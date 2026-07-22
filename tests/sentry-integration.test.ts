import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

function readProjectFile(path: string) {
  return readFileSync(join(root, path), "utf8");
}

describe("Sentry integration", () => {
  it("configures Sentry for the Next.js App Router runtimes", () => {
    expect(existsSync(join(root, "instrumentation-client.ts"))).toBe(true);
    expect(existsSync(join(root, "sentry.server.config.ts"))).toBe(true);
    expect(existsSync(join(root, "sentry.edge.config.ts"))).toBe(true);
    expect(existsSync(join(root, "instrumentation.ts"))).toBe(true);

    const clientSource = readProjectFile("instrumentation-client.ts");
    expect(clientSource).toContain("Sentry.init");
    expect(clientSource).toContain('import("@sentry/nextjs")');
    expect(clientSource).not.toContain('import * as Sentry from "@sentry/nextjs"');
    expect(clientSource).toContain('addEventListener("unhandledrejection"');
    expect(clientSource).toContain("requestIdleCallback");
    expect(clientSource).toContain('addEventListener("pointerdown"');
    expect(clientSource).toContain("15_000");
    expect(clientSource).toContain("Sentry.captureException");
    expect(readProjectFile("sentry.server.config.ts")).toContain("Sentry.init");
    expect(readProjectFile("sentry.edge.config.ts")).toContain("Sentry.init");
    expect(readProjectFile("instrumentation.ts")).toContain("onRequestError");
  });

  it("adds a React global error boundary for App Router client exceptions", () => {
    const source = readProjectFile("app/global-error.tsx");

    expect(source).toContain("\"use client\"");
    expect(source).toContain("Sentry.captureException");
    expect(source).toContain("reset");
  });

  it("enables source map upload through next.config.ts", () => {
    const source = readProjectFile("next.config.ts");

    expect(source).toContain("withSentryConfig");
    expect(source).toContain("org: process.env.SENTRY_ORG");
    expect(source).toContain("project: process.env.SENTRY_PROJECT");
    expect(source).toContain("widenClientFileUpload");
    expect(source).toContain("hideSourceMaps");
  });

  it("documents required Sentry environment variables", () => {
    const source = readProjectFile(".env.example");

    expect(source).toContain("NEXT_PUBLIC_SENTRY_DSN=");
    expect(source).toContain("SENTRY_DSN=");
    expect(source).toContain("SENTRY_ORG=");
    expect(source).toContain("SENTRY_PROJECT=");
    expect(source).toContain("SENTRY_AUTH_TOKEN=");
    expect(source).toContain("SENTRY_ENVIRONMENT=");
  });

  it("captures AI and Supabase failures with Sentry context", () => {
    expect(readProjectFile("lib/monitoring/sentry.ts")).toContain("captureAppException");
    expect(readProjectFile("lib/ai/assistant-service.ts")).toContain("captureAppException");
    expect(readProjectFile("lib/ai/assistant-retrieval.ts")).toContain("captureAppException");
    expect(readProjectFile("lib/search/semantic-search.ts")).toContain("captureAppException");
    expect(readProjectFile("lib/content/heritage-repository.ts")).toContain("captureAppException");
  });
});
