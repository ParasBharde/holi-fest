import { NextResponse } from 'next/server';
import { getUserCount } from '@/lib/db';

export async function GET() {
  try {
    const count = await getUserCount();
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch user count' }, { status: 500 });
  }
}
