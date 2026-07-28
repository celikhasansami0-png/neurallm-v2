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
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: `${appUrl}/api/integrations/github/callback`,
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) throw new Error('No access token');

    // Get user info
    const userRes = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const githubUser = await userRes.json();

    // Save integration
    await query(
      `INSERT INTO integrations (user_id, type, access_token, workspace_id, metadata)
       VALUES ($1, 'github', $2, $3, $4)
       ON CONFLICT (user_id, type) DO UPDATE
       SET access_token = $2, workspace_id = $3, metadata = $4, updated_at = NOW()`,
      [
        userId,
        tokenData.access_token,
        String(githubUser.id),
        JSON.stringify({ login: githubUser.login, name: githubUser.name, avatar_url: githubUser.avatar_url }),
      ]
    );

    // Trigger background sync
    fetch(`${appUrl}/api/integrations/github/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, accessToken: tokenData.access_token }),
    }).catch(() => {});

    return NextResponse.redirect(`${appUrl}/integrations?success=github`);
  } catch (err) {
    console.error('GitHub callback error:', err);
    return NextResponse.redirect(`${appUrl}/integrations?error=github_failed`);
  }
}
