import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("admin campaign configuration foundation", () => {
  it("defines a Supabase campaign_configs schema", () => {
    const migrationPath = "supabase/migrations/20260608_campaign_configs.sql";

    expect(existsSync(migrationPath)).toBe(true);

    const sql = readFileSync(migrationPath, "utf8");

    expect(sql).toContain("create table if not exists public.campaign_configs");
    expect(sql).toContain("slug text primary key");
    expect(sql).toContain("hero_image text");
    expect(sql).toContain("priority_slugs text[]");
    expect(sql).toContain("enable row level security");
  });

  it("adds admin campaign API routes protected by Admin Key", () => {
    const collectionPath = "app/api/admin/campaigns/route.ts";
    const detailPath = "app/api/admin/campaigns/[slug]/route.ts";

    expect(existsSync(collectionPath)).toBe(true);
    expect(existsSync(detailPath)).toBe(true);

    const collectionSource = readFileSync(collectionPath, "utf8");
    const detailSource = readFileSync(detailPath, "utf8");

    expect(collectionSource).toContain("verifyAdminRequest");
    expect(collectionSource).toContain("getAdminCampaignConfigs");
    expect(detailSource).toContain("verifyAdminRequest");
    expect(detailSource).toContain("upsertAdminCampaignConfig");
    expect(detailSource).toContain("export async function PUT");
  });

  it("exposes campaign management in the existing admin UI", () => {
    const source = readFileSync("components/admin/heritage-admin-client.tsx", "utf8");

    expect(source).toContain('"campaigns"');
    expect(source).toContain("活动配置");
    expect(source).toContain("/api/admin/campaigns");
    expect(source).toContain("Campaign");
  });
});
