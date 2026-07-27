import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { chunkText } from '@/lib/chunker';
import { getEmbedding } from '@/lib/embeddings';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

async function extractTextFromBuffer(buffer: Buffer, ext: string): Promise<string> {
  if (ext === 'pdf') {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require('pdf-parse');
      const data = await pdfParse(buffer);
      return data.text || '';
    } catch (e) {
      console.error('PDF parse error:', e);
      return '';
    }
  }

  if (ext === 'docx') {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const mammoth = require('mammoth');
      const result = await mammoth.extractRawText({ buffer });
      return result.value || '';
    } catch (e) {
      console.error('DOCX parse error:', e);
      return '';
    }
  }

  if (ext === 'pptx') {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const JSZip = require('jszip');
      const zip = await JSZip.loadAsync(buffer);
      let text = '';
      const files = Object.keys(zip.files);
      const slideFiles = files
        .filter((f: string) => /ppt\/slides\/slide\d+\.xml/.test(f))
        .sort();
      for (const slideFile of slideFiles) {
        const content: string = await zip.files[slideFile].async('string');
        const matches = content.match(/<a:t[^>]*>([^<]*)<\/a:t>/g) || [];
        text += matches.map((m: string) => m.replace(/<[^>]+>/g, '')).join(' ') + '\n';
      }
      return text;
    } catch (e) {
      console.error('PPTX parse error:', e);
      return '';
    }
  }

  return buffer.toString('utf-8');
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const allowedTypes = ['pdf', 'docx', 'pptx'];
    const ext = file.name.toLowerCase().split('.').pop() || '';
    if (!allowedTypes.includes(ext)) {
      return NextResponse.json({ error: 'Unsupported file type. Use PDF, DOCX, or PPTX.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Save file to /uploads
    const uploadsDir = path.join(process.cwd(), 'uploads');
    await mkdir(uploadsDir, { recursive: true });
    const safeFilename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    await writeFile(path.join(uploadsDir, safeFilename), buffer);

    // Insert document record
    const docResult = await query(
      'INSERT INTO documents (name, type, size, status) VALUES ($1, $2, $3, $4) RETURNING id',
      [file.name, ext, file.size, 'processing']
    );
    const documentId = docResult.rows[0].id;

    // Parse + embed in background (fire-and-forget)
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
      } catch (err) {
        console.error('Indexing error:', err);
        await query('UPDATE documents SET status = $1 WHERE id = $2', ['failed', documentId]).catch(() => {});
      }
    })();

    return NextResponse.json({ id: documentId, name: file.name, status: 'processing' });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
