import { NextResponse } from 'next/server';

import { requireSessionUser } from '@/lib/auth';
import { handleRouteError } from '@/lib/http';
import { joinGroup, leaveGroup } from '@/lib/repositories';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ groupId: string }> },
) {
  try {
    const user = await requireSessionUser();
    const { groupId } = await params;

    joinGroup(Number(groupId), user.id);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ groupId: string }> },
) {
  try {
    const user = await requireSessionUser();
    const { groupId } = await params;

    leaveGroup(Number(groupId), user.id);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
