import { NextResponse } from 'next/server';

import { requireSessionUser } from '@/lib/auth';
import { cleanText, handleRouteError } from '@/lib/http';
import { getUserKeyMaterial, saveUserKeyMaterial } from '@/lib/repositories';

export async function GET() {
  try {
    const user = await requireSessionUser();
    const keyMaterial = getUserKeyMaterial(user.id);

    return NextResponse.json({ keyMaterial });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireSessionUser();
    const body = await request.json();

    const publicKey = cleanText(body.publicKey, 'Public key', 12000);
    const encryptedPrivateKey = cleanText(body.encryptedPrivateKey, 'Encrypted private key', 20000);
    const wrappingSalt = cleanText(body.wrappingSalt, 'Wrapping salt', 1000);
    const wrappingIv = cleanText(body.wrappingIv, 'Wrapping iv', 1000);

    saveUserKeyMaterial(user.id, {
      publicKey,
      encryptedPrivateKey,
      wrappingSalt,
      wrappingIv,
    });

    return NextResponse.json({
      keyMaterial: {
        publicKey,
        encryptedPrivateKey,
        wrappingSalt,
        wrappingIv,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message.endsWith('required.')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return handleRouteError(error);
  }
}
