import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { CampaignIndex } from "@/components/campaigns/campaign-index";
import { PageTransition } from "@/components/motion/page-transition";
import { JsonLd } from "@/components/seo/json-ld";
import { defaultLocale, getLocalizedPath, isAppLocale, localeMeta, type AppLocale } from "@/i18n/routing";
import { getHeritageItems } from "@/lib/content/heritage-repository";
import { createCampaignCollection } from "@/lib/content/multichannel-content";
import { absoluteUrl, createMetadata, getSiteLocaleConfig } from "@/lib/metadata";
import { createBreadcrumbJsonLd } from "@/lib/seo/structured-data";

type CampaignsPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

const copy = {
  zh: {
    title: "H5非遗活动页",
    description: "面向移动端传播的中国非遗专题活动页，适合节庆、教育、社交分享与数字博物馆导览。",
    breadcrumbHome: "首页",
    breadcrumbCampaigns: "H5活动"
  },
  en: {
    title: "H5 Heritage Campaigns",
    description:
      "Mobile-first Chinese intangible heritage campaign pages for festivals, education, social sharing and digital museum visits.",
    breadcrumbHome: "Home",
    breadcrumbCampaigns: "H5 Campaigns"
  }
} as const;

function resolveLocale(locale: string): AppLocale {
  return isAppLocale(locale) ? locale : defaultLocale;
}

export async function generateMetadata({ params }: CampaignsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const currentLocale = resolveLocale(locale);
  const text = copy[currentLocale];

  return createMetadata({
    title: text.title,
    description: text.description,
    path: "/campaigns",
    image: "/assets/hero-museum.png",
    locale: currentLocale
  });
}

export default async function CampaignsPage({ params }: CampaignsPageProps) {
  const { locale } = await params;
  const currentLocale = resolveLocale(locale);
  setRequestLocale(currentLocale);

  const items = await getHeritageItems();
  const campaigns = createCampaignCollection(items);
  const text = copy[currentLocale];
  const localeConfig = getSiteLocaleConfig(currentLocale);

  return (
    <PageTransition>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: text.title,
          description: text.description,
          url: absoluteUrl(getLocalizedPath("/campaigns", currentLocale)),
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
          name: text.title,
          numberOfItems: campaigns.length,
          itemListElement: campaigns.map((campaign, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: currentLocale === "en" ? campaign.englishTitle : campaign.title,
            url: absoluteUrl(getLocalizedPath(campaign.href, currentLocale))
          }))
        }}
      />
      <JsonLd
        data={createBreadcrumbJsonLd(
          [
            { name: text.breadcrumbHome, path: "/" },
            { name: text.breadcrumbCampaigns, path: "/campaigns" }
          ],
          currentLocale
        )}
      />
      <CampaignIndex locale={currentLocale} campaigns={campaigns} />
    </PageTransition>
  );
}
