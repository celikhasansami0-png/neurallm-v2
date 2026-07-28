import OpenAI from 'openai';

let client: OpenAI | null = null;

export function getNvidia(): OpenAI {
  if (!client) {
    client = new OpenAI({
      apiKey: process.env.NVIDIA_API_KEY,
      baseURL: 'https://integrate.api.nvidia.com/v1',
    });
  }
  return client;
}

export async function chatCompletion(
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[]
): Promise<string> {
  const nvidia = getNvidia();
  const completion = await nvidia.chat.completions.create({
    model: 'meta/llama-3.3-70b-instruct',
    messages,
    max_tokens: 2048,
    temperature: 0.3,
  });
  return completion.choices[0]?.message?.content || '';
}
