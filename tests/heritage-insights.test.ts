import { describe, expect, it } from "vitest";
import { createHeritageInsights } from "@/lib/content/heritage-insights";
import type { HeritageCategorySlug, HeritageItem } from "@/lib/types/heritage";

function makeItem(overrides: Partial<HeritageItem> = {}): HeritageItem {
  const slug = overrides.slug ?? "jingju";

  return {
    id: slug,
    slug,
    name: overrides.name ?? "京剧",
    englishName: overrides.englishName ?? "Peking Opera",
    categorySlug: overrides.categorySlug ?? "traditional-opera",
    categoryName: overrides.categoryName ?? "传统戏曲",
    summary: overrides.summary ?? "京剧以唱、念、做、打为核心。",
    region: overrides.region ?? "北京",
    province: overrides.province ?? "北京市",
    city: overrides.city ?? "北京",
    inscriptionYear: overrides.inscriptionYear ?? 2010,
    featured: overrides.featured ?? false,
    image: "/assets/hero-museum.png",
    heroImage: "/assets/hero-museum.png",
    videoPoster: "/assets/hero-museum.png",
    videoUrl: "",
    history: overrides.history ?? ["形成于清代宫廷与民间戏曲交流。"],
    gallery: [],
    timeline: overrides.timeline ?? [{ year: "清代", title: "形成", description: "徽班进京后逐渐形成。" }],
    inheritor: overrides.inheritor ?? {
      name: "梅派传承群体",
      title: "京剧传承代表",
      bio: "持续推动经典剧目传承。",
      image: "/assets/inheritor-opera.png"
    },
    location: {
      lat: 39,
      lng: 116,
      mapX: 50,
      mapY: 50
    },
    tags: overrides.tags ?? ["戏曲"],
    relatedSlugs: overrides.relatedSlugs ?? [],
    ...overrides
  };
}

describe("heritage insights aggregation", () => {
  it("builds province heat map data from heritage items", () => {
    const insights = createHeritageInsights([
      makeItem({ slug: "jingju", province: "北京市" }),
      makeItem({ slug: "kunqu", province: "江苏省", city: "苏州" }),
      makeItem({ slug: "suxiu", province: "江苏省", city: "苏州", categorySlug: "traditional-craft" })
    ]);

    expect(insights.heatMap.totalCount).toBe(3);
    expect(insights.heatMap.provinces.map((province) => [province.province, province.count])).toEqual([
      ["江苏省", 2],
      ["北京市", 1]
    ]);
    expect(insights.heatMap.provinces[0]?.intensity).toBe(1);
  });

  it("groups items into historical period timeline buckets", () => {
    const insights = createHeritageInsights([
      makeItem({
        slug: "guqin",
        name: "古琴艺术",
        history: ["先秦时期已经形成士人音乐传统。"],
        timeline: [{ year: "先秦", title: "源起", description: "礼乐文化孕育。" }]
      }),
      makeItem({
        slug: "kunqu",
        name: "昆曲",
        history: ["昆曲在明代形成并兴盛。"],
        timeline: [{ year: "明代", title: "形成", description: "水磨腔成熟。" }]
      }),
      makeItem({
        slug: "jingju",
        name: "京剧",
        history: ["京剧在清代形成。"],
        timeline: [{ year: "清代", title: "形成", description: "徽班进京。" }]
      })
    ]);

    expect(insights.timeline.periods.find((period) => period.id === "pre-qin")?.items[0]?.slug).toBe("guqin");
    expect(insights.timeline.periods.find((period) => period.id === "ming-qing")?.items.map((item) => item.slug)).toEqual([
      "kunqu",
      "jingju"
    ]);
  });

  it("creates category statistics with percentages", () => {
    const insights = createHeritageInsights([
      makeItem({ slug: "jingju", categorySlug: "traditional-opera" }),
      makeItem({ slug: "kunqu", categorySlug: "traditional-opera" }),
      makeItem({ slug: "suxiu", categorySlug: "traditional-craft", categoryName: "传统工艺" })
    ]);
    const opera = insights.categories.find((category) => category.slug === "traditional-opera");

    expect(opera).toEqual(
      expect.objectContaining({
        count: 2,
        percentage: 67
      })
    );
  });

  it("builds inheritance graph nodes and links", () => {
    const item = makeItem({
      slug: "suzhou-embroidery",
      name: "苏绣",
      categorySlug: "traditional-craft" as HeritageCategorySlug,
      categoryName: "传统工艺",
      province: "江苏省",
      inheritor: {
        name: "姚建萍",
        title: "苏绣代表性传承人",
        bio: "长期从事苏绣创作。",
        image: "/assets/inheritor-craft.png"
      }
    });
    const insights = createHeritageInsights([item]);

    expect(insights.graph.nodes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "heritage:suzhou-embroidery", type: "heritage", label: "苏绣" }),
        expect.objectContaining({ id: "inheritor:姚建萍", type: "inheritor", label: "姚建萍" }),
        expect.objectContaining({ id: "province:江苏省", type: "province", label: "江苏省" }),
        expect.objectContaining({ id: "category:traditional-craft", type: "category", label: "传统工艺" })
      ])
    );
    expect(insights.graph.links).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: "heritage:suzhou-embroidery", target: "inheritor:姚建萍" }),
        expect.objectContaining({ source: "heritage:suzhou-embroidery", target: "province:江苏省" })
      ])
    );
  });
});
