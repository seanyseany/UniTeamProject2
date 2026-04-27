import { NextResponse } from 'next/server';

import { requireSessionUser } from '@/lib/auth';
import { cleanOptionalText, cleanText, handleRouteError } from '@/lib/http';
import { createTask, listTasks } from '@/lib/repositories';
import type { TaskPriority, TaskStatus } from '@/lib/types';

function parseTaskStatus(value: unknown) {
  const allowed: TaskStatus[] = ['To Do', 'In Progress', 'Review', 'Completed'];
  return allowed.includes(value as TaskStatus) ? (value as TaskStatus) : 'To Do';
}

function parseTaskPriority(value: unknown) {
  const allowed: TaskPriority[] = ['Low', 'Medium', 'High'];
  return allowed.includes(value as TaskPriority) ? (value as TaskPriority) : 'Medium';
}

function parseNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ groupId: string }> },
) {
  try {
    const user = await requireSessionUser();
    const { groupId } = await params;
    const tasks = listTasks(Number(groupId), user.id);

    return NextResponse.json({ tasks });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ groupId: string }> },
) {
  try {
    const user = await requireSessionUser();
    const { groupId } = await params;
    const body = await request.json();

    createTask(Number(groupId), user.id, {
      title: cleanText(body.title, 'Task title', 120),
      description: cleanOptionalText(body.description, 500),
      dueDate: cleanText(body.dueDate, 'Due date', 30),
      status: parseTaskStatus(body.status),
      priority: parseTaskPriority(body.priority),
      expectedHours: parseNumber(body.expectedHours),
      actualHours: parseNumber(body.actualHours),
      assigneeId: body.assigneeId ? Number(body.assigneeId) : null,
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && (error.message.includes('required') || error.message.includes('must be'))) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return handleRouteError(error);
  }
}
