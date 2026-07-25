import Image from "next/image";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { HeritageItem } from "@/lib/types/heritage";

type DetailHeroProps = {
  item: HeritageItem;
  title: string;
  subtitle: string;
  breadcrumbHome: string;
  breadcrumbArchive: string;
  currentLabel: string;
  actions?: ReactNode;
  consultationAvailable?: string;
  consultationAction?: ReactNode;
};

export function DetailHero({
  item,
  title,
  subtitle,
  breadcrumbHome,
  breadcrumbArchive,
  currentLabel,
  actions,
  consultationAvailable,
  consultationAction
}: DetailHeroProps) {
  const coverImage = item.heroImage || item.image;

  return (
    <section className="bg-[#f4f1ea] px-3 pb-8 pt-4 text-white sm:px-5 lg:px-8">
      <div className="relative mx-auto min-h-[680px] max-w-[1500px] overflow-hidden bg-[#102c28] md:min-h-[780px]">
        <Image
          src={coverImage}
          alt={item.name}
          fill
          priority
          sizes="(min-width: 1500px) 1500px, 100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/25" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-transparent to-transparent" />

        <div className="relative z-10 flex min-h-[680px] flex-col px-7 pb-10 pt-10 sm:px-10 md:min-h-[780px] md:px-16 md:pb-16 lg:px-20">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs text-white/65">
            <Link href="/" className="transition hover:text-white">{breadcrumbHome}</Link>
            <ChevronRight className="size-3.5 text-white/35" aria-hidden="true" />
            <Link href="/heritage" className="transition hover:text-white">{breadcrumbArchive}</Link>
            <ChevronRight className="size-3.5 text-white/35" aria-hidden="true" />
            <span className="text-white/85">{currentLabel}</span>
          </nav>

          <div className="mt-auto max-w-4xl">
            <div className="mb-5 flex flex-wrap items-center gap-3 text-[11px] text-white/65">
              <span>{item.categoryName}</span>
              <span className="h-3 w-px bg-white/35" />
              <span>{item.region}</span>
            </div>
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <h1 className="serif-title text-[46px] font-normal leading-[1.02] text-white [overflow-wrap:anywhere] sm:text-6xl md:text-7xl lg:text-[96px]">
                {title}
              </h1>
              {actions ? (
                <div className="flex shrink-0 flex-wrap items-center gap-3 pb-1 [&_button]:border-white/45 [&_button]:bg-black/30 [&_button]:text-white [&_button:hover]:border-white/70 [&_button:hover]:bg-white/15 [&_button:hover]:text-white">
                  {actions}
                </div>
              ) : null}
            </div>
            {subtitle ? <p className="mt-3 text-xs uppercase text-white/50 sm:text-sm">{subtitle}</p> : null}
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/80 sm:text-lg sm:leading-9">{item.summary}</p>
            {consultationAction ? (
              <div className="mt-8 hidden items-center gap-4 md:flex">
                {consultationAction}
                {consultationAvailable ? <span className="text-xs text-white/55">{consultationAvailable}</span> : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
