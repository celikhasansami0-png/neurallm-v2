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

    const headers = {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    };

    // Get user's repos
    const reposRes = await fetch('https://api.github.com/user/repos?per_page=30&sort=updated', { headers });
    if (!reposRes.ok) throw new Error('Failed to fetch repos');

    const repos = await reposRes.json();
    let synced = 0;

    for (const repo of repos.slice(0, 15)) {
      try {
        // Get README
        const readmeRes = await fetch(
          `https://api.github.com/repos/${repo.full_name}/readme`,
          { headers: { ...headers, Accept: 'application/vnd.github.raw' } }
        );

        if (!readmeRes.ok) continue;
        const readmeContent = await readmeRes.text();
        if (!readmeContent || readmeContent.length < 50) continue;

        const content = `# ${repo.full_name}\n\n${repo.description ? repo.description + '\n\n' : ''}${readmeContent}`;
        const docName = `GitHub: ${repo.full_name} (README)`;

        const docResult = await query(
          `INSERT INTO documents (user_id, name, type, size, status, source, external_id)
           VALUES ($1, $2, 'github', $3, 'indexed', 'github', $4)
           ON CONFLICT (user_id, external_id) DO UPDATE
           SET name = $2, size = $3, status = 'indexed', updated_at = NOW()
           RETURNING id`,
          [userId, docName, content.length, `${repo.full_name}/readme`]
        );

        const docId = docResult.rows[0]?.id;
        if (docId) {
          await query(
            `INSERT INTO chunks (document_id, content, page_number)
             VALUES ($1, $2, 1)
             ON CONFLICT DO NOTHING`,
            [docId, content.slice(0, 8000)]
          ).catch(() => {});
          synced++;
        }
      } catch {
        // Skip individual repo errors
      }
    }

    return NextResponse.json({ synced, total: repos.length });
  } catch (err) {
    console.error('GitHub sync error:', err);
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}
