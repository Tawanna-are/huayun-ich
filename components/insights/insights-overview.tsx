import { Reveal } from "@/components/motion/reveal";
import type { AppLocale } from "@/i18n/routing";
import type { HeritageInsights } from "@/lib/content/heritage-insights";

type InsightsOverviewProps = {
  locale: AppLocale;
  insights: HeritageInsights;
};

const copy = {
  zh: {
    eyebrow: "Data Gallery",
    title: "数据洞察",
    description: "以数据作为新的策展材料，把地域、时间、门类与传承关系转化为可阅读的数字展陈。",
    heat: "热力地区",
    periods: "历史时期",
    categories: "内容分类",
    links: "关系连接"
  },
  en: {
    eyebrow: "Data Gallery",
    title: "Data Insights",
    description:
      "Data becomes a curatorial material, turning geography, time, categories and transmission into readable digital exhibits.",
    heat: "Heat Regions",
    periods: "Periods",
    categories: "Categories",
    links: "Relations"
  }
} as const;

export function InsightsOverview({ locale, insights }: InsightsOverviewProps) {
  const text = copy[locale];
  const stats = [
    { value: insights.heatMap.provinces.length, label: text.heat },
    { value: insights.timeline.periods.filter((period) => period.count > 0).length, label: text.periods },
    { value: insights.categories.length, label: text.categories },
    { value: insights.graph.links.length, label: text.links }
  ];

  return (
    <section className="relative min-h-[78svh] overflow-hidden bg-ink pt-32 text-rice">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_18%,rgba(200,169,106,0.2),transparent_28%),linear-gradient(135deg,rgba(178,34,34,0.16),transparent_42%),linear-gradient(180deg,rgba(15,15,15,0),#0f0f0f_96%)]" />
      <div className="museum-container relative z-10 flex min-h-[62svh] flex-col justify-end pb-14">
        <Reveal>
          <p className="text-sm uppercase tracking-[0.24em] text-museumGold">{text.eyebrow}</p>
          <h1 className="serif-title mt-4 max-w-4xl text-6xl font-normal leading-tight md:text-8xl">{text.title}</h1>
          <p className="mt-7 max-w-2xl text-lg leading-9 text-rice/72">{text.description}</p>
        </Reveal>
        <div className="mt-10 grid gap-3 md:grid-cols-4">
          {stats.map((stat, index) => (
            <Reveal key={stat.label} delay={index * 0.05}>
              <div className="rounded-lg border border-museumGold/18 bg-rice/[0.045] p-5 shadow-goldline">
                <p className="serif-title text-5xl font-normal">{stat.value}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.16em] text-rice/42">{stat.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
