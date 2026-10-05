import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import type { MediaAssetRow } from "@/lib/types/database";

describe("media assets schema", () => {
  it("defines media_assets with a heritage_items relationship", () => {
    const schema = readFileSync("supabase/schema.sql", "utf8");

    expect(schema).toContain("create table if not exists public.media_assets");
    expect(schema).toContain("title text not null");
    expect(schema).toContain("file_type text not null");
    expect(schema).toContain("file_url text not null");
    expect(schema).toContain("thumbnail_url text");
    expect(schema).toContain("file_size bigint");
    expect(schema).toContain("duration integer");
    expect(schema).toContain("heritage_id uuid references public.heritage_items(id)");
    expect(schema).toContain("asset_role text not null");
    expect(schema).toContain("check (asset_role in ('cover', 'hero', 'gallery', 'poster', 'main_video', 'video'))");
    expect(schema).toContain("alt text");
    expect(schema).toContain("caption text");
    expect(schema).toContain("mime_type text");
    expect(schema).toContain("storage_path text");
    expect(schema).toContain("thumbnail_storage_path text");
    expect(schema).toContain("sort_order integer not null default 0");
    expect(schema).toContain("media_assets_heritage_idx");
    expect(schema).toContain("media_assets_role_idx");
    expect(schema).toContain("alter table public.media_assets enable row level security");
    expect(schema).toContain('create policy "Public read media assets"');
  });

  it("exports a strict TypeScript row type for media assets", () => {
    const row = {
      id: "asset-1",
      title: "Archive image",
      file_type: "image",
      file_url: "https://example.com/image.webp",
      thumbnail_url: "https://example.com/thumb.webp",
      file_size: 2048,
      duration: null,
      heritage_id: "heritage-1",
      asset_role: "gallery",
      alt: "Archive detail",
      caption: "Needlework detail",
      mime_type: "image/webp",
      storage_path: "heritage-1/gallery.webp",
      thumbnail_storage_path: "heritage-1/thumbnails/gallery.webp",
      sort_order: 10,
      featured_on_home: false,
      created_at: "2026-06-07T00:00:00.000Z"
    } satisfies MediaAssetRow;

    expect(row.file_type).toBe("image");
  });

  it("defaults gallery homepage selection off in both schema and migration", () => {
    const schema = readFileSync("supabase/schema.sql", "utf8");
    const migration = readFileSync("supabase/migrations/20261005_media_assets_featured_on_home.sql", "utf8");

    expect(schema).toContain("featured_on_home boolean not null default false");
    expect(migration).toContain("add column if not exists featured_on_home boolean not null default false");
  });
});
