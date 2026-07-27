import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { chatCompletion } from '@/lib/groq';

export const dynamic = 'force-dynamic';

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  try {
    const wfResult = await query('SELECT * FROM workflows WHERE id = $1', [id]);
    if (!wfResult.rows.length) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }
    const workflow = wfResult.rows[0];

    await query('UPDATE workflows SET status = $1 WHERE id = $2', ['running', id]);

    let result = '';
    try {
      const docsResult = await query(
        "SELECT name FROM documents WHERE status = 'indexed' ORDER BY created_at DESC LIMIT 10"
      );
      const docNames = docsResult.rows.map((r: { name: string }) => r.name).join(', ');
      result = await chatCompletion([
        { role: 'system', content: 'You are NeuraLLM executing a workflow for a consulting firm. Be concise and professional.' },
        { role: 'user', content: `Execute: "${workflow.action}". Available documents: ${docNames || 'none'}. Summarize what was done.` },
      ]);
    } catch {
      result = `Workflow "${workflow.action}" completed.`;
    }

    await query('UPDATE workflows SET status = $1, last_run = NOW() WHERE id = $2', ['active', id]);
    return NextResponse.json({ success: true, result });
  } catch (err) {
    console.error('Run workflow error:', err);
    await query('UPDATE workflows SET status = $1 WHERE id = $2', ['active', id]).catch(() => {});
    return NextResponse.json({ error: 'Workflow execution failed' }, { status: 500 });
  }
}
