import { defineRouting } from "next-intl/routing";

export const locales = ["zh", "en"] as const;
export type AppLocale = (typeof locales)[number];

export const defaultLocale: AppLocale = "zh";

export const localeMeta: Record<
  AppLocale,
  {
    label: string;
    shortLabel: string;
    language: string;
    openGraph: string;
  }
> = {
  zh: {
    label: "中文",
    shortLabel: "中",
    language: "zh-CN",
    openGraph: "zh_CN"
  },
  en: {
    label: "English",
    shortLabel: "EN",
    language: "en-US",
    openGraph: "en_US"
  }
};

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: "always"
});

export function isAppLocale(locale: string | undefined): locale is AppLocale {
  return locales.includes(locale as AppLocale);
}

export function getLocalizedPath(path = "/", locale: AppLocale = defaultLocale) {
  if (path.startsWith("http")) {
    return path;
  }

  const hashIndex = path.indexOf("#");
  const beforeHash = hashIndex >= 0 ? path.slice(0, hashIndex) : path;
  const hash = hashIndex >= 0 ? path.slice(hashIndex) : "";
  const queryIndex = beforeHash.indexOf("?");
  const rawPathname = queryIndex >= 0 ? beforeHash.slice(0, queryIndex) : beforeHash;
  const query = queryIndex >= 0 ? beforeHash.slice(queryIndex) : "";
  let pathname = rawPathname || "/";

  if (!pathname.startsWith("/")) {
    pathname = `/${pathname}`;
  }

  for (const candidate of locales) {
    if (pathname === `/${candidate}`) {
      pathname = "/";
      break;
    }

    if (pathname.startsWith(`/${candidate}/`)) {
      pathname = pathname.slice(candidate.length + 1) || "/";
      break;
    }
  }

  const localizedPathname = pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;

  return `${localizedPathname}${query}${hash}`;
}

export function getAlternateLocale(locale: AppLocale) {
  return locale === "zh" ? "en" : "zh";
}
