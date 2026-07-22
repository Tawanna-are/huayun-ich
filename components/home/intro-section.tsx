import { useTranslations } from "next-intl";
import { Reveal } from "@/components/motion/reveal";

export function IntroSection() {
  const t = useTranslations("Home.intro");

  return (
    <section className="bg-paper py-16 text-ink md:py-24">
      <div className="museum-container grid gap-10 md:grid-cols-[0.9fr_1.1fr] md:items-end">
        <Reveal>
          <p className="text-sm uppercase text-cinnabar">{t("eyebrow")}</p>
          <h2 className="serif-title mt-4 text-4xl font-normal leading-tight md:text-6xl">
            {t("title")}
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="text-lg leading-9 text-ink/70">
            {t("description")}
          </p>
          <div className="gold-rule mt-10" />
        </Reveal>
      </div>
    </section>
  );
}
