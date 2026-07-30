import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getIntegration, ingestAsDocuments } from '@/lib/integrations';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const integration = await getIntegration(userId, 'webflow');
  if (!integration) return NextResponse.json({ error: 'Webflow not connected' }, { status: 400 });

  const { apiKey } = integration;
  const headers = { Authorization: `Bearer ${apiKey}`, Accept: 'application/json' };

  try {
    const sitesRes = await fetch('https://api.webflow.com/v2/sites', { headers });
    if (!sitesRes.ok) return NextResponse.json({ error: 'Webflow API error' }, { status: 502 });
    const { sites } = await sitesRes.json();

    const docs: { title: string; content: string; externalId: string }[] = [];

    for (const site of (sites || []).slice(0, 3)) {
      const colsRes = await fetch(`https://api.webflow.com/v2/sites/${site.id}/collections`, { headers });
      if (!colsRes.ok) continue;
      const { collections } = await colsRes.json();
      for (const col of (collections || []).slice(0, 5)) {
        const itemsRes = await fetch(`https://api.webflow.com/v2/collections/${col.id}/items?limit=50`, { headers });
        if (!itemsRes.ok) continue;
        const { items } = await itemsRes.json();
        for (const item of (items || [])) {
          const name = item.fieldData?.name || item.fieldData?.title || item.id;
          const body = item.fieldData?.['post-body'] || item.fieldData?.body || item.fieldData?.description || '';
          const content = typeof body === 'string' ? body.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : '';
          if (!content) continue;
          docs.push({ title: `Webflow: ${col.displayName} / ${name}`, content: content.slice(0, 20000), externalId: `webflow:${item.id}` });
        }
      }
    }

    const count = await ingestAsDocuments(userId, 'webflow', docs);
    return NextResponse.json({ ok: true, synced: count });
  } catch (err) {
    console.error('Webflow sync error:', err);
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}
