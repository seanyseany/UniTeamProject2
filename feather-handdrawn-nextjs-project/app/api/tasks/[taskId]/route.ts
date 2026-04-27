import { NextResponse } from 'next/server';

import { requireSessionUser } from '@/lib/auth';
import { cleanOptionalText, cleanText, handleRouteError } from '@/lib/http';
import { deleteTask, updateTask } from '@/lib/repositories';
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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ taskId: string }> },
) {
  try {
    const user = await requireSessionUser();
    const { taskId } = await params;
    const body = await request.json();

    updateTask(Number(taskId), user.id, {
      title: cleanText(body.title, 'Task title', 120),
      description: cleanOptionalText(body.description, 500),
      dueDate: cleanText(body.dueDate, 'Due date', 30),
      status: parseTaskStatus(body.status),
      priority: parseTaskPriority(body.priority),
      expectedHours: parseNumber(body.expectedHours),
      actualHours: parseNumber(body.actualHours),
      assigneeId: body.assigneeId ? Number(body.assigneeId) : null,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ taskId: string }> },
) {
  try {
    const user = await requireSessionUser();
    const { taskId } = await params;

    deleteTask(Number(taskId), user.id);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
