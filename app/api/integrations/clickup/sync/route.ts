import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getIntegration, ingestAsDocuments } from '@/lib/integrations';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const integration = await getIntegration(userId, 'clickup');
  if (!integration) return NextResponse.json({ error: 'ClickUp not connected' }, { status: 400 });

  const { apiKey } = integration;
  const headers = { Authorization: apiKey };

  try {
    const teamsRes = await fetch('https://api.clickup.com/api/v2/team', { headers });
    if (!teamsRes.ok) return NextResponse.json({ error: 'ClickUp API error' }, { status: 502 });
    const { teams } = await teamsRes.json();
    if (!teams?.length) return NextResponse.json({ ok: true, synced: 0 });

    const teamId = teams[0].id;
    const tasksRes = await fetch(`https://api.clickup.com/api/v2/team/${teamId}/task?page=0&limit=100`, { headers });
    const { tasks } = await tasksRes.json();

    const docs = (tasks || []).map((task: { id: string; name: string; description?: string; list?: { name: string }; status?: { status: string } }) => ({
      title: `ClickUp: ${task.name}`,
      content: `List: ${task.list?.name || 'N/A'}\nStatus: ${task.status?.status || 'N/A'}\n${task.description || ''}`,
      externalId: `clickup:${task.id}`,
    }));

    const count = await ingestAsDocuments(userId, 'clickup', docs);
    return NextResponse.json({ ok: true, synced: count });
  } catch (err) {
    console.error('ClickUp sync error:', err);
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}
