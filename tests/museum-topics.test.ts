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
    id: "08d7f672-4220-42df-9bd5-7e5bc7aa62d9",
    slug: "tie-dye",
    name: "扎染",
    englishName: "Tie-dye",
    categorySlug: "traditional-craft",
    categoryName: "传统工艺",
    summary: "扎染通过结扎与染色形成独特纹样。",
    region: "云南大理",
    province: "云南省",
    city: "大理",
    inscriptionYear: 2006,
    featured: false,
    image: "/assets/hero-museum.png",
    heroImage: "/assets/hero-museum.png",
    videoPoster: "/assets/hero-museum.png",
    videoUrl: "",
    history: ["扎染技艺在长期生活实践中传承。"],
    gallery: [],
    timeline: [{ year: "2010", title: "入选名录", description: "进入代表作名录。" }],
    inheritor: {
      name: "扎染传承群体",
      title: "扎染技艺传承人",
      bio: "持续传承扎染技艺。",
      image: "/assets/hero-museum.png"
    },
    location: {
      lat: 25.6065,
      lng: 100.2676,
      mapX: 46,
      mapY: 67
    },
    tags: ["扎染", "染色"],
    relatedSlugs: [],
    ...overrides
  };
}

describe("curated museum topics", () => {
  it("does not publish retired museum topic slugs", () => {
    expect(curatedMuseumTopicSlugs).toEqual([]);
    expect(getMuseumTopicBySlug("four-embroideries")).toBeUndefined();
  });

  it("does not create retired topic summaries for the current tie-dye archive", () => {
    expect(createMuseumTopicSummaries([makeItem()])).toEqual([]);
  });

  it("does not resolve retired topic details from the current tie-dye archive", () => {
    expect(resolveMuseumTopicDetail("traditional-opera", [makeItem()], "en")).toBeUndefined();
    expect(resolveMuseumTopicDetail("four-embroideries", [makeItem()], "zh")).toBeUndefined();
  });

  it("does not return static params for retired topic routes", () => {
    expect(getMuseumTopicStaticParams(["zh", "en"])).toEqual([]);
  });
});
