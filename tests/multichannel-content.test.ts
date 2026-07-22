import { describe, expect, it } from "vitest";
import {
  createCampaignCollection,
  createMultichannelContent,
  createOfflineContentPayload,
  resolveCampaignDetail
} from "@/lib/content/multichannel-content";
import type { HeritageItem } from "@/lib/types/heritage";

function makeItem(overrides: Partial<HeritageItem> = {}): HeritageItem {
  const slug = overrides.slug ?? "jingju";

  return {
    id: slug,
    slug,
    name: overrides.name ?? "京剧",
    englishName: overrides.englishName ?? "Peking Opera",
    categorySlug: overrides.categorySlug ?? "traditional-opera",
    categoryName: overrides.categoryName ?? "传统戏曲",
    summary: overrides.summary ?? "京剧以唱念做打为核心。",
    region: overrides.region ?? "北京",
    province: overrides.province ?? "北京市",
    city: overrides.city ?? "北京",
    inscriptionYear: overrides.inscriptionYear ?? 2010,
    featured: overrides.featured ?? false,
    image: overrides.image ?? "/assets/jingju.png",
    heroImage: overrides.heroImage ?? "/assets/jingju-hero.png",
    videoPoster: overrides.videoPoster ?? "/assets/jingju-hero.png",
    videoUrl: overrides.videoUrl ?? "",
    history: overrides.history ?? ["清代宫廷与民间戏曲交流中形成。"],
    gallery: overrides.gallery ?? [],
    timeline: overrides.timeline ?? [{ year: "2010", title: "入选名录", description: "进入代表作名录。" }],
    inheritor: overrides.inheritor ?? {
      name: "梅派传承群体",
      title: "京剧表演艺术传承代表",
      bio: "持续推动经典剧目传承。",
      image: "/assets/inheritor-opera.png"
    },
    location: overrides.location ?? {
      lat: 39.9042,
      lng: 116.4074,
      mapX: 68,
      mapY: 31
    },
    tags: overrides.tags ?? ["国粹"],
    relatedSlugs: overrides.relatedSlugs ?? [],
    ...overrides
  };
}

describe("multichannel content", () => {
  it("creates launch H5 campaign cards from heritage content", () => {
    const campaigns = createCampaignCollection([
      makeItem(),
      makeItem({
        slug: "suzhou-embroidery",
        name: "苏绣",
        englishName: "Suzhou Embroidery",
        categorySlug: "traditional-craft",
        categoryName: "传统工艺",
        summary: "苏绣以精细针法与雅致设色见长。",
        tags: ["刺绣", "四大名绣"]
      })
    ]);

    expect(campaigns.map((campaign) => campaign.slug)).toEqual([
      "four-embroideries",
      "traditional-opera",
      "tea-culture",
      "traditional-festivals"
    ]);
    expect(campaigns[0]).toEqual(
      expect.objectContaining({
        slug: "four-embroideries",
        href: "/campaigns/four-embroideries",
        itemCount: 1
      })
    );
    expect(campaigns[1]?.itemCount).toBe(1);
  });

  it("resolves localized campaign detail with representative items", () => {
    const detail = resolveCampaignDetail(
      "traditional-opera",
      [
        makeItem(),
        makeItem({
          slug: "kunqu",
          name: "昆曲",
          englishName: "Kunqu Opera",
          categorySlug: "traditional-opera",
          categoryName: "传统戏曲",
          province: "江苏省"
        })
      ],
      "en"
    );

    expect(detail?.displayTitle).toBe("Chinese Traditional Opera");
    expect(detail?.items.map((item) => item.slug)).toEqual(["jingju", "kunqu"]);
    expect(detail?.featuredItem?.slug).toBe("jingju");
  });

  it("creates a sanitized multichannel API feed", () => {
    const feed = createMultichannelContent({
      items: [makeItem()],
      categories: [
        {
          slug: "traditional-opera",
          name: "传统戏曲",
          englishName: "Traditional Opera",
          summary: "以舞台表演为核心。",
          color: "#B22222"
        }
      ],
      inheritors: []
    });

    expect(feed.version).toBe(1);
    expect(feed.heritageItems[0]).toEqual(
      expect.objectContaining({
        slug: "jingju",
        title: "京剧",
        englishTitle: "Peking Opera",
        href: "/heritage/jingju"
      })
    );
    expect(feed.campaigns[1]?.slug).toBe("traditional-opera");
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
