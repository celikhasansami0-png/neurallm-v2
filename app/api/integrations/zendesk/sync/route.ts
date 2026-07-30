import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getIntegration, ingestAsDocuments } from '@/lib/integrations';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const integration = await getIntegration(userId, 'zendesk');
  if (!integration) return NextResponse.json({ error: 'Zendesk not connected' }, { status: 400 });

  const { apiKey, config } = integration;
  const subdomain = config.subdomain;
  const email = config.email;
  if (!subdomain || !email) return NextResponse.json({ error: 'Subdomain/email missing' }, { status: 400 });

  const authHeader = 'Basic ' + Buffer.from(`${email}/token:${apiKey}`).toString('base64');

  try {
    const res = await fetch(`https://${subdomain}.zendesk.com/api/v2/tickets.json?per_page=100`, {
      headers: { Authorization: authHeader },
    });
    if (!res.ok) return NextResponse.json({ error: 'Zendesk API error' }, { status: 502 });
    const { tickets } = await res.json();

    const docs = (tickets || []).map((t: { id: number; subject: string; description: string; status: string }) => ({
      title: `Zendesk #${t.id}: ${t.subject}`,
      content: `Status: ${t.status}\nSubject: ${t.subject}\n${t.description || ''}`,
      externalId: `zendesk:${t.id}`,
    }));

    const count = await ingestAsDocuments(userId, 'zendesk', docs);
    return NextResponse.json({ ok: true, synced: count });
  } catch (err) {
    console.error('Zendesk sync error:', err);
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}
