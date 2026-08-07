import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { getHeritageImageAlt, getHeritageSeoTitle } from "@/lib/seo/localized-content";
import { createHeritageArticleJsonLd, createOrganizationJsonLd, createWebsiteJsonLd } from "@/lib/seo/structured-data";
import type { HeritageItem } from "@/lib/types/heritage";

const item: HeritageItem = {
  id: "test-id",
  slug: "sichuan-opera-face-changing",
  name: "川剧变脸",
  englishName: "Sichuan Opera Face Changing",
  categorySlug: "traditional-opera",
  categoryName: "传统戏剧",
  summary: "了解川剧变脸的历史、技艺和文化价值。",
  region: "四川成都",
  province: "四川",
  city: "成都",
  inscriptionYear: 2006,
  featured: true,
  image: "/assets/hero-museum.png",
  heroImage: "/assets/hero-museum.png",
  videoPoster: "",
  videoUrl: "",
  history: [],
  gallery: [],
  timeline: [],
  inheritor: { name: "李明", title: "传承人", bio: "", image: "" },
  location: { lat: 0, lng: 0, mapX: 50, mapY: 50 },
  tags: ["川剧", "变脸"],
  relatedSlugs: []
};

describe("heritage SEO enhancements", () => {
  it("creates localized, descriptive heritage titles and image alt fallbacks", () => {
    expect(getHeritageSeoTitle(item, "zh")).toContain("川剧变脸");
    expect(getHeritageSeoTitle(item, "zh")).toContain("中国非物质文化遗产");
    expect(getHeritageSeoTitle(item, "en")).toContain("Sichuan Opera Face Changing");
    expect(getHeritageSeoTitle(item, "en")).toContain("Chinese Intangible Cultural Heritage");
    expect(getHeritageImageAlt(item, "zh")).toContain("传统戏剧");
    expect(getHeritageImageAlt(item, "en")).toContain("Sichuan Opera Face Changing");
    expect(getHeritageImageAlt(item, "zh", "舞台上的川剧变脸表演")).toBe("舞台上的川剧变脸表演");
  });

  it("creates an Article schema for a heritage detail page", () => {
    const schema = createHeritageArticleJsonLd(item, "en");

    expect(schema["@type"]).toBe("Article");
    expect(schema.headline).toBe("Sichuan Opera Face Changing");
    expect(schema.image).toContain("hero-museum.png");
    expect(schema.inLanguage).toBe("en-US");
    expect(schema.mainEntityOfPage).toContain("/en/heritage/sichuan-opera-face-changing");
  });

  it("describes the cultural platform brand in Organization and WebSite schema", () => {
    const organization = createOrganizationJsonLd();
    const website = createWebsiteJsonLd("en");

    expect(organization["@type"]).toBe("Organization");
    expect(organization.additionalType).toBe("CulturalOrganization");
    expect(organization.brand).toEqual(expect.objectContaining({ "@type": "Brand" }));
    expect(organization.logo).toEqual(expect.objectContaining({ "@type": "ImageObject" }));
    expect(website.publisher).toEqual(expect.objectContaining({ "@id": expect.stringContaining("#organization") }));
    expect(website).toHaveProperty("genre");
  });

  it("adds homepage metadata and semantic keyword headings without changing the hero layout", () => {
    const source = readFileSync("app/[locale]/page.tsx", "utf8");
    const hero = readFileSync("components/home/heritage-explorer-hero.tsx", "utf8");

    expect(source).toContain("generateMetadata");
    expect(source).toContain("Chinese Intangible Cultural Heritage");
    expect(source).toContain("中国非物质文化遗产");
    expect(hero).toContain("<h2 className=\"sr-only\"");
    expect(hero).toContain("Traditional Chinese Culture");
  });

  it("renders Article schema and visible breadcrumb navigation on heritage detail pages", () => {
    const source = readFileSync("app/[locale]/heritage/[slug]/page.tsx", "utf8");
    const hero = readFileSync("components/heritage/detail-hero.tsx", "utf8");

    expect(source).toContain("createHeritageArticleJsonLd");
    expect(source).toContain("getHeritageSeoTitle");
    expect(hero).toContain("aria-label=\"Breadcrumb\"");
    expect(hero).toContain("breadcrumbHome");
    expect(hero).toContain("breadcrumbArchive");
  });

  it("provides indexable About and Contact trust pages", () => {
    for (const route of ["about", "contact"]) {
      const path = `app/[locale]/${route}/page.tsx`;
      expect(existsSync(path)).toBe(true);
      const source = readFileSync(path, "utf8");
      expect(source).toContain("createMetadata");
      expect(source).not.toContain("noIndex: true");
    }
  });
});
