import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getIntegration, ingestAsDocuments } from '@/lib/integrations';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const integration = await getIntegration(userId, 'typeform');
  if (!integration) return NextResponse.json({ error: 'Typeform not connected' }, { status: 400 });

  const { apiKey } = integration;
  const headers = { Authorization: `Bearer ${apiKey}` };

  try {
    const formsRes = await fetch('https://api.typeform.com/forms?page_size=10', { headers });
    if (!formsRes.ok) return NextResponse.json({ error: 'Typeform API error' }, { status: 502 });
    const { items: forms } = await formsRes.json();

    const docs: { title: string; content: string; externalId: string }[] = [];

    for (const form of (forms || [])) {
      const responsesRes = await fetch(`https://api.typeform.com/forms/${form.id}/responses?page_size=50`, { headers });
      if (!responsesRes.ok) continue;
      const { items: responses } = await responsesRes.json();
      for (const resp of (responses || [])) {
        const answers = (resp.answers || []).map((a: { field: { title: string }; type: string; text?: string; choice?: { label: string }; number?: number }) => {
          const val = a.text || a.choice?.label || a.number?.toString() || '';
          return `${a.field?.title}: ${val}`;
        }).join('\n');
        if (!answers) continue;
        docs.push({
          title: `Typeform: ${form.title} — Response ${resp.token?.slice(0, 8)}`,
          content: answers,
          externalId: `typeform:${resp.token}`,
        });
      }
    }

    const count = await ingestAsDocuments(userId, 'typeform', docs);
    return NextResponse.json({ ok: true, synced: count });
  } catch (err) {
    console.error('Typeform sync error:', err);
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}
