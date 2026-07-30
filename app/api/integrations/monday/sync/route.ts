import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getIntegration, ingestAsDocuments } from '@/lib/integrations';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const integration = await getIntegration(userId, 'monday');
  if (!integration) return NextResponse.json({ error: 'Monday.com not connected' }, { status: 400 });

  const { apiKey } = integration;

  try {
    const res = await fetch('https://api.monday.com/v2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: apiKey },
      body: JSON.stringify({
        query: `{ boards(limit: 10) { id name items_page(limit: 100) { items { id name column_values { text } } } } }`,
      }),
    });
    if (!res.ok) return NextResponse.json({ error: 'Monday API error' }, { status: 502 });
    const { data } = await res.json();

    const docs: { title: string; content: string; externalId: string }[] = [];
    for (const board of (data?.boards || [])) {
      for (const item of (board.items_page?.items || [])) {
        const cols = (item.column_values || []).map((c: { text: string }) => c.text).filter(Boolean).join(' | ');
        docs.push({
          title: `Monday: ${item.name}`,
          content: `Board: ${board.name}\nItem: ${item.name}\n${cols}`,
          externalId: `monday:${item.id}`,
        });
      }
    }

    const count = await ingestAsDocuments(userId, 'monday', docs);
    return NextResponse.json({ ok: true, synced: count });
  } catch (err) {
    console.error('Monday sync error:', err);
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}
