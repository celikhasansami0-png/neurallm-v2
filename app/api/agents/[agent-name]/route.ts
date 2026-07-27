import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { chatCompletion } from '@/lib/groq';
import { getEmbedding } from '@/lib/embeddings';

export const dynamic = 'force-dynamic';

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
    return result.rows.map((r: any) => `[${r.doc_name}, p${r.page_number}]\n${r.content}`).join('\n\n---\n\n');
  } catch {
    // Fallback to recent chunks
    const result = await query(
      `SELECT c.content, c.page_number, d.name as doc_name FROM chunks c
       JOIN documents d ON c.document_id = d.id WHERE d.status = 'indexed' LIMIT $1`,
      [limit]
    ).catch(() => ({ rows: [] }));
    return (result as any).rows.map((r: any) => `[${r.doc_name}, p${r.page_number}]\n${r.content}`).join('\n\n---\n\n');
  }
}

const AGENT_PROMPTS: Record<string, (input: string, context: string) => string> = {
  'summarizer': (input, context) => `
You are a professional document summarizer. Create a clear, concise 1-page summary.
${context ? `Document context:\n${context}` : `Input text:\n${input}`}
Format: Executive Summary, Key Points, Conclusions.`,

  'comparator': (input, context) => `
You are a document comparison expert. Compare the two documents and highlight:
1. Key similarities
2. Key differences
3. Conflicting information
4. Recommendations

Context from documents:
${context}

Documents to compare: ${input}`,

  'meeting-notes': (input, _context) => `
You are an expert meeting notes processor. From this transcript, extract:

1. **Action Items** (with owner and deadline if mentioned)
2. **Key Decisions Made**
3. **Discussion Points**
4. **Next Steps**

Transcript:
${input}`,

  'client-brief': (input, context) => `
You are a consulting professional generating a client briefing document.
Create a professional client brief with: Executive Summary, Project Overview, Key Findings, Recommendations, Next Steps.

Context from project documents:
${context}

Selected documents: ${input}`,

  'expert-finder': (input, context) => `
You are analyzing consulting documents to identify subject matter experts.
Topic: "${input}"

From these documents, identify:
1. Names and roles of people who worked on this topic
2. Their areas of expertise demonstrated
3. Key contributions mentioned
4. Recommended contacts for this topic

Document context:
${context}`,

  'gap-analysis': (input, context) => `
You are a knowledge management expert performing a gap analysis.
${input ? `Focus area: ${input}` : 'Analyze all available knowledge.'}

From the indexed documents, identify:
1. **Well-covered topics** (with strong documentation)
2. **Partially covered topics** (needs more depth)
3. **Knowledge gaps** (missing or no documentation)
4. **Recommendations** for filling gaps

Document context:
${context}`,

  'trend-report': (input, context) => `
You are analyzing query patterns and document usage trends.
${input ? `Period: ${input}` : 'Analyze recent activity.'}

Based on the available information, provide:
1. Most frequently accessed topics
2. Emerging trends in queries
3. Knowledge areas with high demand
4. Recommendations for knowledge base expansion

Context:
${context}`,

  'weekly-digest': (input, context) => `
You are generating a weekly activity digest for a consulting firm's knowledge platform.
${input ? `Week: ${input}` : 'Current week'}

Generate a professional weekly digest including:
1. **New Documents Added** this week
2. **Most Queried Topics**
3. **Key Insights** from the knowledge base
4. **Recommended Reading** based on recent activity
5. **Team Highlights**

Available context:
${context}`,
};

export async function POST(request: NextRequest, { params }: { params: { 'agent-name': string } }) {
  try {
    const agentName = params['agent-name'];
    const { input } = await request.json();

    const promptBuilder = AGENT_PROMPTS[agentName];
    if (!promptBuilder) {
      return NextResponse.json({ error: `Unknown agent: ${agentName}` }, { status: 404 });
    }

    const context = await getRelevantContext(input || agentName);
    const prompt = promptBuilder(input || '', context);

    const result = await chatCompletion([
      { role: 'system', content: 'You are NeuraLLM, an expert AI assistant for a consulting firm. Provide professional, structured, actionable responses.' },
      { role: 'user', content: prompt },
    ]);

    return NextResponse.json({ result, agentName });
  } catch (err) {
    console.error('Agent error:', err);
    return NextResponse.json({ error: 'Agent execution failed' }, { status: 500 });
  }
}
