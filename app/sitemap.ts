import type { MetadataRoute } from "next";
import { getLocalizedPath, locales } from "@/i18n/routing";
import { getHeritageItems } from "@/lib/content/heritage-repository";
import { getInheritorProfiles } from "@/lib/content/inheritor-repository";
import { siteConfig } from "@/lib/constants";
import { absoluteUrl, createLanguageAlternates } from "@/lib/metadata";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const heritageItems = await getHeritageItems();
  const inheritors = await getInheritorProfiles();
  const createEntries = (
    path: string,
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"],
    priority: number
  ) =>
    locales.map((locale) => ({
      url: absoluteUrl(getLocalizedPath(path, locale)),
      changeFrequency,
      priority,
      alternates: {
        languages: createLanguageAlternates(path)
      }
    }));

  return [
    ...createEntries("/", "weekly", 1),
    ...createEntries("/heritage", "weekly", 0.9),
    ...createEntries("/museum", "weekly", 0.86),
    ...createEntries("/museum/insights", "weekly", 0.82),
    ...createEntries("/campaigns", "weekly", 0.82),
    ...createEntries("/assistant", "weekly", 0.84),
    ...heritageItems.flatMap((item) => createEntries(`/heritage/${item.slug}`, "monthly", 0.75)),
    ...createEntries("/inheritors", "weekly", 0.82),
    ...inheritors.flatMap((profile) => createEntries(`/inheritors/${profile.id}`, "monthly", 0.68)),
    ...createEntries("/about", "monthly", 0.6),
    ...createEntries("/contact", "monthly", 0.6),
    ...createEntries("/disclaimer", "yearly", 0.45),
    ...createEntries("/privacy", "yearly", 0.45),
    ...createEntries("/copyright", "yearly", 0.45),
    ...createEntries("/terms", "yearly", 0.45)
  ];
}
