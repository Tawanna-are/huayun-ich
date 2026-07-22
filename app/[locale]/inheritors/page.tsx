import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { InheritorCard } from "@/components/inheritors/inheritor-card";
import { PageTransition } from "@/components/motion/page-transition";
import { JsonLd } from "@/components/seo/json-ld";
import { defaultLocale, isAppLocale, type AppLocale } from "@/i18n/routing";
import { getInheritorProfiles } from "@/lib/content/inheritor-repository";
import { createMetadata } from "@/lib/metadata";

type InheritorsPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

function resolveLocale(locale: string): AppLocale {
  return isAppLocale(locale) ? locale : defaultLocale;
}

export async function generateMetadata({ params }: InheritorsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const currentLocale = resolveLocale(locale);
  const t = await getTranslations({ locale: currentLocale, namespace: "InheritorsPage" });

  return createMetadata({
    title: t("metaTitle"),
    description: t("metaDescription"),
    path: "/inheritors",
    locale: currentLocale
  });
}

export default async function InheritorsPage({ params }: InheritorsPageProps) {
  const { locale } = await params;
  const currentLocale = resolveLocale(locale);
  setRequestLocale(currentLocale);
  const t = await getTranslations({ locale: currentLocale, namespace: "InheritorsPage" });
  const profiles = await getInheritorProfiles();

  return (
    <PageTransition>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: t("title"),
          description: t("metaDescription"),
          numberOfItems: profiles.length,
          itemListElement: profiles.map((profile, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: profile.name,
            url: `/inheritors/${profile.id}`
          }))
        }}
      />
      <section className="relative overflow-hidden border-b border-museumGold/20 bg-ink pt-32 text-rice">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(145deg,rgba(178,34,34,0.2),transparent_34%),linear-gradient(180deg,rgba(248,246,242,0.08),transparent_42%)]" />
        <div className="museum-container pb-16">
          <p className="text-sm uppercase tracking-[0.22em] text-museumGold">{t("eyebrow")}</p>
          <h1 className="serif-title mt-4 max-w-4xl text-5xl font-normal leading-tight md:text-7xl">
            {t("title")}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-rice/70 md:text-lg">{t("description")}</p>
        </div>
      </section>

      <section className="bg-ink py-12 text-rice md:py-16">
        <div className="museum-container">
          <div className="mb-8 flex items-center justify-between gap-4 text-sm text-rice/50">
            <span>{t("count", { count: profiles.length })}</span>
            <span>Inheritor Archive</span>
          </div>
          {profiles.length ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {profiles.map((profile) => (
                <InheritorCard key={profile.id} profile={profile} viewLabel={t("viewProfile")} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-museumGold/18 bg-rice/[0.035] p-10 text-center text-rice/58">
              {t("empty")}
            </div>
          )}
        </div>
      </section>
    </PageTransition>
  );
}
