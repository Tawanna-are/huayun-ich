import { describe, expect, it } from "vitest";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { siteConfig } from "@/lib/constants";
import { createMetadata } from "@/lib/metadata";
import { getHeritageSeoDescription } from "@/lib/seo/localized-content";
import {
  createCreativeWorkJsonLd,
  createItemListJsonLd,
  createOrganizationJsonLd,
  createWebsiteJsonLd
} from "@/lib/seo/structured-data";
import type { HeritageItem } from "@/lib/types/heritage";

const heritageItem: HeritageItem = {
  id: "jingju",
  slug: "jingju",
  name: "京剧",
  englishName: "Peking Opera",
  categorySlug: "traditional-opera",
  categoryName: "传统戏曲",
  summary: "京剧以唱、念、做、打为核心。",
  region: "北京",
  province: "北京市",
  city: "北京",
  inscriptionYear: 2010,
  featured: false,
  image: "/assets/jingju.png",
  heroImage: "/assets/jingju-hero.png",
  videoPoster: "/assets/jingju-hero.png",
  videoUrl: "",
  history: [],
  gallery: [],
  timeline: [],
  inheritor: {
    name: "梅派传承群体",
    title: "京剧表演艺术传承代表",
    bio: "持续推动经典剧目传承。",
    image: "/assets/inheritor-opera.png"
  },
  location: {
    lat: 39.9042,
    lng: 116.4074,
    mapX: 68,
    mapY: 31
  },
  tags: ["国粹"],
  relatedSlugs: ["kunqu"]
};

