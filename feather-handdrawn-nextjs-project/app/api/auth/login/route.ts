import { NextResponse } from 'next/server';

import { createSessionCookie, verifyPassword } from '@/lib/auth';
import { cleanText, handleRouteError } from '@/lib/http';
import { getUserByEmail } from '@/lib/repositories';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = cleanText(body.email, 'Email', 120).toLowerCase();
    const password = cleanText(body.password, 'Password', 120);

    const user = getUserByEmail(email);

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    const passwordMatches = await verifyPassword(password, user.password_hash);

    if (!passwordMatches) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    await createSessionCookie({
      id: user.id,
      name: user.name,
      email: user.email,
    });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
