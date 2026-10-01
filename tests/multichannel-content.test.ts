import { describe, expect, it } from "vitest";
import {
  createCampaignCollection,
  createMultichannelContent,
  createOfflineContentPayload,
  resolveCampaignDetail
} from "@/lib/content/multichannel-content";
import type { HeritageItem } from "@/lib/types/heritage";

function makeItem(overrides: Partial<HeritageItem> = {}): HeritageItem {
  const slug = overrides.slug ?? "tie-dye";

  return {
    id: slug,
    slug,
    name: overrides.name ?? "扎染",
    englishName: overrides.englishName ?? "Tie-dye",
    categorySlug: overrides.categorySlug ?? "traditional-craft",
    categoryName: overrides.categoryName ?? "传统工艺",
    summary: overrides.summary ?? "扎染通过结扎与染色形成独特纹样。",
    region: overrides.region ?? "云南大理",
    province: overrides.province ?? "云南省",
    city: overrides.city ?? "大理",
    inscriptionYear: overrides.inscriptionYear ?? 2006,
    featured: overrides.featured ?? false,
    image: overrides.image ?? "/assets/hero-museum.png",
    heroImage: overrides.heroImage ?? "/assets/hero-museum.png",
    videoPoster: overrides.videoPoster ?? "/assets/hero-museum.png",
    videoUrl: overrides.videoUrl ?? "",
    history: overrides.history ?? ["扎染技艺在长期生活实践中传承。"],
    gallery: overrides.gallery ?? [],
    timeline: overrides.timeline ?? [{ year: "2010", title: "入选名录", description: "进入代表作名录。" }],
    inheritor: overrides.inheritor ?? {
      name: "扎染传承群体",
      title: "扎染技艺传承人",
      bio: "持续传承扎染技艺。",
      image: "/assets/hero-museum.png"
    },
    location: overrides.location ?? {
      lat: 25.6065,
      lng: 100.2676,
      mapX: 46,
      mapY: 67
    },
    tags: overrides.tags ?? ["扎染", "染色"],
    relatedSlugs: overrides.relatedSlugs ?? [],
    ...overrides
  };
}

describe("multichannel content", () => {
  it("does not create retired campaign cards from the current tie-dye archive", () => {
    expect(createCampaignCollection([makeItem()])).toEqual([]);
  });

  it("does not resolve retired campaign details", () => {
    expect(resolveCampaignDetail("traditional-opera", [makeItem()], "en")).toBeUndefined();
  });

  it("creates a sanitized multichannel API feed", () => {
    const feed = createMultichannelContent({
      items: [makeItem()],
      categories: [
        {
          slug: "traditional-craft",
          name: "传统工艺",
          englishName: "Traditional Craft",
          summary: "以手工技艺为核心。",
          color: "#B22222"
        }
      ],
      inheritors: []
    });

    expect(feed.version).toBe(1);
    expect(feed.heritageItems[0]).toEqual(
      expect.objectContaining({
        slug: "tie-dye",
        title: "扎染",
        englishTitle: "Tie-dye",
        href: "/heritage/tie-dye"
      })
    );
    expect(feed.campaigns).toEqual([]);
  });

  it("limits offline payload for fast PWA boot", () => {
    const payload = createOfflineContentPayload([makeItem({ slug: "one" }), makeItem({ slug: "two" })], 1);

    expect(payload.version).toBe(1);
    expect(payload.cachedAt).toEqual(expect.any(String));
    expect(payload.items).toHaveLength(1);
    expect(payload.items[0]).toEqual(
      expect.objectContaining({
        slug: "one",
        href: "/heritage/one"
      })
    );
  });
});
