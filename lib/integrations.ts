import { query } from '@/lib/db';
import { encrypt, decrypt } from '@/lib/encrypt';

export async function saveIntegration(userId: string, type: string, apiKey: string, config: Record<string, string> = {}) {
  const encrypted = encrypt(apiKey);
  await query(
    `INSERT INTO integrations (user_id, type, api_key_encrypted, config_json, connected_at)
     VALUES ($1, $2, $3, $4, NOW())
     ON CONFLICT (user_id, type)
     DO UPDATE SET api_key_encrypted = $3, config_json = $4, connected_at = NOW()`,
    [userId, type, encrypted, JSON.stringify(config)]
  );
}

export async function getIntegration(userId: string, type: string): Promise<{ apiKey: string; config: Record<string, string> } | null> {
  const result = await query(
    `SELECT api_key_encrypted, config_json FROM integrations WHERE user_id = $1 AND type = $2`,
    [userId, type]
  );
  if (!result.rows[0]) return null;
  const row = result.rows[0];
  return {
    apiKey: decrypt(row.api_key_encrypted),
    config: row.config_json || {},
  };
}

export async function ingestAsDocuments(userId: string, source: string, items: { title: string; content: string; externalId: string }[]) {
  for (const item of items) {
    if (!item.content?.trim()) continue;
    await query(
      `INSERT INTO documents (user_id, name, content, source, external_id, status, created_at)
       VALUES ($1, $2, $3, $4, $5, 'indexed', NOW())
       ON CONFLICT (user_id, external_id) WHERE external_id IS NOT NULL
       DO UPDATE SET content = $3, name = $2, status = 'indexed'`,
      [userId, item.title.slice(0, 255), item.content.slice(0, 50000), source, item.externalId]
    );
  }
  return items.length;
}
