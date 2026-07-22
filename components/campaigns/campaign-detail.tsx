import Image from "next/image";
import { ArrowUpRight, Share2 } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import type { CampaignDetail as CampaignDetailData } from "@/lib/content/multichannel-content";

type CampaignDetailProps = {
  locale: AppLocale;
  detail: CampaignDetailData;
};

const copy = {
  zh: {
    eyebrow: "Mobile Exhibition",
    linked: "关联非遗",
    featured: "精选项目",
    related: "继续探索",
    empty: "该活动专题正在补充内容。",
    view: "查看展陈",
    back: "返回活动",
    poster: "生成分享海报"
  },
  en: {
    eyebrow: "Mobile Exhibition",
    linked: "Linked Heritage",
    featured: "Featured Records",
    related: "Continue Exploring",
    empty: "This campaign is being enriched.",
    view: "View exhibit",
    back: "Back to campaigns",
    poster: "Share poster"
  }
} as const;

export function CampaignDetail({ locale, detail }: CampaignDetailProps) {
  const text = copy[locale];

  return (
    <>
      <section className="relative min-h-[92vh] overflow-hidden bg-ink text-rice">
        <Image src={detail.heroImage} alt={detail.displayTitle} fill priority sizes="100vw" className="object-cover opacity-70" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,15,15,0.18),rgba(15,15,15,0.94)),radial-gradient(circle_at_20%_26%,rgba(200,169,106,0.22),transparent_28%)]" />
        <div className="museum-container relative flex min-h-[92vh] flex-col justify-end pb-12 pt-32">
          <Reveal className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/campaigns" className="text-sm text-museumGold hover:text-rice">
                {text.back}
              </Link>
              <a
                href={`/api/content/campaigns/${detail.slug}/poster?locale=${locale}`}
                target="_blank"
                rel="noreferrer"
                aria-label="Share poster"
                className="inline-flex h-9 items-center gap-2 rounded-md border border-museumGold/30 px-3 text-sm text-rice/76 transition hover:border-museumGold hover:bg-museumGold/12 hover:text-rice"
              >
                <Share2 className="size-4" />
                {text.poster}
              </a>
            </div>
            <p className="mt-8 text-xs uppercase tracking-[0.26em] text-museumGold">{text.eyebrow}</p>
            <h1 className="serif-title mt-5 text-5xl font-normal leading-[1.05] md:text-8xl">{detail.displayTitle}</h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-rice/72 md:text-lg">{detail.displaySummary}</p>
          </Reveal>
          <div className="mt-12 grid max-w-3xl gap-px overflow-hidden rounded-lg border border-museumGold/16 bg-museumGold/16 sm:grid-cols-2">
            <Reveal className="bg-ink/74 p-5 backdrop-blur-md">
              <p className="serif-title text-4xl text-rice">{detail.itemCount}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.18em] text-rice/48">{text.linked}</p>
            </Reveal>
            <Reveal delay={0.05} className="bg-ink/74 p-5 backdrop-blur-md">
              <p className="serif-title text-4xl text-rice">{detail.featuredSlugs.length}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.18em] text-rice/48">{text.featured}</p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-rice py-14 text-ink md:py-24">
        <div className="museum-container grid gap-10 md:grid-cols-[0.82fr_1.18fr]">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.2em] text-cinnabar">Curatorial Story</p>
            <h2 className="serif-title mt-3 text-4xl font-normal md:text-6xl">{detail.displayTitle}</h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="max-w-2xl text-base leading-9 text-ink/68 md:text-lg">{detail.displayDescription}</p>
          </Reveal>
        </div>
      </section>

      <section className="bg-ink py-14 text-rice md:py-24">
        <div className="museum-container">
          <Reveal className="mb-9 flex items-end justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-museumGold">{text.featured}</p>
              <h2 className="serif-title mt-3 text-4xl font-normal md:text-6xl">{text.linked}</h2>
            </div>
          </Reveal>
          {detail.items.length ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {detail.items.map((item, index) => (
                <Reveal key={item.slug} delay={index * 0.05}>
                  <Link
                    href={`/heritage/${item.slug}`}
                    className="group block h-full overflow-hidden rounded-lg border border-museumGold/16 bg-rice/[0.045] transition duration-300 hover:-translate-y-1 hover:border-museumGold/44"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        src={item.image}
                        alt={locale === "en" ? item.englishName : item.name}
                        fill
                        sizes="(min-width: 1024px) 30vw, (min-width: 768px) 50vw, 100vw"
                        className="object-cover transition duration-700 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-5">
                      <p className="text-xs uppercase tracking-[0.16em] text-museumGold/70">{item.province || item.region}</p>
                      <h3 className="serif-title mt-3 text-3xl font-normal">
                        {locale === "en" ? item.englishName : item.name}
                      </h3>
                      <p className="mt-3 line-clamp-2 text-sm leading-7 text-rice/58">{item.summary}</p>
                      <span className="mt-5 inline-flex items-center gap-2 text-sm text-museumGold">
                        {text.view}
                        <ArrowUpRight className="size-4" />
                      </span>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          ) : (
            <Reveal className="rounded-lg border border-museumGold/18 bg-rice/[0.035] p-10 text-center text-rice/58">
              {text.empty}
            </Reveal>
          )}
        </div>
      </section>

      {detail.relatedItems.length ? (
        <section className="bg-rice py-14 text-ink md:py-20">
          <div className="museum-container">
            <Reveal>
              <p className="text-xs uppercase tracking-[0.2em] text-cinnabar">{text.related}</p>
            </Reveal>
            <div className="mt-8 grid gap-3 md:grid-cols-4">
              {detail.relatedItems.map((item) => (
                <Reveal key={item.slug}>
                  <Link
                    href={`/heritage/${item.slug}`}
                    className="block rounded-lg border border-ink/10 bg-white/70 p-5 transition hover:-translate-y-1 hover:border-museumGold/50"
                  >
                    <p className="serif-title text-2xl font-normal">{locale === "en" ? item.englishName : item.name}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.14em] text-ink/42">{item.categoryName}</p>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
