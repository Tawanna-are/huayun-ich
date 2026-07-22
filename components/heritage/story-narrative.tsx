import { Reveal } from "@/components/motion/reveal";
import type { StoryPanel } from "@/lib/content/heritage-storytelling";
import type { HeritageItem } from "@/lib/types/heritage";

type StoryNarrativeProps = {
  item: HeritageItem;
  panels: StoryPanel[];
  eyebrow: string;
  title: string;
  description: string;
};

export function StoryNarrative({ item, panels, eyebrow, title, description }: StoryNarrativeProps) {
  return (
    <section id="story" className="bg-rice py-16 text-ink md:py-24">
      <div className="museum-container grid gap-12 lg:grid-cols-[0.42fr_1fr]">
        <aside className="lg:sticky lg:top-28 lg:h-fit">
          <Reveal>
            <p className="text-sm uppercase text-cinnabar">{eyebrow}</p>
            <h2 className="serif-title mt-3 text-4xl font-normal leading-tight md:text-6xl">{title}</h2>
            <p className="mt-6 max-w-md text-base leading-8 text-ink/64">{description}</p>
            <div className="gold-rule mt-9" />
          </Reveal>
        </aside>

        <div className="grid gap-5">
          {panels.map((panel, index) => (
            <Reveal key={panel.id} delay={index * 0.06}>
              <article
                id={panel.id}
                className="scroll-mt-28 border-t border-ink/10 py-8 first:border-t-0 md:grid md:grid-cols-[0.72fr_1.28fr] md:gap-10 md:py-12"
              >
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-cinnabar">{panel.eyebrow}</p>
                  <h3 className="serif-title mt-4 text-4xl font-normal leading-tight">{panel.title}</h3>
                  <div className="mt-7 border-l border-cinnabar/36 pl-5">
                    <p className="serif-title break-words text-4xl text-cinnabar">{panel.stat}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.16em] text-ink/42">{panel.statLabel}</p>
                  </div>
                </div>
                <div className="mt-7 space-y-5 text-lg leading-9 text-ink/72 md:mt-0">
                  {panel.body.split("\n\n").map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </article>
            </Reveal>
          ))}
          <p className="sr-only">{item.name}</p>
        </div>
      </div>
    </section>
  );
}
