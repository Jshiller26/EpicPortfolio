import { NextResponse } from 'next/server';

export function middleware() {
  const response = NextResponse.next();

  response.headers.append(
    'Content-Security-Policy', 
    "frame-src 'self' https://* http://* data: blob:"
  );

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
