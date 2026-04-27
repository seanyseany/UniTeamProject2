import { NextResponse } from 'next/server';

import { requireSessionUser } from '@/lib/auth';
import { handleRouteError } from '@/lib/http';
import { getGroupKeyEnvelope, upsertGroupKeyEnvelopes } from '@/lib/repositories';

function isEnvelopeInput(item: unknown): item is { userId: number | string; encryptedGroupKey: string } {
  if (typeof item !== 'object' || item === null) {
    return false;
  }

  const candidate = item as { userId?: unknown; encryptedGroupKey?: unknown };
  return typeof candidate.encryptedGroupKey === 'string' && candidate.userId !== undefined;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ groupId: string }> },
) {
  try {
    const user = await requireSessionUser();
    const { groupId } = await params;
    const envelope = getGroupKeyEnvelope(Number(groupId), user.id);

    return NextResponse.json(envelope);
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
    const envelopes = Array.isArray(body.envelopes) ? (body.envelopes as unknown[]) : [];

    upsertGroupKeyEnvelopes(
      Number(groupId),
      user.id,
      envelopes
        .filter(isEnvelopeInput)
        .map((item: { userId: number | string; encryptedGroupKey: string }) => ({
          userId: Number(item.userId),
          encryptedGroupKey: item.encryptedGroupKey,
        })),
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
