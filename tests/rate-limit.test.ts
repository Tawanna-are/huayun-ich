import { describe, expect, it } from "vitest";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";

describe("rate limiting", () => {
  it("allows requests until the bucket limit is reached", () => {
    const key = `test:${crypto.randomUUID()}`;

    expect(checkRateLimit({ key, limit: 2, windowMs: 60_000 })).toEqual(
      expect.objectContaining({ allowed: true, remaining: 1 })
    );
    expect(checkRateLimit({ key, limit: 2, windowMs: 60_000 })).toEqual(
      expect.objectContaining({ allowed: true, remaining: 0 })
    );
    expect(checkRateLimit({ key, limit: 2, windowMs: 60_000 })).toEqual(
      expect.objectContaining({ allowed: false, remaining: 0 })
    );
  });

  it("resets expired buckets", async () => {
    const key = `test:${crypto.randomUUID()}`;

    expect(checkRateLimit({ key, limit: 1, windowMs: 1 }).allowed).toBe(true);
    await new Promise((resolve) => setTimeout(resolve, 5));
    expect(checkRateLimit({ key, limit: 1, windowMs: 1 }).allowed).toBe(true);
  });

  it("prefers forwarded client IP headers", () => {
    const request = new Request("https://example.test/api/search", {
      headers: {
        "x-forwarded-for": "203.0.113.10, 10.0.0.1",
        "x-real-ip": "198.51.100.8"
      }
    });

    expect(getClientIp(request)).toBe("203.0.113.10");
  });
});
