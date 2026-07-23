import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Feishu sync admin integration", () => {
  it("adds admin-only manual sync and log APIs", () => {
    const routePath = "app/api/admin/feishu-sync/route.ts";
    const logsPath = "app/api/admin/feishu-sync/logs/route.ts";
    const cronPath = "app/api/cron/feishu-sync/route.ts";

    expect(existsSync(routePath)).toBe(true);
    expect(existsSync(logsPath)).toBe(true);
    expect(existsSync(cronPath)).toBe(true);

    const routeSource = readFileSync(routePath, "utf8");
    const logsSource = readFileSync(logsPath, "utf8");
    const cronSource = readFileSync(cronPath, "utf8");

    expect(routeSource).toContain("verifyAdminRequest");
    expect(routeSource).toContain('source: "manual"');
    expect(routeSource).toContain("syncFeishuContent");
    expect(logsSource).toContain("getFeishuSyncLogs");
    expect(logsSource).toContain("verifyAdminRequest");
    expect(cronSource).toContain("CRON_SECRET");
    expect(cronSource).toContain('source: "cron"');
  });

  it("exposes a manual Feishu sync action in the existing admin dashboard", () => {
    const source = readFileSync("components/admin/heritage-admin-client.tsx", "utf8");

    expect(source).toContain("/api/admin/feishu-sync");
    expect(source).toContain("/api/admin/feishu-sync/logs");
    expect(source).toContain("立即同步飞书");
    expect(source).toContain("同步日志");
  });

  it("documents environment variables and Vercel cron cadence", () => {
    const env = readFileSync(".env.example", "utf8");
    const docsPath = "docs/feishu-sync.md";
    const vercelPath = "vercel.json";

    expect(env).toContain("FEISHU_APP_ID=");
    expect(env).toContain("FEISHU_APP_SECRET=");
    expect(env).toContain("FEISHU_BITABLE_APP_TOKEN=");
    expect(env).toContain("FEISHU_BITABLE_TABLE_ID=");
    expect(env).toContain("CRON_SECRET=");
    expect(existsSync(docsPath)).toBe(true);
    expect(existsSync(vercelPath)).toBe(true);

    const docs = readFileSync(docsPath, "utf8");
    const vercel = readFileSync(vercelPath, "utf8");

    expect(docs).toContain("飞书多维表格");
    expect(docs).toContain("每 5 分钟");
    expect(docs).toContain("图片附件");
    expect(vercel).toContain("/api/cron/feishu-sync");
    expect(vercel).toContain("0 2 * * *");
  });
});
