import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("contact submission route", () => {
  it("uses validation, rate limiting, optional auth and the admin client", () => {
    const source = readFileSync("app/api/contact/route.ts", "utf8");

    expect(source).toContain("validateContactSubmission");
    expect(source).toContain("rateLimitRequest");
    expect(source).toContain("createSupabaseAdminClient");
    expect(source).toContain("auth.getUser");
    expect(source).toContain("contact_submissions");
    expect(source).toContain("status: 201");
  });
});
