import type { AppLocale } from "@/i18n/routing";
import type { HeritageItem } from "@/lib/types/heritage";
import type {
  MuseumFeaturedTopic,
  MuseumTopicDefinition,
  MuseumTopicSlug,
  ResolvedMuseumTopicDetail
} from "@/lib/types/museum";

const museumTopicDefinitions = [
  {
    slug: "four-embroideries",
    title: "中国四大名绣",
    englishTitle: "The Four Great Chinese Embroideries",
    summary: "以苏绣、湘绣、蜀绣为线索，观看丝线如何在地域审美中形成不同的光泽、针法与气质。",
    englishSummary:
      "A curated path through Suzhou, Hunan and Shu embroidery, tracing how silk thread carries regional aesthetics, technique and temperament.",
    description:
      "四大名绣不是单一技法的排行榜，而是中国地域审美的四种细密表达。专题将成品、制作过程、细节特写与传承人线索并置，让观众看见针脚背后的地方生活、材料系统与女性手工传统。",
    englishDescription:
      "The four great embroideries are not a simple ranking of techniques, but four refined expressions of regional aesthetics. This topic brings together finished works, making processes, close details and inheritor clues.",
    curatorNote:
      "从一根丝线进入江南、湖湘、巴蜀与岭南，观看同一种材料如何在不同水土中生成不同的时间感。",
    englishCuratorNote:
      "Enter Jiangnan, Hunan, Sichuan and Lingnan through a single silk thread, and see how one material creates different senses of time.",
    heroImage: "/assets/suzhou-embroidery-hero.png",
    prioritySlugs: ["suzhou-embroidery", "hunan-embroidery", "shu-embroidery"],
    keywords: [
      "苏绣",
      "湘绣",
      "蜀绣",
      "刺绣",
      "绣",
      "embroidery",
      "suzhou embroidery",
      "hunan embroidery",
      "shu embroidery",
      "cantonese embroidery"
    ],
    sections: [
      {
        title: "地域与针法",
        englishTitle: "Regions and Stitches",
        description: "江南的雅、湖湘的烈、巴蜀的润、岭南的繁，在针法与设色中留下清晰的地方性。",
        englishDescription:
          "Jiangnan refinement, Hunan intensity, Sichuan softness and Lingnan richness become visible through stitch and color."
      },
      {
        title: "从图案到生活",
        englishTitle: "From Motif to Life",
        description: "花鸟、人物、山水与日用器物相互映照，使刺绣成为生活审美的一部分。",
        englishDescription:
          "Birds, flowers, figures, landscapes and daily objects make embroidery a part of lived aesthetics."
      }
    ],
    href: "/museum/topics/four-embroideries"
  },
  {
    slug: "traditional-opera",
    title: "中国传统戏曲",
    englishTitle: "Chinese Traditional Opera",
    summary: "从京剧到地方声腔，进入唱念做打、身段程式与舞台美学构成的东方剧场。",
    englishSummary:
      "From Peking Opera to regional vocal traditions, enter an Eastern theater shaped by voice, gesture, role and stage convention.",
    description:
      "传统戏曲将文学、音乐、表演、服饰与空间调度组织在同一座舞台上。专题以声腔和剧种为线索，呈现中国戏曲如何在地方语言、城市剧场和传承训练之间持续生长。",
    englishDescription:
      "Traditional opera gathers literature, music, performance, costume and spatial choreography on one stage. This topic follows vocal systems and genres across regions, theaters and training lineages.",
    curatorNote: "一座舞台可以很小，却能容纳山河、军阵、园林与一生的悲欢。",
    englishCuratorNote:
      "A stage may be small, yet it can hold mountains, armies, gardens and a lifetime of emotion.",
    heroImage: "/assets/jingju-hero.png",
    categorySlugs: ["traditional-opera"],
    prioritySlugs: ["jingju", "qin-opera", "yue-opera", "yu-opera"],
    keywords: ["戏曲", "京剧", "秦腔", "越剧", "豫剧", "opera", "theater", "theatre"],
    sections: [
      {
        title: "声腔系统",
        englishTitle: "Vocal Systems",
        description: "声腔承载地方语言、音乐结构与角色气质，是剧种辨识度的核心。",
        englishDescription:
          "Vocal systems carry local language, musical structure and role temperament, forming each genre's identity."
      },
      {
        title: "程式与想象",
        englishTitle: "Convention and Imagination",
        description: "一支马鞭、一段圆场、一句念白，能在有限舞台上打开无限空间。",
        englishDescription:
          "A riding crop, a circular walk or a spoken line can open vast space on a limited stage."
      }
    ],
    href: "/museum/topics/traditional-opera"
  },
  {
    slug: "tea-culture",
    title: "中国茶文化",
    englishTitle: "Chinese Tea Culture",
    summary: "从采摘、制茶、茶器到茶席，呈现茶如何连接山地生态、手工技艺与日常精神生活。",
    englishSummary:
      "From picking, processing and teaware to tea settings, explore how tea connects mountain ecologies, craft knowledge and everyday spiritual life.",
    description:
      "茶文化横跨农业、手工技艺、器物审美与礼俗交往。专题先以策展叙事建立展线，后续内容库补充制茶技艺、茶俗与相关器物后将自动聚合。",
    englishDescription:
      "Tea culture spans agriculture, handcraft, object aesthetics and social ritual. This topic launches as an editorial exhibition line and will automatically gather tea-related records as the archive grows.",
    curatorNote: "茶不是一杯饮料的终点，而是一座山、一双手、一只器物与一段相会的开始。",
    englishCuratorNote:
      "Tea is not the end of a drink, but the beginning of a mountain, a pair of hands, a vessel and a meeting.",
    heroImage: "/assets/hero-museum.png",
    prioritySlugs: ["traditional-tea-processing-techniques", "wuyi-rock-tea", "longjing-tea", "pu-er-tea"],
    keywords: ["茶", "制茶", "茶艺", "茶文化", "龙井", "普洱", "武夷", "tea", "teaware"],
    sections: [
      {
        title: "山地与风土",
        englishTitle: "Mountains and Terroir",
        description: "茶的香气来自土壤、海拔、雨雾、树种与季节共同形成的生态系统。",
        englishDescription:
          "Tea aroma emerges from soil, altitude, mist, cultivar and season as a living ecology."
      },
      {
        title: "器物与礼序",
        englishTitle: "Vessels and Ritual",
        description: "茶器、火候、水路与席面秩序，让日常饮用转化为可感知的审美经验。",
        englishDescription:
          "Vessels, heat, water and table order transform daily drinking into a sensuous aesthetic experience."
      }
    ],
    href: "/museum/topics/tea-culture"
  },
  {
    slug: "traditional-festivals",
    title: "中国传统节庆",
    englishTitle: "Chinese Traditional Festivals",
    summary: "以岁时节令、民俗活动与共同体记忆为线索，观看节庆如何把时间变成可参与的文化现场。",
    englishSummary:
      "Follow seasonal festivals, folk rituals and community memory to see how time becomes a participatory cultural scene.",
    description:
      "传统节庆把历法、信仰、食俗、游艺与地方组织联结在一起。专题聚合端午、中秋、春节、二十四节气等内容，让节日从日期重新回到人的相聚与地方生活。",
    englishDescription:
      "Traditional festivals connect calendars, belief, foodways, games and local organization. The topic gathers records such as Dragon Boat Festival, Mid-Autumn Festival, Spring Festival and the Twenty-Four Solar Terms.",
    curatorNote: "节日不是日历上的红字，而是共同体一次次重新确认彼此的方式。",
    englishCuratorNote:
      "A festival is not a red mark on a calendar; it is a community repeatedly recognizing itself.",
    heroImage: "/assets/datiehua-hero.png",
    prioritySlugs: ["dragon-boat-festival", "spring-festival", "mid-autumn-festival", "twenty-four-solar-terms"],
    keywords: ["节", "节庆", "春节", "端午", "中秋", "清明", "二十四节气", "festival", "solar terms"],
    sections: [
      {
        title: "岁时秩序",
        englishTitle: "Seasonal Order",
        description: "节庆让抽象时间拥有气味、声音、食物和身体动作。",
        englishDescription:
          "Festivals give abstract time scent, sound, food and bodily movement."
      },
      {
        title: "共同体现场",
        englishTitle: "Community Scenes",
        description: "从家宴到街巷游艺，节庆把个人记忆编织进地方共同体。",
        englishDescription:
          "From family meals to street rituals, festivals weave personal memory into local community."
      }
    ],
    href: "/museum/topics/traditional-festivals"
  }
] as const satisfies readonly MuseumTopicDefinition[];

