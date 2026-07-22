import Image from "next/image";
import { ArrowUpRight, Share2 } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import type { CampaignCard } from "@/lib/content/multichannel-content";

type CampaignIndexProps = {
  locale: AppLocale;
  campaigns: CampaignCard[];
};

const copy = {
  zh: {
    eyebrow: "H5 Campaigns",
    title: "可分享的非遗专题",
    description: "为移动端传播设计的轻量专题页，把非遗馆藏转化为适合节庆、教育与社交分享的叙事入口。",
    count: "个关联项目",
    open: "进入活动"
  },
  en: {
    eyebrow: "H5 Campaigns",
    title: "Shareable Heritage Campaigns",
    description:
      "Mobile-first campaign pages turn the archive into concise cultural stories for festivals, education and social sharing.",
    count: "linked items",
    open: "Open campaign"
  }
} as const;

export function CampaignIndex({ locale, campaigns }: CampaignIndexProps) {
  const text = copy[locale];

  return (
    <>
      <section className="relative overflow-hidden border-b border-museumGold/18 bg-ink pt-32 text-rice">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_26%_20%,rgba(200,169,106,0.16),transparent_28%),linear-gradient(180deg,rgba(178,34,34,0.16),transparent_48%)]" />
        <div className="museum-container grid min-h-[68vh] gap-10 pb-14 md:grid-cols-[0.9fr_1.1fr] md:items-end">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.26em] text-museumGold">{text.eyebrow}</p>
            <h1 className="serif-title mt-5 max-w-3xl text-5xl font-normal leading-[1.05] md:text-7xl">
              {text.title}
            </h1>
          </Reveal>
          <Reveal delay={0.08} className="max-w-xl md:justify-self-end">
            <Share2 className="mb-5 size-7 text-museumGold" />
            <p className="text-base leading-8 text-rice/68 md:text-lg">{text.description}</p>
          </Reveal>
        </div>
      </section>

      <section className="bg-rice py-12 text-ink md:py-20">
        <div className="museum-container grid gap-4 md:grid-cols-2">
          {campaigns.map((campaign, index) => {
            const title = locale === "en" ? campaign.englishTitle : campaign.title;
            const summary = locale === "en" ? campaign.englishSummary : campaign.summary;

            return (
              <Reveal key={campaign.slug} delay={index * 0.05}>
                <Link
                  href={campaign.href}
                  className="group grid h-full overflow-hidden rounded-lg border border-ink/10 bg-white/70 shadow-[0_20px_54px_rgba(15,15,15,0.08)] transition duration-300 hover:-translate-y-1 hover:border-museumGold/50 md:grid-cols-[0.9fr_1.1fr]"
                >
                  <div className="relative min-h-[260px] overflow-hidden">
                    <Image
                      src={campaign.heroImage}
                      alt={title}
                      fill
                      sizes="(min-width: 768px) 38vw, 100vw"
                      className="object-cover transition duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/50 to-transparent" />
                    <span
                      className="absolute left-4 top-4 h-1 w-16 rounded-full"
                      style={{ backgroundColor: campaign.accent }}
                    />
                  </div>
                  <div className="flex min-h-[260px] flex-col p-6">
                    <p className="text-xs uppercase tracking-[0.18em] text-ink/42">
                      {String(index + 1).padStart(2, "0")}
                    </p>
                    <h2 className="serif-title mt-4 text-4xl font-normal leading-tight">{title}</h2>
                    <p className="mt-4 line-clamp-3 text-sm leading-7 text-ink/62">{summary}</p>
                    <div className="mt-auto flex items-center justify-between gap-4 pt-8">
                      <span className="text-xs uppercase tracking-[0.14em] text-ink/42">
                        {campaign.itemCount} {text.count}
                      </span>
                      <span className="inline-flex items-center gap-2 text-sm text-cinnabar">
                        {text.open}
                        <ArrowUpRight className="size-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>
    </>
  );
}
