import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { FavoriteButton } from "@/components/user/favorite-button";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import type { MuseumFeaturedTopic } from "@/lib/types/museum";

type FeaturedTopicsProps = {
  locale: AppLocale;
  topics: MuseumFeaturedTopic[];
  eyebrow: string;
  title: string;
  description: string;
  viewLabel: string;
  countLabel: string;
  emptyLabel: string;
};

export function FeaturedTopics({
  locale,
  topics,
  eyebrow,
  title,
  description,
  viewLabel,
  countLabel,
  emptyLabel
}: FeaturedTopicsProps) {
  return (
    <section className="bg-ink py-16 text-rice md:py-24">
      <div className="museum-container">
        <div className="mb-10 grid gap-6 md:grid-cols-[0.8fr_1.2fr] md:items-end">
          <Reveal>
            <p className="text-sm uppercase tracking-[0.2em] text-museumGold">{eyebrow}</p>
            <h2 className="serif-title mt-3 text-4xl font-normal leading-tight md:text-6xl">{title}</h2>
          </Reveal>
          <Reveal delay={0.08} className="max-w-2xl text-base leading-8 text-rice/62 md:justify-self-end">
            {description}
          </Reveal>
        </div>

        {topics.length ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {topics.map((topic, index) => {
              const displayTitle = locale === "en" ? topic.englishTitle : topic.title;
              const displaySubtitle = locale === "en" ? topic.title : topic.englishTitle;

              return (
                <Reveal key={topic.id} delay={index * 0.05}>
                  <article className="group relative h-full">
                    <div className="absolute right-4 top-4 z-30">
                      <FavoriteButton targetType="museum_topic" targetId={topic.id} compact />
                    </div>
                    <Link
                      href={topic.href}
                      className="flex h-full min-h-[380px] flex-col overflow-hidden rounded-lg border border-museumGold/18 bg-rice/[0.045] shadow-goldline transition duration-300 hover:-translate-y-2 hover:border-museumGold/42 hover:bg-rice/[0.07]"
                    >
                      <div className="relative aspect-[0.92/1] overflow-hidden">
                        <Image
                          src={topic.image}
                          alt={displayTitle}
                          fill
                          sizes="(min-width: 1024px) 20vw, (min-width: 768px) 50vw, 100vw"
                          className="object-cover transition duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/28 to-transparent" />
                        <div className="absolute left-4 top-4 text-xs uppercase tracking-[0.18em] text-museumGold/80">
                          {String(index + 1).padStart(2, "0")}
                        </div>
                      </div>
                      <div className="flex flex-1 flex-col p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="serif-title text-3xl font-normal leading-tight">{displayTitle}</h3>
                            <p className="mt-2 text-xs uppercase tracking-[0.14em] text-museumGold/68">
                              {displaySubtitle}
                            </p>
                          </div>
                          <ArrowUpRight className="mt-1 size-5 shrink-0 text-museumGold transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </div>
                        <p className="mt-4 line-clamp-3 text-sm leading-7 text-rice/58">{topic.summary}</p>
                        <p className="mt-auto pt-6 text-xs uppercase tracking-[0.16em] text-rice/42">
                          {topic.count} {countLabel}
                        </p>
                        <span className="mt-3 text-sm text-museumGold">{viewLabel}</span>
                      </div>
                    </Link>
                  </article>
                </Reveal>
              );
            })}
          </div>
        ) : (
          <Reveal className="rounded-lg border border-museumGold/18 bg-rice/[0.035] p-10 text-center text-rice/58">
            {emptyLabel}
          </Reveal>
        )}
      </div>
    </section>
  );
}
