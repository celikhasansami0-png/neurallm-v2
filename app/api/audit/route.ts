import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const result = await query(
    `SELECT * FROM audit_logs WHERE user_id = $1 ORDER BY created_at DESC LIMIT 100`,
    [userId]
  );
  return NextResponse.json(result.rows);
}
