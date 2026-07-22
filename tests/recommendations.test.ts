import { describe, expect, it } from "vitest";
import type { HeritageCategorySlug, HeritageItem } from "@/lib/types/heritage";
import { createHeritageRecommendations } from "@/lib/user/recommendations";

function createItem({
  id,
  slug,
  name,
  categorySlug,
  tags,
  relatedSlugs = [],
  province = "江苏省",
  inscriptionYear = 2006
}: {
  id: string;
  slug: string;
  name: string;
  categorySlug: HeritageCategorySlug;
  tags: string[];
  relatedSlugs?: string[];
  province?: string;
  inscriptionYear?: number;
}): HeritageItem {
  return {
    id,
    slug,
    name,
    englishName: name,
    categorySlug,
    categoryName: categorySlug,
    summary: `${name} summary`,
    region: province,
    province,
    city: province,
    inscriptionYear,
    featured: false,
    image: "/assets/test.png",
    heroImage: "/assets/test.png",
    videoPoster: "/assets/test.png",
    videoUrl: "",
    history: [],
    gallery: [],
    timeline: [],
    inheritor: {
      name: "",
      title: "",
      bio: "",
      image: "/assets/test.png"
    },
    location: {
      lat: 0,
      lng: 0,
      mapX: 0,
      mapY: 0
    },
    tags,
    relatedSlugs
  };
}

const items = [
  createItem({
    id: "suzhou",
    slug: "suzhou-embroidery",
    name: "苏绣",
    categorySlug: "traditional-craft",
    tags: ["刺绣", "江南"],
    relatedSlugs: ["hunan-embroidery"]
  }),
  createItem({
    id: "hunan",
    slug: "hunan-embroidery",
    name: "湘绣",
    categorySlug: "traditional-craft",
    tags: ["刺绣", "湖湘"],
    relatedSlugs: ["suzhou-embroidery"],
    province: "湖南省"
  }),
  createItem({
    id: "jingju",
    slug: "jingju",
    name: "京剧",
    categorySlug: "traditional-opera",
    tags: ["戏曲", "剧场"],
    province: "北京市",
    inscriptionYear: 2010
  }),
  createItem({
    id: "datiehua",
    slug: "datiehua",
    name: "打铁花",
    categorySlug: "folk-activity",
    tags: ["民俗", "节庆"],
    province: "河南省"
  })
];

describe("heritage recommendations", () => {
  it("prioritizes related items from favorites and interest tags while excluding saved heritage", () => {
    const recommendations = createHeritageRecommendations({
      items,
      favorites: [
        {
          target_type: "heritage",
          target_id: "suzhou",
          heritage_item_id: "suzhou"
        }
      ],
      history: [],
      interestTags: ["刺绣"],
      inheritors: [],
      limit: 3
    });

    expect(recommendations[0]?.item.slug).toBe("hunan-embroidery");
    expect(recommendations.some((recommendation) => recommendation.item.id === "suzhou")).toBe(false);
    expect(recommendations[0]?.reasons).toContain("interest_tag");
  });

  it("uses museum topic favorites as category signals", () => {
    const recommendations = createHeritageRecommendations({
      items,
      favorites: [
        {
          target_type: "museum_topic",
          target_id: "traditional-opera",
          heritage_item_id: null
        }
      ],
      history: [],
      interestTags: [],
      inheritors: [],
      limit: 2
    });

    expect(recommendations[0]?.item.categorySlug).toBe("traditional-opera");
  });

  it("uses curated museum topic favorites as representative item signals", () => {
    const recommendations = createHeritageRecommendations({
      items,
      favorites: [
        {
          target_type: "museum_topic",
          target_id: "four-embroideries",
          heritage_item_id: null
        }
      ],
      history: [],
      interestTags: [],
      inheritors: [],
      limit: 2
    });

    expect(recommendations.map((recommendation) => recommendation.item.slug)).toEqual([
      "suzhou-embroidery",
      "hunan-embroidery"
    ]);
    expect(recommendations[0]?.reasons).toContain("shared_tag");
  });
});
