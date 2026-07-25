import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ContactApplicationForm } from "@/components/contact/contact-application-form";
import { CraftMediaGallery } from "@/components/heritage/craft-media-gallery";
import { DetailHero } from "@/components/heritage/detail-hero";
import { HeritageVideoArchive } from "@/components/heritage/heritage-video-archive";
import { HeritageLikeButton } from "@/components/heritage/heritage-like-button";
import { HeritageComments } from "@/components/heritage/heritage-comments";
import { PageTransition } from "@/components/motion/page-transition";
import { Reveal } from "@/components/motion/reveal";
import { JsonLd } from "@/components/seo/json-ld";
import { BrowsingHistoryTracker } from "@/components/user/browsing-history-tracker";
import { FavoriteButton } from "@/components/user/favorite-button";
import { defaultLocale, isAppLocale, routing, type AppLocale } from "@/i18n/routing";
import { getHeritageBySlug, getHeritageSlugs } from "@/lib/content/heritage-repository";
import { createMetadata } from "@/lib/metadata";
import { createBreadcrumbJsonLd, createCreativeWorkJsonLd } from "@/lib/seo/structured-data";

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

const detailCopy = {
  zh: {
    galleryEyebrow: "Work Images",
    galleryTitle: "作品影像",
    galleryDescription: "作品、细节与现场。",
    factsEyebrow: "Project Information",
    factsTitle: "项目信息",
    categoryLabel: "分类",
    regionLabel: "地区",
    videoEyebrow: "Moving Image",
    videoTitle: "项目影像",
    videoDescription: "现场动作与声音记录。",
    consultationEyebrow: "Consultation",
    consultationTitle: "咨询合作",
    closePreview: "关闭图片预览"
  },
  en: {
    galleryEyebrow: "Work Images",
    galleryTitle: "Work Gallery",
    galleryDescription: "Work, detail and place.",
    factsEyebrow: "Project Information",
    factsTitle: "Project Details",
    categoryLabel: "Category",
    regionLabel: "Region",
    videoEyebrow: "Moving Image",
    videoTitle: "Project Film",
    videoDescription: "Gesture and sound recorded in place.",
    consultationEyebrow: "Consultation",
    consultationTitle: "Consultation & Cooperation",
    closePreview: "Close image preview"
  }
} as const;

function resolveLocale(locale: string): AppLocale {
  return isAppLocale(locale) ? locale : defaultLocale;
}

export async function generateStaticParams() {
  const slugs = await getHeritageSlugs();
  return routing.locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const currentLocale = resolveLocale(locale);
  const t = await getTranslations({ locale: currentLocale, namespace: "HeritageDetail" });
  const item = await getHeritageBySlug(slug);

  if (!item) return createMetadata({ title: t("fallbackTitle"), path: "/heritage", locale: currentLocale });

  return createMetadata({
    title: currentLocale === "en" ? item.englishName || item.name : item.name,
    description: item.summary,
    path: `/heritage/${item.slug}`,
    image: item.heroImage || item.image,
    type: "article",
    locale: currentLocale
  });
}

export default async function HeritageDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const currentLocale = resolveLocale(locale);
  setRequestLocale(currentLocale);
  const t = await getTranslations({ locale: currentLocale, namespace: "HeritageDetail" });
  const item = await getHeritageBySlug(slug);

  if (!item) notFound();

  const copy = detailCopy[currentLocale];
  const displayTitle = currentLocale === "en" ? item.englishName || item.name : item.name;
  const displaySubtitle = currentLocale === "en" ? item.name : item.englishName;
  const hasVideo = Boolean(item.videoUrl || item.videos?.length);

  return (
    <PageTransition>
      <JsonLd data={createCreativeWorkJsonLd(item, currentLocale)} />
      <JsonLd data={createBreadcrumbJsonLd([
        { name: t("breadcrumbHome"), path: "/" },
        { name: t("breadcrumbArchive"), path: "/heritage" },
        { name: displayTitle, path: `/heritage/${item.slug}` }
      ], currentLocale)} />

      <article className="bg-[#f4f1ea] text-[#18231e]">
          <BrowsingHistoryTracker itemId={item.id} />
          <DetailHero
            item={item}
            title={displayTitle}
            subtitle={displaySubtitle}
            breadcrumbHome={t("breadcrumbHome")}
            breadcrumbArchive={t("breadcrumbArchive")}
            currentLabel={displayTitle}
            actions={
              <>
                <FavoriteButton itemId={item.id} />
                <HeritageLikeButton itemId={item.id} />
              </>
            }
          />

          <CraftMediaGallery
            images={item.gallery}
            itemName={item.name}
            eyebrow={copy.galleryEyebrow}
            title={copy.galleryTitle}
            description={copy.galleryDescription}
            closeLabel={copy.closePreview}
            actions={
              <>
                <FavoriteButton itemId={item.id} />
                <HeritageLikeButton itemId={item.id} />
              </>
            }
          />

          {hasVideo ? <HeritageVideoArchive item={item} eyebrow={copy.videoEyebrow} title={copy.videoTitle} description={copy.videoDescription} /> : null}

          <section data-section="project-information" className="border-y border-[#31594c]/10 bg-[#fffefa] py-14 md:py-20">
            <div className="museum-container grid gap-10 md:grid-cols-[0.8fr_1.2fr] md:items-end">
              <Reveal>
                <p className="text-[11px] uppercase text-[#9b3b32]">{copy.factsEyebrow}</p>
                <h2 className="serif-title mt-2 text-3xl font-normal md:text-5xl">{copy.factsTitle}</h2>
              </Reveal>
              <Reveal delay={0.06}>
                <dl className="grid grid-cols-2 gap-px bg-[#31594c]/10">
                  <div className="bg-[#fffefa] px-5 py-6"><dt className="text-[11px] text-[#7a847e]">{copy.regionLabel}</dt><dd className="mt-2 text-base">{item.region}</dd></div>
                  <div className="bg-[#fffefa] px-5 py-6"><dt className="text-[11px] text-[#7a847e]">{copy.categoryLabel}</dt><dd className="mt-2 text-base">{item.categoryName}</dd></div>
                </dl>
              </Reveal>
            </div>
          </section>

          <HeritageComments itemId={item.id} />

          <section data-section="consultation-cooperation" className="bg-[#102c28] py-16 text-[#f8f4e9] md:py-24">
              <div className="museum-container grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:items-start">
                <Reveal>
                  <p className="text-[11px] uppercase text-[#d3bea0]">{copy.consultationEyebrow}</p>
                  <h2 className="serif-title mt-2 text-3xl font-normal md:text-5xl">{copy.consultationTitle}</h2>
                </Reveal>
                <Reveal delay={0.06}>
                  <ContactApplicationForm locale={currentLocale} defaultKind="supporter" heritageItemId={item.id} heritageItemName={displayTitle} />
                </Reveal>
              </div>
          </section>
      </article>
    </PageTransition>
  );
}
