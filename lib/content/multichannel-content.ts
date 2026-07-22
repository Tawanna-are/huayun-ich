import type { AppLocale } from "@/i18n/routing";
import type { HeritageCategory, HeritageItem } from "@/lib/types/heritage";
import type { InheritorProfile } from "@/lib/types/inheritor";

export type CampaignSlug =
  | "four-embroideries"
  | "traditional-opera"
  | "tea-culture"
  | "traditional-festivals";

export type CampaignDefinition = {
  slug: CampaignSlug;
  title: string;
  englishTitle: string;
  summary: string;
  englishSummary: string;
  description: string;
  englishDescription: string;
  heroImage: string;
  accent: string;
  categorySlugs?: HeritageItem["categorySlug"][];
  prioritySlugs: string[];
  keywords: string[];
  href: string;
};

export type CampaignCard = {
  slug: CampaignSlug;
  title: string;
  englishTitle: string;
  summary: string;
  englishSummary: string;
  heroImage: string;
  accent: string;
  href: string;
  itemCount: number;
  featuredSlugs: string[];
};

export type CampaignDetail = CampaignCard & {
  description: string;
  englishDescription: string;
  displayTitle: string;
  displaySummary: string;
  displayDescription: string;
  items: HeritageItem[];
  featuredItem?: HeritageItem;
  relatedItems: HeritageItem[];
};

export type MultichannelHeritageCard = {
  id: string;
  slug: string;
  title: string;
  englishTitle: string;
  summary: string;
  categorySlug: HeritageItem["categorySlug"];
  categoryName: string;
  region: string;
  province: string;
  image: string;
  heroImage: string;
  href: string;
  tags: string[];
};

export type MultichannelContentFeed = {
  version: 1;
  generatedAt: string;
  heritageItems: MultichannelHeritageCard[];
  categories: Array<Pick<HeritageCategory, "slug" | "name" | "englishName" | "summary" | "color">>;
  campaigns: CampaignCard[];
  inheritors: Array<{
    id: string;
    name: string;
    title: string;
    image: string;
    region: string;
    heritageSlug: string;
    href: string;
  }>;
};

export type OfflineContentPayload = {
  version: 1;
  cachedAt: string;
  items: MultichannelHeritageCard[];
  campaigns: CampaignCard[];
  routes: string[];
};

