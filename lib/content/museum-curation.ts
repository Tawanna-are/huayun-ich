import type { HeritageItem } from "@/lib/types/heritage";
import { createMuseumTopicSummaries } from "@/lib/content/museum-topics";
import type { MuseumCuratorialStory, MuseumCuration } from "@/lib/types/museum";

function createAnnualRecommendations(items: HeritageItem[]) {
  return [...items]
    .sort((a, b) => b.inscriptionYear - a.inscriptionYear || a.name.localeCompare(b.name, "zh-CN"))
    .slice(0, 6);
}

function createCuratorialStories(items: HeritageItem[]): MuseumCuratorialStory[] {
  return items.slice(0, 3).map((item) => ({
    id: item.slug,
    title: item.name,
    englishTitle: item.englishName,
    quote: item.history[0] ?? item.summary,
    region: item.region,
    image: item.gallery[0]?.src ?? item.heroImage ?? item.image,
    href: `/heritage/${item.slug}`
  }));
}

export function createMuseumCuration(items: HeritageItem[]): MuseumCuration {
  return {
    featuredTopics: createMuseumTopicSummaries(items),
    annualRecommendations: createAnnualRecommendations(items),
    curatorialStories: createCuratorialStories(items)
  };
}
