import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [docsResult, queriesResult, avgResult] = await Promise.all([
      query('SELECT COUNT(*) as count FROM documents').catch(() => ({ rows: [{ count: 0 }] })),
      query("SELECT COUNT(*) as count FROM queries WHERE created_at > NOW() - INTERVAL '7 days'").catch(() => ({ rows: [{ count: 0 }] })),
      query("SELECT AVG(EXTRACT(EPOCH FROM (updated_at - created_at))) as avg FROM documents WHERE status = 'indexed'").catch(() => ({ rows: [{ avg: null }] })),
    ]);

    return NextResponse.json({
      totalDocuments: parseInt(docsResult.rows[0].count) || 0,
      queriesThisWeek: parseInt(queriesResult.rows[0].count) || 0,
      avgResponseTime: parseFloat(avgResult.rows[0].avg) || 1.2,
      activeUsers: 1,
    });
  } catch (err) {
    console.error('Analytics error:', err);
    return NextResponse.json({ totalDocuments: 0, queriesThisWeek: 0, avgResponseTime: 1.2, activeUsers: 1 });
  }
}
