import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    // Clamp limit to prevent abuse
    const rawLimit = parseInt(request.nextUrl.searchParams.get('limit') || '20');
    const limit = Math.min(Math.max(1, rawLimit), 100);

    const result = await query(
      'SELECT id, question, answer, sources, created_at FROM queries ORDER BY created_at DESC LIMIT $1',
      [limit]
    );
    return NextResponse.json(result.rows);
  } catch {
    return NextResponse.json([]);
  }
}
