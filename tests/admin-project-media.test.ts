import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  buildSetCoverUpdates,
  buildSetMainVideoUpdates,
  moveProjectMedia,
  validateProjectMediaActionPayload
} from "@/lib/admin/project-media";
import type { HeritageMediaRow } from "@/lib/types/database";

function mediaRow(patch: Partial<HeritageMediaRow> & Pick<HeritageMediaRow, "id" | "media_type" | "role" | "sort_order">): HeritageMediaRow {
  return {
    heritage_item_id: "heritage-1",
    url: `https://example.com/${patch.id}`,
    alt: null,
    caption: null,
    file_name: null,
    file_size: null,
    mime_type: null,
    storage_path: null,
    thumbnail_url: null,
    thumbnail_storage_path: null,
    original_file_name: null,
    width: null,
    height: null,
    created_at: "2026-06-01T00:00:00.000Z",
    ...patch
  };
}

describe("admin project media management", () => {
  it("wires project media management into the existing CMS media tab", () => {
    const componentPath = "components/admin/project-media-manager.tsx";
    const apiPath = "app/api/admin/media/[id]/route.ts";
    const adminSource = readFileSync("components/admin/heritage-admin-client.tsx", "utf8");

    expect(existsSync(componentPath)).toBe(true);
    expect(existsSync(apiPath)).toBe(true);
    expect(adminSource).toContain("ProjectMediaManager");
  });

  it("retains Hero, Cover, Gallery, main-video, and ordering controls", () => {
    const source = readFileSync("components/admin/project-media-manager.tsx", "utf8");

    expect(source).toContain('<option value="gallery">');
    expect(source).toContain('<option value="hero">');
    expect(source).toContain('onAction(media.id, "set-cover")');
    expect(source).toContain('onAction(media.id, "set-main-video")');
    expect(source).toContain('onAction(media.id, "move", "up")');
    expect(source).toContain('onAction(media.id, "move", "down")');
    expect(source).toContain('direction?: "up" | "down"');
    expect(source).not.toMatch(/images\.sort\s*\(/);
  });

  it("promotes one project image to cover and demotes existing covers to gallery", () => {
    const rows = [
      mediaRow({ id: "cover-1", media_type: "image", role: "cover", sort_order: 0 }),
      mediaRow({ id: "gallery-1", media_type: "image", role: "gallery", sort_order: 20 }),
      mediaRow({ id: "video-1", media_type: "video", role: "video", sort_order: 0 })
    ];

    expect(buildSetCoverUpdates(rows, "gallery-1")).toEqual([
      { id: "gallery-1", role: "cover", sort_order: 0 },
      { id: "cover-1", role: "gallery", sort_order: 10 }
    ]);
  });

  it("rejects using non-image media as the project cover", () => {
    const rows = [mediaRow({ id: "video-1", media_type: "video", role: "video", sort_order: 0 })];

    expect(() => buildSetCoverUpdates(rows, "video-1")).toThrow("Only image media can be used as a cover.");
  });

  it("sets the main project video by making it first in video sort order", () => {
    const rows = [
      mediaRow({ id: "video-1", media_type: "video", role: "video", sort_order: 40 }),
      mediaRow({ id: "video-2", media_type: "video", role: "video", sort_order: 10 }),
      mediaRow({ id: "image-1", media_type: "image", role: "cover", sort_order: 0 })
    ];

    expect(buildSetMainVideoUpdates(rows, "video-1")).toEqual([
      { id: "video-1", role: "video", sort_order: 0 },
      { id: "video-2", role: "video", sort_order: 10 }
    ]);
  });

  it("moves media within the selected project media type only", () => {
    const rows = [
      mediaRow({ id: "image-1", media_type: "image", role: "gallery", sort_order: 10 }),
      mediaRow({ id: "image-2", media_type: "image", role: "gallery", sort_order: 20 }),
      mediaRow({ id: "video-1", media_type: "video", role: "video", sort_order: 0 })
    ];

    expect(moveProjectMedia(rows, "image-2", "up")).toEqual([
      { id: "image-2", role: "gallery", sort_order: 10 },
      { id: "image-1", role: "gallery", sort_order: 20 }
    ]);
    expect(moveProjectMedia(rows, "image-1", "up")).toEqual([]);
    expect(moveProjectMedia(rows, "video-1", "down")).toEqual([]);
  });

  it("validates project media action payloads", () => {
    expect(validateProjectMediaActionPayload({ action: "set-cover" })).toEqual({ ok: true, action: "set-cover" });
    expect(validateProjectMediaActionPayload({ action: "move", direction: "down" })).toEqual({
      ok: true,
      action: "move",
      direction: "down"
    });
    expect(validateProjectMediaActionPayload({ action: "move", direction: "sideways" })).toEqual({
      ok: false,
      error: "Invalid media move direction."
    });
    expect(validateProjectMediaActionPayload({ action: "delete" })).toEqual({
      ok: false,
      error: "Invalid project media action."
    });
    expect(validateProjectMediaActionPayload({ action: "set-home-featured", featured: true })).toEqual({
      ok: true,
      action: "set-home-featured",
      featured: true
    });
    expect(validateProjectMediaActionPayload({ action: "set-home-featured", featured: "true" })).toEqual({
      ok: false,
      error: "Invalid homepage featured value."
    });
  });

  it("offers a gallery-only home switch backed by the media asset flag", () => {
    const manager = readFileSync("components/admin/project-media-manager.tsx", "utf8");
    const route = readFileSync("app/api/admin/media/[id]/route.ts", "utf8");

    expect(manager).toContain('media.role === "gallery"');
    expect(manager).toContain('action: "set-home-featured"');
    expect(manager).toContain("首页展示");
    expect(manager).toContain("Show on Home");
    expect(route).toContain('validation.action === "set-home-featured"');
    expect(route).toContain('featured_on_home: validation.featured');
  });

  it("normalizes valid image metadata updates", () => {
    expect(
      validateProjectMediaActionPayload({
        action: "update-metadata",
        caption: "  Peony Embroidered Handbag  ",
        alt: "  Pink peony embroidery on a silk handbag.  "
      })
    ).toEqual({
      ok: true,
      action: "update-metadata",
      caption: "Peony Embroidered Handbag",
      alt: "Pink peony embroidery on a silk handbag."
    });
  });

  it("rejects invalid image metadata updates", () => {
    expect(validateProjectMediaActionPayload({ action: "update-metadata", caption: "   ", alt: "" })).toEqual({
      ok: false,
      error: "Image name is required."
    });
    expect(
      validateProjectMediaActionPayload({ action: "update-metadata", caption: "x".repeat(161), alt: "" })
    ).toEqual({
      ok: false,
      error: "Image name must be 160 characters or fewer."
    });
    expect(
      validateProjectMediaActionPayload({ action: "update-metadata", caption: "Valid name", alt: "x".repeat(301) })
    ).toEqual({
      ok: false,
      error: "Image description must be 300 characters or fewer."
    });
  });

  it("wires image metadata editing through the CMS and admin API", () => {
    const manager = readFileSync("components/admin/project-media-manager.tsx", "utf8");
    const route = readFileSync("app/api/admin/media/[id]/route.ts", "utf8");
    const mirror = readFileSync("lib/admin/media-assets.ts", "utf8");

    expect(manager).toContain("Image name");
    expect(manager).toContain("Image description");
    expect(manager).toContain('action: "update-metadata"');
    expect(manager).toContain("saveMediaMetadata");
    expect(route).toContain('validation.action === "update-metadata"');
    expect(route).toContain("updateMediaAssetMetadataByStorageIdentity");
    expect(mirror).toContain("export async function updateMediaAssetMetadataByStorageIdentity");
  });

  it("allows the admin media workspace to shrink to a mobile viewport", () => {
    const admin = readFileSync("components/admin/heritage-admin-client.tsx", "utf8");

    expect(admin).toContain('className="museum-container grid min-w-0 gap-6');
    expect(admin).toContain('<aside className="min-w-0 space-y-4">');
    expect(admin).toContain('<div className="min-w-0 space-y-4">');
  });
});
