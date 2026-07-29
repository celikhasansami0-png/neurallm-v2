// Simple in-memory rate limiter (per user, resets per minute)
const store = new Map<string, { count: number; reset: number }>();

export function rateLimit(userId: string, max = 30): { ok: boolean; remaining: number } {
  const now = Date.now();
  const key = userId;
  const window = 60_000; // 1 minute

  const entry = store.get(key);

  if (!entry || now > entry.reset) {
    store.set(key, { count: 1, reset: now + window });
    return { ok: true, remaining: max - 1 };
  }

  if (entry.count >= max) {
    return { ok: false, remaining: 0 };
  }

  entry.count++;
  return { ok: true, remaining: max - entry.count };
}
