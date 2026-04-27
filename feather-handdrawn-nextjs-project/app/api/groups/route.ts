import { NextResponse } from 'next/server';

import { requireSessionUser } from '@/lib/auth';
import { cleanOptionalText, cleanText, handleRouteError } from '@/lib/http';
import { createGroup, listGroups } from '@/lib/repositories';

export async function GET() {
  try {
    const user = await requireSessionUser();
    const groups = listGroups(user.id);

    return NextResponse.json({ groups });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireSessionUser();
    const body = await request.json();
    const name = cleanText(body.name, 'Group name', 80);
    const description = cleanOptionalText(body.description, 240);

    const groupId = createGroup(user.id, name, description);

    return NextResponse.json({ groupId }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.includes('must be')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return handleRouteError(error);
  }
}
