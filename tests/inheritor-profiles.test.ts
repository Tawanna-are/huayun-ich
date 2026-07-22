import { describe, expect, it } from "vitest";
import { createInheritorProfilesFromHeritageItems } from "@/lib/content/inheritor-repository";
import type { HeritageItem } from "@/lib/types/heritage";

function makeHeritageItem(overrides: Partial<HeritageItem> = {}): HeritageItem {
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
    gallery: [{ src: "/assets/jingju-gallery.png", alt: "京剧身段", caption: "舞台身段与脸谱。" }],
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
    relatedSlugs: ["kunqu"],
    ...overrides
  };
}

describe("inheritor profiles", () => {
  it("creates inheritor list profiles from heritage items", () => {
    const profiles = createInheritorProfilesFromHeritageItems([
      makeHeritageItem(),
      makeHeritageItem({
        id: "kunqu",
        slug: "kunqu",
        name: "昆曲",
        englishName: "Kunqu Opera",
        inheritor: {
          name: "昆曲传习群体",
          title: "昆曲传承代表",
          bio: "延续水磨腔与舞台传统。",
          image: "/assets/inheritor-kunqu.png"
        }
      })
    ]);

    expect(profiles).toHaveLength(2);
    expect(profiles[0]).toEqual(
      expect.objectContaining({
        id: "jingju-mei-pai-chuan-cheng-qun-ti",
        name: "梅派传承群体",
        title: "京剧表演艺术传承代表",
        region: "北京",
        heritageName: "京剧",
        heritageSlug: "jingju"
      })
    );
    expect(profiles[0]?.representativeWorks[0]).toEqual(
      expect.objectContaining({
        title: "京剧",
        href: "/heritage/jingju",
        image: "/assets/jingju.png"
      })
    );
  });

  it("uses the associated heritage video as the interview video", () => {
    const [profile] = createInheritorProfilesFromHeritageItems([makeHeritageItem()]);

    expect(profile?.interviewVideo).toEqual({
      url: "/assets/jingju.mp4",
      poster: "/assets/jingju-hero.png",
      title: "梅派传承群体 · 京剧"
    });
  });
});
