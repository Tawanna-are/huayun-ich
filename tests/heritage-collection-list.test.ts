import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("heritage collection list", () => {
  it("keeps the existing server data and SEO boundaries", () => {
    const page = readFileSync("app/[locale]/heritage/page.tsx", "utf8");

    expect(page).toContain("Promise.all([getHeritageItems(), getCategories()])");
    expect(page).toContain("createItemListJsonLd");
    expect(page).toContain("createBreadcrumbJsonLd");
    expect(page).toContain("<HeritageListClient");
  });

  it("uses a restrained collection header without archive description copy", () => {
    const page = readFileSync("app/[locale]/heritage/page.tsx", "utf8");

    expect(page).toContain('data-page="heritage-collection"');
    expect(page).toContain('t("collectionTitle")');
    expect(page).toContain('t("collectionLabel")');
    expect(page).not.toContain('t("description")');
    expect(page).not.toContain("radial-gradient");
  });

  it("keeps semantic search and moves filters behind one disclosure", () => {
    const list = readFileSync("components/heritage/heritage-list-client.tsx", "utf8");

    expect(list).toContain('fetch("/api/search"');
    expect(list).toContain("filterHeritageItems");
    expect(list).toContain("filtersOpen");
    expect(list).toContain("aria-expanded={filtersOpen}");
    expect(list).toContain('t("filters")');
  });

  it("renders a curatorial desktop wall and a two-column mobile collection grid", () => {
    const list = readFileSync("components/heritage/heritage-list-client.tsx", "utf8");

    expect(list).toContain("grid-cols-2");
    expect(list).toContain("lg:grid-cols-12");
    expect(list).toContain("data-collection-grid");
    expect(list).toContain("collectionPlacements");
    expect(list).toContain("lg:col-span-7");
    expect(list).toContain("<HeritageCard item={item} variant={placement.variant}");
    expect(list).not.toContain("lg:grid-cols-3");
  });

  it("renders only collection metadata with bounded editorial image variants", () => {
    const card = readFileSync("components/heritage/heritage-card.tsx", "utf8");

    for (const field of ["item.image", "item.name", "item.englishName", "item.region", "item.categoryName"]) {
      expect(card).toContain(field);
    }
    expect(card).toContain('export type HeritageCardVariant = "feature" | "wide" | "standard"');
    expect(card).toContain('variant = "standard"');
    expect(card).toContain("aspect-[3/4]");
    expect(card).toContain("lg:aspect-[16/11]");
    expect(card).toContain("imagePresentation[variant]");
    expect(card).not.toContain("item.summary");
    expect(card).not.toContain("item.history");
    expect(card).not.toContain("inheritance");
    expect(card).not.toContain("from-black");
  });
});
