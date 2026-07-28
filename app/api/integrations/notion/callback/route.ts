import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const userId = searchParams.get('state');
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

  if (!code || !userId) {
    return NextResponse.redirect(`${appUrl}/integrations?error=missing_params`);
  }

  try {
    // Exchange code for access token
    const credentials = Buffer.from(
      `${process.env.NOTION_CLIENT_ID}:${process.env.NOTION_CLIENT_SECRET}`
    ).toString('base64');

    const tokenRes = await fetch('https://api.notion.com/v1/oauth/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${appUrl}/api/integrations/notion/callback`,
      }),
    });

    if (!tokenRes.ok) {
      throw new Error('Failed to exchange token');
    }

    const tokenData = await tokenRes.json();

    // Save integration to DB
    await query(
      `INSERT INTO integrations (user_id, type, access_token, workspace_id, metadata)
       VALUES ($1, 'notion', $2, $3, $4)
       ON CONFLICT (user_id, type) DO UPDATE
       SET access_token = $2, workspace_id = $3, metadata = $4, updated_at = NOW()`,
      [
        userId,
        tokenData.access_token,
        tokenData.workspace_id || null,
        JSON.stringify({
          workspace_name: tokenData.workspace_name,
          workspace_icon: tokenData.workspace_icon,
          bot_id: tokenData.bot_id,
        }),
      ]
    );

    // Trigger initial sync in background
    fetch(`${appUrl}/api/integrations/notion/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, accessToken: tokenData.access_token }),
    }).catch(() => {});

    return NextResponse.redirect(`${appUrl}/integrations?success=notion`);
  } catch (err) {
    console.error('Notion callback error:', err);
    return NextResponse.redirect(`${appUrl}/integrations?error=notion_failed`);
  }
}
