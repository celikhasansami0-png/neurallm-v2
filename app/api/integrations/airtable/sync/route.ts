import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getIntegration, ingestAsDocuments } from '@/lib/integrations';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const integration = await getIntegration(userId, 'airtable');
  if (!integration) return NextResponse.json({ error: 'Airtable not connected' }, { status: 400 });

  const { apiKey, config } = integration;
  const baseId = config.baseId;
  if (!baseId) return NextResponse.json({ error: 'Base ID missing' }, { status: 400 });

  try {
    // List tables
    const tablesRes = await fetch(`https://api.airtable.com/v0/meta/bases/${baseId}/tables`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!tablesRes.ok) return NextResponse.json({ error: 'Airtable API error' }, { status: 502 });
    const { tables } = await tablesRes.json();

    const docs: { title: string; content: string; externalId: string }[] = [];

    for (const table of (tables || []).slice(0, 5)) {
      const recordsRes = await fetch(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table.name)}?maxRecords=100`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (!recordsRes.ok) continue;
      const { records } = await recordsRes.json();
      for (const record of (records || [])) {
        const fields = record.fields || {};
        const content = Object.entries(fields)
          .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
          .join('\n');
        docs.push({ title: `${table.name} — ${record.id}`, content, externalId: `airtable:${record.id}` });
      }
    }

    const count = await ingestAsDocuments(userId, 'airtable', docs);
    return NextResponse.json({ ok: true, synced: count });
  } catch (err) {
    console.error('Airtable sync error:', err);
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}
