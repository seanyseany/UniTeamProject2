import { NextResponse } from 'next/server';

import { requireSessionUser } from '@/lib/auth';
import { cleanOptionalText, cleanText, handleRouteError } from '@/lib/http';
import { deleteChannel, updateChannel } from '@/lib/repositories';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ channelId: string }> },
) {
  try {
    const user = await requireSessionUser();
    const { channelId } = await params;
    const body = await request.json();
    const name = cleanText(body.name, 'Channel name', 80);
    const description = cleanOptionalText(body.description, 240);

    updateChannel(Number(channelId), user.id, name, description);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ channelId: string }> },
) {
  try {
    const user = await requireSessionUser();
    const { channelId } = await params;

    deleteChannel(Number(channelId), user.id);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
