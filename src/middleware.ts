import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // If user navigates to legacy auth routes, redirect directly to home
  if (pathname === '/login' || pathname === '/warning') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // All routes are publicly accessible without authentication
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
