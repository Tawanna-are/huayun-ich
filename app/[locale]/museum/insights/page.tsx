import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { CategoryStatChart } from "@/components/insights/category-stat-chart";
import { DynastyTimelineChart } from "@/components/insights/dynasty-timeline-chart";
import { HeritageHeatMap } from "@/components/insights/heritage-heat-map";
import { InheritanceGraph } from "@/components/insights/inheritance-graph";
import { InsightsOverview } from "@/components/insights/insights-overview";
import { PageTransition } from "@/components/motion/page-transition";
import { JsonLd } from "@/components/seo/json-ld";
import { defaultLocale, getLocalizedPath, isAppLocale, localeMeta, type AppLocale } from "@/i18n/routing";
import { createHeritageInsights } from "@/lib/content/heritage-insights";
import { getHeritageItems } from "@/lib/content/heritage-repository";
import { absoluteUrl, createMetadata, getSiteLocaleConfig } from "@/lib/metadata";
import { createBreadcrumbJsonLd } from "@/lib/seo/structured-data";

type MuseumInsightsPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

const pageCopy = {
  zh: {
    metaTitle: "非遗数据洞察",
    metaDescription:
      "以热力图、朝代时间轴、分类统计与传承关系图谱观察中国非遗内容库的地理分布、历史线索与传承网络。",
    title: "非遗数据洞察",
    description: "从地理、历史、分类与传承关系进入华韵非遗内容库的另一层阅读。",
    breadcrumbHome: "首页",
    breadcrumbMuseum: "数字展馆",
    breadcrumbInsights: "数据洞察",
    datasetName: "华韵非遗数据洞察集",
    datasetDescription: "基于华韵已发布非遗项目生成的地理分布、朝代线索、分类统计与传承关系数据。"
  },
  en: {
    metaTitle: "Heritage Data Insights",
    metaDescription:
      "Explore Chinese intangible heritage through a distribution heat map, dynasty timeline, category statistics and inheritance network.",
    title: "Heritage Data Insights",
    description:
      "A research-oriented reading layer for Huayun's heritage archive across geography, history, categories and transmission.",
    breadcrumbHome: "Home",
    breadcrumbMuseum: "Digital Museum",
    breadcrumbInsights: "Data Insights",
    datasetName: "Huayun Heritage Data Insights",
    datasetDescription:
      "Geographic, historical, category and transmission datasets generated from Huayun's published heritage records."
  }
} satisfies Record<AppLocale, Record<string, string>>;

function resolveLocale(locale: string): AppLocale {
  return isAppLocale(locale) ? locale : defaultLocale;
}

export async function generateMetadata({ params }: MuseumInsightsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const currentLocale = resolveLocale(locale);
  const text = pageCopy[currentLocale];

  return createMetadata({
    title: text.metaTitle,
    description: text.metaDescription,
    path: "/museum/insights",
    image: "/assets/hero-museum.png",
    locale: currentLocale
  });
}

export default async function MuseumInsightsPage({ params }: MuseumInsightsPageProps) {
  const { locale } = await params;
  const currentLocale = resolveLocale(locale);
  setRequestLocale(currentLocale);

  const items = await getHeritageItems();
  const insights = createHeritageInsights(items);
  const localeConfig = getSiteLocaleConfig(currentLocale);
  const text = pageCopy[currentLocale];
  const pageUrl = absoluteUrl(getLocalizedPath("/museum/insights", currentLocale));

  return (
    <PageTransition>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Dataset",
          name: text.datasetName,
          description: text.datasetDescription,
          url: pageUrl,
          inLanguage: localeMeta[currentLocale].language,
          creator: {
            "@type": "Organization",
            name: localeConfig.name,
            url: absoluteUrl(getLocalizedPath("/", currentLocale))
          },
          isPartOf: {
            "@type": "WebSite",
            name: localeConfig.name,
            url: absoluteUrl(getLocalizedPath("/", currentLocale))
          },
          variableMeasured: [
            currentLocale === "en" ? "Province distribution" : "省份分布",
            currentLocale === "en" ? "Historical period" : "历史时期",
            currentLocale === "en" ? "Heritage category" : "非遗分类",
            currentLocale === "en" ? "Transmission relationship" : "传承关系"
          ],
          measurementTechnique: "Server-side aggregation from published heritage records",
          license: absoluteUrl(getLocalizedPath("/museum/insights", currentLocale))
        }}
      />
      <JsonLd
        data={createBreadcrumbJsonLd(
          [
            { name: text.breadcrumbHome, path: "/" },
            { name: text.breadcrumbMuseum, path: "/museum" },
            { name: text.breadcrumbInsights, path: "/museum/insights" }
          ],
          currentLocale
        )}
      />

      <InsightsOverview locale={currentLocale} insights={insights} />
      <HeritageHeatMap locale={currentLocale} data={insights.heatMap} />
      <DynastyTimelineChart locale={currentLocale} data={insights.timeline} />
      <CategoryStatChart locale={currentLocale} data={insights.categories} />
      <InheritanceGraph locale={currentLocale} data={insights.graph} />
    </PageTransition>
  );
}
