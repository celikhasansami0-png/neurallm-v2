import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
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
