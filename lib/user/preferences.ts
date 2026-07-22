import { defaultLocale, isAppLocale, type AppLocale } from "@/i18n/routing";

export function normalizePreferredLocale(value: string | null | undefined): AppLocale {
  const candidate = value ?? undefined;
  return isAppLocale(candidate) ? candidate : defaultLocale;
}

export function normalizeInterestTags(value: string[] | null | undefined): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const seen = new Set<string>();
  const tags: string[] = [];

  for (const item of value) {
    const tag = item.trim();

    if (!tag || seen.has(tag)) {
      continue;
    }

    seen.add(tag);
    tags.push(tag);

    if (tags.length >= 12) {
      break;
    }
  }

  return tags;
}
