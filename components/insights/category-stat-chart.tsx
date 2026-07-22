import { Reveal } from "@/components/motion/reveal";
import type { AppLocale } from "@/i18n/routing";
import type { InsightCategoryStat } from "@/lib/content/heritage-insights";

type CategoryStatChartProps = {
  locale: AppLocale;
  data: InsightCategoryStat[];
};

const copy = {
  zh: {
    eyebrow: "Category Statistics",
    title: "分类统计图",
    description: "以五大非遗分类观察内容库结构，帮助策展时发现哪些门类已经丰满，哪些门类仍需补充。",
    records: "项"
  },
  en: {
    eyebrow: "Category Statistics",
    title: "Category Statistics",
    description:
      "The five heritage categories reveal where the archive is rich and where future curation should add more records.",
    records: "records"
  }
} as const;

export function CategoryStatChart({ locale, data }: CategoryStatChartProps) {
  const text = copy[locale];

  return (
    <section className="bg-ink py-16 text-rice md:py-24">
      <div className="museum-container grid gap-10 lg:grid-cols-[0.7fr_1.3fr]">
        <Reveal>
          <p className="text-sm uppercase tracking-[0.2em] text-museumGold">{text.eyebrow}</p>
          <h2 className="serif-title mt-3 text-4xl font-normal leading-tight md:text-6xl">{text.title}</h2>
          <p className="mt-6 max-w-md text-base leading-8 text-rice/62">{text.description}</p>
        </Reveal>

        <div className="grid gap-4">
          {data.map((category, index) => {
            const label = locale === "en" ? category.englishLabel : category.label;

            return (
              <Reveal key={category.slug} delay={index * 0.05}>
                <div className="rounded-lg border border-museumGold/18 bg-rice/[0.045] p-5 shadow-goldline">
                  <div className="mb-4 flex items-start justify-between gap-5">
                    <div>
                      <p className="serif-title text-3xl font-normal">{label}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.14em] text-rice/42">{category.slug}</p>
                    </div>
                    <div className="text-right">
                      <p className="serif-title text-4xl font-normal text-museumGold">{category.percentage}%</p>
                      <p className="text-xs text-rice/42">
                        {category.count} {text.records}
                      </p>
                    </div>
                  </div>
                  <span className="block h-2 overflow-hidden rounded-full bg-rice/10">
                    <span className="block h-full rounded-full bg-museumGold" style={{ width: `${category.percentage}%` }} />
                  </span>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
