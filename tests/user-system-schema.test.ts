import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("user system schema", () => {
  it("defines user-owned favorites, browsing history and preferences with RLS", () => {
    const schema = readFileSync("supabase/schema.sql", "utf8");

    expect(schema).toContain("create table if not exists public.user_favorites");
    expect(schema).toContain("create table if not exists public.user_browsing_history");
    expect(schema).toContain("create table if not exists public.user_preferences");
    expect(schema).toContain("references auth.users(id)");
    expect(schema).toContain("auth.uid() = user_id");
    expect(schema).toContain("preferred_locale text not null default 'zh'");
    expect(schema).toContain("interest_tags text[] not null default '{}'");
    expect(schema).toContain("user_preferences_interest_tags_idx");
    expect(schema).toContain("target_type text not null default 'heritage'");
    expect(schema).toContain("target_id text");
    expect(schema).toContain("'inheritor'");
    expect(schema).toContain("'museum_topic'");
  });
});
