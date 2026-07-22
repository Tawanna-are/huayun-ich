import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { ParallaxImage } from "@/components/motion/parallax-image";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { HeritageItem } from "@/lib/types/heritage";

export function StorySection({ item }: { item: HeritageItem }) {
  const t = useTranslations("Home.story");

  return (
    <section id="stories" className="bg-paper py-16 text-ink md:py-24">
      <div className="museum-container grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
        <Reveal className="relative h-[520px] overflow-hidden rounded-lg border border-pine/10 shadow-porcelain">
          <ParallaxImage src={item.inheritor.image} alt={item.inheritor.name} className="h-full" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/38 to-transparent" />
        </Reveal>
        <Reveal delay={0.08}>
          <p className="text-sm uppercase text-cinnabar">{t("eyebrow")}</p>
          <h2 className="serif-title mt-3 text-4xl font-normal leading-tight md:text-6xl">
            {t("title")}
          </h2>
          <p className="mt-6 text-lg leading-9 text-ink/70">
            {item.inheritor.bio}
          </p>
          <div className="mt-7 border-l border-cinnabar/44 bg-mist/50 py-4 pl-5">
            <p className="serif-title text-3xl">{item.inheritor.name}</p>
            <p className="mt-2 text-sm text-ink/52">{item.inheritor.title}</p>
          </div>
          <Button asChild className="mt-9">
            <Link href={`/heritage/${item.slug}`}>
              {t("read")}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
