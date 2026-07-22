import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

function readProjectFile(path: string) {
  return readFileSync(join(root, path), "utf8");
}

describe("Release Candidate readiness", () => {
  it("applies security headers from middleware", () => {
    const source = readProjectFile("middleware.ts");

    expect(source).toContain("applySecurityHeaders");
    expect(source).toContain("Content-Security-Policy");
    expect(source).toContain("X-Frame-Options");
    expect(source).toContain("Strict-Transport-Security");
  });

  it("provides rate limiting for public and admin API routes", () => {
    expect(existsSync(join(root, "lib/security/rate-limit.ts"))).toBe(true);
    const source = readProjectFile("lib/security/rate-limit.ts");
    const assistantRoute = readProjectFile("app/api/assistant/route.ts");
    const searchRoute = readProjectFile("app/api/search/route.ts");
    const adminMediaRoute = readProjectFile("app/api/admin/media/route.ts");

    expect(source).toContain("checkRateLimit");
    expect(source).toContain("RATE_LIMIT_WINDOW_MS");
    expect(assistantRoute).toContain("rateLimitRequest");
    expect(searchRoute).toContain("rateLimitRequest");
    expect(adminMediaRoute).toContain("rateLimitRequest");
  });

  it("uses constant-time admin key verification", () => {
    const source = readProjectFile("lib/supabase/admin.ts");

    expect(source).toContain("timingSafeEqual");
    expect(source).toContain("verifyAdminRequest");
  });

  it("keeps admin heritage list behind admin authorization", () => {
    const source = readProjectFile("app/api/admin/heritage/route.ts");

    expect(source).toContain("export async function GET(request: Request)");
    expect(source).toContain("verifyAdminRequest(request)");
    expect(source).toContain("Unauthorized admin request.");
    expect(source).toContain("getAdminHeritageRows");
  });

  it("exposes a health endpoint for deployment probes", () => {
    expect(existsSync(join(root, "app/api/health/route.ts"))).toBe(true);
    const source = readProjectFile("app/api/health/route.ts");

    expect(source).toContain("runtime");
    expect(source).toContain("Cache-Control");
    expect(source).toContain("SENTRY_ENVIRONMENT");
  });

  it("documents and scripts backup, load testing and RC launch checks", () => {
    expect(existsSync(join(root, "scripts/supabase-backup.ps1"))).toBe(true);
    expect(existsSync(join(root, "scripts/load-test.ps1"))).toBe(true);
    expect(existsSync(join(root, "docs/rc-production-readiness.md"))).toBe(true);

    const loadTestScript = readProjectFile("scripts/load-test.ps1");

    expect(readProjectFile("scripts/supabase-backup.ps1")).toContain("SUPABASE_DB_URL");
    expect(loadTestScript).toContain("RequestCount");
    expect(loadTestScript).toContain("Receive-FinishedJobs");
    expect(loadTestScript).toContain("$results += $batch.Results");
    expect(loadTestScript).toContain("$results.Count -ne $RequestCount");
    expect(readProjectFile("docs/rc-production-readiness.md")).toContain("Release Candidate");
  });
});
