"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Search, SlidersHorizontal } from "lucide-react";
import { HeritageCard, type HeritageCardVariant } from "@/components/heritage/heritage-card";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { HeritageCategory, HeritageItem } from "@/lib/types/heritage";
import { filterHeritageItems } from "@/lib/content/heritage-filters";
import { cn } from "@/lib/utils";

type FilterValue = "all" | string;

type HeritageListClientProps = {
  items: HeritageItem[];
  categories: HeritageCategory[];
  provinces: string[];
  initialCategory?: string;
  initialProvince?: string;
  initialQuery?: string;
};

type SemanticSearchPayload = {
  items: HeritageItem[];
  mode: "vector" | "local" | "empty";
  query: string;
};

const collectionPlacements = [
  { className: "lg:col-span-7", variant: "feature" },
  { className: "lg:col-span-4 lg:col-start-9 lg:mt-24", variant: "standard" },
  { className: "lg:col-span-4 lg:mt-8", variant: "standard" },
  { className: "lg:col-span-7 lg:col-start-6", variant: "feature" },
  { className: "lg:col-span-5", variant: "wide" },
  { className: "lg:col-span-5 lg:col-start-8 lg:mt-20", variant: "wide" }
] satisfies Array<{ className: string; variant: HeritageCardVariant }>;

export function HeritageListClient({
  items,
  categories,
  provinces,
  initialCategory,
  initialProvince,
  initialQuery
}: HeritageListClientProps) {
  const t = useTranslations("HeritageList");
  const locale = useLocale();
  const [query, setQuery] = useState(initialQuery ?? "");
  const [category, setCategory] = useState<FilterValue>(initialCategory ?? "all");
  const [province, setProvince] = useState<FilterValue>(initialProvince ?? "all");
  const [semanticItems, setSemanticItems] = useState<HeritageItem[] | null>(null);
  const [isSemanticSearching, setIsSemanticSearching] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const searchStateLabel = isSemanticSearching
    ? t("searching")
    : semanticItems
      ? t("semanticSearch")
      : t("collectionView");

  const localFilteredItems = useMemo(() => {
    return filterHeritageItems(items, { query, category, province });
  }, [category, items, province, query]);
  const filteredItems = semanticItems ?? localFilteredItems;

  useEffect(() => {
    const trimmedQuery = query.trim();

    setSemanticItems(null);

    if (!trimmedQuery) {
      setIsSemanticSearching(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setIsSemanticSearching(true);

      try {
        const response = await fetch("/api/search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            query: trimmedQuery,
            locale,
            category,
            province,
            limit: 24
          }),
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error("Semantic search failed.");
        }

        const payload = (await response.json()) as SemanticSearchPayload;
        setSemanticItems(payload.items);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Semantic search failed:", error instanceof Error ? error.message : error);
          setSemanticItems(null);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsSemanticSearching(false);
        }
      }
    }, 260);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [category, locale, province, query]);

  return (
    <section className="bg-[#f4f1ea] py-8 text-[#18231e] md:py-12">
      <div className="museum-container">
        <Reveal>
          <div className="grid gap-3 border-b border-[#31594c]/12 pb-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-0 top-1/2 size-4 -translate-y-1/2 text-[#66716b]" />
              <Input
                className="h-12 rounded-none border-0 border-b border-[#31594c]/20 bg-transparent px-0 pl-7 shadow-none focus-visible:ring-0"
                placeholder={t("searchPlaceholder")}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <Button
              type="button"
              variant="ghost"
              className="justify-self-start rounded-none px-0 text-[#59645e] hover:bg-transparent hover:text-[#18231e] sm:justify-self-end"
              aria-expanded={filtersOpen}
              aria-controls="heritage-filters"
              onClick={() => setFiltersOpen((open) => !open)}
            >
              <SlidersHorizontal className="size-4" />
              {filtersOpen ? t("hideFilters") : t("filters")}
            </Button>
          </div>
        </Reveal>

        {filtersOpen ? (
          <div id="heritage-filters" className="grid gap-6 border-b border-[#31594c]/10 py-6 md:grid-cols-2">
            <div>
              <p className="mb-3 text-[11px] uppercase text-[#7a847e]">{t("category")}</p>
              <div className="flex flex-wrap gap-x-1 gap-y-2">
                <Button
                  type="button"
                  size="sm"
                  variant={category === "all" ? "secondary" : "ghost"}
                  onClick={() => setCategory("all")}
                >
                  {t("all")}
                </Button>
                {categories.map((item) => (
                  <Button
                    key={item.slug}
                    type="button"
                    size="sm"
                    variant={category === item.slug ? "secondary" : "ghost"}
                    className={cn(category === item.slug && "text-ink")}
                    onClick={() => setCategory(item.slug)}
                  >
                    {locale === "en" ? item.englishName || item.name : item.name}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-3 text-[11px] uppercase text-[#7a847e]">{t("region")}</p>
              <div className="flex flex-wrap gap-x-1 gap-y-2">
                <Button
                  type="button"
                  size="sm"
                  variant={province === "all" ? "secondary" : "ghost"}
                  onClick={() => setProvince("all")}
                >
                  {t("allRegions")}
                </Button>
                {provinces.map((item) => (
                  <Button
                    key={item}
                    type="button"
                    size="sm"
                    variant={province === item ? "secondary" : "ghost"}
                    className={cn(province === item && "text-ink")}
                    onClick={() => setProvince(item)}
                  >
                    {item}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        <div className="mt-5 flex items-center justify-between gap-4 text-xs text-[#6f7973]">
          <span>{t("count", { count: filteredItems.length })}</span>
          <span>{searchStateLabel}</span>
        </div>

        <div
          data-collection-grid
          className="mt-8 grid grid-cols-2 items-start gap-x-3 gap-y-10 [content-visibility:auto] sm:gap-x-5 sm:gap-y-14 lg:grid-flow-row-dense lg:grid-cols-12 lg:gap-x-7 lg:gap-y-20"
        >
          {filteredItems.map((item, index) => {
            const placement = collectionPlacements[index % collectionPlacements.length];

            return (
              <div key={item.slug} className={cn("min-w-0 animate-[fadeUp_0.35s_both]", placement.className)}>
                <HeritageCard item={item} variant={placement.variant} />
              </div>
            );
          })}
        </div>

        {filteredItems.length === 0 ? (
          <div className="mt-10 border-y border-pine/10 py-16 text-center text-ink/58">
            {t("empty")}
          </div>
        ) : null}
      </div>
    </section>
  );
}