export const campaignDefinitions: CampaignDefinition[] = [
  {
    slug: "four-embroideries",
    title: "中国四大名绣",
    englishTitle: "The Four Great Chinese Embroideries",
    summary: "以丝线、针法与地域审美进入中国刺绣传统。",
    englishSummary: "A silk-thread path through Chinese embroidery, regional aesthetics and handcraft.",
    description:
      "从苏绣的精微、湘绣的浓烈到蜀绣的温润，刺绣让一根丝线成为地方生活、女性手工与审美秩序的共同记忆。",
    englishDescription:
      "From Suzhou refinement to Hunan intensity, Shu softness and Cantonese richness, the four embroideries turn silk thread into a living memory of place, hand and aesthetics.",
    heroImage: "/assets/suzhou-embroidery-hero.png",
    accent: "#C8A96A",
    prioritySlugs: ["suzhou-embroidery", "hunan-embroidery", "shu-embroidery"],
    keywords: ["刺绣", "绣", "苏绣", "湘绣", "蜀绣", "embroidery"],
    href: "/campaigns/four-embroideries"
  },
  {
    slug: "traditional-opera",
    title: "中国传统戏曲",
    englishTitle: "Chinese Traditional Opera",
    summary: "从声腔、身段与舞台程式进入东方剧场。",
    englishSummary: "An Eastern theater shaped by voice, gesture, role and stage convention.",
    description:
      "传统戏曲把文学、音乐、表演、服饰与空间调度组织在同一座舞台上，让有限场景打开山河、园林与人世悲欢。",
    englishDescription:
      "Traditional opera gathers literature, music, performance, costume and spatial choreography on one stage, opening vast worlds through compact conventions.",
    heroImage: "/assets/jingju-hero.png",
    accent: "#B22222",
    categorySlugs: ["traditional-opera"],
    prioritySlugs: ["jingju", "qin-opera", "yue-opera", "yu-opera"],
    keywords: ["戏曲", "京剧", "opera", "theater", "theatre"],
    href: "/campaigns/traditional-opera"
  },
  {
    slug: "tea-culture",
    title: "中国茶文化",
    englishTitle: "Chinese Tea Culture",
    summary: "从山地生态、制茶技艺与器物礼序理解茶。",
    englishSummary: "Tea as mountain ecology, processing craft, vessels and ritual order.",
    description:
      "茶文化横跨农业、手工技艺、器物审美与礼俗交往。它不是一杯饮料的终点，而是一座山、一双手、一只器物与一次相会的开始。",
    englishDescription:
      "Tea culture spans agriculture, handcraft, object aesthetics and social ritual. It begins with mountains, hands, vessels and encounters.",
    heroImage: "/assets/hero-museum.png",
    accent: "#94A995",
    prioritySlugs: ["traditional-tea-processing-techniques", "wuyi-rock-tea", "longjing-tea", "pu-er-tea"],
    keywords: ["茶", "制茶", "茶艺", "茶文化", "tea", "teaware"],
    href: "/campaigns/tea-culture"
  },
  {
    slug: "traditional-festivals",
    title: "中国传统节庆",
    englishTitle: "Chinese Traditional Festivals",
    summary: "节令、民俗活动与共同体记忆构成可参与的文化现场。",
    englishSummary: "Seasonal rituals and community memory turn time into cultural scenes.",
    description:
      "传统节庆把历法、信仰、食俗、游艺与地方组织联结在一起，让日期重新回到人的相聚、身体动作与地方生活。",
    englishDescription:
      "Traditional festivals connect calendars, belief, foodways, games and local organization, returning dates to embodied community life.",
    heroImage: "/assets/datiehua-hero.png",
    accent: "#DCE7EA",
    categorySlugs: ["folk-activity"],
    prioritySlugs: ["dragon-boat-festival", "spring-festival", "mid-autumn-festival", "twenty-four-solar-terms", "datiehua"],
    keywords: ["节", "节庆", "春节", "端午", "中秋", "节气", "festival", "solar terms"],
    href: "/campaigns/traditional-festivals"
  }
];

export const campaignSlugs = campaignDefinitions.map((campaign) => campaign.slug);

function normalizeText(item: HeritageItem) {
  return [
    item.slug,
    item.name,
    item.englishName,
    item.categoryName,
    item.summary,
    item.region,
    item.province,
    item.city,
    ...item.tags
  ]
    .join(" ")
    .toLocaleLowerCase();
}

function matchesCampaign(campaign: CampaignDefinition, item: HeritageItem) {
  if (campaign.prioritySlugs.includes(item.slug)) {
    return true;
  }

  if (campaign.categorySlugs?.includes(item.categorySlug)) {
    return true;
  }

  const text = normalizeText(item);
  return campaign.keywords.some((keyword) => text.includes(keyword.toLocaleLowerCase()));
}

function sortCampaignItems(campaign: CampaignDefinition, items: HeritageItem[]) {
  return [...items].sort((a, b) => {
    const priorityA = campaign.prioritySlugs.indexOf(a.slug);
    const priorityB = campaign.prioritySlugs.indexOf(b.slug);
    const normalizedA = priorityA === -1 ? Number.MAX_SAFE_INTEGER : priorityA;
    const normalizedB = priorityB === -1 ? Number.MAX_SAFE_INTEGER : priorityB;

    if (normalizedA !== normalizedB) {
      return normalizedA - normalizedB;
    }

    return b.inscriptionYear - a.inscriptionYear || a.name.localeCompare(b.name, "zh-CN");
  });
}

