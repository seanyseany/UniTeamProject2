import { NextResponse } from 'next/server';

import { requireSessionUser } from '@/lib/auth';
import { handleRouteError } from '@/lib/http';
import { getUserKeyMaterial } from '@/lib/repositories';

export async function GET() {
  try {
    const user = await requireSessionUser();
    const keyMaterial = getUserKeyMaterial(user.id);

    return NextResponse.json({ keyMaterial });
  } catch (error) {
    return handleRouteError(error);
  }
}
