import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getEmbedding } from '@/lib/embeddings';
import { chunkText } from '@/lib/chunker';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const userId = searchParams.get('state');

  if (!code || !userId) return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/integrations?error=google`);

  // Exchange code for tokens
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      code,
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/google-drive/callback`,
      grant_type: 'authorization_code',
    }),
  });
  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/integrations?error=google`);

  await query(
    `INSERT INTO integrations (user_id, type, access_token, refresh_token, workspace_name)
     VALUES ($1, 'google_drive', $2, $3, 'Google Drive')
     ON CONFLICT (user_id, type) DO UPDATE SET access_token = $2, refresh_token = $3, updated_at = NOW()`,
    [userId, tokenData.access_token, tokenData.refresh_token || null]
  );

  // Background: index recent Drive files
  void indexGoogleDrive(tokenData.access_token, userId);

  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/integrations?success=google`);
}

async function indexGoogleDrive(token: string, userId: string) {
  try {
    const filesRes = await fetch(
      'https://www.googleapis.com/drive/v3/files?q=mimeType%3D\'application/vnd.google-apps.document\'&pageSize=20&fields=files(id,name,modifiedTime)',
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const filesData = await filesRes.json();

    for (const file of (filesData.files || []).slice(0, 10)) {
      const contentRes = await fetch(
        `https://www.googleapis.com/drive/v3/files/${file.id}/export?mimeType=text/plain`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const text = await contentRes.text();
      if (!text || text.length < 50) continue;

      const docRes = await query(
        `INSERT INTO documents (name, type, size, status, user_id) VALUES ($1, 'gdoc', $2, 'processing', $3) RETURNING id`,
        [file.name, text.length, userId]
      );
      const docId = docRes.rows[0].id;

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
    console.error('Google Drive indexing error:', e);
  }
}
