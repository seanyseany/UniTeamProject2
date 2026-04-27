import { NextResponse } from 'next/server';

import { requireSessionUser } from '@/lib/auth';
import { cleanOptionalText, cleanText, handleRouteError } from '@/lib/http';
import { createChannel, listChannels } from '@/lib/repositories';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ groupId: string }> },
) {
  try {
    const user = await requireSessionUser();
    const { groupId } = await params;
    const channels = listChannels(Number(groupId), user.id);

    return NextResponse.json({ channels });
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
    const name = cleanText(body.name, 'Channel name', 80);
    const description = cleanOptionalText(body.description, 240);

    createChannel(Number(groupId), user.id, name, description);

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
