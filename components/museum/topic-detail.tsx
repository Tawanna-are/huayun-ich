import Image from "next/image";
import { ArrowLeft, ArrowUpRight, BookOpen, MapPin, Sparkles } from "lucide-react";
import { HeritageCard } from "@/components/heritage/heritage-card";
import { Reveal } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import type { ResolvedMuseumTopicDetail } from "@/lib/types/museum";

type MuseumTopicDetailProps = {
  locale: AppLocale;
  detail: ResolvedMuseumTopicDetail;
};

const copy = {
  zh: {
    back: "返回数字展馆",
    eyebrow: "Curated Exhibition",
    representative: "代表展陈",
    representativeDescription: "专题会优先展示内容库中与该策展线索相关的非遗项目，并随后台内容增长自动扩展。",
    empty: "该专题的代表项目正在补充中。你可以先阅读策展叙事，并从推荐展陈继续探索。",
    context: "策展线索",
    regions: "覆盖地区",
    noRegion: "待补充地区",
    recommended: "延伸观看",
    recommendedDescription: "从同一座数字展馆中继续进入相关的技艺、舞台、节令与地方故事。",
    viewAll: "浏览全部名录",
    enter: "进入展陈",
    curator: "策展札记"
  },
  en: {
    back: "Back to Museum",
    eyebrow: "Curated Exhibition",
    representative: "Representative Exhibits",
    representativeDescription:
      "The topic prioritizes heritage records related to this curatorial line and expands automatically as the CMS grows.",
    empty:
      "Representative records for this topic are still being expanded. Read the curatorial story first, then continue with recommended exhibits.",
    context: "Curatorial Lines",
    regions: "Regions",
    noRegion: "Regions to be added",
    recommended: "Further Viewing",
    recommendedDescription:
      "Continue through related techniques, stages, seasons and local stories in the same digital museum.",
    viewAll: "Browse Archive",
    enter: "Enter exhibit",
    curator: "Curator's Note"
  }
} as const;

