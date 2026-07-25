import { describe, expect, it } from "vitest";
import { createMuseumCuration } from "@/lib/content/museum-curation";
import type { HeritageItem } from "@/lib/types/heritage";

function makeItem(overrides: Partial<HeritageItem> = {}): HeritageItem {
  return {
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
    videoUrl: "/assets/jingju.mp4",
    history: ["宫廷与民间戏曲融合。", "现代剧场继续重塑经典。"],
    gallery: [{ id: "jingju-gallery", src: "/assets/jingju-gallery.png", alt: "京剧身段", caption: "舞台身段与脸谱。" }],
    timeline: [{ year: "2010", title: "入选名录", description: "进入代表作名录。" }],
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
    relatedSlugs: ["kunqu"],
    ...overrides
  };
}

describe("museum curation", () => {
  it("builds curated museum topics with localized exhibition paths", () => {
    const curation = createMuseumCuration([
      makeItem(),
      makeItem({
        id: "suxiu",
        slug: "suzhou-embroidery",
        name: "苏绣",
        englishName: "Suzhou Embroidery",
        categorySlug: "traditional-craft",
        categoryName: "传统工艺",
        province: "江苏省",
        region: "江苏苏州",
        inscriptionYear: 2006
      })
    ]);

    expect(curation.featuredTopics).toHaveLength(4);
    expect(curation.featuredTopics[0]).toEqual(
      expect.objectContaining({
        id: "four-embroideries",
        title: "中国四大名绣",
        englishTitle: "The Four Great Chinese Embroideries",
        count: 1,
        href: "/museum/topics/four-embroideries"
      })
    );
    expect(curation.featuredTopics.map((topic) => topic.href)).toEqual([
      "/museum/topics/four-embroideries",
      "/museum/topics/traditional-opera",
      "/museum/topics/tea-culture",
      "/museum/topics/traditional-festivals"
    ]);
  });

  it("selects annual recommendations by inscription year and creates curatorial stories", () => {
    const curation = createMuseumCuration([
      makeItem({ inscriptionYear: 2010 }),
      makeItem({
        id: "suxiu",
        slug: "suzhou-embroidery",
        name: "苏绣",
        englishName: "Suzhou Embroidery",
        categorySlug: "traditional-craft",
        categoryName: "传统工艺",
        inscriptionYear: 2006
      })
    ]);

    expect(curation.annualRecommendations.map((item) => item.slug)).toEqual(["jingju", "suzhou-embroidery"]);
    expect(curation.curatorialStories[0]).toEqual(
      expect.objectContaining({
        title: "京剧",
        href: "/heritage/jingju",
        quote: "宫廷与民间戏曲融合。"
      })
    );
  });
});
