import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { saveIntegration } from '@/lib/integrations';

export const dynamic = 'force-dynamic';

const ALLOWED_TYPES = [
  'airtable', 'trello', 'monday', 'linear', 'asana', 'clickup',
  'coda', 'webflow', 'zendesk', 'intercom', 'typeform',
  'zapier', 'make', 'n8n', 'dropbox', 'hubspot',
];

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { type, apiKey, config } = body;

    if (!type || !ALLOWED_TYPES.includes(type)) {
      return NextResponse.json({ error: 'Invalid integration type' }, { status: 400 });
    }
    if (!apiKey || typeof apiKey !== 'string' || apiKey.length < 4 || apiKey.length > 512) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 400 });
    }

    const safeConfig: Record<string, string> = {};
    if (config && typeof config === 'object') {
      for (const [k, v] of Object.entries(config)) {
        if (typeof k === 'string' && typeof v === 'string' && k.length < 64 && v.length < 512) {
          safeConfig[k] = v;
        }
      }
    }

    await saveIntegration(userId, type, apiKey, safeConfig);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('save-key error:', err);
    return NextResponse.json({ error: 'Failed to save integration' }, { status: 500 });
  }
}
