import { NextResponse } from 'next/server';

import { requireSessionUser } from '@/lib/auth';
import { handleRouteError } from '@/lib/http';
import { listGroupMembers } from '@/lib/repositories';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ groupId: string }> },
) {
  try {
    const user = await requireSessionUser();
    const { groupId } = await params;
    const members = listGroupMembers(Number(groupId), user.id);

    return NextResponse.json({ members });
  } catch (error) {
    return handleRouteError(error);
  }
}
