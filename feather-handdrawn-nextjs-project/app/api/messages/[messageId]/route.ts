import { NextResponse } from 'next/server';

import { requireSessionUser } from '@/lib/auth';
import { cleanText, handleRouteError } from '@/lib/http';
import { deleteMessage, updateEncryptedMessage, updateMessage } from '@/lib/repositories';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ messageId: string }> },
) {
  try {
    const user = await requireSessionUser();
    const { messageId } = await params;
    const body = await request.json();
    const message = cleanText(body.body, 'Message', 24000);

    if (body.isEncrypted === true) {
      const e2eeIv = cleanText(body.e2eeIv, 'Message IV', 1000);
      updateEncryptedMessage(Number(messageId), user.id, message, e2eeIv);
    } else {
      updateMessage(Number(messageId), user.id, message);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ messageId: string }> },
) {
  try {
    const user = await requireSessionUser();
    const { messageId } = await params;

    deleteMessage(Number(messageId), user.id);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
