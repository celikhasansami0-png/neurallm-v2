import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getEmbedding } from '@/lib/embeddings';
import { chunkText } from '@/lib/chunker';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const userId = searchParams.get('state');

  if (!code || !userId) return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/integrations?error=slack`);

  // Exchange code for token
  const tokenRes = await fetch('https://slack.com/api/oauth.v2.access', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.SLACK_CLIENT_ID!,
      client_secret: process.env.SLACK_CLIENT_SECRET!,
      code,
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/slack/callback`,
    }),
  });
  const tokenData = await tokenRes.json();
  if (!tokenData.ok) return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/integrations?error=slack`);

  const accessToken = tokenData.access_token;
  const workspaceId = tokenData.team?.id;
  const workspaceName = tokenData.team?.name;

  // Save integration
  await query(
    `INSERT INTO integrations (user_id, type, access_token, workspace_id, workspace_name)
     VALUES ($1, 'slack', $2, $3, $4)
     ON CONFLICT (user_id, type) DO UPDATE SET access_token = $2, workspace_id = $3, workspace_name = $4, updated_at = NOW()`,
    [userId, accessToken, workspaceId, workspaceName]
  );

  // Background: index recent messages
  void indexSlackMessages(accessToken, userId, workspaceName || 'Slack');

  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/integrations?success=slack`);
}

async function indexSlackMessages(token: string, userId: string, workspaceName: string) {
  try {
    // Get channels
    const chRes = await fetch('https://slack.com/api/conversations.list?limit=20&types=public_channel', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const chData = await chRes.json();
    if (!chData.ok) return;

    for (const channel of (chData.channels || []).slice(0, 5)) {
      const msgRes = await fetch(`https://slack.com/api/conversations.history?channel=${channel.id}&limit=100`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const msgData = await msgRes.json();
      if (!msgData.ok) continue;

      const text = msgData.messages
        ?.filter((m: any) => m.text && m.type === 'message')
        .map((m: any) => m.text)
        .join('\n');

      if (!text || text.length < 50) continue;

      // Insert as document
      const docRes = await query(
        `INSERT INTO documents (name, type, size, status, user_id) VALUES ($1, 'slack', $2, 'processing', $3) RETURNING id`,
        [`${workspaceName} #${channel.name}`, text.length, userId]
      );
      const docId = docRes.rows[0].id;

      // Chunk and embed
      const chunks = chunkText(text);
      for (let i = 0; i < chunks.length; i++) {
        const embedding = await getEmbedding(chunks[i].content);
        await query(
          `INSERT INTO chunks (document_id, content, embedding, page_number, chunk_index) VALUES ($1, $2, $3::vector, $4, $5)`,
          [docId, chunks[i].content, JSON.stringify(embedding), chunks[i].pageNumber, i]
        );
      }

      await query(`UPDATE documents SET status = 'indexed' WHERE id = $1`, [docId]);
    }
  } catch (e) {
    console.error('Slack indexing error:', e);
  }
}
