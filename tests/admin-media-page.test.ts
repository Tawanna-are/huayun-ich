import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("admin media library page", () => {
  it("adds a localized admin media route backed by a client media manager", () => {
    const pagePath = "app/[locale]/admin/media/page.tsx";
    const clientPath = "components/admin/media-library-client.tsx";
    const videoPanelPath = "components/admin/video-upload-panel.tsx";
    const apiPath = "app/api/admin/media-library/route.ts";
    const tusApiPath = "app/api/admin/media/tus/[[...path]]/route.ts";

    expect(existsSync(pagePath)).toBe(true);
    expect(existsSync(clientPath)).toBe(true);
    expect(existsSync(videoPanelPath)).toBe(true);
    expect(existsSync(apiPath)).toBe(true);
    expect(existsSync(tusApiPath)).toBe(true);

    const pageSource = readFileSync(pagePath, "utf8");
    const clientSource = readFileSync(clientPath, "utf8");
    const videoPanelSource = readFileSync(videoPanelPath, "utf8");
    const apiSource = readFileSync(apiPath, "utf8");
    const tusApiSource = readFileSync(tusApiPath, "utf8");

    expect(pageSource).not.toContain('"use client"');
    expect(pageSource).toContain("MediaLibraryClient");
    expect(pageSource).toContain("createMetadata");
    expect(clientSource).toContain("/api/admin/media-library");
    expect(clientSource).toContain("VideoUploadPanel");
    expect(clientSource).toContain("selectedIds");
    expect(clientSource).toContain("DELETE");
    expect(videoPanelSource).toContain("tus-js-client");
    expect(videoPanelSource).toContain("/api/admin/media/tus");
    expect(videoPanelSource).toContain("captureVideoPoster");
    expect(apiSource).toContain("getAdminMediaLibrary");
    expect(apiSource).toContain("deleteAdminMediaAssets");
    expect(tusApiSource).toContain("storage/v1/upload/resumable");
    expect(tusApiSource).toContain("verifyAdminRequest");
  });
});
