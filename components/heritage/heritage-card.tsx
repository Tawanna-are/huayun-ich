import Image from "next/image";
import { useLocale } from "next-intl";
import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { defaultLocale, isAppLocale, type AppLocale } from "@/i18n/routing";
import type { HeritageItem } from "@/lib/types/heritage";
import { cn } from "@/lib/utils";

export type HeritageCardVariant = "feature" | "wide" | "standard";

type HeritageCardProps = {
  item: HeritageItem;
  compact?: boolean;
  variant?: HeritageCardVariant;
};

const imagePresentation = {
  feature: {
    className: "aspect-[3/4] lg:aspect-[16/11]",
    sizes: "(min-width: 1280px) 56vw, (min-width: 1024px) 54vw, 50vw"
  },
  wide: {
    className: "aspect-[3/4] lg:aspect-[4/3]",
    sizes: "(min-width: 1280px) 42vw, (min-width: 1024px) 40vw, 50vw"
  },
  standard: {
    className: "aspect-[3/4]",
    sizes: "(min-width: 1280px) 32vw, (min-width: 1024px) 34vw, 50vw"
  }
} satisfies Record<HeritageCardVariant, { className: string; sizes: string }>;

export function HeritageCard({ item, variant = "standard" }: HeritageCardProps) {
  const locale = useLocale();
  const currentLocale: AppLocale = isAppLocale(locale) ? locale : defaultLocale;
  const title = currentLocale === "en" ? item.englishName || item.name : item.name;
  const subtitle = currentLocale === "en" ? item.name : item.englishName;
  const presentation = imagePresentation[variant];

  return (
    <article className="min-w-0" data-card-variant={variant}>
      <Link href={`/heritage/${item.slug}`} className="group block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9b3b32]/60">
        <div className={cn("relative overflow-hidden rounded-[3px] bg-[#e8e4dc]", presentation.className)}>
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes={presentation.sizes}
            className="object-cover saturate-[0.96] transition duration-700 ease-out group-hover:scale-[1.018] group-hover:saturate-100 motion-reduce:transform-none"
          />
          <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/[0.04]" />
          <ArrowUpRight className="absolute right-3 top-3 size-4 text-white opacity-0 drop-shadow-sm transition group-hover:opacity-90 sm:right-4 sm:top-4" />
        </div>
        <div className="pt-3 sm:pt-4">
          <div className="flex min-w-0 items-start justify-between gap-2 sm:gap-4">
            <h2 className={cn("serif-title min-w-0 font-normal leading-tight text-[#18231e]", variant === "feature" ? "text-lg sm:text-2xl lg:text-3xl" : "text-base sm:text-xl lg:text-2xl")}>
              {title}
            </h2>
            <span className="max-w-[46%] shrink-0 truncate pt-1 text-right text-[9px] text-[#7a847e] sm:text-[11px]">
              {item.categoryName}
            </span>
          </div>
          {subtitle ? <p className="mt-1 truncate text-[9px] uppercase text-[#7a847e] sm:text-[11px]">{subtitle}</p> : null}
          <p className="mt-2 truncate text-[10px] text-[#59645e] sm:text-xs">{item.region}</p>
        </div>
      </Link>
    </article>
  );
}