export function MuseumTopicDetail({ locale, detail }: MuseumTopicDetailProps) {
  const text = copy[locale];
  const sections = detail.topic.sections;

  return (
    <article>
      <section className="relative min-h-[94svh] overflow-hidden bg-ink pt-28 text-rice">
        <Image
          src={detail.heroImage}
          alt={detail.displayTitle}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-72"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,15,15,0.97),rgba(15,15,15,0.56),rgba(15,15,15,0.9)),linear-gradient(180deg,rgba(15,15,15,0.08),#0f0f0f_96%)]" />
        <div className="museum-container relative z-10 flex min-h-[80svh] flex-col justify-end pb-12">
          <Link
            href="/museum"
            className="mb-auto inline-flex w-fit items-center gap-2 text-sm text-rice/72 transition hover:text-museumGold"
          >
            <ArrowLeft className="size-4" />
            {text.back}
          </Link>

          <Reveal>
            <div className="max-w-5xl">
              <div className="mb-5 flex flex-wrap items-center gap-3">
                <Badge>{text.eyebrow}</Badge>
                <span className="inline-flex items-center gap-2 text-sm text-rice/68">
                  <BookOpen className="size-4 text-museumGold" />
                  {detail.representativeItems.length} {locale === "en" ? "records" : "项展陈"}
                </span>
                <span className="inline-flex items-center gap-2 text-sm text-rice/68">
                  <MapPin className="size-4 text-museumGold" />
                  {detail.regions.length ? detail.regions.slice(0, 3).join(" / ") : text.noRegion}
                </span>
              </div>
              <p className="text-sm uppercase tracking-[0.24em] text-museumGold">{detail.displaySubtitle}</p>
              <h1 className="serif-title mt-4 max-w-4xl text-5xl font-normal leading-tight md:text-8xl">
                {detail.displayTitle}
              </h1>
              <p className="mt-7 max-w-3xl text-lg leading-8 text-rice/76 md:text-xl md:leading-9">
                {detail.displaySummary}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-b border-museumGold/18 bg-rice py-16 text-ink md:py-24">
        <div className="museum-container grid gap-10 lg:grid-cols-[0.76fr_1.24fr]">
          <Reveal>
            <p className="text-sm uppercase tracking-[0.2em] text-cinnabar">{text.curator}</p>
            <h2 className="serif-title mt-3 text-4xl font-normal leading-tight md:text-5xl">
              {detail.displayTitle}
            </h2>
          </Reveal>
          <Reveal delay={0.08} className="space-y-6">
            <p className="text-lg leading-9 text-ink/72">{detail.displayDescription}</p>
            <div className="border-l border-cinnabar/34 pl-6">
              <p className="serif-title text-3xl font-normal leading-snug text-ink">{detail.displayCuratorNote}</p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-ink py-16 text-rice md:py-24">
        <div className="museum-container">
          <div className="mb-10 grid gap-6 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
            <Reveal>
              <p className="text-sm uppercase tracking-[0.2em] text-museumGold">{text.context}</p>
              <h2 className="serif-title mt-3 text-4xl font-normal leading-tight md:text-6xl">
                {text.representative}
              </h2>
            </Reveal>
            <Reveal delay={0.08} className="max-w-2xl text-base leading-8 text-rice/62 lg:justify-self-end">
              {text.representativeDescription}
            </Reveal>
          </div>

          {detail.representativeItems.length ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {detail.representativeItems.slice(0, 6).map((item, index) => (
                <Reveal key={item.slug} delay={index * 0.05}>
                  <HeritageCard item={item} compact={index > 2} />
                </Reveal>
              ))}
            </div>
          ) : (
            <Reveal className="rounded-lg border border-museumGold/18 bg-rice/[0.045] p-10 text-center text-rice/62">
              {text.empty}
            </Reveal>
          )}
        </div>
      </section>

      <section className="border-y border-ink/10 bg-rice py-16 text-ink md:py-24">
        <div className="museum-container grid gap-5 md:grid-cols-2">
          {sections.map((section, index) => {
            const title = locale === "en" ? section.englishTitle : section.title;
            const description = locale === "en" ? section.englishDescription : section.description;

            return (
              <Reveal key={section.title} delay={index * 0.07}>
                <div className="h-full rounded-lg border border-ink/10 bg-white/58 p-7 shadow-[0_22px_60px_rgba(15,15,15,0.08)]">
                  <div className="mb-8 flex items-center justify-between gap-5">
                    <span className="text-xs uppercase tracking-[0.2em] text-cinnabar">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <Sparkles className="size-5 text-cinnabar" />
                  </div>
                  <h3 className="serif-title text-4xl font-normal leading-tight">{title}</h3>
                  <p className="mt-5 text-base leading-8 text-ink/64">{description}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section className="bg-ink py-16 text-rice md:py-24">
        <div className="museum-container">
          <div className="mb-9 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-museumGold">{text.regions}</p>
              <h2 className="serif-title mt-3 text-4xl font-normal">{text.recommended}</h2>
              <p className="mt-4 max-w-xl text-base leading-8 text-rice/58">{text.recommendedDescription}</p>
            </div>
            <Button asChild variant="outline">
              <Link href="/heritage">{text.viewAll}</Link>
            </Button>
          </div>

          {detail.recommendedItems.length ? (
            <div className="grid gap-5 md:grid-cols-3">
              {detail.recommendedItems.map((item, index) => (
                <Reveal key={item.slug} delay={index * 0.05}>
                  <Link
                    href={`/heritage/${item.slug}`}
                    className="group flex h-full min-h-[280px] flex-col justify-between rounded-lg border border-museumGold/18 bg-rice/[0.045] p-6 shadow-goldline transition duration-300 hover:-translate-y-2 hover:border-museumGold/42"
                  >
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-museumGold/72">{item.region}</p>
                      <h3 className="serif-title mt-4 text-4xl font-normal leading-tight">
                        {locale === "en" ? item.englishName || item.name : item.name}
                      </h3>
                      <p className="mt-3 line-clamp-3 text-sm leading-7 text-rice/58">{item.summary}</p>
                    </div>
                    <span className="mt-8 inline-flex items-center gap-2 text-sm text-museumGold">
                      {text.enter}
                      <ArrowUpRight className="size-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </Link>
                </Reveal>
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </article>
  );
}
