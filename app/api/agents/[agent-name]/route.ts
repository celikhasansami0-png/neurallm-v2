import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { query } from '@/lib/db';
import { chatCompletion } from '@/lib/ai';
import { getEmbedding } from '@/lib/embeddings';
import { rateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

async function getRelevantContext(topic: string, limit = 8): Promise<string> {
  try {
    const embedding = await getEmbedding(topic);
    const embeddingStr = `[${embedding.join(',')}]`;
    const result = await query(
      `SELECT c.content, c.page_number, d.name as doc_name
       FROM chunks c JOIN documents d ON c.document_id = d.id
       WHERE d.status = 'indexed'
       ORDER BY c.embedding <=> $1::vector LIMIT $2`,
      [embeddingStr, limit]
    );
    return result.rows.map((r: { doc_name: string; page_number: number; content: string }) =>
      `[${r.doc_name}, p${r.page_number}]\n${r.content}`
    ).join('\n\n---\n\n');
  } catch {
    const result = await query(
      `SELECT c.content, c.page_number, d.name as doc_name FROM chunks c
       JOIN documents d ON c.document_id = d.id WHERE d.status = 'indexed' LIMIT $1`,
      [limit]
    ).catch(() => ({ rows: [] as Array<{ doc_name: string; page_number: number; content: string }> }));
    return result.rows.map(r => `[${r.doc_name}, p${r.page_number}]\n${r.content}`).join('\n\n---\n\n');
  }
}

const AGENT_PROMPTS: Record<string, (input: string, context: string) => string> = {
  'summarizer': (input, context) =>
    `Create a concise 1-page professional summary.\n${context ? `Context:\n${context}` : `Input:\n${input}`}\nFormat: Executive Summary, Key Points, Conclusions.`,
  'comparator': (input, context) =>
    `Compare the two documents. Show: similarities, differences, conflicts, recommendations.\nContext:\n${context}\nDocuments: ${input}`,
  'meeting-notes': (input) =>
    `Extract from this transcript:\n1. Action Items (owner + deadline)\n2. Key Decisions\n3. Discussion Points\n4. Next Steps\n\nTranscript:\n${input}`,
  'client-brief': (input, context) =>
    `Generate a professional client brief with: Executive Summary, Project Overview, Key Findings, Recommendations, Next Steps.\nContext:\n${context}\nDocuments: ${input}`,
  'expert-finder': (input, context) =>
    `Find experts on "${input}" from these documents. List names, roles, expertise, contributions.\nContext:\n${context}`,
  'gap-analysis': (input, context) =>
    `Perform knowledge gap analysis${input ? ` on: ${input}` : ''}.\nIdentify: well-covered topics, partial coverage, gaps, recommendations.\nContext:\n${context}`,
  'trend-report': (input, context) =>
    `Analyze trends${input ? ` for: ${input}` : ''}.\nReport: most queried topics, emerging trends, high-demand areas, recommendations.\nContext:\n${context}`,
  'weekly-digest': (input, context) =>
    `Generate weekly knowledge base digest${input ? ` for: ${input}` : ''}.\nInclude: new documents, top queries, key insights, recommended reading.\nContext:\n${context}`,
};

export async function POST(
  request: NextRequest,
  { params }: { params: { 'agent-name': string } }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { ok } = rateLimit(userId, 20); // 20 agent runs/min
  if (!ok) return NextResponse.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 });

  try {
    const agentName = params['agent-name'];
    const VALID_AGENTS = ['summarizer','comparator','meeting-notes','client-brief','expert-finder','gap-analysis','trend-report','weekly-digest'];
    if (!VALID_AGENTS.includes(agentName)) {
      return NextResponse.json({ error: `Unknown agent: ${agentName}` }, { status: 404 });
    }
    const { input } = await request.json();

    const promptBuilder = AGENT_PROMPTS[agentName];
    if (!promptBuilder) {
      return NextResponse.json({ error: `Unknown agent: ${agentName}` }, { status: 404 });
    }

    const context = await getRelevantContext(input || agentName);
    const prompt = promptBuilder(input || '', context);

    const result = await chatCompletion([
      { role: 'system', content: 'You are NeuraLLM, expert AI assistant for a consulting firm. Provide professional, structured, actionable responses.' },
      { role: 'user', content: prompt },
    ]);

    return NextResponse.json({ result, agentName });
  } catch (err) {
    console.error('Agent error:', err);
    return NextResponse.json({ error: 'Agent execution failed' }, { status: 500 });
  }
}
