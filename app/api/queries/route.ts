import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '20');
    const result = await query(
      'SELECT id, question, answer, sources, created_at FROM queries ORDER BY created_at DESC LIMIT $1',
      [limit]
    );
    return NextResponse.json(result.rows);
  } catch {
    return NextResponse.json([]);
  }
}
