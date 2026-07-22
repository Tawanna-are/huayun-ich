import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { isPublicHeritageSlug } from "@/lib/content/heritage-repository";

describe("public heritage publication visibility", () => {
  it("hides Yue embroidery and Kunqu while retaining other heritage slugs", () => {
    expect(isPublicHeritageSlug("yue-embroidery")).toBe(false);
    expect(isPublicHeritageSlug("kunqu")).toBe(false);
    expect(isPublicHeritageSlug("suzhou-embroidery")).toBe(true);
    expect(isPublicHeritageSlug("jingdezhen-porcelain")).toBe(true);
  });

  it("routes homepage, list, search and sitemap through the filtered public repository", () => {
    const surfaces = [
      "app/[locale]/page.tsx",
      "app/[locale]/heritage/page.tsx",
      "app/api/search/route.ts",
      "app/sitemap.ts"
    ];

    for (const path of surfaces) {
      expect(readFileSync(path, "utf8")).toContain("getHeritageItems");
    }
  });

  it("removes hidden item names from public localized copy", () => {
    const publicCopy = [readFileSync("messages/zh.json", "utf8"), readFileSync("messages/en.json", "utf8")].join("\n");

    for (const hiddenName of ["粤绣", "昆曲", "Kunqu", "Cantonese embroidery"]) {
      expect(publicCopy).not.toContain(hiddenName);
    }
  });

  it("builds recommendations only from the filtered public item collection", () => {
    const repository = readFileSync("lib/content/heritage-repository.ts", "utf8");

    expect(repository).toContain("export async function getRelatedHeritage");
    expect(repository).toContain("const items = await getHeritageItems()");
  });

  it("excludes hidden static routes and returns not found for hidden detail reads", () => {
    const repository = readFileSync("lib/content/heritage-repository.ts", "utf8");
    const detailPage = readFileSync("app/[locale]/heritage/[slug]/page.tsx", "utf8");

    expect(repository).toContain("isPublicHeritageSlug(item.slug as string)");
    expect(repository).toContain("if (!isPublicHeritageSlug(slug))");
    expect(detailPage).toContain("getHeritageSlugs");
    expect(detailPage).toContain("getHeritageBySlug(slug)");
    expect(detailPage).toContain("if (!item) notFound()");
  });
});
