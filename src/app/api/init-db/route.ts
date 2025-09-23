import { NextResponse } from 'next/server';
import { initdb } from '@/lib/db';

export async function GET() {
  try {
    await initdb();
    return NextResponse.json({ message: 'Database initialized successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to initialize database' }, { status: 500 });
  }
}