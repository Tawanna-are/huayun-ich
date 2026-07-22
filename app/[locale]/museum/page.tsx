import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AnnualRecommendations } from "@/components/museum/annual-recommendations";
import { FeaturedTopics } from "@/components/museum/featured-topics";
import { PageTransition } from "@/components/motion/page-transition";
import { JsonLd } from "@/components/seo/json-ld";
import { defaultLocale, getLocalizedPath, isAppLocale, localeMeta, type AppLocale } from "@/i18n/routing";
import { createMuseumCuration } from "@/lib/content/museum-curation";
import { getHeritageItems } from "@/lib/content/heritage-repository";
import { absoluteUrl, createMetadata, getSiteLocaleConfig } from "@/lib/metadata";
import { createBreadcrumbJsonLd } from "@/lib/seo/structured-data";

type MuseumPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

function resolveLocale(locale: string): AppLocale {
  return isAppLocale(locale) ? locale : defaultLocale;
}

export async function generateMetadata({ params }: MuseumPageProps): Promise<Metadata> {
  const { locale } = await params;
  const currentLocale = resolveLocale(locale);
  const t = await getTranslations({ locale: currentLocale, namespace: "MuseumPage" });

  return createMetadata({
    title: t("metaTitle"),
    description: t("metaDescription"),
    path: "/museum",
    image: "/assets/hero-museum.png",
    locale: currentLocale
  });
}

export default async function MuseumPage({ params }: MuseumPageProps) {
  const { locale } = await params;
  const currentLocale = resolveLocale(locale);
  setRequestLocale(currentLocale);

  const t = await getTranslations({ locale: currentLocale, namespace: "MuseumPage" });
  const items = await getHeritageItems();
  const curation = createMuseumCuration(items);
  const localeConfig = getSiteLocaleConfig(currentLocale);
  const pageTitle = t("title");
  const pageDescription = t("description");

  return (
    <PageTransition>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: pageTitle,
          description: pageDescription,
          url: absoluteUrl(getLocalizedPath("/museum", currentLocale)),
          inLanguage: localeMeta[currentLocale].language,
          isPartOf: {
            "@type": "WebSite",
            name: localeConfig.name,
            url: absoluteUrl(getLocalizedPath("/", currentLocale))
          },
          about: {
            "@type": "Thing",
            name: currentLocale === "en" ? "Chinese intangible cultural heritage" : "中国非物质文化遗产"
          }
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: t("annualTitle"),
          numberOfItems: curation.annualRecommendations.length,
          itemListElement: curation.annualRecommendations.map((item, index) => ({
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
            { name: t("breadcrumbHome"), path: "/" },
            { name: t("breadcrumbMuseum"), path: "/museum" }
          ],
          currentLocale
        )}
      />

      <FeaturedTopics
        locale={currentLocale}
        topics={curation.featuredTopics}
        eyebrow={t("featuredEyebrow")}
        title={t("featuredTitle")}
        description={t("featuredDescription")}
        viewLabel={t("viewTopic")}
        countLabel={t("topicCountLabel")}
        emptyLabel={t("empty")}
      />
      <AnnualRecommendations
        locale={currentLocale}
        items={curation.annualRecommendations}
        eyebrow={t("annualEyebrow")}
        title={t("annualTitle")}
        description={t("annualDescription")}
        yearLabel={t("yearLabel")}
        viewLabel={t("viewExhibit")}
        emptyLabel={t("empty")}
      />
    </PageTransition>
  );
}
