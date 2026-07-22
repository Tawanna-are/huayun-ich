import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Feishu content sync schema", () => {
  it("defines source configuration, record mapping and sync logs", () => {
    const migrationPath = "supabase/migrations/20260608_feishu_sync.sql";

    expect(existsSync(migrationPath)).toBe(true);

    const sql = readFileSync(migrationPath, "utf8");

    expect(sql).toContain("create table if not exists public.feishu_sync_sources");
    expect(sql).toContain("app_token text not null");
    expect(sql).toContain("table_id text not null");
    expect(sql).toContain("last_sync_at timestamptz");
    expect(sql).toContain("create table if not exists public.feishu_record_mappings");
    expect(sql).toContain("feishu_record_id text not null");
    expect(sql).toContain("heritage_id uuid references public.heritage_items(id)");
    expect(sql).toContain("last_feishu_modified_time bigint");
    expect(sql).toContain("create table if not exists public.feishu_sync_logs");
    expect(sql).toContain("inserted_count integer not null default 0");
    expect(sql).toContain("updated_count integer not null default 0");
    expect(sql).toContain("deleted_count integer not null default 0");
    expect(sql).toContain("failed_count integer not null default 0");
    expect(sql).toContain("enable row level security");
  });

  it("extends TypeScript database types for Feishu sync rows", () => {
    const source = readFileSync("lib/types/database.ts", "utf8");

    expect(source).toContain("FeishuSyncSourceRow");
    expect(source).toContain("FeishuRecordMappingRow");
    expect(source).toContain("FeishuSyncLogRow");
    expect(source).toContain('source: "manual" | "cron"');
  });
});
