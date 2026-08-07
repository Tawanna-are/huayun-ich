import type { AppLocale } from "@/i18n/routing";
import type { HeritageItem } from "@/lib/types/heritage";
import type { InheritorProfile } from "@/lib/types/inheritor";

export function getHeritageSeoDescription(item: HeritageItem, locale: AppLocale) {
  if (locale === "zh") {
    return `了解中国非物质文化遗产${item.name}的历史、技艺和文化价值。${item.summary}`;
  }

  const name = item.englishName || item.name;
  return `Explore ${name}, a Chinese intangible cultural heritage project, through its history, craftsmanship, images, videos and living transmission.`;
}

export function getHeritageSeoTitle(item: HeritageItem, locale: AppLocale) {
  if (locale === "zh") return `${item.name} | 中国非物质文化遗产`;

  return `${item.englishName || item.name} | Chinese Intangible Cultural Heritage`;
}

type HeritageImageAltItem = Pick<HeritageItem, "name" | "englishName" | "categoryName" | "region">;

export function getHeritageImageAlt(item: HeritageImageAltItem, locale: AppLocale, suppliedAlt?: string) {
  if (suppliedAlt?.trim()) return suppliedAlt.trim();

  if (locale === "zh") {
    return `${item.name}，${item.categoryName}，${item.region}`;
  }

  return `${item.englishName || item.name}, ${item.categoryName}, ${item.region}`;
}

export function getInheritorSeoDescription(profile: InheritorProfile, locale: AppLocale) {
  if (locale === "zh") return profile.bio;

  const heritageName = profile.heritageEnglishName || profile.heritageName;
  return `Meet ${profile.name}, an inheritor associated with ${heritageName}, and explore their representative work and living transmission practice.`;
}

export function getHeritageSeoKeywords(item: HeritageItem, locale: AppLocale) {
  const location = [item.region, item.province, item.city].filter(Boolean);
  const names = locale === "en"
    ? [item.englishName, item.name, item.categoryName]
    : [item.name, item.englishName, item.categoryName];

  return [...names, ...location, ...item.tags].filter((value): value is string => Boolean(value));
}
