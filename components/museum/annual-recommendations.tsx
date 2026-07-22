import Image from "next/image";
import { ArrowUpRight, MapPin } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import type { HeritageItem } from "@/lib/types/heritage";

type AnnualRecommendationsProps = {
  locale: AppLocale;
  items: HeritageItem[];
  eyebrow: string;
  title: string;
  description: string;
  yearLabel: string;
  viewLabel: string;
  emptyLabel: string;
};

export function AnnualRecommendations({
  locale,
  items,
  eyebrow,
  title,
  description,
  yearLabel,
  viewLabel,
  emptyLabel
}: AnnualRecommendationsProps) {
  return (
    <section className="border-y border-museumGold/16 bg-rice py-16 text-ink md:py-24">
      <div className="museum-container">
        <div className="mb-10 grid gap-6 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
          <Reveal>
            <p className="text-sm uppercase tracking-[0.2em] text-cinnabar">{eyebrow}</p>
            <h2 className="serif-title mt-3 text-4xl font-normal leading-tight md:text-6xl">{title}</h2>
          </Reveal>
          <Reveal delay={0.08} className="max-w-2xl text-base leading-8 text-ink/62 lg:justify-self-end">
            {description}
          </Reveal>
        </div>

        {items.length ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item, index) => {
              const displayTitle = locale === "en" ? item.englishName || item.name : item.name;
              const displaySubtitle = locale === "en" ? item.name : item.englishName;

              return (
                <Reveal key={item.slug} delay={index * 0.05}>
                  <Link
                    href={`/heritage/${item.slug}`}
                    className="group flex h-full min-h-[440px] flex-col overflow-hidden rounded-lg border border-ink/10 bg-white/42 shadow-[0_22px_60px_rgba(15,15,15,0.08)] transition duration-300 hover:-translate-y-2 hover:border-cinnabar/32"
                  >
                    <div className="relative aspect-[1.12/0.78] overflow-hidden">
                      <Image
                        src={item.heroImage || item.image}
                        alt={displayTitle}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                        className="object-cover transition duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink/72 via-ink/8 to-transparent" />
                      <div className="absolute left-4 top-4">
                        <Badge>{item.categoryName}</Badge>
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <div className="flex items-start justify-between gap-5">
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-cinnabar">
                            {item.inscriptionYear} / {yearLabel}
                          </p>
                          <h3 className="serif-title mt-3 text-3xl font-normal leading-tight md:text-4xl">
                            {displayTitle}
                          </h3>
                          <p className="mt-2 text-xs uppercase tracking-[0.14em] text-ink/42">
                            {displaySubtitle}
                          </p>
                        </div>
                        <ArrowUpRight className="mt-1 size-5 shrink-0 text-cinnabar transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </div>
                      <p className="mt-5 line-clamp-3 text-sm leading-7 text-ink/62">{item.summary}</p>
                      <div className="mt-auto flex items-center justify-between gap-4 pt-7">
                        <span className="inline-flex items-center gap-2 text-xs text-ink/48">
                          <MapPin className="size-4 text-cinnabar" />
                          {item.region}
                        </span>
                        <span className="text-sm text-cinnabar">{viewLabel}</span>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        ) : (
          <Reveal className="rounded-lg border border-ink/10 bg-white/44 p-10 text-center text-ink/54">
            {emptyLabel}
          </Reveal>
        )}
      </div>
    </section>
  );
}
