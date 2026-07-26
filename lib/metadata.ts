import type { Metadata } from "next";
import {
  defaultLocale,
  getLocalizedPath,
  localeMeta,
  locales,
  type AppLocale
} from "@/i18n/routing";
import { siteConfig } from "@/lib/constants";

type MetadataOptions = {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  type?: "website" | "article";
  noIndex?: boolean;
  locale?: AppLocale;
  keywords?: readonly string[];
};

function normalizeDescription(description: string) {
  const normalized = description.replace(/\s+/g, " ").trim();
  if (normalized.length <= 160) return normalized;
  return `${normalized.slice(0, 157).trimEnd()}...`;
}

export function absoluteUrl(path = "/") {
  if (path.startsWith("http")) {
    return path;
  }

  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;
}

export function getSiteLocaleConfig(locale: AppLocale = defaultLocale) {
  return siteConfig.localized[locale] ?? siteConfig.localized[defaultLocale];
}

export function createLanguageAlternates(path = "/") {
  return {
    ...Object.fromEntries(
      locales.map((locale) => [localeMeta[locale].language, absoluteUrl(getLocalizedPath(path, locale))])
    ),
    "x-default": absoluteUrl(getLocalizedPath(path, defaultLocale))
  } as Record<string, string>;
}

export function createMetadata({
  title,
  description,
  path = "/",
  image = siteConfig.ogImage,
  type = "website",
  noIndex = false,
  locale = defaultLocale,
  keywords = []
}: MetadataOptions): Metadata {
  const localeConfig = getSiteLocaleConfig(locale);
  const resolvedDescription = normalizeDescription(description ?? localeConfig.description);
  const resolvedKeywords = [...new Set([...localeConfig.keywords, ...keywords].map((keyword) => keyword.trim()).filter(Boolean))];
  const resolvedTitle = title === localeConfig.name ? title : `${title} | ${localeConfig.name}`;
  const url = absoluteUrl(getLocalizedPath(path, locale));
  const imageUrl = absoluteUrl(image);
  const openGraphImage = image === siteConfig.ogImage
    ? { url: imageUrl, width: 1600, height: 1000, alt: title }
    : { url: imageUrl, alt: title };
  const alternateLocales = locales
    .filter((candidate) => candidate !== locale)
    .map((candidate) => localeMeta[candidate].openGraph);

  return {
    title: resolvedTitle,
    description: resolvedDescription,
    applicationName: localeConfig.name,
    keywords: resolvedKeywords,
    authors: [{ name: siteConfig.name, url: siteConfig.url }],
    creator: localeConfig.name,
    publisher: localeConfig.name,
    category: "culture",
    icons: {
      icon: "/assets/hero-museum.png",
      apple: "/assets/hero-museum.png"
    },
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: url,
      languages: createLanguageAlternates(path)
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false
          }
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1
          }
        },
    openGraph: {
      title: resolvedTitle,
      description: resolvedDescription,
      url,
      siteName: localeConfig.name,
      locale: localeMeta[locale].openGraph,
      alternateLocale: alternateLocales,
      type,
      images: [openGraphImage]
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description: resolvedDescription,
      images: [imageUrl]
    }
  };
}
