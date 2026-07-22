import { MapPin } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import type { InsightHeatMap } from "@/lib/content/heritage-insights";

type HeritageHeatMapProps = {
  locale: AppLocale;
  data: InsightHeatMap;
};

const copy = {
  zh: {
    eyebrow: "Geo Heatmap",
    title: "非遗分布热力图",
    description: "按省份聚合当前内容库中的非遗项目，观察舞台、手作、节庆与地方生活如何在地理空间中形成密度。",
    total: "收录项目",
    active: "活跃地区",
    empty: "暂无地区数据",
    view: "查看地区"
  },
  en: {
    eyebrow: "Geo Heatmap",
    title: "Heritage Distribution Heat Map",
    description:
      "Province-level density reveals how stages, crafts, festivals and local life form visible cultural clusters.",
    total: "Records",
    active: "Active Regions",
    empty: "No regional data",
    view: "View region"
  }
} as const;

export function HeritageHeatMap({ locale, data }: HeritageHeatMapProps) {
  const text = copy[locale];
  const topProvinces = data.provinces.slice(0, 6);

  return (
    <section className="bg-ink py-16 text-rice md:py-24">
      <div className="museum-container grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
        <Reveal>
          <p className="text-sm uppercase tracking-[0.2em] text-museumGold">{text.eyebrow}</p>
          <h2 className="serif-title mt-3 text-4xl font-normal leading-tight md:text-6xl">{text.title}</h2>
          <p className="mt-6 max-w-md text-base leading-8 text-rice/62">{text.description}</p>
          <div className="mt-8 grid max-w-sm grid-cols-2 gap-3">
            <div className="rounded-lg border border-museumGold/18 bg-rice/[0.04] p-4">
              <p className="serif-title text-4xl">{data.totalCount}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.14em] text-rice/42">{text.total}</p>
            </div>
            <div className="rounded-lg border border-museumGold/18 bg-rice/[0.04] p-4">
              <p className="serif-title text-4xl">{data.provinces.length}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.14em] text-rice/42">{text.active}</p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
            <div className="relative min-h-[420px] overflow-hidden rounded-lg border border-museumGold/18 bg-rice/[0.035] p-5 shadow-museum">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_18%,rgba(200,169,106,0.16),transparent_30%),linear-gradient(135deg,rgba(148,169,149,0.13),transparent_42%)]" />
              <svg viewBox="0 0 900 620" className="relative z-10 h-full min-h-[360px] w-full" role="img" aria-label={text.title}>
                <path
                  d="M170 318 C207 211 302 133 435 118 C548 105 639 150 704 224 C748 274 817 282 842 360 C870 447 781 492 692 472 C604 452 573 546 477 512 C385 480 342 446 266 449 C184 453 132 401 170 318 Z"
                  fill="rgba(248,246,242,0.045)"
                  stroke="rgba(200,169,106,0.42)"
                  strokeWidth="2"
                />
                <path
                  d="M222 333 C292 365 336 343 383 379 C432 416 486 405 554 433 C611 457 663 438 727 456"
                  fill="none"
                  stroke="rgba(248,246,242,0.12)"
                  strokeWidth="1.3"
                />
                {data.provinces.map((province) => {
                  const radius = 10 + province.intensity * 22;
                  const cx = province.x * 9;
                  const cy = province.y * 6.2;

                  return (
                    <g key={province.province}>
                      <circle cx={cx} cy={cy} r={radius * 1.8} fill="rgba(178,34,34,0.08)" />
                      <circle cx={cx} cy={cy} r={radius} fill="rgba(200,169,106,0.42)" />
                      <circle cx={cx} cy={cy} r={Math.max(4, radius * 0.38)} fill="#C8A96A" />
                      <text x={cx + radius + 5} y={cy + 4} fill="rgba(248,246,242,0.72)" fontSize="18">
                        {province.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            <aside className="rounded-lg border border-museumGold/18 bg-rice/[0.045] p-5">
              <div className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-museumGold">
                <MapPin className="size-4" />
                {text.active}
              </div>
              {topProvinces.length ? (
                <div className="space-y-3">
                  {topProvinces.map((province) => (
                    <Link
                      key={province.province}
                      href={`/heritage?province=${encodeURIComponent(province.province)}`}
                      className="group block rounded-md border border-rice/8 bg-ink/42 p-3 transition hover:border-museumGold/40"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="serif-title text-2xl">{province.label}</span>
                        <span className="text-sm text-museumGold">{province.count}</span>
                      </div>
                      <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-rice/10">
                        <span className="block h-full rounded-full bg-museumGold" style={{ width: `${province.intensity * 100}%` }} />
                      </span>
                      <span className="mt-3 block text-xs text-rice/42 group-hover:text-museumGold">{text.view}</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-rice/52">{text.empty}</p>
              )}
            </aside>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
