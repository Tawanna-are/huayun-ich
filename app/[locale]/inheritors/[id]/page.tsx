import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft, MapPin, Sparkles } from "lucide-react";
import { HeritageCard } from "@/components/heritage/heritage-card";
import { InterviewVideo } from "@/components/inheritors/interview-video";
import { RepresentativeWorks } from "@/components/inheritors/representative-works";
import { PageTransition } from "@/components/motion/page-transition";
import { Reveal } from "@/components/motion/reveal";
import { JsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FavoriteButton } from "@/components/user/favorite-button";
import { Link } from "@/i18n/navigation";
import { defaultLocale, getLocalizedPath, isAppLocale, routing, type AppLocale } from "@/i18n/routing";
import {
  getInheritorProfileById,
  getInheritorProfileIds
} from "@/lib/content/inheritor-repository";
import { getHeritageBySlug, getRelatedHeritage } from "@/lib/content/heritage-repository";
import { absoluteUrl, createMetadata } from "@/lib/metadata";
import { getInheritorSeoDescription } from "@/lib/seo/localized-content";

type InheritorDetailPageProps = {
  params: Promise<{
    locale: string;
    id: string;
  }>;
};

function resolveLocale(locale: string): AppLocale {
  return isAppLocale(locale) ? locale : defaultLocale;
}

export async function generateStaticParams() {
  const ids = await getInheritorProfileIds();

  return routing.locales.flatMap((locale) => ids.map((id) => ({ locale, id })));
}

export async function generateMetadata({ params }: InheritorDetailPageProps): Promise<Metadata> {
  const { locale, id } = await params;
  const currentLocale = resolveLocale(locale);
  const t = await getTranslations({ locale: currentLocale, namespace: "InheritorDetail" });
  const profile = await getInheritorProfileById(id);

  if (!profile) {
    return createMetadata({
      title: t("fallbackTitle"),
      path: "/inheritors",
      locale: currentLocale
    });
  }

  return createMetadata({
    title: profile.name,
    description: getInheritorSeoDescription(profile, currentLocale),
    keywords: [profile.name, profile.heritageName, profile.heritageEnglishName, profile.region],
    path: `/inheritors/${profile.id}`,
    image: profile.image,
    type: "article",
    locale: currentLocale
  });
}

export default async function InheritorDetailPage({ params }: InheritorDetailPageProps) {
  const { locale, id } = await params;
  const currentLocale = resolveLocale(locale);
  setRequestLocale(currentLocale);
  const t = await getTranslations({ locale: currentLocale, namespace: "InheritorDetail" });
  const profile = await getInheritorProfileById(id);

  if (!profile) {
    notFound();
  }

  const heritageItem = await getHeritageBySlug(profile.heritageSlug);
  const relatedItems = heritageItem ? await getRelatedHeritage(heritageItem) : [];

  return (
    <PageTransition>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: profile.name,
          jobTitle: profile.title,
          description: getInheritorSeoDescription(profile, currentLocale),
          image: absoluteUrl(profile.image),
          url: absoluteUrl(getLocalizedPath(`/inheritors/${profile.id}`, currentLocale)),
          inLanguage: currentLocale === "en" ? "en-US" : "zh-CN",
          worksFor: {
            "@type": "CreativeWork",
            name: profile.heritageName
          }
        }}
      />
      <article>
        <section className="relative min-h-[92svh] overflow-hidden bg-ink pt-28 text-rice">
          <Image
            src={profile.image}
            alt={profile.name}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,15,15,0.96),rgba(15,15,15,0.54),rgba(15,15,15,0.9)),linear-gradient(180deg,rgba(15,15,15,0.14),#0f0f0f_96%)]" />
          <div className="museum-container relative z-10 flex min-h-[78svh] flex-col justify-end pb-14">
            <Link
              href="/inheritors"
              className="mb-auto inline-flex w-fit items-center gap-2 text-sm text-rice/72 transition hover:text-museumGold"
            >
              <ArrowLeft className="size-4" />
              {t("back")}
            </Link>
            <Reveal>
              <div className="max-w-4xl">
                <div className="mb-5 flex flex-wrap items-center gap-3">
                  <Badge>{profile.heritageCategoryName}</Badge>
                  <span className="inline-flex items-center gap-2 text-sm text-rice/68">
                    <MapPin className="size-4 text-museumGold" />
                    {profile.region}
                  </span>
                  <span className="inline-flex items-center gap-2 text-sm text-rice/68">
                    <Sparkles className="size-4 text-museumGold" />
                    {profile.heritageName}
                  </span>
                </div>
                <p className="text-sm uppercase tracking-[0.24em] text-museumGold">{t("eyebrow")}</p>
                <h1 className="serif-title mt-4 text-6xl font-normal leading-tight md:text-8xl">
                  {profile.name}
                </h1>
                <p className="mt-5 text-lg text-museumGold/80">{profile.title}</p>
                <p className="mt-7 max-w-2xl text-lg leading-8 text-rice/76">{profile.bio}</p>
                <div className="mt-8">
                  <FavoriteButton targetType="inheritor" targetId={profile.id} />
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="bg-rice py-16 text-ink md:py-24">
          <div className="museum-container grid gap-10 lg:grid-cols-[0.76fr_1.24fr]">
            <Reveal>
              <p className="text-sm uppercase text-cinnabar">{t("heritageEyebrow")}</p>
              <h2 className="serif-title mt-3 text-4xl font-normal leading-tight md:text-5xl">
                {t("heritageTitle")}
              </h2>
            </Reveal>
            <Reveal delay={0.08}>
              <div className="rounded-lg border border-ink/10 bg-white/64 p-6 shadow-museum">
                <p className="serif-title text-4xl font-normal">{profile.heritageName}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.16em] text-ink/42">
                  {profile.heritageEnglishName}
                </p>
                <p className="mt-5 text-base leading-8 text-ink/68">{t("heritageDescription")}</p>
                <Button asChild className="mt-7">
                  <Link href={`/heritage/${profile.heritageSlug}`}>{t("viewHeritage")}</Link>
                </Button>
              </div>
            </Reveal>
          </div>
        </section>

        <RepresentativeWorks
          works={profile.representativeWorks}
          eyebrow={t("worksEyebrow")}
          title={t("worksTitle")}
          description={t("worksDescription")}
          viewLabel={t("viewWork")}
        />

        <InterviewVideo
          video={profile.interviewVideo}
          eyebrow={t("interviewEyebrow")}
          title={t("interviewTitle")}
          description={t("interviewDescription")}
          emptyLabel={t("interviewEmpty")}
        />

        {relatedItems.length ? (
          <section className="bg-ink py-16 text-rice md:py-24">
            <div className="museum-container">
              <div className="mb-9 flex flex-col justify-between gap-5 md:flex-row md:items-end">
                <div>
                  <p className="text-sm uppercase text-museumGold">{t("relatedEyebrow")}</p>
                  <h2 className="serif-title mt-3 text-4xl font-normal">{t("relatedTitle")}</h2>
                </div>
                <Button asChild variant="outline">
                  <Link href="/heritage">{t("viewAll")}</Link>
                </Button>
              </div>
              <div className="grid gap-5 md:grid-cols-3">
                {relatedItems.map((item) => (
                  <HeritageCard key={item.slug} item={item} compact />
                ))}
              </div>
            </div>
          </section>
        ) : null}
      </article>
    </PageTransition>
  );
}
