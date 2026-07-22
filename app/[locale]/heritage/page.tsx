import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { HeritageListClient } from "@/components/heritage/heritage-list-client";
import { PageTransition } from "@/components/motion/page-transition";
import { JsonLd } from "@/components/seo/json-ld";
import { defaultLocale, isAppLocale, type AppLocale } from "@/i18n/routing";
import { getAvailableProvinces } from "@/lib/content/heritage-filters";
import { getCategories, getHeritageItems } from "@/lib/content/heritage-repository";
import { createMetadata } from "@/lib/metadata";
import { createBreadcrumbJsonLd, createItemListJsonLd } from "@/lib/seo/structured-data";

type HeritageListPageProps = {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{
    category?: string;
    province?: string;
    query?: string;
  }>;
};

function resolveLocale(locale: string): AppLocale {
  return isAppLocale(locale) ? locale : defaultLocale;
}

export async function generateMetadata({ params, searchParams }: HeritageListPageProps): Promise<Metadata> {
  const { locale } = await params;
  const currentLocale = resolveLocale(locale);
  const t = await getTranslations({ locale: currentLocale, namespace: "HeritageListPage" });
  const queryParams = await searchParams;
  const scopedTitle = queryParams.province
    ? t("meta.provinceTitle", { province: queryParams.province })
    : queryParams.category
      ? t("meta.categoryTitle")
      : queryParams.query
        ? t("meta.queryTitle", { query: queryParams.query })
        : t("meta.defaultTitle");

  return createMetadata({
    title: scopedTitle,
    description: t("meta.description"),
    path: "/heritage",
    locale: currentLocale
  });
}

export default async function HeritageListPage({ params, searchParams }: HeritageListPageProps) {
  const { locale } = await params;
  const currentLocale = resolveLocale(locale);
  setRequestLocale(currentLocale);
  const t = await getTranslations({ locale: currentLocale, namespace: "HeritageListPage" });
  const queryParams = await searchParams;
  const [items, categories] = await Promise.all([getHeritageItems(), getCategories()]);
  const provinces = getAvailableProvinces(items);

  return (
    <PageTransition>
      <JsonLd data={createItemListJsonLd(items, currentLocale)} />
      <JsonLd
        data={createBreadcrumbJsonLd(
          [
            { name: t("breadcrumbHome"), path: "/" },
            { name: t("breadcrumbArchive"), path: "/heritage" }
          ],
          currentLocale
        )}
      />
      <section
        data-page="heritage-collection"
        className="border-b border-[#31594c]/10 bg-[#f4f1ea] pt-24 text-[#18231e] md:pt-28"
      >
        <div className="museum-container flex items-end justify-between gap-6 pb-9 pt-8 md:gap-8 md:pb-12 md:pt-10">
          <div>
            <p className="text-[11px] uppercase text-[#9b3b32]">{t("collectionLabel")}</p>
            <h1 className="serif-title mt-3 text-4xl font-normal leading-none sm:text-5xl md:text-6xl">
              {t("collectionTitle")}
            </h1>
          </div>
          <p className="shrink-0 pb-1 text-xs text-[#6f7973] md:text-sm">
            {t("collectionCount", { count: items.length })}
          </p>
        </div>
      </section>
      <HeritageListClient
        items={items}
        categories={categories}
        provinces={provinces}
        initialCategory={queryParams.category}
        initialProvince={queryParams.province}
        initialQuery={queryParams.query}
      />
    </PageTransition>
  );
}
