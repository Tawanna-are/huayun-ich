const localizedSiteConfig = {
  zh: {
    name: "华韵 · 中国非遗",
    description: "以数字博物馆方式呈现中国非物质文化遗产，探索戏曲、工艺、技艺、民俗与民间文学的当代生命力。",
    locale: "zh_CN",
    language: "zh-CN",
    keywords: ["中国非物质文化遗产", "中国非遗", "中国传统文化", "传统手工艺", "非遗文化展示平台", "数字博物馆", "传统戏曲", "民俗活动"]
  },
  en: {
    name: "Huayun · Chinese Intangible Cultural Heritage",
    description:
      "A digital museum for Chinese intangible cultural heritage, exploring opera, craft, traditional skills, rituals and oral literature for a global audience.",
    locale: "en_US",
    language: "en-US",
    keywords: [
      "Chinese Intangible Cultural Heritage",
      "Traditional Chinese Culture",
      "Chinese Heritage",
      "Chinese Traditional Crafts",
      "digital museum",
      "Chinese opera",
      "folk culture",
      "living heritage"
    ]
  }
} as const;

export const siteConfig = {
  ...localizedSiteConfig.zh,
  name: "华韵 · 中国非遗",
  englishName: "Chinese Intangible Cultural Heritage",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://www.huayunheritage.com").replace(/\/$/, ""),
  ogImage: "/assets/hero-museum.png",
  localized: localizedSiteConfig
};

export const heroVideoUrl =
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";
