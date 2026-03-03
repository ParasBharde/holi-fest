import { NextRequest, NextResponse } from 'next/server';
import { authConfig, verifyAdminSession } from '@/lib/auth';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  if (pathname === '/admin') {
    return NextResponse.next();
  }

  const token = request.cookies.get(authConfig.cookieName)?.value;
  const session = token ? verifyAdminSession(token) : null;

  if (!session) {
    const loginUrl = new URL('/admin', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*']
};
