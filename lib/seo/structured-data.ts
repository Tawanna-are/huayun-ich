import { siteConfig } from "@/lib/constants";
import { defaultLocale, getLocalizedPath, type AppLocale } from "@/i18n/routing";
import { absoluteUrl, getSiteLocaleConfig } from "@/lib/metadata";
import type { HeritageItem } from "@/lib/types/heritage";
import { getHeritageSeoDescription } from "@/lib/seo/localized-content";

type JsonLd = Record<string, unknown>;

export function createOrganizationJsonLd(): JsonLd {
  const organizationId = `${siteConfig.url}/#organization`;
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    additionalType: "CulturalOrganization",
    "@id": organizationId,
    name: siteConfig.name,
    alternateName: siteConfig.englishName,
    url: siteConfig.url,
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl(siteConfig.ogImage),
      caption: siteConfig.name
    },
    description: siteConfig.description,
    knowsAbout: "Chinese intangible cultural heritage",
    areaServed: "Worldwide",
    brand: {
      "@type": "Brand",
      name: siteConfig.name,
      alternateName: siteConfig.englishName
    }
  };
}

const itemListText = {
  zh: {
    name: "中国非遗名录",
    description: "中国非物质文化遗产代表性项目浏览列表。"
  },
  en: {
    name: "Chinese Heritage Archive",
    description: "Representative Chinese intangible cultural heritage items."
  }
} satisfies Record<AppLocale, { name: string; description: string }>;

export function createWebsiteJsonLd(locale: AppLocale = defaultLocale): JsonLd {
  const localeConfig = getSiteLocaleConfig(locale);

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${absoluteUrl(getLocalizedPath("/", locale))}#website`,
    name: localeConfig.name,
    alternateName: siteConfig.englishName,
    url: absoluteUrl(getLocalizedPath("/", locale)),
    description: localeConfig.description,
    inLanguage: localeConfig.language,
    publisher: {
      "@type": "Organization",
      "@id": `${siteConfig.url}/#organization`,
      name: localeConfig.name
    },
    about: {
      "@type": "Thing",
      name: "Chinese intangible cultural heritage"
    },
    genre: "Chinese intangible cultural heritage and traditional crafts",
    potentialAction: {
      "@type": "SearchAction",
      target: `${absoluteUrl(getLocalizedPath("/heritage", locale))}?query={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };
}

export function createHeritageArticleJsonLd(item: HeritageItem, locale: AppLocale = defaultLocale): JsonLd {
  const localeConfig = getSiteLocaleConfig(locale);
  const url = absoluteUrl(getLocalizedPath(`/heritage/${item.slug}`, locale));
  const headline = locale === "en" ? item.englishName || item.name : item.name;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    headline,
    description: getHeritageSeoDescription(item, locale),
    image: absoluteUrl(item.heroImage || item.image),
    mainEntityOfPage: url,
    inLanguage: localeConfig.language,
    articleSection: item.categoryName,
    keywords: item.tags.join(", "),
    about: {
      "@type": "Thing",
      name: headline,
      description: item.categoryName
    },
    spatialCoverage: item.region,
    author: {
      "@type": "Organization",
      "@id": `${siteConfig.url}/#organization`,
      name: siteConfig.name
    },
    publisher: {
      "@type": "Organization",
      "@id": `${siteConfig.url}/#organization`
    }
  };
}

export function createItemListJsonLd(items: HeritageItem[], locale: AppLocale = defaultLocale): JsonLd {
  const text = itemListText[locale];

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: text.name,
    description: text.description,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(getLocalizedPath(`/heritage/${item.slug}`, locale)),
      name: locale === "en" ? item.englishName || item.name : item.name
    }))
  };
}

export function createCreativeWorkJsonLd(item: HeritageItem, locale: AppLocale = defaultLocale): JsonLd {
  const localeConfig = getSiteLocaleConfig(locale);
  const url = absoluteUrl(getLocalizedPath(`/heritage/${item.slug}`, locale));

  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "@id": `${url}#heritage-project`,
    name: locale === "en" ? item.englishName || item.name : item.name,
    alternateName: locale === "en" ? item.name : item.englishName,
    description: getHeritageSeoDescription(item, locale),
    image: absoluteUrl(item.heroImage),
    url,
    mainEntityOfPage: url,
    isPartOf: {
      "@id": `${absoluteUrl(getLocalizedPath("/", locale))}#website`
    },
    inLanguage: localeConfig.language,
    about: {
      "@type": "Thing",
      name: item.categoryName
    },
    keywords: item.tags.join(", "),
    spatialCoverage: item.region,
    datePublished: item.inscriptionYear ? `${item.inscriptionYear}` : undefined,
    contributor: {
      "@type": "Person",
      name: item.inheritor.name,
      description: item.inheritor.title
    }
  };
}

export function createBreadcrumbJsonLd(
  items: Array<{ name: string; path: string }>,
  locale: AppLocale = defaultLocale
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(getLocalizedPath(item.path, locale))
    }))
  };
}
