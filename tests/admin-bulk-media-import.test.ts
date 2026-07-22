import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseImportMediaFileName } from "@/lib/admin/import-service";

describe("bulk media import", () => {
  it("parses the filename convention for automatic media linking", () => {
    expect(parseImportMediaFileName("suzhou-embroidery__gallery__detail-01.webp")).toEqual({
      heritageSlug: "suzhou-embroidery",
      role: "gallery",
      fileName: "detail-01.webp"
    });

    expect(parseImportMediaFileName("bad-file-name.webp")).toBeNull();
  });

  it("adds an admin media import route that uploads and registers media assets", () => {
    const routePath = "app/api/admin/import/media/route.ts";

    expect(existsSync(routePath)).toBe(true);

    const routeSource = readFileSync(routePath, "utf8");
    const serviceSource = readFileSync("lib/admin/import-service.ts", "utf8");

    expect(routeSource).toContain("verifyAdminRequest");
    expect(routeSource).toContain("importMediaBatch");
    expect(serviceSource).toContain("parseImportMediaFileName");
    expect(serviceSource).toContain('storage.from("heritage-media").upload');
    expect(serviceSource).toContain('from("media_assets").insert');
  });
});
