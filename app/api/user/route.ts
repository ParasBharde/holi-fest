import { NextRequest, NextResponse } from 'next/server';
import { createUser } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = String(body?.name || '').trim();
    if (!name || name.length > 120) {
      return NextResponse.json({ error: 'Invalid name' }, { status: 400 });
    }

    const user = await createUser(name);
    return NextResponse.json({ user }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
