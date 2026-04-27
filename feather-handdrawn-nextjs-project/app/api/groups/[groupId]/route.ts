import { NextResponse } from 'next/server';

import { requireSessionUser } from '@/lib/auth';
import { cleanOptionalText, cleanText, handleRouteError } from '@/lib/http';
import { deleteGroup, updateGroup } from '@/lib/repositories';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ groupId: string }> },
) {
  try {
    const user = await requireSessionUser();
    const { groupId } = await params;
    const body = await request.json();
    const name = cleanText(body.name, 'Group name', 80);
    const description = cleanOptionalText(body.description, 240);

    updateGroup(Number(groupId), user.id, name, description);

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

    deleteGroup(Number(groupId), user.id);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
