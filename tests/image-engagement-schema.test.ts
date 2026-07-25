import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migrationPath = "supabase/migrations/20260725_image_engagement.sql";

describe("image engagement schema", () => {
  it("creates image likes and extends favorite targets in the migration", () => {
    const sql = readFileSync(migrationPath, "utf8");

    expect(sql).toMatch(/drop constraint if exists user_favorites_target_type_check/i);
    expect(sql).toMatch(/heritage_image/i);
    expect(sql).toContain("create table if not exists public.heritage_image_likes");
    expect(sql).toMatch(/unique\s*\(user_id,\s*image_id\)/i);
    expect(sql).toContain("alter table public.heritage_image_likes enable row level security");
    expect(sql).toContain("heritage_image_likes_image_idx");
    expect(sql).toContain("heritage_image_likes_item_idx");
    expect(sql).toContain('drop policy if exists "Public read image likes"');
    expect(sql).toContain('drop policy if exists "Users manage own image likes"');
    expect(sql).not.toContain('create policy "Public read image likes"');
    expect(sql).not.toContain('create policy "Users manage own image likes"');
    expect(sql).not.toContain('create policy "Public read heritage image likes"');
    expect(sql).not.toContain('create policy "Users manage own heritage image likes"');
  });

  it("keeps the canonical schema and database row types aligned", () => {
    const schema = readFileSync("supabase/schema.sql", "utf8");
    const types = readFileSync("lib/types/database.ts", "utf8");

    expect(schema).toContain("create table if not exists public.heritage_image_likes");
    expect(schema).toMatch(/unique\s*\(user_id,\s*image_id\)/i);
    expect(schema).toContain("alter table public.heritage_image_likes enable row level security");
    expect(schema).not.toContain('create policy "Public read heritage image likes"');
    expect(schema).not.toContain('create policy "Users manage own heritage image likes"');
    expect(schema).toContain("'heritage_image'");
    expect(types).toContain('"heritage_image"');
    expect(types).toContain("HeritageImageLikeRow");
    expect(types).toContain("image_id: string");
  });
});
