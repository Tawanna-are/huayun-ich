import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { CampaignDetail } from "@/components/campaigns/campaign-detail";
import { PageTransition } from "@/components/motion/page-transition";
import { JsonLd } from "@/components/seo/json-ld";
import { defaultLocale, getLocalizedPath, isAppLocale, localeMeta, routing, type AppLocale } from "@/i18n/routing";
import { getHeritageItems } from "@/lib/content/heritage-repository";
import { campaignSlugs, resolveCampaignDetail } from "@/lib/content/multichannel-content";
import { absoluteUrl, createMetadata, getSiteLocaleConfig } from "@/lib/metadata";
import { createBreadcrumbJsonLd } from "@/lib/seo/structured-data";

type CampaignDetailPageProps = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

function resolveLocale(locale: string): AppLocale {
  return isAppLocale(locale) ? locale : defaultLocale;
}

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => campaignSlugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: CampaignDetailPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const currentLocale = resolveLocale(locale);
  const items = await getHeritageItems();
  const detail = resolveCampaignDetail(slug, items, currentLocale);

  if (!detail) {
    return createMetadata({
      title: currentLocale === "en" ? "H5 Campaign" : "H5活动",
      path: "/campaigns",
      locale: currentLocale
    });
  }

  return createMetadata({
    title: detail.displayTitle,
    description: detail.displaySummary,
    path: detail.href,
    image: detail.heroImage,
    type: "article",
    locale: currentLocale
  });
}

export default async function CampaignDetailPage({ params }: CampaignDetailPageProps) {
  const { locale, slug } = await params;
  const currentLocale = resolveLocale(locale);
  setRequestLocale(currentLocale);

  const items = await getHeritageItems();
  const detail = resolveCampaignDetail(slug, items, currentLocale);

  if (!detail) {
    notFound();
  }

  const localeConfig = getSiteLocaleConfig(currentLocale);
  const campaignsLabel = currentLocale === "en" ? "H5 Campaigns" : "H5活动";

  return (
    <PageTransition>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: detail.displayTitle,
          description: detail.displaySummary,
          url: absoluteUrl(getLocalizedPath(detail.href, currentLocale)),
          image: absoluteUrl(detail.heroImage),
          inLanguage: localeMeta[currentLocale].language,
          isPartOf: {
            "@type": "WebSite",
            name: localeConfig.name,
            url: absoluteUrl(getLocalizedPath("/", currentLocale))
          }
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: detail.displayTitle,
          numberOfItems: detail.items.length,
          itemListElement: detail.items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: currentLocale === "en" ? item.englishName : item.name,
            url: absoluteUrl(getLocalizedPath(`/heritage/${item.slug}`, currentLocale))
          }))
        }}
      />
      <JsonLd
        data={createBreadcrumbJsonLd(
          [
            { name: currentLocale === "en" ? "Home" : "首页", path: "/" },
            { name: campaignsLabel, path: "/campaigns" },
            { name: detail.displayTitle, path: detail.href }
          ],
          currentLocale
        )}
      />
      <CampaignDetail locale={currentLocale} detail={detail} />
    </PageTransition>
  );
}
