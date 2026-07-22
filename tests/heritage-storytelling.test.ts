import { describe, expect, it } from "vitest";
import { createStoryPanels, createVideoChapters } from "@/lib/content/heritage-storytelling";
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
  videoUrl: "/assets/jingju.mp4",
  history: ["宫廷与民间戏曲融合。", "现代剧场继续重塑经典。"],
  gallery: [
    { src: "/assets/jingju-1.png", alt: "脸谱", caption: "脸谱、行当与舞台身段。" }
  ],
  timeline: [
    { year: "1790", title: "徽班进京", description: "戏曲声腔开始交汇。" },
    { year: "2010", title: "入选名录", description: "进入代表作名录。" }
  ],
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

const labels = {
  video: "影像开场",
  origin: "历史源流",
  craft: "技艺现场",
  timeline: "时间线",
  inheritor: "传承人",
  related: "延伸观看",
  inscription: "入选年份",
  galleryCount: "图像线索",
  timelineCount: "历史节点",
  profile: "人物档案"
};

describe("heritage detail storytelling", () => {
  it("creates anchorable video chapters from heritage content", () => {
    const chapters = createVideoChapters(heritageItem, labels);

    expect(chapters).toEqual([
      expect.objectContaining({ id: "hero-video", href: "#hero-video", timecode: "00:00", title: "影像开场" }),
      expect.objectContaining({ id: "story-origin", href: "#story-origin", timecode: "01:20", title: "历史源流" }),
      expect.objectContaining({ id: "gallery", href: "#gallery", timecode: "02:40", title: "技艺现场" }),
      expect.objectContaining({ id: "timeline", href: "#timeline", timecode: "03:30", title: "时间线" }),
      expect.objectContaining({ id: "inheritor", href: "#inheritor", timecode: "04:20", title: "传承人" })
    ]);
    expect(chapters[1]?.description).toContain("宫廷与民间");
    expect(chapters[2]?.description).toContain("脸谱");
  });

  it("creates story panels with stable counts and fallbacks", () => {
    const panels = createStoryPanels(heritageItem, labels);

    expect(panels.map((panel) => panel.id)).toEqual([
      "story-origin",
      "story-craft",
      "story-memory",
      "story-inheritor"
    ]);
    expect(panels[0]).toEqual(expect.objectContaining({ stat: "2010", statLabel: "入选年份" }));
    expect(panels[1]).toEqual(expect.objectContaining({ stat: "1", statLabel: "图像线索" }));
    expect(panels[2]).toEqual(expect.objectContaining({ stat: "2", statLabel: "历史节点" }));
    expect(panels[3]?.body).toContain("持续推动经典剧目传承");
  });
});
