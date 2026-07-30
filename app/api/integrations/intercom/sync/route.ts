import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getIntegration, ingestAsDocuments } from '@/lib/integrations';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const integration = await getIntegration(userId, 'intercom');
  if (!integration) return NextResponse.json({ error: 'Intercom not connected' }, { status: 400 });

  const { apiKey } = integration;
  const headers = { Authorization: `Bearer ${apiKey}`, Accept: 'application/json' };

  try {
    const res = await fetch('https://api.intercom.io/articles?per_page=50', { headers });
    if (!res.ok) return NextResponse.json({ error: 'Intercom API error' }, { status: 502 });
    const { data } = await res.json();

    const docs = (data || []).map((a: { id: string; title: string; body: string }) => ({
      title: `Intercom: ${a.title}`,
      content: a.body?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() || '',
      externalId: `intercom:${a.id}`,
    })).filter((d: { content: string }) => d.content.length > 10);

    const count = await ingestAsDocuments(userId, 'intercom', docs);
    return NextResponse.json({ ok: true, synced: count });
  } catch (err) {
    console.error('Intercom sync error:', err);
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}
