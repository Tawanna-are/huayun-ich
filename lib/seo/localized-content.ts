import type { AppLocale } from "@/i18n/routing";
import type { HeritageItem } from "@/lib/types/heritage";
import type { InheritorProfile } from "@/lib/types/inheritor";

export function getHeritageSeoDescription(item: HeritageItem, locale: AppLocale) {
  if (locale === "zh") return item.summary;

  const name = item.englishName || item.name;
  return `Explore ${name}, a Chinese intangible cultural heritage project, through its history, craftsmanship, images, videos and living transmission.`;
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
