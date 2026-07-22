import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("phase-one collection visual redesign", () => {
  it("removes the standalone collection and category modules from the homepage", () => {
    const content = readFileSync("components/home/home-cms-content.tsx", "utf8");

    expect(existsSync("components/home/collection-category-index.tsx")).toBe(true);
    expect(content).not.toContain("CollectionCategoryIndex");
    expect(content).not.toContain("<FeaturedGrid");
    expect(content).toContain("<HeritageExplorerHero");
    expect(content).not.toContain("StorySection");
    expect(content).not.toContain("MapExplorer");
    expect(content).not.toContain("StatsSection");
  });

  it("links six text categories to the existing keyword query", () => {
    const path = "components/home/collection-category-index.tsx";

    expect(existsSync(path)).toBe(true);
    if (!existsSync(path)) return;
    const index = readFileSync(path, "utf8");

    for (const label of ["戏曲", "刺绣", "陶瓷", "染织", "竹编", "剪纸"]) {
      expect(index).toContain(label);
    }
    for (const englishName of [
      "Traditional Opera",
      "Embroidery",
      "Ceramics",
      "Dyeing & Weaving",
      "Bamboo Weaving",
      "Paper Cutting"
    ]) {
      expect(index).toContain(englishName);
    }
    expect(index).toContain('pathname: "/heritage"');
    expect(index).toContain("query: { query: item.query }");
    expect(index).not.toContain("<Image");
    expect(index).not.toContain("Collections");
  });

  it("keeps heritage cards image-led and excerpt-free", () => {
    const card = readFileSync("components/heritage/heritage-card.tsx", "utf8");

    expect(card).toContain("item.image");
    expect(card).toContain("item.categoryName");
    expect(card).toContain("item.region");
    expect(card).toContain("item.englishName");
    expect(card).not.toContain("item.summary");
  });

  it("uses a minimal detail composition without article sections", () => {
    const page = readFileSync("app/[locale]/heritage/[slug]/page.tsx", "utf8");

    expect(page).toContain("DetailHero");
    expect(page).toContain("CraftMediaGallery");
    expect(page).toContain('data-section="project-information"');
    expect(page).toContain("HeritageVideoArchive");
    expect(page).not.toContain("Timeline");
    expect(page).not.toContain('id="history"');
    expect(page).not.toContain('id="inheritance-value"');
    expect(page).not.toContain("<InheritorProfile");
    expect(page).not.toContain("<MakingProcess");
    expect(page).not.toContain("<FutureWorksPreview");
    expect(page).not.toContain("relatedItems.map");
  });

  it("uses one primary gallery image followed by a two-column detail grid", () => {
    const gallery = readFileSync("components/heritage/craft-media-gallery.tsx", "utf8");

    expect(gallery).toContain("const [primaryImage, ...detailImages] = images");
    expect(gallery).toContain('data-gallery-role="primary"');
    expect(gallery).toContain("detailImages.map");
    expect(gallery).toContain("md:grid-cols-2");
  });
});
