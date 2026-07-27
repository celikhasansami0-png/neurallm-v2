import { query } from './db';

export async function log(
  userId: string,
  action: string,
  resourceType?: string,
  resourceId?: string,
  metadata?: Record<string, any>
) {
  try {
    await query(
      `INSERT INTO audit_logs (user_id, action, resource_type, resource_id, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, action, resourceType || null, resourceId || null, JSON.stringify(metadata || {})]
    );
  } catch {}
}
