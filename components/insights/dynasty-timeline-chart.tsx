import { Reveal } from "@/components/motion/reveal";
import type { AppLocale } from "@/i18n/routing";
import type { InsightTimeline } from "@/lib/content/heritage-insights";

type DynastyTimelineChartProps = {
  locale: AppLocale;
  data: InsightTimeline;
};

const copy = {
  zh: {
    eyebrow: "Historical Timeline",
    title: "朝代时间轴",
    description: "把项目源流中的时代线索整理为可阅读的历史带，观察非遗如何跨越制度、城市与日常生活继续流动。",
    empty: "暂无时间线数据"
  },
  en: {
    eyebrow: "Historical Timeline",
    title: "Dynasty Timeline",
    description:
      "Historical cues from each record are arranged into broad periods, showing how living heritage moves across dynasties, cities and everyday life.",
    empty: "No timeline data"
  }
} as const;

export function DynastyTimelineChart({ locale, data }: DynastyTimelineChartProps) {
  const text = copy[locale];
  const maxCount = Math.max(1, ...data.periods.map((period) => period.count));

  return (
    <section className="border-y border-ink/10 bg-rice py-16 text-ink md:py-24">
      <div className="museum-container">
        <div className="mb-10 grid gap-6 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
          <Reveal>
            <p className="text-sm uppercase tracking-[0.2em] text-cinnabar">{text.eyebrow}</p>
            <h2 className="serif-title mt-3 text-4xl font-normal leading-tight md:text-6xl">{text.title}</h2>
          </Reveal>
          <Reveal delay={0.08} className="max-w-2xl text-base leading-8 text-ink/62 lg:justify-self-end">
            {text.description}
          </Reveal>
        </div>

        <div className="overflow-hidden rounded-lg border border-ink/10 bg-white/58 shadow-[0_22px_60px_rgba(15,15,15,0.08)]">
          {data.periods.map((period, index) => {
            const label = locale === "en" ? period.englishLabel : period.label;
            const width = `${Math.max(8, (period.count / maxCount) * 100)}%`;

            return (
              <Reveal key={period.id} delay={index * 0.04}>
                <div className="grid gap-4 border-b border-ink/10 p-5 last:border-b-0 md:grid-cols-[160px_1fr_88px] md:items-center">
                  <div>
                    <p className="serif-title text-3xl font-normal">{label}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.14em] text-ink/42">{period.range}</p>
                  </div>
                  <div>
                    <span className="block h-2 overflow-hidden rounded-full bg-ink/10">
                      <span className="block h-full rounded-full bg-cinnabar" style={{ width }} />
                    </span>
                    <p className="mt-3 line-clamp-1 text-sm text-ink/52">
                      {period.items.length ? period.items.slice(0, 3).map((item) => item.name).join(" / ") : text.empty}
                    </p>
                  </div>
                  <p className="serif-title text-right text-4xl font-normal text-cinnabar">{period.count}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
