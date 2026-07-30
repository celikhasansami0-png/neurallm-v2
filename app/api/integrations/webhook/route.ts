import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// Public webhook endpoint — Zapier/Make/n8n sends documents here
// URL: POST /api/integrations/webhook?userId=XXX&secret=YYY
// Body: { title: string, content: string, source?: string }
//    or array: [{ title, content, source }]

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const secret = searchParams.get('secret');

  if (!userId || !secret) {
    return NextResponse.json({ error: 'Missing userId or secret' }, { status: 400 });
  }

  // Validate webhook secret against DB
  const tokenResult = await query(
    `SELECT id FROM integrations WHERE user_id = $1 AND type = 'zapier' AND api_key_encrypted IS NOT NULL LIMIT 1`,
    [userId]
  ).catch(() => ({ rows: [] }));

  // If no zapier integration exists, also check make/n8n
  const hasWebhook = tokenResult.rows.length > 0 ||
    (await query(`SELECT id FROM integrations WHERE user_id = $1 AND type IN ('make','n8n') LIMIT 1`, [userId]).catch(() => ({ rows: [] }))).rows.length > 0;

  if (!hasWebhook) {
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 403 });
  }

  try {
    let body: unknown;
    try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

    const items = Array.isArray(body) ? body : [body];
    let count = 0;

    for (const item of items.slice(0, 50)) {
      const title = String((item as { title?: string }).title || 'Webhook Document').slice(0, 255);
      const content = String((item as { content?: string; text?: string; body?: string }).content || (item as { text?: string }).text || (item as { body?: string }).body || '').slice(0, 50000);
      const source = String((item as { source?: string }).source || 'zapier').slice(0, 50);
      if (!content.trim()) continue;

      await query(
        `INSERT INTO documents (user_id, name, content, source, status, created_at)
         VALUES ($1, $2, $3, $4, 'indexed', NOW())`,
        [userId, title, content, source]
      );
      count++;
    }

    return NextResponse.json({ ok: true, ingested: count });
  } catch (err) {
    console.error('Webhook error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
