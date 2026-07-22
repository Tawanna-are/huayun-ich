import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import type { MuseumCuratorialStory } from "@/lib/types/museum";

type CuratorialStoriesProps = {
  locale: AppLocale;
  stories: MuseumCuratorialStory[];
  eyebrow: string;
  title: string;
  description: string;
  noteLabel: string;
  readLabel: string;
  emptyLabel: string;
};

export function CuratorialStories({
  locale,
  stories,
  eyebrow,
  title,
  description,
  noteLabel,
  readLabel,
  emptyLabel
}: CuratorialStoriesProps) {
  return (
    <section className="bg-ink py-16 text-rice md:py-24">
      <div className="museum-container">
        <div className="mb-10 max-w-3xl">
          <Reveal>
            <p className="text-sm uppercase tracking-[0.2em] text-museumGold">{eyebrow}</p>
            <h2 className="serif-title mt-3 text-4xl font-normal leading-tight md:text-6xl">{title}</h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-rice/62">{description}</p>
          </Reveal>
        </div>

        {stories.length ? (
          <div className="grid gap-5">
            {stories.map((story, index) => {
              const displayTitle = locale === "en" ? story.englishTitle || story.title : story.title;
              const displaySubtitle = locale === "en" ? story.title : story.englishTitle;

              return (
                <Reveal key={story.id} delay={index * 0.06}>
                  <Link
                    href={story.href}
                    className="group grid min-h-[360px] overflow-hidden rounded-lg border border-museumGold/18 bg-rice/[0.045] shadow-goldline transition duration-300 hover:-translate-y-1 hover:border-museumGold/42 lg:grid-cols-[0.95fr_1.05fr]"
                  >
                    <div className="relative min-h-[280px] overflow-hidden lg:min-h-[360px]">
                      <Image
                        src={story.image}
                        alt={displayTitle}
                        fill
                        sizes="(min-width: 1024px) 46vw, 100vw"
                        className="object-cover transition duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink/72 via-ink/8 to-transparent" />
                      <div className="absolute left-5 top-5 text-xs uppercase tracking-[0.2em] text-museumGold">
                        {String(index + 1).padStart(2, "0")}
                      </div>
                    </div>
                    <div className="flex flex-col justify-center p-7 md:p-10">
                      <p className="text-xs uppercase tracking-[0.18em] text-museumGold/72">{noteLabel}</p>
                      <h3 className="serif-title mt-4 text-4xl font-normal leading-tight md:text-6xl">
                        {displayTitle}
                      </h3>
                      <p className="mt-3 text-xs uppercase tracking-[0.16em] text-rice/42">{displaySubtitle}</p>
                      <p className="mt-8 max-w-2xl text-xl leading-9 text-rice/76 md:text-2xl">
                        {story.quote}
                      </p>
                      <div className="mt-9 flex items-center justify-between gap-4 border-t border-rice/10 pt-5">
                        <span className="text-sm text-rice/46">{story.region}</span>
                        <span className="inline-flex items-center gap-2 text-sm text-museumGold">
                          {readLabel}
                          <ArrowUpRight className="size-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </span>
                      </div>
                    </div>
                  </Link>
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
