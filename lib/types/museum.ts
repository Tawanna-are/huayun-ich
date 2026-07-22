import type { HeritageCategorySlug, HeritageItem } from "@/lib/types/heritage";

export type MuseumTopicSlug =
  | "four-embroideries"
  | "traditional-opera"
  | "tea-culture"
  | "traditional-festivals";

export type MuseumTopicSection = {
  title: string;
  englishTitle: string;
  description: string;
  englishDescription: string;
};

export type MuseumTopicDefinition = {
  slug: MuseumTopicSlug;
  title: string;
  englishTitle: string;
  summary: string;
  englishSummary: string;
  description: string;
  englishDescription: string;
  curatorNote: string;
  englishCuratorNote: string;
  heroImage: string;
  categorySlugs?: readonly HeritageCategorySlug[];
  prioritySlugs: readonly string[];
  keywords: readonly string[];
  sections: readonly MuseumTopicSection[];
  href: string;
};

export type MuseumFeaturedTopic = {
  id: MuseumTopicSlug;
  title: string;
  englishTitle: string;
  summary: string;
  count: number;
  image: string;
  href: string;
};

export type MuseumCuratorialStory = {
  id: string;
  title: string;
  englishTitle: string;
  quote: string;
  region: string;
  image: string;
  href: string;
};

export type MuseumCuration = {
  featuredTopics: MuseumFeaturedTopic[];
  annualRecommendations: HeritageItem[];
  curatorialStories: MuseumCuratorialStory[];
};

export type ResolvedMuseumTopicDetail = {
  topic: MuseumTopicDefinition;
  displayTitle: string;
  displaySubtitle: string;
  displaySummary: string;
  displayDescription: string;
  displayCuratorNote: string;
  representativeItems: HeritageItem[];
  recommendedItems: HeritageItem[];
  heroImage: string;
  regions: string[];
};