const activeMuseumTopicSlugs = new Set<MuseumTopicSlug>();

export const curatedMuseumTopics: readonly MuseumTopicDefinition[] = museumTopicDefinitions.filter((topic) =>
  activeMuseumTopicSlugs.has(topic.slug)
);

export const curatedMuseumTopicSlugs = curatedMuseumTopics.map((topic) => topic.slug);

function itemText(item: HeritageItem) {
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

function matchesTopic(topic: MuseumTopicDefinition, item: HeritageItem) {
  if (topic.prioritySlugs.includes(item.slug)) {
    return true;
  }

  const text = itemText(item);
  const keywordMatch = topic.keywords.some((keyword) => text.includes(keyword.toLocaleLowerCase()));

  if (keywordMatch) {
    return true;
  }

  return Boolean(topic.categorySlugs?.includes(item.categorySlug));
}

function sortForTopic(topic: MuseumTopicDefinition, items: HeritageItem[]) {
  return [...items].sort((a, b) => {
    const aPriority = topic.prioritySlugs.indexOf(a.slug);
    const bPriority = topic.prioritySlugs.indexOf(b.slug);
    const normalizedA = aPriority === -1 ? Number.MAX_SAFE_INTEGER : aPriority;
    const normalizedB = bPriority === -1 ? Number.MAX_SAFE_INTEGER : bPriority;

    if (normalizedA !== normalizedB) {
      return normalizedA - normalizedB;
    }

    return b.inscriptionYear - a.inscriptionYear || a.name.localeCompare(b.name, "zh-CN");
  });
}

function sortRecommendations(items: HeritageItem[]) {
  return [...items].sort((a, b) => b.inscriptionYear - a.inscriptionYear || a.name.localeCompare(b.name, "zh-CN"));
}

export function getMuseumTopicBySlug(slug: string): MuseumTopicDefinition | undefined {
  return curatedMuseumTopics.find((topic) => topic.slug === slug);
}

export function getMuseumTopicStaticParams(locales: readonly string[]) {
  return locales.flatMap((locale) => curatedMuseumTopicSlugs.map((slug) => ({ locale, slug })));
}

export function getRepresentativeItemsForTopic(topic: MuseumTopicDefinition, items: HeritageItem[]) {
  return sortForTopic(
    topic,
    items.filter((item) => matchesTopic(topic, item))
  );
}

export function createMuseumTopicSummaries(items: HeritageItem[]): MuseumFeaturedTopic[] {
  return curatedMuseumTopics.flatMap((topic) => {
    const representativeItems = getRepresentativeItemsForTopic(topic, items);
    const lead = representativeItems[0];

    if (!lead) {
      return [];
    }

    return [{
      id: topic.slug,
      title: topic.title,
      englishTitle: topic.englishTitle,
      summary: topic.summary,
      count: representativeItems.length,
      image: lead.heroImage || lead.image,
      href: topic.href
    }];
  });
}

export function resolveMuseumTopicDetail(
  slug: string,
  items: HeritageItem[],
  locale: AppLocale
): ResolvedMuseumTopicDetail | undefined {
  const topic = getMuseumTopicBySlug(slug);

  if (!topic) {
    return undefined;
  }

  const representativeItems = getRepresentativeItemsForTopic(topic, items);

  if (representativeItems.length === 0) {
    return undefined;
  }

  const representativeSlugs = new Set(representativeItems.map((item) => item.slug));
  const recommendedItems = sortRecommendations(items.filter((item) => !representativeSlugs.has(item.slug))).slice(0, 3);
  const lead = representativeItems[0];
  const regions = Array.from(
    new Set(representativeItems.map((item) => item.province || item.region).filter(Boolean))
  );

  return {
    topic,
    displayTitle: locale === "en" ? topic.englishTitle : topic.title,
    displaySubtitle: locale === "en" ? topic.title : topic.englishTitle,
    displaySummary: locale === "en" ? topic.englishSummary : topic.summary,
    displayDescription: locale === "en" ? topic.englishDescription : topic.description,
    displayCuratorNote: locale === "en" ? topic.englishCuratorNote : topic.curatorNote,
    representativeItems,
    recommendedItems,
    heroImage: lead?.heroImage || lead?.image || topic.heroImage,
    regions
  };
}
