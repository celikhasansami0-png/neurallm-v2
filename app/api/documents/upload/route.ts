import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { chunkText } from '@/lib/chunker';
import { getEmbedding } from '@/lib/embeddings';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

async function parseDocument(buffer: Buffer, filename: string, mimeType: string): Promise<string> {
  const ext = filename.toLowerCase().split('.').pop();
  
  if (ext === 'pdf') {
    try {
      const pdfParse = (await import('pdf-parse')).default;
      const data = await pdfParse(buffer);
      return data.text;
    } catch (e) {
      console.error('PDF parse error:', e);
      return buffer.toString('utf-8', 0, Math.min(buffer.length, 50000));
    }
  }
  
  if (ext === 'docx') {
    try {
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } catch (e) {
      console.error('DOCX parse error:', e);
      return '';
    }
  }
  
  if (ext === 'pptx') {
    // Basic PPTX text extraction via XML parsing
    try {
      const JSZip = (await import('jszip') as any).default || (await import('jszip'));
      const zip = await JSZip.loadAsync(buffer);
      let text = '';
      const slideFiles = Object.keys(zip.files).filter(f => f.match(/ppt\/slides\/slide\d+\.xml/));
      for (const slideFile of slideFiles.sort()) {
        const content = await zip.files[slideFile].async('string');
        const textMatches = content.match(/<a:t[^>]*>([^<]*)<\/a:t>/g) || [];
        text += textMatches.map((m: string) => m.replace(/<[^>]+>/g, '')).join(' ') + '\n';
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
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
    }

    // Save file
    const uploadsDir = path.join(process.cwd(), 'uploads');
    await mkdir(uploadsDir, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    const safeFilename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    await writeFile(path.join(uploadsDir, safeFilename), buffer);

    // Insert document record
    const docResult = await query(
      'INSERT INTO documents (name, type, size, status) VALUES ($1, $2, $3, $4) RETURNING id',
      [file.name, ext, file.size, 'processing']
    );
    const documentId = docResult.rows[0].id;

    // Parse and index in background
    (async () => {
      try {
        const text = await parseDocument(buffer, file.name, file.type);
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
