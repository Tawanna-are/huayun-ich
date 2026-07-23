import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function readSource(path: string) {
  return readFileSync(path, "utf8");
}

describe("media performance pipeline", () => {
  it("centralizes immutable Storage cache settings and WebP output policy", () => {
    const helperPath = "lib/admin/media-performance.ts";

    expect(existsSync(helperPath)).toBe(true);

    if (!existsSync(helperPath)) {
      return;
    }

    const helper = readSource(helperPath);

    expect(helper).toContain('export const IMAGE_STORAGE_CACHE_CONTROL = "31536000"');
    expect(helper).toContain('export const VIDEO_STORAGE_CACHE_CONTROL = "31536000"');
    expect(helper).toContain('export const IMAGE_OUTPUT_MIME_TYPE = "image/webp"');
    expect(helper).toContain("getStorageCacheControlForMimeType");
  });

  it("stores direct image uploads and thumbnails with long-lived CDN cache metadata", () => {
    const routeSource = readSource("app/api/admin/media/route.ts");

    expect(routeSource).toContain('from "@/lib/admin/media-performance";');
    expect(routeSource).toContain("cacheControl: getStorageCacheControlForMimeType(file.type)");
    expect(routeSource).toContain("cacheControl: IMAGE_STORAGE_CACHE_CONTROL");
  });

  it("uploads large videos through resumable TUS chunks with CDN cache metadata", () => {
    const panelSource = readSource("components/admin/video-upload-panel.tsx");
    const proxySource = readSource("app/api/admin/media/tus/[[...path]]/route.ts");

    expect(panelSource).toContain("chunkSize: 4 * 1024 * 1024");
    expect(panelSource).toContain("cacheControl: getStorageCacheControlForMimeType(file.type)");
    expect(panelSource).not.toContain('cacheControl: "3600"');
    expect(proxySource).toContain('"upload-metadata"');
  });

  it("configures Supabase Storage for optimized images, MOV uploads and CDN image delivery", () => {
    const schema = readSource("supabase/schema.sql");
    const migrationPath = "supabase/migrations/20260607_media_performance_storage.sql";

    expect(existsSync(migrationPath)).toBe(true);

    if (!existsSync(migrationPath)) {
      return;
    }

    const migration = readSource(migrationPath);
    const nextConfig = readSource("next.config.ts");

    for (const source of [schema, migration]) {
      expect(source).toContain("'image/webp'");
      expect(source).toContain("'video/mp4'");
      expect(source).toContain("'video/quicktime'");
      expect(source).toContain("524288000");
    }

    expect(nextConfig).toContain("formats: [\"image/webp\"]");
    expect(nextConfig).toContain('hostname: "**.supabase.co"');
    expect(nextConfig).toContain('pathname: "/storage/v1/object/public/**"');
  });

  it("documents Storage configuration and upload flow for production operations", () => {
    const docPath = "docs/storage-media-performance.md";

    expect(existsSync(docPath)).toBe(true);

    if (!existsSync(docPath)) {
      return;
    }

    const docs = readSource(docPath);

    expect(docs).toContain("Supabase Storage");
    expect(docs).toContain("CDN");
    expect(docs).toContain("WebP");
    expect(docs).toContain("TUS");
    expect(docs).toContain("Range");
    expect(docs).toContain("31536000");
  });
});
