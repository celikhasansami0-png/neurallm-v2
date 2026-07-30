import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getIntegration, ingestAsDocuments } from '@/lib/integrations';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const integration = await getIntegration(userId, 'trello');
  if (!integration) return NextResponse.json({ error: 'Trello not connected' }, { status: 400 });

  const { apiKey, config } = integration;
  const token = config.token;
  if (!token) return NextResponse.json({ error: 'Token missing' }, { status: 400 });

  try {
    const boardsRes = await fetch(`https://api.trello.com/1/members/me/boards?key=${apiKey}&token=${token}&fields=id,name,desc`);
    if (!boardsRes.ok) return NextResponse.json({ error: 'Trello API error' }, { status: 502 });
    const boards = await boardsRes.json();

    const docs: { title: string; content: string; externalId: string }[] = [];

    for (const board of (boards || []).slice(0, 10)) {
      const cardsRes = await fetch(`https://api.trello.com/1/boards/${board.id}/cards?key=${apiKey}&token=${token}&fields=id,name,desc,labels`);
      if (!cardsRes.ok) continue;
      const cards = await cardsRes.json();
      for (const card of (cards || [])) {
        if (!card.name && !card.desc) continue;
        const content = `Board: ${board.name}\nCard: ${card.name}\n${card.desc || ''}`;
        docs.push({ title: `Trello: ${card.name}`, content, externalId: `trello:${card.id}` });
      }
    }

    const count = await ingestAsDocuments(userId, 'trello', docs);
    return NextResponse.json({ ok: true, synced: count });
  } catch (err) {
    console.error('Trello sync error:', err);
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}