describe("SEO configuration", () => {
  it("uses production-ready Chinese site metadata", () => {
    expect(siteConfig.name).toBe("华韵 · 中国非遗");
    expect(siteConfig.description).toContain("中国非物质文化遗产");
    expect(siteConfig.url).toBe("https://www.huayunheritage.com");
    expect(siteConfig.url).not.toMatch(/\/$/);
  });

  it("creates canonical Open Graph and Twitter card metadata", () => {
    const metadata = createMetadata({
      title: "非遗名录",
      description: "浏览中国非遗项目。",
      path: "/heritage",
      image: "/assets/hero-museum.png"
    });
    const openGraph = metadata.openGraph as Record<string, unknown>;
    const twitter = metadata.twitter as Record<string, unknown>;
    const alternates = metadata.alternates?.languages as Record<string, string>;

    expect(metadata.title).toBe("非遗名录 | 华韵 · 中国非遗");
    expect(metadata.alternates?.canonical).toBe(`${siteConfig.url}/zh/heritage`);
    expect(alternates).toMatchObject({
      "zh-CN": `${siteConfig.url}/zh/heritage`,
      "en-US": `${siteConfig.url}/en/heritage`,
      "x-default": `${siteConfig.url}/zh/heritage`
    });
    expect(openGraph.type).toBe("website");
    expect(openGraph.url).toBe(`${siteConfig.url}/zh/heritage`);
    expect(openGraph.images).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          url: `${siteConfig.url}/assets/hero-museum.png`,
          width: 1600,
          height: 1000
        })
      ])
    );
    expect(twitter.card).toBe("summary_large_image");
    expect(twitter).not.toHaveProperty("creator");
  });

  it("merges page-specific keywords without duplicates", () => {
    const metadata = createMetadata({
      title: "Peking Opera",
      path: "/heritage/jingju",
      locale: "en",
      keywords: ["Peking Opera", "living heritage", "Beijing", "Peking Opera"]
    });

    expect((metadata.keywords as string[]).map((keyword) => keyword.toLowerCase())).toEqual(
      expect.arrayContaining(["chinese intangible cultural heritage", "peking opera", "beijing"])
    );
    expect((metadata.keywords as string[]).filter((keyword) => keyword === "Peking Opera")).toHaveLength(1);
  });

  it("uses an English fallback instead of Chinese CMS copy for English heritage SEO", () => {
    const description = getHeritageSeoDescription(heritageItem, "en");

    expect(description).toContain("Peking Opera");
    expect(description).toContain("Chinese intangible cultural heritage");
    expect(description).not.toBe(heritageItem.summary);
  });

  it("creates English metadata with localized canonical and Open Graph locale", () => {
    const metadata = createMetadata({
      title: "Heritage Archive",
      description: "Browse Chinese intangible cultural heritage items.",
      path: "/heritage",
      image: "/assets/hero-museum.png",
      locale: "en"
    } as Parameters<typeof createMetadata>[0] & { locale: "en" });
    const openGraph = metadata.openGraph as Record<string, unknown>;
    const alternates = metadata.alternates?.languages as Record<string, string>;

    expect(metadata.title).toBe("Heritage Archive | Huayun · Chinese Intangible Cultural Heritage");
    expect(metadata.alternates?.canonical).toBe(`${siteConfig.url}/en/heritage`);
    expect(alternates["zh-CN"]).toBe(`${siteConfig.url}/zh/heritage`);
    expect(alternates["en-US"]).toBe(`${siteConfig.url}/en/heritage`);
    expect(openGraph.locale).toBe("en_US");
  });

  it("keeps crawlers on public pages and away from admin APIs", () => {
    const result = robots();

    expect(result.sitemap).toBe(`${siteConfig.url}/sitemap.xml`);
    expect(result.rules).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ userAgent: "*", allow: "/" }),
        expect.objectContaining({
          userAgent: "*",
          disallow: expect.arrayContaining(["/admin", "/zh/admin", "/en/admin", "/api/", "/monitoring"])
        })
      ])
    );
  });

  it("generates localized sitemap entries with hreflang alternates", async () => {
    const result = await sitemap();
    const zhHome = result.find((entry) => entry.url === `${siteConfig.url}/zh`);
    const enArchive = result.find((entry) => entry.url === `${siteConfig.url}/en/heritage`);
    const zhMuseum = result.find((entry) => entry.url === `${siteConfig.url}/zh/museum`);
    const zhMuseumInsights = result.find((entry) => entry.url === `${siteConfig.url}/zh/museum/insights`);
    const zhCampaigns = result.find((entry) => entry.url === `${siteConfig.url}/zh/campaigns`);
    const retiredCampaign = result.find((entry) => entry.url === `${siteConfig.url}/zh/campaigns/traditional-opera`);
    const zhOffline = result.find((entry) => entry.url === `${siteConfig.url}/zh/offline`);
    const retiredMuseumTopic = result.find(
      (entry) => entry.url === `${siteConfig.url}/zh/museum/topics/four-embroideries`
    );
    const zhAssistant = result.find((entry) => entry.url === `${siteConfig.url}/zh/assistant`);

    expect(zhHome?.alternates?.languages).toMatchObject({
      "zh-CN": `${siteConfig.url}/zh`,
      "en-US": `${siteConfig.url}/en`,
      "x-default": `${siteConfig.url}/zh`
    });
    expect(enArchive?.alternates?.languages).toMatchObject({
      "zh-CN": `${siteConfig.url}/zh/heritage`,
      "en-US": `${siteConfig.url}/en/heritage`
    });
    expect(zhMuseum?.alternates?.languages).toMatchObject({
      "zh-CN": `${siteConfig.url}/zh/museum`,
      "en-US": `${siteConfig.url}/en/museum`
    });
    expect(zhMuseumInsights?.alternates?.languages).toMatchObject({
      "zh-CN": `${siteConfig.url}/zh/museum/insights`,
      "en-US": `${siteConfig.url}/en/museum/insights`
    });
    expect(zhCampaigns?.alternates?.languages).toMatchObject({
      "zh-CN": `${siteConfig.url}/zh/campaigns`,
      "en-US": `${siteConfig.url}/en/campaigns`
    });
    expect(retiredCampaign).toBeUndefined();
    expect(zhOffline).toBeUndefined();
    expect(result.every((entry) => entry.lastModified === undefined)).toBe(true);
    expect(retiredMuseumTopic).toBeUndefined();
    expect(zhAssistant?.alternates?.languages).toMatchObject({
      "zh-CN": `${siteConfig.url}/zh/assistant`,
      "en-US": `${siteConfig.url}/en/assistant`
    });
  });
});

describe("structured data helpers", () => {
  it("creates website and organization JSON-LD", () => {
    expect(createWebsiteJsonLd()).toEqual(
      expect.objectContaining({
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: siteConfig.name,
        inLanguage: "zh-CN",
        url: `${siteConfig.url}/zh`
      })
    );
    expect(createOrganizationJsonLd()).toEqual(
      expect.objectContaining({
        "@type": "Organization",
        name: siteConfig.name,
        url: siteConfig.url
      })
    );
  });

  it("creates list and detail JSON-LD from Supabase content shape", () => {
    expect(createItemListJsonLd([heritageItem])).toEqual(
      expect.objectContaining({
        "@type": "ItemList",
        numberOfItems: 1,
        itemListElement: [
          expect.objectContaining({
            position: 1,
            url: `${siteConfig.url}/zh/heritage/jingju`,
            name: "京剧"
          })
        ]
      })
    );

    expect(createCreativeWorkJsonLd(heritageItem)).toEqual(
      expect.objectContaining({
        "@type": "CreativeWork",
        name: "京剧",
        alternateName: "Peking Opera",
        spatialCoverage: "北京"
      })
    );

    expect(createCreativeWorkJsonLd(heritageItem, "en")).toEqual(
      expect.objectContaining({
        name: "Peking Opera",
        description: expect.stringContaining("Chinese intangible cultural heritage"),
        inLanguage: "en-US"
      })
    );
  });
});
