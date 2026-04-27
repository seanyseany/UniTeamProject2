import { NextResponse } from 'next/server';

import { requireSessionUser } from '@/lib/auth';
import { cleanText, handleRouteError } from '@/lib/http';
import { createEncryptedMessage, createMessage, listMessages } from '@/lib/repositories';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ channelId: string }> },
) {
  try {
    const user = await requireSessionUser();
    const { channelId } = await params;
    const messages = listMessages(Number(channelId), user.id);

    return NextResponse.json({ messages });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ channelId: string }> },
) {
  try {
    const user = await requireSessionUser();
    const { channelId } = await params;
    const body = await request.json();
    const message = cleanText(body.body, 'Message', 24000);

    if (body.isEncrypted === true) {
      const e2eeIv = cleanText(body.e2eeIv, 'Message IV', 1000);
      createEncryptedMessage(Number(channelId), user.id, message, e2eeIv);
    } else {
      createMessage(Number(channelId), user.id, message);
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
