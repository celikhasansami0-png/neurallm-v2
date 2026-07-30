import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getIntegration, ingestAsDocuments } from '@/lib/integrations';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const integration = await getIntegration(userId, 'asana');
  if (!integration) return NextResponse.json({ error: 'Asana not connected' }, { status: 400 });

  const { apiKey } = integration;

  try {
    const headers = { Authorization: `Bearer ${apiKey}`, Accept: 'application/json' };

    const wsRes = await fetch('https://app.asana.com/api/1.0/workspaces', { headers });
    if (!wsRes.ok) return NextResponse.json({ error: 'Asana API error' }, { status: 502 });
    const { data: workspaces } = await wsRes.json();
    if (!workspaces?.length) return NextResponse.json({ ok: true, synced: 0 });

    const wsGid = workspaces[0].gid;
    const tasksRes = await fetch(
      `https://app.asana.com/api/1.0/workspaces/${wsGid}/tasks/search?opt_fields=gid,name,notes,projects.name&limit=100`,
      { headers }
    );
    const { data: tasks } = await tasksRes.json();

    const docs = (tasks || []).map((task: { gid: string; name: string; notes?: string; projects?: { name: string }[] }) => ({
      title: `Asana: ${task.name}`,
      content: `Project: ${task.projects?.map((p: { name: string }) => p.name).join(', ') || 'N/A'}\n${task.notes || ''}`,
      externalId: `asana:${task.gid}`,
    }));

    const count = await ingestAsDocuments(userId, 'asana', docs);
    return NextResponse.json({ ok: true, synced: count });
  } catch (err) {
    console.error('Asana sync error:', err);
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}
