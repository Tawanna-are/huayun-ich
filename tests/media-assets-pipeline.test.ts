import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function readSource(path: string) {
  return readFileSync(path, "utf8");
}

describe("media assets content pipeline", () => {
  it("loads media_assets with heritage items so pages can auto-render project media", () => {
    const repositorySource = readSource("lib/content/heritage-repository.ts");

    expect(repositorySource).toContain("media_assets (");
    expect(repositorySource).toContain("asset_role");
    expect(repositorySource).toContain("file_url");
    expect(repositorySource).toContain("mapMediaAssetToHeritageMedia");
  });

  it("registers uploaded images and videos in media_assets as the canonical content asset table", () => {
    const uploadRouteSource = readSource("app/api/admin/media/route.ts");
    const helperSource = readSource("lib/admin/media-assets.ts");

    expect(uploadRouteSource).toContain("insertMediaAsset");
    expect(helperSource).toContain('from("media_assets").insert');
    expect(helperSource).toContain("asset_role");
    expect(helperSource).toContain("file_url");
    expect(helperSource).toContain("thumbnail_url");
    expect(helperSource).toContain("heritage_id: input.heritageId");
  });

  it("revalidates localized heritage pages after a media upload", () => {
    const uploadRouteSource = readSource("app/api/admin/media/route.ts");

    expect(uploadRouteSource).toContain('import { revalidatePath } from "next/cache"');
    expect(uploadRouteSource).toContain("revalidateHeritageMediaPages");
    expect(uploadRouteSource).toContain('revalidatePath(`/${locale}/heritage/${slug}`)');
  });

  it("syncs primary media fields from the heritage editor into media_assets", () => {
    const createRouteSource = readSource("app/api/admin/heritage/route.ts");
    const updateRouteSource = readSource("app/api/admin/heritage/[id]/route.ts");

    for (const source of [createRouteSource, updateRouteSource]) {
      expect(source).toContain("replacePrimaryMedia");
      expect(source).toContain('from("media_assets")');
      expect(source).toContain("buildPrimaryMediaAssetRows");
    }
  });
});
