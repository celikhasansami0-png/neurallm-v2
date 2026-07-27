import Groq from 'groq-sdk';

let client: Groq | null = null;

export function getGroq(): Groq {
  if (!client) {
    client = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return client;
}

export async function chatCompletion(messages: { role: 'user' | 'assistant' | 'system'; content: string }[]): Promise<string> {
  const groq = getGroq();
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages,
    max_tokens: 2048,
    temperature: 0.3,
  });
  return completion.choices[0]?.message?.content || '';
}
