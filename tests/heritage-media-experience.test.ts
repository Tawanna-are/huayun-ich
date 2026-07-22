import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("heritage detail media experience", () => {
  it("upgrades the detail gallery with lazy images, lightbox preview and high-resolution viewing", () => {
    const gallerySource = readFileSync("components/heritage/image-gallery.tsx", "utf8");

    expect(gallerySource).toContain('"use client"');
    expect(gallerySource).toContain("useState");
    expect(gallerySource).toContain("loading=\"lazy\"");
    expect(gallerySource).toContain("selectedImage");
    expect(gallerySource).toContain("role=\"dialog\"");
    expect(gallerySource).toContain("View high resolution");
    expect(gallerySource).toContain("window.open");
  });

  it("uses an adaptive detail video player with poster fallback and playback tracking", () => {
    const headerSource = readFileSync("components/heritage/immersive-video-header.tsx", "utf8");
    const apiPath = "app/api/media/playback/route.ts";

    expect(existsSync(apiPath)).toBe(true);
    expect(headerSource).toContain('"use client"');
    expect(headerSource).toContain("controls");
    expect(headerSource).toContain("preload=\"metadata\"");
    expect(headerSource).toContain("poster={resolvedPoster}");
    expect(headerSource).toContain("onPlay=");
    expect(headerSource).toContain("/api/media/playback");
  });
});
