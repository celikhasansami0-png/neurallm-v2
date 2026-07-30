import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getIntegration, ingestAsDocuments } from '@/lib/integrations';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const integration = await getIntegration(userId, 'coda');
  if (!integration) return NextResponse.json({ error: 'Coda not connected' }, { status: 400 });

  const { apiKey } = integration;
  const headers = { Authorization: `Bearer ${apiKey}` };

  try {
    const docsRes = await fetch('https://coda.io/apis/v1/docs?limit=25', { headers });
    if (!docsRes.ok) return NextResponse.json({ error: 'Coda API error' }, { status: 502 });
    const { items: codaDocs } = await docsRes.json();

    const docs: { title: string; content: string; externalId: string }[] = [];

    for (const doc of (codaDocs || []).slice(0, 10)) {
      const pagesRes = await fetch(`https://coda.io/apis/v1/docs/${doc.id}/pages?limit=20`, { headers });
      if (!pagesRes.ok) continue;
      const { items: pages } = await pagesRes.json();
      for (const page of (pages || [])) {
        const exportRes = await fetch(`https://coda.io/apis/v1/docs/${doc.id}/pages/${page.id}/export`, {
          method: 'POST',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ outputFormat: 'markdown' }),
        });
        if (!exportRes.ok) continue;
        const { href } = await exportRes.json();
        if (!href) continue;
        // Poll for export
        await new Promise(r => setTimeout(r, 2000));
        const contentRes = await fetch(href, { headers });
        if (!contentRes.ok) continue;
        const content = await contentRes.text();
        docs.push({ title: `Coda: ${doc.name} / ${page.name}`, content: content.slice(0, 20000), externalId: `coda:${page.id}` });
      }
    }

    const count = await ingestAsDocuments(userId, 'coda', docs);
    return NextResponse.json({ ok: true, synced: count });
  } catch (err) {
    console.error('Coda sync error:', err);
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}
