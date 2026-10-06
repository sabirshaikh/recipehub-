import "server-only";

interface Bucket {
  count: number;
  resetAt: number;
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

/**
 * Fixed-window, in-memory rate limiter.
 * Good enough for a single Node instance / dev. For multi-instance production,
 * swap the Map for a shared store (e.g. Redis / Upstash) behind the same API.
 */
export function createRateLimiter({ limit, windowMs }: { limit: number; windowMs: number }) {
  const buckets = new Map<string, Bucket>();

  return function check(key: string): RateLimitResult {
    const now = Date.now();

    // Opportunistic cleanup so the map can't grow unbounded
    if (buckets.size > 10_000) {
      for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
    }

    let bucket = buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + windowMs };
      buckets.set(key, bucket);
    }
    bucket.count += 1;

    return {
      ok: bucket.count <= limit,
      remaining: Math.max(0, limit - bucket.count),
      retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000),
    };
  };
}

/** Best-effort client IP from proxy headers. */
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return headers.get("x-real-ip") ?? "unknown";
}

// Shared limiters (module-level so they persist across requests)
export const authLimiter = createRateLimiter({ limit: 10, windowMs: 15 * 60 * 1000 });
export const reviewLimiter = createRateLimiter({ limit: 20, windowMs: 60 * 60 * 1000 });
