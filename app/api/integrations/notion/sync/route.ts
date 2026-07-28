import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const { userId, accessToken } = await request.json();
    if (!userId || !accessToken) {
      return NextResponse.json({ error: 'Missing params' }, { status: 400 });
    }

    // Fetch all pages from Notion
    const searchRes = await fetch('https://api.notion.com/v1/search', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ filter: { property: 'object', value: 'page' }, page_size: 50 }),
    });

    if (!searchRes.ok) throw new Error('Notion search failed');

    const { results } = await searchRes.json();
    let synced = 0;

    for (const page of results) {
      try {
        const title =
          page.properties?.title?.title?.[0]?.plain_text ||
          page.properties?.Name?.title?.[0]?.plain_text ||
          'Untitled';

        // Get page content blocks
        const blocksRes = await fetch(`https://api.notion.com/v1/blocks/${page.id}/children`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Notion-Version': '2022-06-28',
          },
        });

        let content = `# ${title}\n\n`;
        if (blocksRes.ok) {
          const { results: blocks } = await blocksRes.json();
          for (const block of blocks) {
            const text = block[block.type]?.rich_text?.map((t: { plain_text: string }) => t.plain_text).join('') || '';
            if (text) content += text + '\n';
          }
        }

        if (content.length < 20) continue;

        // Upsert document
        const docResult = await query(
          `INSERT INTO documents (user_id, name, type, size, status, source, external_id)
           VALUES ($1, $2, 'notion', $3, 'indexed', 'notion', $4)
           ON CONFLICT (user_id, external_id) DO UPDATE
           SET name = $2, size = $3, status = 'indexed', updated_at = NOW()
           RETURNING id`,
          [userId, title, content.length, page.id]
        );

        const docId = docResult.rows[0]?.id;
        if (docId) {
          // Store content as a single chunk (embedding done separately)
          await query(
            `INSERT INTO chunks (document_id, content, page_number)
             VALUES ($1, $2, 1)
             ON CONFLICT DO NOTHING`,
            [docId, content.slice(0, 8000)]
          ).catch(() => {});
          synced++;
        }
      } catch {
        // Skip individual page errors
      }
    }

    return NextResponse.json({ synced, total: results.length });
  } catch (err) {
    console.error('Notion sync error:', err);
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}
