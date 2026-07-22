import { describe, expect, it } from "vitest";
import {
  buildMediaLibraryFilters,
  formatMediaFileSize,
  getStoragePathFromPublicUrl,
  normalizeAdminMediaRow,
  validateBulkDeleteMediaPayload
} from "@/lib/admin/media-library";
import type { AdminMediaSelectRow } from "@/lib/admin/media-library";

const baseRow: AdminMediaSelectRow = {
  id: "media-1",
  heritage_item_id: "heritage-1",
  media_type: "image",
  role: "gallery",
  url: "https://example.supabase.co/storage/v1/object/public/heritage-media/heritage-1/gallery.png",
  alt: "Gallery image",
  caption: "Gallery caption",
  file_name: "gallery.png",
  file_size: 153600,
  mime_type: "image/png",
  storage_path: "heritage-1/gallery.png",
  thumbnail_url: "https://example.supabase.co/storage/v1/object/public/heritage-media/heritage-1/thumbnails/gallery.png",
  thumbnail_storage_path: "heritage-1/thumbnails/gallery.png",
  original_file_name: "苏绣细节.png",
  width: 1600,
  height: 900,
  sort_order: 10,
  created_at: "2026-06-01T10:00:00.000Z",
  heritage_item: {
    id: "heritage-1",
    name: "苏绣",
    slug: "suzhou-embroidery",
    region: "江苏苏州",
    province: "江苏省",
    city: "苏州"
  }
};

describe("admin media library", () => {
  it("normalizes media rows for the CMS library", () => {
    expect(normalizeAdminMediaRow(baseRow)).toEqual({
      id: "media-1",
      heritageItemId: "heritage-1",
      mediaType: "image",
      role: "gallery",
      url: "https://example.supabase.co/storage/v1/object/public/heritage-media/heritage-1/gallery.png",
      alt: "Gallery image",
      caption: "Gallery caption",
      fileName: "gallery.png",
      fileSize: 153600,
      mimeType: "image/png",
      storagePath: "heritage-1/gallery.png",
      thumbnailUrl: "https://example.supabase.co/storage/v1/object/public/heritage-media/heritage-1/thumbnails/gallery.png",
      thumbnailStoragePath: "heritage-1/thumbnails/gallery.png",
      originalFileName: "苏绣细节.png",
      width: 1600,
      height: 900,
      sortOrder: 10,
      createdAt: "2026-06-01T10:00:00.000Z",
      heritageItem: {
        id: "heritage-1",
        name: "苏绣",
        slug: "suzhou-embroidery",
        region: "江苏苏州",
        province: "江苏省",
        city: "苏州"
      }
    });
  });

  it("falls back to file metadata parsed from public urls", () => {
    const normalized = normalizeAdminMediaRow({
      ...baseRow,
      file_name: null,
      file_size: null,
      mime_type: null,
      storage_path: null,
      thumbnail_url: null,
      thumbnail_storage_path: null,
      original_file_name: null,
      width: null,
      height: null
    });

    expect(normalized.fileName).toBe("gallery.png");
    expect(normalized.storagePath).toBe("heritage-1/gallery.png");
    expect(normalized.fileSize).toBeNull();
  });

  it("builds typed filters from URLSearchParams", () => {
    const filters = buildMediaLibraryFilters(
      new URLSearchParams({
        q: "  苏绣  ",
        type: "video",
        heritageId: "heritage-1"
      })
    );

    expect(filters).toEqual({
      query: "苏绣",
      mediaType: "video",
      heritageId: "heritage-1"
    });
  });

  it("validates bulk delete payloads", () => {
    expect(validateBulkDeleteMediaPayload({ ids: ["a", "b"] })).toEqual({
      ok: true,
      ids: ["a", "b"]
    });
    expect(validateBulkDeleteMediaPayload({ ids: [] })).toEqual({
      ok: false,
      error: "Select at least one media asset."
    });
    expect(validateBulkDeleteMediaPayload({ ids: Array.from({ length: 51 }, (_, index) => `id-${index}`) })).toEqual({
      ok: false,
      error: "Delete at most 50 media assets at a time."
    });
  });

  it("formats file sizes for dense admin tables", () => {
    expect(formatMediaFileSize(null)).toBe("-");
    expect(formatMediaFileSize(512)).toBe("512 B");
    expect(formatMediaFileSize(1536)).toBe("1.5 KB");
    expect(formatMediaFileSize(2 * 1024 * 1024)).toBe("2 MB");
  });

  it("extracts Supabase storage paths from public URLs", () => {
    expect(
      getStoragePathFromPublicUrl(
        "https://example.supabase.co/storage/v1/object/public/heritage-media/heritage-1/video.mp4"
      )
    ).toBe("heritage-1/video.mp4");
    expect(getStoragePathFromPublicUrl("/assets/local.png")).toBeNull();
  });
});
