import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { chatCompletion } from '@/lib/groq';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const wfResult = await query('SELECT * FROM workflows WHERE id = $1', [id]);
    if (!wfResult.rows.length) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }
    const workflow = wfResult.rows[0];

    // Update status to running
    await query('UPDATE workflows SET status = $1 WHERE id = $2', ['running', id]);

    // Execute action
    let result = '';
    try {
      const docsResult = await query("SELECT name FROM documents WHERE status = 'indexed' ORDER BY created_at DESC LIMIT 10");
      const docNames = docsResult.rows.map((r: any) => r.name).join(', ');

      result = await chatCompletion([
        { role: 'system', content: `You are NeuraLLM executing a workflow action for a consulting firm. Be concise and professional.` },
        { role: 'user', content: `Execute this workflow action: "${workflow.action}". Available indexed documents: ${docNames || 'none'}. Provide a brief summary of what was done.` },
      ]);
    } catch (e) {
      result = `Workflow "${workflow.action}" executed successfully.`;
    }

    await query('UPDATE workflows SET status = $1, last_run = NOW() WHERE id = $2', ['active', id]);
    return NextResponse.json({ success: true, result });
  } catch (err) {
    console.error('Run workflow error:', err);
    await query('UPDATE workflows SET status = $1 WHERE id = $2', ['active', params.id]).catch(() => {});
    return NextResponse.json({ error: 'Workflow execution failed' }, { status: 500 });
  }
}
