import { NextResponse } from "next/server";

export const RATE_LIMIT_WINDOW_MS = 60_000;

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

type RateLimitOptions = {
  key: string;
  limit: number;
  windowMs?: number;
};

const buckets = new Map<string, RateLimitBucket>();

function now() {
  return Date.now();
}

function cleanupBuckets(currentTime: number) {
  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= currentTime) {
      buckets.delete(key);
    }
  }
}

export function getClientIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export function checkRateLimit({ key, limit, windowMs = RATE_LIMIT_WINDOW_MS }: RateLimitOptions) {
  const currentTime = now();
  cleanupBuckets(currentTime);

  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= currentTime) {
    const resetAt = currentTime + windowMs;
    buckets.set(key, { count: 1, resetAt });

    return {
      allowed: true,
      remaining: Math.max(limit - 1, 0),
      resetAt
    };
  }

  if (bucket.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: bucket.resetAt
    };
  }

  bucket.count += 1;

  return {
    allowed: true,
    remaining: Math.max(limit - bucket.count, 0),
    resetAt: bucket.resetAt
  };
}

export function rateLimitResponse(resetAt: number) {
  const retryAfter = Math.max(Math.ceil((resetAt - now()) / 1000), 1);

  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfter),
        "X-RateLimit-Reset": String(resetAt)
      }
    }
  );
}

export function rateLimitRequest(request: Request, namespace: string, limit: number, windowMs = RATE_LIMIT_WINDOW_MS) {
  const result = checkRateLimit({
    key: `${namespace}:${getClientIp(request)}`,
    limit,
    windowMs
  });

  return result.allowed ? null : rateLimitResponse(result.resetAt);
}
