import { NextResponse } from 'next/server';

import { requireSessionUser } from '@/lib/auth';
import { cleanOptionalText, cleanText, handleRouteError } from '@/lib/http';
import { listAvailability, upsertAvailabilitySlot } from '@/lib/repositories';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ groupId: string }> },
) {
  try {
    const user = await requireSessionUser();
    const { groupId } = await params;
    const availability = listAvailability(Number(groupId), user.id);

    return NextResponse.json({ availability });
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

    upsertAvailabilitySlot(Number(groupId), user.id, {
      day: cleanText(body.day, 'Day', 20),
      timeLabel: cleanText(body.timeLabel, 'Time', 20),
      status: body.status === 'busy' ? 'busy' : 'available',
      reason: cleanOptionalText(body.reason, 160),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
