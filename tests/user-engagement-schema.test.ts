import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migrationPath = "supabase/migrations/20260724_user_engagement_contact.sql";

describe("engagement schema", () => {
  it.each(["heritage_likes", "heritage_comments", "contact_submissions"])("creates %s with RLS", (table) => {
    const sql = readFileSync(migrationPath, "utf8");

    expect(sql).toContain(`create table if not exists public.${table}`);
    expect(sql).toContain(`alter table public.${table} enable row level security`);
  });

  it("prevents duplicate likes and defaults comments to pending", () => {
    const sql = readFileSync(migrationPath, "utf8");

    expect(sql).toMatch(/unique\s*\(user_id,\s*heritage_item_id\)/i);
    expect(sql).toMatch(/status text not null default 'pending'/i);
    expect(sql).toContain("Public read approved comments");
    expect(sql).toContain("Users read own contact submissions");
  });

  it("keeps the canonical schema and row types aligned", () => {
    const schema = readFileSync("supabase/schema.sql", "utf8");
    const types = readFileSync("lib/types/database.ts", "utf8");

    expect(schema).toContain("create table if not exists public.heritage_likes");
    expect(schema).toContain("create table if not exists public.heritage_comments");
    expect(schema).toContain("create table if not exists public.contact_submissions");
    expect(types).toContain("HeritageLikeRow");
    expect(types).toContain("HeritageCommentRow");
    expect(types).toContain("ContactSubmissionRow");
  });
});
