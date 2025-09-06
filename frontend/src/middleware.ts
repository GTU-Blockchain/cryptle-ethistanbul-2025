import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // For /play route, redirect to home if wallet is not connected
  if (request.nextUrl.pathname.startsWith('/play')) {
    // We can't check wallet connection server-side, so we'll let the client handle it
    // This middleware is just for any future server-side protection
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/play/:path*']
};
