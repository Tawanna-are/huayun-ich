import type { Metadata } from "next";
import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";
import { unstable_noStore as noStore } from "next/cache";
import { HomeCmsContent } from "@/components/home/home-cms-content";
import { HeroSection } from "@/components/home/hero-section";
import { JsonLd } from "@/components/seo/json-ld";
import { PageTransition } from "@/components/motion/page-transition";
import { defaultLocale, isAppLocale, type AppLocale } from "@/i18n/routing";
import { getHeritageItems } from "@/lib/content/heritage-repository";
import { createMetadata } from "@/lib/metadata";
import { createOrganizationJsonLd, createWebsiteJsonLd } from "@/lib/seo/structured-data";

type HomePageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export const dynamic = "force-dynamic";

const homeSeo = {
  zh: {
    title: "华韵非遗：中国非物质文化遗产展示平台",
    description: "华韵非遗是面向全球的中国非物质文化遗产展示平台，探索中国非遗、中国传统文化、传统手工艺与传承故事。",
    keywords: ["中国非物质文化遗产", "中国非遗", "中国传统文化", "传统手工艺", "非遗文化展示平台"]
  },
  en: {
    title: "Chinese Intangible Cultural Heritage Platform",
    description: "Huayun Heritage is a global platform for exploring Chinese Intangible Cultural Heritage, Traditional Chinese Culture and Chinese Traditional Crafts.",
    keywords: ["Chinese Intangible Cultural Heritage", "Traditional Chinese Culture", "Chinese Heritage", "Chinese Traditional Crafts"]
  }
} satisfies Record<AppLocale, { title: string; description: string; keywords: string[] }>;

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { locale } = await params;
  const currentLocale = isAppLocale(locale) ? locale : defaultLocale;
  const seo = homeSeo[currentLocale];

  return createMetadata({
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    path: "/",
    locale: currentLocale
  });
}

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
