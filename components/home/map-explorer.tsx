import { useTranslations } from "next-intl";
import { Reveal } from "@/components/motion/reveal";
import { LazyChinaMapExplorerClient } from "@/components/home/lazy-china-map-explorer-client";
import { buildProvinceExplorerData } from "@/lib/content/china-map";
import type { HeritageItem } from "@/lib/types/heritage";

export function MapExplorer({ items }: { items: HeritageItem[] }) {
  const t = useTranslations("Home.map");
  const mapData = buildProvinceExplorerData(items);

  return (
    <section id="map" className="relative overflow-hidden border-y border-pine/10 bg-rice py-16 text-ink md:py-24">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_75%_20%,rgba(140,169,154,0.22),transparent_28%),linear-gradient(140deg,rgba(231,240,238,0.78),transparent_38%),linear-gradient(30deg,rgba(184,80,66,0.08),transparent_42%)]" />
      <div className="museum-container grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
        <Reveal>
          <p className="text-sm uppercase text-cinnabar">{t("eyebrow")}</p>
          <h2 className="serif-title mt-3 text-4xl font-normal leading-tight text-ink md:text-6xl">
            {t("title")}
          </h2>
          <p className="mt-6 max-w-md text-base leading-8 text-ink/62">
            {t("description")}
          </p>
          <div className="mt-8 grid max-w-sm grid-cols-2 gap-3">
            <div className="rounded-lg border border-pine/10 bg-paper/76 p-4 shadow-goldline">
              <p className="text-3xl text-pine">{mapData.groups.length}</p>
              <p className="mt-1 text-xs uppercase text-ink/42">{t("activeProvinces")}</p>
            </div>
            <div className="rounded-lg border border-pine/10 bg-paper/76 p-4 shadow-goldline">
              <p className="text-3xl text-pine">{mapData.totalCount}</p>
              <p className="mt-1 text-xs uppercase text-ink/42">{t("heritageItems")}</p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <LazyChinaMapExplorerClient data={mapData} />
        </Reveal>
      </div>
    </section>
  );
}
