import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { query } from '@/lib/db';
import { getEmbedding } from '@/lib/embeddings';
import { chatCompletion } from '@/lib/nvidia';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const start = Date.now();
  try {
    const { question } = await request.json();
    if (!question?.trim()) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    const questionEmbedding = await getEmbedding(question);
    const embeddingStr = `[${questionEmbedding.join(',')}]`;

    let chunks: Array<{ content: string; page_number: number; document_id: string; document_name: string; similarity: number }> = [];

    try {
      const result = await query(
        `SELECT c.id, c.content, c.page_number, c.document_id, d.name as document_name,
                1 - (c.embedding <=> $1::vector) as similarity
         FROM chunks c
         JOIN documents d ON c.document_id = d.id
         WHERE d.status = 'indexed'
         ORDER BY c.embedding <=> $1::vector
         LIMIT 5`,
        [embeddingStr]
      );
      chunks = result.rows;
    } catch {
      // Fallback: text search
      const fallback = await query(
        `SELECT c.id, c.content, c.page_number, c.document_id, d.name as document_name, 0.5 as similarity
         FROM chunks c JOIN documents d ON c.document_id = d.id
         WHERE d.status = 'indexed' AND c.content ILIKE $1
         LIMIT 5`,
        [`%${question.slice(0, 50)}%`]
      ).catch(() => ({ rows: [] }));
      chunks = fallback.rows;
    }

    const responseTime = (Date.now() - start) / 1000;
    let answer: string;
    let sources: Array<{ documentId: string; documentName: string; pageNumber: number; similarity: number }> = [];

    if (chunks.length === 0) {
      answer = 'No relevant information found in the knowledge base. Please upload relevant documents first.';
    } else {
      const context = chunks.map((c, i) =>
        `[Source ${i + 1}: ${c.document_name}, page ${c.page_number}]\n${c.content}`
      ).join('\n\n---\n\n');

      answer = await chatCompletion([
        {
          role: 'system',
          content: `You are NeuraLLM, an AI assistant for a consulting firm's knowledge management platform.
Answer questions based ONLY on the provided document excerpts. Be precise and professional.
If the context doesn't contain enough information, say so clearly.

Document Context:
${context}`,
        },
        { role: 'user', content: question },
      ]);

      sources = chunks.map(c => ({
        documentId: c.document_id,
        documentName: c.document_name,
        pageNumber: c.page_number,
        similarity: c.similarity,
      }));
    }

    // Save query
    await query(
      'INSERT INTO queries (question, answer, sources) VALUES ($1, $2, $3)',
      [question, answer, JSON.stringify(sources)]
    ).catch(err => console.error('Failed to save query:', err));

    return NextResponse.json({ answer, sources, responseTime });
  } catch (err) {
    console.error('ASK error:', err);
    return NextResponse.json({ error: 'Failed to process question' }, { status: 500 });
  }
}
