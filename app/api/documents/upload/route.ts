import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { query } from '@/lib/db';
import { chunkText } from '@/lib/chunker';
import { getEmbedding } from '@/lib/embeddings';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const ALLOWED_TYPES = ['pdf', 'docx', 'pptx', 'txt'];
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

async function extractTextFromBuffer(buffer: Buffer, ext: string): Promise<string> {
  if (ext === 'pdf') {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require('pdf-parse');
      const data = await pdfParse(buffer);
      return data.text || '';
    } catch { return ''; }
  }
  if (ext === 'docx') {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const mammoth = require('mammoth');
      const result = await mammoth.extractRawText({ buffer });
      return result.value || '';
    } catch { return ''; }
  }
  if (ext === 'pptx') {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const JSZip = require('jszip');
      const zip = await JSZip.loadAsync(buffer);
      let text = '';
      const slideFiles = Object.keys(zip.files)
        .filter((f: string) => /ppt\/slides\/slide\d+\.xml/.test(f))
        .sort();
      for (const slideFile of slideFiles) {
        const content: string = await zip.files[slideFile].async('string');
        const matches = content.match(/<a:t[^>]*>([^<]*)<\/a:t>/g) || [];
        text += matches.map((m: string) => m.replace(/<[^>]+>/g, '')).join(' ') + '\n';
      }
      return text;
    } catch { return ''; }
  }
  if (ext === 'txt') return buffer.toString('utf-8').slice(0, 500000);
  return '';
}

export async function POST(request: NextRequest) {
  // Auth check
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    // File type validation
    const ext = file.name.toLowerCase().split('.').pop() || '';
    if (!ALLOWED_TYPES.includes(ext)) {
      return NextResponse.json({ error: 'Unsupported file type. Use PDF, DOCX, PPTX, or TXT.' }, { status: 400 });
    }

    // File size validation
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large. Maximum 20MB.' }, { status: 400 });
    }

    // Sanitize filename
    const safeName = file.name.replace(/[<>:"/\\|?*\x00-\x1F]/g, '_').slice(0, 255);

    const buffer = Buffer.from(await file.arrayBuffer());

    // Insert document record
    const docResult = await query(
      'INSERT INTO documents (name, type, size, status) VALUES ($1, $2, $3, $4) RETURNING id',
      [safeName, ext, file.size, 'processing']
    );
    const documentId = docResult.rows[0].id;

    // Parse + embed in background
    void (async () => {
      try {
        const text = await extractTextFromBuffer(buffer, ext);
        if (!text?.trim()) {
          await query('UPDATE documents SET status = $1 WHERE id = $2', ['failed', documentId]);
          return;
        }
        const chunks = chunkText(text);
        for (const chunk of chunks) {
          const embedding = await getEmbedding(chunk.content);
          const embeddingStr = `[${embedding.join(',')}]`;
          await query(
            'INSERT INTO chunks (document_id, content, embedding, page_number, chunk_index) VALUES ($1, $2, $3::vector, $4, $5)',
            [documentId, chunk.content, embeddingStr, chunk.pageNumber, chunk.chunkIndex]
          );
        }
        await query('UPDATE documents SET status = $1 WHERE id = $2', ['indexed', documentId]);
      } catch {
        await query('UPDATE documents SET status = $1 WHERE id = $2', ['failed', documentId]).catch(() => {});
      }
    })();

    return NextResponse.json({ id: documentId, name: safeName, status: 'processing' });
  } catch {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
