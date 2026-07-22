import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

type MuseumHeroStat = {
  value: string;
  label: string;
};

type MuseumHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  primaryAction: string;
  secondaryAction: string;
  stats: MuseumHeroStat[];
};

export function MuseumHero({
  eyebrow,
  title,
  description,
  primaryAction,
  secondaryAction,
  stats
}: MuseumHeroProps) {
  return (
    <section className="relative min-h-[92vh] overflow-hidden border-b border-museumGold/18 bg-ink text-rice">
      <Image
        src="/assets/hero-museum.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-62"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_28%,rgba(200,169,106,0.18),transparent_30%),linear-gradient(90deg,rgba(15,15,15,0.94)_0%,rgba(15,15,15,0.56)_48%,rgba(15,15,15,0.26)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-ink via-ink/72 to-transparent" />

      <div className="museum-container relative flex min-h-[92vh] flex-col justify-end pb-10 pt-32 md:pb-14">
        <Reveal className="max-w-4xl">
          <p className="text-xs uppercase tracking-[0.28em] text-museumGold md:text-sm">{eyebrow}</p>
          <h1 className="serif-title mt-5 max-w-3xl text-5xl font-normal leading-[1.04] md:text-7xl lg:text-8xl">
            {title}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-rice/72 md:text-lg">{description}</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/heritage">
                {primaryAction}
                <ArrowUpRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/inheritors">{secondaryAction}</Link>
            </Button>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-px overflow-hidden rounded-lg border border-museumGold/16 bg-museumGold/16 sm:grid-cols-3 lg:max-w-3xl">
          {stats.map((stat, index) => (
            <Reveal
              key={stat.label}
              delay={0.08 + index * 0.04}
              className="bg-ink/72 px-5 py-5 backdrop-blur-md"
            >
              <div className="serif-title text-3xl text-rice md:text-4xl">{stat.value}</div>
              <div className="mt-2 text-xs uppercase tracking-[0.18em] text-rice/48">{stat.label}</div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
