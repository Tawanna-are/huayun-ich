import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { HeritageAdminClient } from "@/components/admin/heritage-admin-client";
import { EngagementAdminClient } from "@/components/admin/engagement-admin-client";
import { PageTransition } from "@/components/motion/page-transition";
import { defaultLocale, isAppLocale, type AppLocale } from "@/i18n/routing";
import { getAdminHeritageRows, getCategories, getHeritageItems } from "@/lib/content/heritage-repository";
import { createMetadata } from "@/lib/metadata";

type AdminPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

function resolveLocale(locale: string): AppLocale {
  return isAppLocale(locale) ? locale : defaultLocale;
}

export async function generateMetadata({ params }: AdminPageProps): Promise<Metadata> {
  const { locale } = await params;
  const currentLocale = resolveLocale(locale);
  const t = await getTranslations({ locale: currentLocale, namespace: "AdminPage" });

  return createMetadata({
    title: t("metaTitle"),
    description: t("metaDescription"),
    path: "/admin",
    noIndex: true,
    locale: currentLocale
  });
}

export default async function AdminPage({ params }: AdminPageProps) {
  const { locale } = await params;
  const currentLocale = resolveLocale(locale);
  setRequestLocale(currentLocale);
  const t = await getTranslations({ locale: currentLocale, namespace: "AdminPage" });
  const [items, categories, adminRows] = await Promise.all([
    getHeritageItems(),
    getCategories(),
    getAdminHeritageRows()
  ]);

  return (
    <PageTransition>
      <section className="border-b border-museumGold/18 bg-ink pt-32 text-rice">
        <div className="museum-container pb-12">
          <p className="text-sm uppercase text-museumGold">{t("eyebrow")}</p>
          <h1 className="serif-title mt-4 text-5xl font-normal md:text-7xl">{t("title")}</h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-rice/64">
            {t("description")}
          </p>
        </div>
      </section>
      <HeritageAdminClient locale={currentLocale} items={items} categories={categories} adminRows={adminRows} />
      <EngagementAdminClient locale={currentLocale} />
    </PageTransition>
  );
}
