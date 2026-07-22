import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { MuseumTopicDetail } from "@/components/museum/topic-detail";
import { PageTransition } from "@/components/motion/page-transition";
import { JsonLd } from "@/components/seo/json-ld";
import { defaultLocale, getLocalizedPath, isAppLocale, localeMeta, routing, type AppLocale } from "@/i18n/routing";
import {
  getMuseumTopicStaticParams,
  resolveMuseumTopicDetail
} from "@/lib/content/museum-topics";
import { getHeritageItems } from "@/lib/content/heritage-repository";
import { absoluteUrl, createMetadata, getSiteLocaleConfig } from "@/lib/metadata";
import { createBreadcrumbJsonLd } from "@/lib/seo/structured-data";

type MuseumTopicPageProps = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

function resolveLocale(locale: string): AppLocale {
  return isAppLocale(locale) ? locale : defaultLocale;
}

export function generateStaticParams() {
  return getMuseumTopicStaticParams(routing.locales);
}

export async function generateMetadata({ params }: MuseumTopicPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const currentLocale = resolveLocale(locale);
  const items = await getHeritageItems();
  const detail = resolveMuseumTopicDetail(slug, items, currentLocale);

  if (!detail) {
    return createMetadata({
      title: currentLocale === "en" ? "Museum Topic" : "策展专题",
      path: "/museum",
      locale: currentLocale
    });
  }

  return createMetadata({
    title: detail.displayTitle,
    description: detail.displaySummary,
    path: detail.topic.href,
    image: detail.heroImage,
    type: "article",
    locale: currentLocale
  });
}

export default async function MuseumTopicPage({ params }: MuseumTopicPageProps) {
  const { locale, slug } = await params;
  const currentLocale = resolveLocale(locale);
  setRequestLocale(currentLocale);

  const items = await getHeritageItems();
  const detail = resolveMuseumTopicDetail(slug, items, currentLocale);

  if (!detail) {
    notFound();
  }

  const localeConfig = getSiteLocaleConfig(currentLocale);
  const museumLabel = currentLocale === "en" ? "Digital Museum" : "数字展馆";

  return (
    <PageTransition>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: detail.displayTitle,
          description: detail.displaySummary,
          url: absoluteUrl(getLocalizedPath(detail.topic.href, currentLocale)),
          image: absoluteUrl(detail.heroImage),
          inLanguage: localeMeta[currentLocale].language,
          isPartOf: {
            "@type": "WebSite",
            name: localeConfig.name,
            url: absoluteUrl(getLocalizedPath("/", currentLocale))
          },
          about: {
            "@type": "Thing",
            name: currentLocale === "en" ? detail.topic.englishTitle : detail.topic.title
          }
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: detail.displayTitle,
          numberOfItems: detail.representativeItems.length,
          itemListElement: detail.representativeItems.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: currentLocale === "en" ? item.englishName || item.name : item.name,
            url: absoluteUrl(getLocalizedPath(`/heritage/${item.slug}`, currentLocale))
          }))
        }}
      />
      <JsonLd
        data={createBreadcrumbJsonLd(
          [
            { name: currentLocale === "en" ? "Home" : "首页", path: "/" },
            { name: museumLabel, path: "/museum" },
            { name: detail.displayTitle, path: detail.topic.href }
          ],
          currentLocale
        )}
      />
      <MuseumTopicDetail locale={currentLocale} detail={detail} />
    </PageTransition>
  );
}
