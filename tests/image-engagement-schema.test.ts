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

  it("exposes atomic image-like RPCs only to the service role", () => {
    const sql = readFileSync(migrationPath, "utf8");

    for (const functionName of ["get_heritage_image_like_state", "set_heritage_image_like_state"]) {
      expect(sql).toContain(`create or replace function public.${functionName}`);
      expect(sql).toMatch(new RegExp(`${functionName}[\\s\\S]*security definer`, "i"));
      expect(sql).toMatch(new RegExp(`${functionName}[\\s\\S]*set search_path = pg_catalog, public`, "i"));
      expect(sql).toMatch(new RegExp(`revoke execute on function public\\.${functionName}[^;]+from public, anon, authenticated`, "i"));
      expect(sql).toMatch(new RegExp(`grant execute on function public\\.${functionName}[^;]+to service_role`, "i"));
    }

    expect(sql).toMatch(/from public\.heritage_items[\s\S]*published\s*=\s*true/i);
    expect(sql).toMatch(/from public\.media_assets[\s\S]*file_type\s*=\s*'image'/i);
    expect(sql).toMatch(/from public\.heritage_media[\s\S]*media_type\s*=\s*'image'/i);
    expect(sql).toMatch(/insert into public\.heritage_image_likes[\s\S]*on conflict\s*\(user_id,\s*image_id\)/i);
    expect(sql).toMatch(/delete from public\.heritage_image_likes[\s\S]*image_id\s*=\s*p_image_id/i);
    expect(sql).toMatch(/return query[\s\S]*count\(\*\)[\s\S]*heritage_image_likes/i);
  });

  it("deletes a like by its unique user and image identity after image reassignment", () => {
    for (const path of [migrationPath, "supabase/schema.sql"]) {
      const sql = readFileSync(path, "utf8");
      const setRpc = sql.match(
        /create or replace function public\.set_heritage_image_like_state[\s\S]*?\$function\$;/i
      )?.[0];
      const deletion = setRpc?.match(/delete from public\.heritage_image_likes[\s\S]*?;/i)?.[0];

      expect(deletion, `${path} must define the image-like deletion`).toBeDefined();
      expect(deletion).toMatch(/image_like\.user_id\s*=\s*p_user_id/i);
      expect(deletion).toMatch(/image_like\.image_id\s*=\s*p_image_id/i);
      expect(deletion).not.toMatch(/heritage_item_id/i);
    }
  });

  it("locks the published item and matching media row before mutating likes", () => {
    for (const path of [migrationPath, "supabase/schema.sql"]) {
      const sql = readFileSync(path, "utf8");
      const setRpc = sql.match(
        /create or replace function public\.set_heritage_image_like_state[\s\S]*?\$function\$;/i
      )?.[0];

      expect(setRpc, `${path} must define the image-like mutation RPC`).toBeDefined();
      expect(setRpc).toMatch(/from public\.heritage_items item[^;]*item\.published\s*=\s*true[^;]*for update\s*;/i);
      expect(setRpc).toMatch(/from public\.media_assets asset[^;]*asset\.file_type\s*=\s*'image'[^;]*for update\s*;/i);
      expect(setRpc).toMatch(/from public\.heritage_media media[^;]*media\.media_type\s*=\s*'image'[^;]*for update\s*;/i);
    }
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
    expect(schema).toContain("create or replace function public.get_heritage_image_like_state");
    expect(schema).toContain("create or replace function public.set_heritage_image_like_state");
    expect(schema).toMatch(/from public\.heritage_items[\s\S]*published\s*=\s*true/i);
    expect(schema).toMatch(/revoke execute on function public\.get_heritage_image_like_state[^;]+from public, anon, authenticated/i);
    expect(schema).toMatch(/grant execute on function public\.set_heritage_image_like_state[^;]+to service_role/i);
  });
});
