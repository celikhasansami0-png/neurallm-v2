import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { query } from '@/lib/db';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const result = await query(
      'SELECT id, name, type, size, status, created_at FROM documents ORDER BY created_at DESC'
    );
    return NextResponse.json(result.rows);
  } catch (err) {
    console.error('GET /api/documents error:', err);
    return NextResponse.json([], { status: 200 });
  }
}
