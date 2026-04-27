import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  if (process.env.NODE_ENV !== 'production') {
    return NextResponse.next();
  }

  const forwardedProto = request.headers.get('x-forwarded-proto');
  if (forwardedProto === 'https') {
    return NextResponse.next();
  }

  const httpsUrl = new URL(request.url);
  httpsUrl.protocol = 'https:';

  return NextResponse.redirect(httpsUrl, 308);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
