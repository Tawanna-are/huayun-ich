import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";
import { unstable_noStore as noStore } from "next/cache";
import { HomeCmsContent } from "@/components/home/home-cms-content";
import { HeroSection } from "@/components/home/hero-section";
import { JsonLd } from "@/components/seo/json-ld";
import { PageTransition } from "@/components/motion/page-transition";
import { defaultLocale, isAppLocale, type AppLocale } from "@/i18n/routing";
import { getHeritageItems } from "@/lib/content/heritage-repository";
import { createOrganizationJsonLd, createWebsiteJsonLd } from "@/lib/seo/structured-data";

type HomePageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function HomePage({ params }: HomePageProps) {
  noStore();
  const itemsPromise = getHeritageItems();
  const { locale } = await params;
  const currentLocale: AppLocale = isAppLocale(locale) ? locale : defaultLocale;
  setRequestLocale(currentLocale);
  return (
    <PageTransition>
      <JsonLd data={createWebsiteJsonLd(currentLocale)} />
      <JsonLd data={createOrganizationJsonLd()} />
      <Suspense fallback={<HeroSection />}>
        <HomeCmsContent itemsPromise={itemsPromise} locale={currentLocale} />
      </Suspense>
    </PageTransition>
  );
}
