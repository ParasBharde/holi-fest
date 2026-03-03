import { NextRequest, NextResponse } from 'next/server';
import { getUsers } from '@/lib/db';
import { authConfig, verifyAdminSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const token = request.cookies.get(authConfig.cookieName)?.value;
  if (!token || !verifyAdminSession(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const users = await getUsers();
    return NextResponse.json({ users });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
