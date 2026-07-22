import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AssistantChat } from "@/components/assistant/assistant-chat";
import { PageTransition } from "@/components/motion/page-transition";
import { Reveal } from "@/components/motion/reveal";
import { JsonLd } from "@/components/seo/json-ld";
import { defaultLocale, getLocalizedPath, isAppLocale, localeMeta, type AppLocale } from "@/i18n/routing";
import { absoluteUrl, createMetadata, getSiteLocaleConfig } from "@/lib/metadata";
import { createBreadcrumbJsonLd } from "@/lib/seo/structured-data";

type AssistantPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

function resolveLocale(locale: string): AppLocale {
  return isAppLocale(locale) ? locale : defaultLocale;
}

export async function generateMetadata({ params }: AssistantPageProps): Promise<Metadata> {
  const { locale } = await params;
  const currentLocale = resolveLocale(locale);
  const t = await getTranslations({ locale: currentLocale, namespace: "AssistantPage" });

  return createMetadata({
    title: t("metaTitle"),
    description: t("metaDescription"),
    path: "/assistant",
    image: "/assets/hero-museum.png",
    locale: currentLocale
  });
}

export default async function AssistantPage({ params }: AssistantPageProps) {
  const { locale } = await params;
  const currentLocale = resolveLocale(locale);
  setRequestLocale(currentLocale);

  const t = await getTranslations({ locale: currentLocale, namespace: "AssistantPage" });
  const localeConfig = getSiteLocaleConfig(currentLocale);

  return (
    <PageTransition>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: t("title"),
          description: t("metaDescription"),
          url: absoluteUrl(getLocalizedPath("/assistant", currentLocale)),
          inLanguage: localeMeta[currentLocale].language,
          isPartOf: {
            "@type": "WebSite",
            name: localeConfig.name,
            url: absoluteUrl(getLocalizedPath("/", currentLocale))
          }
        }}
      />
      <JsonLd
        data={createBreadcrumbJsonLd(
          [
            { name: t("breadcrumbHome"), path: "/" },
            { name: t("breadcrumbAssistant"), path: "/assistant" }
          ],
          currentLocale
        )}
      />

      <section className="relative overflow-hidden border-b border-museumGold/18 bg-ink pt-32 text-rice">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_20%,rgba(200,169,106,0.18),transparent_28%),linear-gradient(145deg,rgba(178,34,34,0.22),transparent_36%)]" />
        <div className="museum-container pb-12 md:pb-16">
          <Reveal>
            <p className="text-sm uppercase tracking-[0.22em] text-museumGold">{t("eyebrow")}</p>
            <h1 className="serif-title mt-4 max-w-4xl text-5xl font-normal leading-tight md:text-7xl">
              {t("title")}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-rice/70 md:text-lg">{t("description")}</p>
          </Reveal>
        </div>
      </section>

      <section className="bg-ink py-10 text-rice md:py-16">
        <div className="museum-container">
          <AssistantChat />
        </div>
      </section>
    </PageTransition>
  );
}
