// Simple deterministic hash-based embedding for fallback (384 dimensions)
// In production, use a proper embedding model

export function hashEmbedding(text: string): number[] {
  const dims = 384;
  const vec = new Array(dims).fill(0);
  const normalized = text.toLowerCase().replace(/\s+/g, ' ').trim();
  
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    const pos = (i * 7 + char * 13) % dims;
    vec[pos] += Math.sin(char * (i + 1) * 0.01);
  }
  
  // Normalize to unit vector
  const magnitude = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0)) || 1;
  return vec.map(v => v / magnitude);
}

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  return dot / (Math.sqrt(magA) * Math.sqrt(magB) || 1);
}

export async function getEmbedding(text: string): Promise<number[]> {
  // Try Groq first if they ever add embedding support
  // For now use hash-based approach
  return hashEmbedding(text);
}
