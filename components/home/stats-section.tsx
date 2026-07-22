import { useTranslations } from "next-intl";
import { CountUp } from "@/components/motion/count-up";
import { Reveal } from "@/components/motion/reveal";
import type { HeritageItem } from "@/lib/types/heritage";

export function StatsSection({ items }: { items: HeritageItem[] }) {
  const t = useTranslations("Home.stats");
  const provinceCount = new Set(items.map((item) => item.province)).size;
  const categoryCount = new Set(items.map((item) => item.categorySlug)).size;
  const stats = [
    { value: 1557, label: t("national"), suffix: "+" },
    { value: 43, label: t("unesco"), suffix: "" },
    { value: provinceCount, label: t("provinces"), suffix: "" },
    { value: categoryCount, label: t("categories"), suffix: "" }
  ];

  return (
    <section className="border-y border-pine/10 bg-mist/70 py-12 md:py-16">
      <div className="museum-container grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Reveal key={stat.label} delay={index * 0.06}>
            <div className="rounded-lg border border-pine/10 bg-paper/78 p-6 shadow-goldline">
              <div className="serif-title text-4xl text-pine md:text-5xl">
                <CountUp value={stat.value} suffix={stat.suffix} />
              </div>
              <p className="mt-3 text-sm text-ink/56">{stat.label}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
