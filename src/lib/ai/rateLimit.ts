/**
 * Simple fixed-window rate limiter. In-process, per key. Good enough for
 * single-node dev / demo; swap for Upstash / Redis in prod.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  resetMs: number;
}

const BUCKETS = new Map<string, Bucket>();

export function rateLimit(
  key: string,
  limit = 15,
  windowMs = 60_000
): RateLimitResult {
  const now = Date.now();
  const bucket = BUCKETS.get(key);

  if (!bucket || now >= bucket.resetAt) {
    const fresh: Bucket = { count: 1, resetAt: now + windowMs };
    BUCKETS.set(key, fresh);
    return {
      allowed: true,
      remaining: limit - 1,
      limit,
      resetMs: fresh.resetAt - now,
    };
  }

  bucket.count += 1;
  const allowed = bucket.count <= limit;
  return {
    allowed,
    remaining: Math.max(0, limit - bucket.count),
    limit,
    resetMs: bucket.resetAt - now,
  };
}
