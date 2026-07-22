import { Reveal } from "@/components/motion/reveal";
import type { AppLocale } from "@/i18n/routing";
import type { InsightGraph, InsightGraphNodeType } from "@/lib/content/heritage-insights";

type InheritanceGraphProps = {
  locale: AppLocale;
  data: InsightGraph;
};

const copy = {
  zh: {
    eyebrow: "Transmission Network",
    title: "传承关系图谱",
    description: "把项目、传承人、地区和分类连接为一张轻量网络，呈现非遗不是孤立条目，而是一组持续发生的关系。",
    empty: "暂无关系数据"
  },
  en: {
    eyebrow: "Transmission Network",
    title: "Inheritance Relationship Graph",
    description:
      "Heritage items, inheritors, regions and categories form a light network, showing living heritage as a system of relationships.",
    empty: "No relationship data"
  }
} as const;

const colorByType: Record<InsightGraphNodeType, string> = {
  heritage: "#C8A96A",
  inheritor: "#B22222",
  category: "#94A995",
  province: "#DCE7EA"
};

export function InheritanceGraph({ locale, data }: InheritanceGraphProps) {
  const text = copy[locale];

  return (
    <section className="border-y border-museumGold/16 bg-rice py-16 text-ink md:py-24">
      <div className="museum-container grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
        <Reveal>
          <p className="text-sm uppercase tracking-[0.2em] text-cinnabar">{text.eyebrow}</p>
          <h2 className="serif-title mt-3 text-4xl font-normal leading-tight md:text-6xl">{text.title}</h2>
          <p className="mt-6 max-w-md text-base leading-8 text-ink/62">{text.description}</p>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="overflow-hidden rounded-lg border border-ink/10 bg-white/62 p-5 shadow-[0_22px_60px_rgba(15,15,15,0.08)]">
            {data.nodes.length ? (
              <svg viewBox="0 0 900 560" className="h-[460px] w-full" role="img" aria-label={text.title}>
                <defs>
                  <filter id="nodeGlow" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                {data.links.map((link, index) => {
                  const source = data.nodes.find((node) => node.id === link.source);
                  const target = data.nodes.find((node) => node.id === link.target);

                  if (!source || !target) {
                    return null;
                  }

                  return (
                    <line
                      key={`${link.source}-${link.target}-${index}`}
                      x1={source.x * 9}
                      y1={source.y * 5.6}
                      x2={target.x * 9}
                      y2={target.y * 5.6}
                      stroke="rgba(15,15,15,0.18)"
                      strokeWidth="1.4"
                    />
                  );
                })}
                {data.nodes.map((node) => {
                  const radius = Math.min(22, 9 + node.weight * 2.5);
                  const fill = colorByType[node.type];

                  return (
                    <g key={node.id} filter={node.type === "heritage" ? "url(#nodeGlow)" : undefined}>
                      <circle cx={node.x * 9} cy={node.y * 5.6} r={radius} fill={fill} opacity={node.type === "province" ? 0.68 : 0.9} />
                      <text
                        x={node.x * 9 + radius + 5}
                        y={node.y * 5.6 + 4}
                        fill="rgba(15,15,15,0.72)"
                        fontSize="15"
                      >
                        {node.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            ) : (
              <p className="py-20 text-center text-ink/52">{text.empty}</p>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
