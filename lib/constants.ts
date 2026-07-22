const localizedSiteConfig = {
  zh: {
    name: "华韵 · 中国非遗",
    description: "以数字博物馆方式呈现中国非物质文化遗产，探索戏曲、工艺、技艺、民俗与民间文学的当代生命力。",
    locale: "zh_CN",
    language: "zh-CN",
    keywords: ["中国非遗", "非物质文化遗产", "数字博物馆", "传统工艺", "传统戏曲", "民俗活动"]
  },
  en: {
    name: "Huayun · Chinese Intangible Cultural Heritage",
    description:
      "A digital museum for Chinese intangible cultural heritage, exploring opera, craft, traditional skills, rituals and oral literature for a global audience.",
    locale: "en_US",
    language: "en-US",
    keywords: [
      "Chinese intangible cultural heritage",
      "digital museum",
      "Chinese opera",
      "traditional craft",
      "folk culture",
      "living heritage"
    ]
  }
} as const;

export const siteConfig = {
  ...localizedSiteConfig.zh,
  name: "华韵 · 中国非遗",
  englishName: "Chinese Intangible Cultural Heritage",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, ""),
  ogImage: "/assets/hero-museum.png",
  localized: localizedSiteConfig
};

export const heroVideoUrl =
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";
