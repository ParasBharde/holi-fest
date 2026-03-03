import { NextRequest, NextResponse } from 'next/server';
import { authConfig, signAdminSession, validateAdminCredentials } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const username = String(body?.username || '');
  const password = String(body?.password || '');

  if (!validateAdminCredentials(username, password)) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const token = signAdminSession({ role: 'admin', username });
  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: authConfig.cookieName,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: authConfig.maxAgeSeconds,
    path: '/'
  });

  return response;
}