function toHeritageCard(item: HeritageItem): MultichannelHeritageCard {
  return {
    id: item.id,
    slug: item.slug,
    title: item.name,
    englishTitle: item.englishName,
    summary: item.summary,
    categorySlug: item.categorySlug,
    categoryName: item.categoryName,
    region: item.region,
    province: item.province,
    image: item.image,
    heroImage: item.heroImage,
    href: `/heritage/${item.slug}`,
    tags: item.tags
  };
}

export function createCampaignCollection(items: HeritageItem[]): CampaignCard[] {
  return campaignDefinitions.map((campaign) => {
    const campaignItems = sortCampaignItems(
      campaign,
      items.filter((item) => matchesCampaign(campaign, item))
    );
    const lead = campaignItems[0];

    return {
      slug: campaign.slug,
      title: campaign.title,
      englishTitle: campaign.englishTitle,
      summary: campaign.summary,
      englishSummary: campaign.englishSummary,
      heroImage: lead?.heroImage || lead?.image || campaign.heroImage,
      accent: campaign.accent,
      href: campaign.href,
      itemCount: campaignItems.length,
      featuredSlugs: campaignItems.slice(0, 4).map((item) => item.slug)
    };
  });
}

export function resolveCampaignDetail(
  slug: string,
  items: HeritageItem[],
  locale: AppLocale
): CampaignDetail | undefined {
  const campaign = campaignDefinitions.find((candidate) => candidate.slug === slug);

  if (!campaign) {
    return undefined;
  }

  const campaignItems = sortCampaignItems(
    campaign,
    items.filter((item) => matchesCampaign(campaign, item))
  );
  const campaignSlugsSet = new Set(campaignItems.map((item) => item.slug));
  const relatedItems = items
    .filter((item) => !campaignSlugsSet.has(item.slug))
    .sort((a, b) => b.inscriptionYear - a.inscriptionYear)
    .slice(0, 4);
  const card = createCampaignCollection(items).find((candidate) => candidate.slug === campaign.slug);

  if (!card) {
    return undefined;
  }

  return {
    ...card,
    description: campaign.description,
    englishDescription: campaign.englishDescription,
    displayTitle: locale === "en" ? campaign.englishTitle : campaign.title,
    displaySummary: locale === "en" ? campaign.englishSummary : campaign.summary,
    displayDescription: locale === "en" ? campaign.englishDescription : campaign.description,
    items: campaignItems,
    featuredItem: campaignItems[0],
    relatedItems
  };
}

export function createMultichannelContent({
  items,
  categories,
  inheritors
}: {
  items: HeritageItem[];
  categories: HeritageCategory[];
  inheritors: InheritorProfile[];
}): MultichannelContentFeed {
  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    heritageItems: items.map(toHeritageCard),
    categories: categories.map((category) => ({
      slug: category.slug,
      name: category.name,
      englishName: category.englishName,
      summary: category.summary,
      color: category.color
    })),
    campaigns: createCampaignCollection(items),
    inheritors: inheritors.map((profile) => ({
      id: profile.id,
      name: profile.name,
      title: profile.title,
      image: profile.image,
      region: profile.region,
      heritageSlug: profile.heritageSlug,
      href: `/inheritors/${profile.id}`
    }))
  };
}

export function createOfflineContentPayload(items: HeritageItem[], limit = 12): OfflineContentPayload {
  const limitedItems = items.slice(0, Math.max(1, limit)).map(toHeritageCard);

  return {
    version: 1,
    cachedAt: new Date().toISOString(),
    items: limitedItems,
    campaigns: createCampaignCollection(items),
    routes: [
      "/zh",
      "/en",
      "/zh/heritage",
      "/en/heritage",
      "/zh/museum",
      "/en/museum",
      "/zh/campaigns",
      "/en/campaigns",
      "/zh/offline",
      "/en/offline"
    ]
  };
}
