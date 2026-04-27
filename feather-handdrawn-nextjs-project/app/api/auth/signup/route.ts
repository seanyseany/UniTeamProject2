import { NextResponse } from 'next/server';

import { createSessionCookie, hashPassword } from '@/lib/auth';
import { cleanText, handleRouteError } from '@/lib/http';
import { createUser, getUserByEmail, getUserById, saveUserKeyMaterial } from '@/lib/repositories';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = cleanText(body.name, 'Name', 60);
    const email = cleanText(body.email, 'Email', 120).toLowerCase();
    const password = cleanText(body.password, 'Password', 120);

    if (!email.includes('@')) {
      return NextResponse.json({ error: 'Email format is invalid.' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long.' },
        { status: 400 },
      );
    }

    if (getUserByEmail(email)) {
      return NextResponse.json({ error: 'An account with that email already exists.' }, { status: 409 });
    }

    const publicKey = cleanText(body.publicKey, 'Public key', 12000);
    const encryptedPrivateKey = cleanText(body.encryptedPrivateKey, 'Encrypted private key', 20000);
    const wrappingSalt = cleanText(body.wrappingSalt, 'Wrapping salt', 1000);
    const wrappingIv = cleanText(body.wrappingIv, 'Wrapping iv', 1000);

    const passwordHash = await hashPassword(password);
    const id = createUser(name, email, passwordHash);
    saveUserKeyMaterial(id, {
      publicKey,
      encryptedPrivateKey,
      wrappingSalt,
      wrappingIv,
    });
    const user = getUserById(id);

    if (!user) {
      return NextResponse.json({ error: 'Unable to create the account.' }, { status: 500 });
    }

    await createSessionCookie(user);

    return NextResponse.json({ user });
  } catch (error) {
    if (error instanceof Error && error.message.endsWith('required.')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return handleRouteError(error);
  }
}
