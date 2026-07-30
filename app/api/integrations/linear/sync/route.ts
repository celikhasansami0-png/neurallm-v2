import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getIntegration, ingestAsDocuments } from '@/lib/integrations';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const integration = await getIntegration(userId, 'linear');
  if (!integration) return NextResponse.json({ error: 'Linear not connected' }, { status: 400 });

  const { apiKey } = integration;

  try {
    const res = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: apiKey },
      body: JSON.stringify({
        query: `{ issues(first: 100) { nodes { id title description state { name } team { name } } } }`,
      }),
    });
    if (!res.ok) return NextResponse.json({ error: 'Linear API error' }, { status: 502 });
    const { data } = await res.json();
    const issues = data?.issues?.nodes || [];

    const docs = issues.map((issue: { id: string; title: string; description?: string; state?: { name: string }; team?: { name: string } }) => ({
      title: `Linear: ${issue.title}`,
      content: `Team: ${issue.team?.name || 'N/A'}\nStatus: ${issue.state?.name || 'N/A'}\n${issue.description || ''}`,
      externalId: `linear:${issue.id}`,
    }));

    const count = await ingestAsDocuments(userId, 'linear', docs);
    return NextResponse.json({ ok: true, synced: count });
  } catch (err) {
    console.error('Linear sync error:', err);
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}
