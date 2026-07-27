export interface Chunk {
  content: string;
  pageNumber: number;
  chunkIndex: number;
}

export function chunkText(text: string, chunkSize = 500, overlap = 50): Chunk[] {
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const chunks: Chunk[] = [];
  let i = 0;
  let chunkIndex = 0;

  // Estimate page boundaries (rough: ~250 words per page)
  const wordsPerPage = 250;

  while (i < words.length) {
    const end = Math.min(i + chunkSize, words.length);
    const content = words.slice(i, end).join(' ');
    const pageNumber = Math.floor(i / wordsPerPage) + 1;
    
    if (content.trim()) {
      chunks.push({ content: content.trim(), pageNumber, chunkIndex });
      chunkIndex++;
    }
    
    i = end - overlap;
    if (i <= 0) i = end;
    if (end === words.length) break;
  }

  return chunks;
}
