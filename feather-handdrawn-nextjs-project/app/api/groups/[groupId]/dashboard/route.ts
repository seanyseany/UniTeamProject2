import { NextResponse } from 'next/server';

import { requireSessionUser } from '@/lib/auth';
import { handleRouteError } from '@/lib/http';
import { getBestMeetingTime, getDashboardSummary, listWorkload } from '@/lib/repositories';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ groupId: string }> },
) {
  try {
    const user = await requireSessionUser();
    const { groupId } = await params;
    const summary = getDashboardSummary(Number(groupId), user.id);
    const bestMeetingTime = getBestMeetingTime(Number(groupId), user.id);
    const workload = listWorkload(Number(groupId), user.id);

    return NextResponse.json({ summary, bestMeetingTime, workload });
  } catch (error) {
    return handleRouteError(error);
  }
}
