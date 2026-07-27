// Embeddings — OpenAI text-embedding-3-small (1536 dims) with hash fallback

export async function getEmbedding(text: string): Promise<number[]> {
  if (process.env.OPENAI_API_KEY) {
    try {
      const res = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: text.slice(0, 8000),
        }),
      });
      const data = await res.json();
      if (data.data?.[0]?.embedding) return data.data[0].embedding;
    } catch {}
  }
  // Fallback: deterministic hash embedding (384 dims)
  return hashEmbedding(text);
}

export function hashEmbedding(text: string): number[] {
  const dims = 384;
  const vec = new Array(dims).fill(0);
  const normalized = text.toLowerCase().replace(/\s+/g, ' ').trim();
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    const pos = (i * 7 + char * 13) % dims;
    vec[pos] += Math.sin(char * (i + 1) * 0.01);
  }
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
