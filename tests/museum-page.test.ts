import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("museum page route", () => {
  it("is a localized server-rendered exhibition page with SEO data", () => {
    const pagePath = "app/[locale]/museum/page.tsx";

    expect(existsSync(pagePath)).toBe(true);

    const source = readFileSync(pagePath, "utf8");

    expect(source).not.toContain('"use client"');
    expect(source).toContain("createMuseumCuration");
    expect(source).toContain("generateMetadata");
    expect(source).toContain("createBreadcrumbJsonLd");
  });

  it("starts with featured topics without data gallery or full-screen museum hero", () => {
    const source = readFileSync("app/[locale]/museum/page.tsx", "utf8");

    expect(source).not.toContain('import { MuseumHero }');
    expect(source).not.toContain("<MuseumHero");
    expect(source).not.toContain("const provinceCount");
    expect(source).not.toContain("const stats =");
    expect(source).not.toContain('data-section="museum-data-gallery"');
    expect(source).not.toContain("Data Gallery");
    expect(source).not.toContain("Enter insights");
    expect(source).toContain("FeaturedTopics");
    expect(source).toContain("AnnualRecommendations");
    expect(source).not.toContain('import { CuratorialStories }');
    expect(source).not.toContain("<CuratorialStories");
  });
});
