import bcrypt from 'bcrypt';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

import { db } from './db';
import type { SessionUser } from './types';

const SESSION_COOKIE = 'group_comm_session';
const JWT_SECRET = process.env.JWT_SECRET ?? 'development-only-change-me';

const secretKey = new TextEncoder().encode(JWT_SECRET);

type JwtPayload = {
  sub: string;
  email: string;
  name: string;
};

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}

export async function createSessionCookie(user: SessionUser) {
  const token = await new SignJWT({
    email: user.email,
    name: user.name,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(String(user.id))
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secretKey);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: new Date(0),
  });
}

export async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  try {
    const verified = await jwtVerify<JwtPayload>(token, secretKey);
    const user = db
      .prepare('SELECT id, name, email FROM users WHERE id = ?')
      .get(Number(verified.payload.sub)) as SessionUser | undefined;

    return user ?? null;
  } catch {
    return null;
  }
}

export async function requireSessionUser() {
  const user = await getSessionUser();

  if (!user) {
    throw new Error('UNAUTHORIZED');
  }

  return user;
}
