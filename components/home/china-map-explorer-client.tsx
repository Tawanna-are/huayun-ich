"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import {
  getProvinceExplorerSelection,
  type ProvinceExplorerData,
  type ProvinceExplorerGroup
} from "@/lib/content/china-map";
import { cn } from "@/lib/utils";

type ChinaMapExplorerClientProps = {
  data: ProvinceExplorerData;
};

const mapOutlinePath =
  "M170 318 C207 211 302 133 435 118 C548 105 639 150 704 224 C748 274 817 282 842 360 C870 447 781 492 692 472 C604 452 573 546 477 512 C385 480 342 446 266 449 C184 453 132 401 170 318 Z";

const riverPath =
  "M222 333 C292 365 336 343 383 379 C432 416 486 405 554 433 C611 457 663 438 727 456";

export function ChinaMapExplorerClient({ data }: ChinaMapExplorerClientProps) {
  const t = useTranslations("MapExplorer");
  const [selectedProvince, setSelectedProvince] = useState(data.defaultProvince);
  const selectedGroup = getProvinceExplorerSelection(data, selectedProvince);
  const topGroups = data.groups.slice(0, 8);

  const activeItems = selectedGroup?.items ?? [];
  const activeProvince = selectedGroup?.province ?? "";

  const connectorPath = useMemo(() => {
    if (!selectedGroup) {
      return "";
    }

    return `M 450 310 Q ${selectedGroup.point.x * 9} ${selectedGroup.point.y * 6.2} ${
      selectedGroup.point.x * 9
    } ${selectedGroup.point.y * 6.2}`;
  }, [selectedGroup]);

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <div className="relative min-h-[430px] overflow-hidden rounded-lg border border-pine/12 bg-paper/78 p-4 shadow-porcelain md:p-6">
        <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-cinnabar">{t("interactive")}</p>
            <p className="mt-2 text-sm text-ink/52">{t("hint")}</p>
          </div>
          <Badge>{t("heritageCount", { count: data.totalCount })}</Badge>
        </div>

        <div className="relative aspect-[1.18/0.82] min-h-[300px]">
          <svg viewBox="0 0 900 620" className="h-full w-full" role="img" aria-label={t("mapLabel")}>
            <defs>
              <linearGradient id="mapInkFill" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0" stopColor="rgba(140,169,154,0.22)" />
                <stop offset="0.55" stopColor="rgba(231,240,238,0.72)" />
                <stop offset="1" stopColor="rgba(184,80,66,0.1)" />
              </linearGradient>
            </defs>
            <motion.path
              d={mapOutlinePath}
              fill="url(#mapInkFill)"
              stroke="rgba(54,88,78,0.42)"
              strokeWidth="2"
              initial={{ pathLength: 0, opacity: 0.4 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={{ once: true, amount: 0.45 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
            <path
              d="M305 386 C376 326 452 337 509 280 C550 238 596 243 655 260"
              fill="none"
              stroke="rgba(54,88,78,0.22)"
              strokeWidth="1.5"
            />
            <path d={riverPath} fill="none" stroke="rgba(184,80,66,0.18)" strokeWidth="1.2" />
            {connectorPath ? (
              <motion.path
                key={connectorPath}
                d={connectorPath}
                fill="none"
                stroke="rgba(184,80,66,0.32)"
                strokeDasharray="5 8"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.55 }}
              />
            ) : null}
          </svg>

          {data.groups.map((group, index) => (
            <ProvinceMarker
              key={group.province}
              group={group}
              index={index}
              selected={group.province === activeProvince}
              markerAria={t("markerAria", { province: group.province })}
              onSelect={() => setSelectedProvince(group.province)}
            />
          ))}
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1 md:hidden">
          {data.groups.map((group) => (
            <button
              key={group.province}
              type="button"
              onClick={() => setSelectedProvince(group.province)}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-sm transition",
                group.province === activeProvince
                  ? "border-pine bg-pine text-rice"
                  : "border-pine/14 text-ink/62"
              )}
            >
              {group.label}
              <span className="ml-2 text-xs opacity-70">{group.count}</span>
            </button>
          ))}
        </div>
      </div>

      <aside className="grid gap-4">
        <div className="rounded-lg border border-pine/12 bg-paper/82 p-4 shadow-goldline">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="inline-flex items-center gap-2 text-xs uppercase text-cinnabar">
                <Sparkles className="size-3" />
                {t("selectedProvince")}
              </p>
              <h3 className="serif-title mt-2 text-4xl text-ink">
                {selectedGroup?.label ?? t("emptyProvince")}
              </h3>
              <p className="mt-1 text-sm text-ink/46">{selectedGroup?.province}</p>
            </div>
            <Badge>{t("itemCount", { count: activeItems.length })}</Badge>
          </div>

          <div className="space-y-3">
            {activeItems.map((item) => (
              <Link
                key={item.slug}
                href={`/heritage/${item.slug}`}
                className="group grid grid-cols-[72px_1fr] gap-3 rounded-md border border-pine/10 bg-rice/70 p-2 transition hover:border-pine/30 hover:bg-paper"
              >
                <div className="relative aspect-square overflow-hidden rounded-md">
                  <Image src={item.image} alt={item.name} fill sizes="72px" className="object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="serif-title truncate text-xl text-ink">{item.name}</p>
                  <p className="mt-1 truncate text-xs text-ink/46">{item.region}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs text-cinnabar">
                    {t("viewItem")}
                    <ArrowRight className="size-3 transition group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            ))}
            {activeItems.length === 0 ? <p className="py-8 text-sm text-ink/46">{t("empty")}</p> : null}
          </div>

          <Button asChild variant="outline" className="mt-4 w-full">
            <Link href={`/heritage?province=${encodeURIComponent(activeProvince)}`}>{t("browseRegion")}</Link>
          </Button>
        </div>

        <div className="hidden rounded-lg border border-pine/12 bg-paper/72 p-4 shadow-goldline md:block">
          <p className="mb-3 text-xs uppercase text-cinnabar">{t("ranking")}</p>
          <div className="space-y-2">
            {topGroups.map((group) => (
              <button
                key={group.province}
                type="button"
                onClick={() => setSelectedProvince(group.province)}
                className="grid w-full grid-cols-[72px_1fr_36px] items-center gap-3 rounded-md px-2 py-2 text-left transition hover:bg-pine/6"
              >
                <span className="text-sm text-ink/68">{group.label}</span>
                <span className="h-1.5 overflow-hidden rounded-full bg-pine/10">
                  <span
                    className="block h-full rounded-full bg-pine"
                    style={{ width: `${Math.max(12, group.intensity * 100)}%` }}
                  />
                </span>
                <span className="text-right text-xs text-ink/48">{group.count}</span>
              </button>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}

function ProvinceMarker({
  group,
  index,
  selected,
  markerAria,
  onSelect
}: {
  group: ProvinceExplorerGroup;
  index: number;
  selected: boolean;
  markerAria: string;
  onSelect: () => void;
}) {
  const size = 12 + group.intensity * 16;

  return (
    <motion.button
      type="button"
      aria-label={markerAria}
      className={cn(
        "group absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full border px-3 py-2 text-xs shadow-goldline backdrop-blur transition",
        selected
          ? "border-pine bg-pine text-rice"
          : "border-pine/24 bg-paper/86 text-ink hover:border-pine hover:bg-pine hover:text-rice"
      )}
      style={{ left: `${group.point.x}%`, top: `${group.point.y}%` }}
      initial={{ opacity: 0, scale: 0.75 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ delay: index * 0.035, duration: 0.34 }}
      whileHover={{ y: -2 }}
      onClick={onSelect}
    >
      <span
        className={cn("relative grid place-items-center rounded-full", selected ? "bg-rice/14" : "bg-pine/12")}
        style={{ width: size, height: size }}
      >
        <MapPin className="size-4" />
        {selected ? <span className="absolute inset-0 rounded-full ring-2 ring-rice/35" /> : null}
      </span>
      <span className="whitespace-nowrap">{group.label}</span>
      <span className="rounded-full bg-rice/16 px-1.5 text-[10px]">{group.count}</span>
    </motion.button>
  );
}
