import { describe, expect, it } from "vitest";
import {
  curatedMuseumTopicSlugs,
  createMuseumTopicSummaries,
  getMuseumTopicBySlug,
  getMuseumTopicStaticParams,
  resolveMuseumTopicDetail
} from "@/lib/content/museum-topics";
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
    history: ["宫廷与民间戏曲融合。"],
    gallery: [{ src: "/assets/jingju-detail.png", alt: "京剧身段", caption: "舞台身段与脸谱。" }],
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

describe("curated museum topics", () => {
  it("defines the four launch topics with stable slugs", () => {
    expect(curatedMuseumTopicSlugs).toEqual([
      "four-embroideries",
      "traditional-opera",
      "tea-culture",
      "traditional-festivals"
    ]);

    expect(getMuseumTopicBySlug("four-embroideries")).toEqual(
      expect.objectContaining({
        slug: "four-embroideries",
        title: "中国四大名绣",
        englishTitle: "The Four Great Chinese Embroideries",
        href: "/museum/topics/four-embroideries"
      })
    );
  });

  it("creates localized topic summaries from Supabase-backed heritage items", () => {
    const items = [
      makeItem(),
      makeItem({
        id: "suzhou-embroidery",
        slug: "suzhou-embroidery",
        name: "苏绣",
        englishName: "Suzhou Embroidery",
        categorySlug: "traditional-craft",
        categoryName: "传统工艺",
        summary: "苏绣以精细针法与雅致设色见长。",
        region: "江苏苏州",
        province: "江苏省",
        city: "苏州",
        inscriptionYear: 2006,
        image: "/assets/suzhou-embroidery.png",
        heroImage: "/assets/suzhou-embroidery-hero.png",
        tags: ["刺绣", "四大名绣"]
      }),
      makeItem({
        id: "duanwu",
        slug: "dragon-boat-festival",
        name: "端午节",
        englishName: "Dragon Boat Festival",
        categorySlug: "folk-activity",
        categoryName: "民俗活动",
        summary: "端午节凝结竞渡、食俗与岁时信仰。",
        region: "多地",
        province: "湖北省",
        city: "宜昌",
        inscriptionYear: 2009,
        image: "/assets/hero-museum.png",
        heroImage: "/assets/hero-museum.png",
        tags: ["节庆", "端午"]
      })
    ];

    const topics = createMuseumTopicSummaries(items);

    expect(topics).toHaveLength(4);
    expect(topics[0]).toEqual(
      expect.objectContaining({
        id: "four-embroideries",
        href: "/museum/topics/four-embroideries",
        count: 1,
        image: "/assets/suzhou-embroidery-hero.png"
      })
    );
    expect(topics.find((topic) => topic.id === "traditional-opera")?.count).toBe(1);
    expect(topics.find((topic) => topic.id === "traditional-festivals")?.count).toBe(1);
  });

  it("resolves detail content with representative items and fallback recommendations", () => {
    const items = [
      makeItem(),
      makeItem({
        id: "kunqu",
        slug: "kunqu",
        name: "昆曲",
        englishName: "Kunqu Opera",
        categorySlug: "traditional-opera",
        categoryName: "传统戏曲",
        summary: "昆曲以水磨腔和精雅表演著称。",
        region: "江苏昆山",
        province: "江苏省",
        city: "昆山",
        inscriptionYear: 2001,
        image: "/assets/kunqu.png",
        heroImage: "/assets/kunqu-hero.png",
        tags: ["戏曲"]
      }),
      makeItem({
        id: "suzhou-embroidery",
        slug: "suzhou-embroidery",
        name: "苏绣",
        englishName: "Suzhou Embroidery",
        categorySlug: "traditional-craft",
        categoryName: "传统工艺",
        summary: "苏绣以精细针法与雅致设色见长。",
        region: "江苏苏州",
        province: "江苏省",
        city: "苏州",
        inscriptionYear: 2006,
        image: "/assets/suzhou-embroidery.png",
        heroImage: "/assets/suzhou-embroidery-hero.png",
        tags: ["刺绣", "四大名绣"]
      })
    ];

    const operaTopic = resolveMuseumTopicDetail("traditional-opera", items, "en");
    const teaTopic = resolveMuseumTopicDetail("tea-culture", items, "zh");

    expect(operaTopic?.representativeItems.map((item) => item.slug)).toEqual(["jingju", "kunqu"]);
    expect(operaTopic?.recommendedItems.map((item) => item.slug)).toEqual(["suzhou-embroidery"]);
    expect(operaTopic?.displayTitle).toBe("Chinese Traditional Opera");
    expect(teaTopic?.representativeItems).toHaveLength(0);
    expect(teaTopic?.recommendedItems.map((item) => item.slug)).toEqual(["jingju", "suzhou-embroidery", "kunqu"]);
  });

  it("returns static params for all localized topic routes", () => {
    expect(getMuseumTopicStaticParams(["zh", "en"])).toEqual([
      { locale: "zh", slug: "four-embroideries" },
      { locale: "zh", slug: "traditional-opera" },
      { locale: "zh", slug: "tea-culture" },
      { locale: "zh", slug: "traditional-festivals" },
      { locale: "en", slug: "four-embroideries" },
      { locale: "en", slug: "traditional-opera" },
      { locale: "en", slug: "tea-culture" },
      { locale: "en", slug: "traditional-festivals" }
    ]);
  });
});
