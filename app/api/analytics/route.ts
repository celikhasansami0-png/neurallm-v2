import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [docsResult, queriesResult] = await Promise.all([
      query('SELECT COUNT(*) as count FROM documents').catch(() => ({ rows: [{ count: '0' }] })),
      query("SELECT COUNT(*) as count FROM queries WHERE created_at > NOW() - INTERVAL '7 days'").catch(() => ({ rows: [{ count: '0' }] })),
    ]);

    return NextResponse.json({
      totalDocuments: parseInt(String(docsResult.rows[0].count)) || 0,
      queriesThisWeek: parseInt(String(queriesResult.rows[0].count)) || 0,
      avgResponseTime: 1.2,
      activeUsers: 1,
    });
  } catch {
    return NextResponse.json({ totalDocuments: 0, queriesThisWeek: 0, avgResponseTime: 1.2, activeUsers: 1 });
  }
}
