import { useLocale, useTranslations } from "next-intl";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Link } from "@/i18n/navigation";
import { defaultLocale, isAppLocale, type AppLocale } from "@/i18n/routing";
import type { HeritageCategory } from "@/lib/types/heritage";

export function CategoryBrowser({ categories }: { categories: HeritageCategory[] }) {
  const locale = useLocale();
  const currentLocale: AppLocale = isAppLocale(locale) ? locale : defaultLocale;
  const t = useTranslations("Home.categories");

  return (
    <section className="bg-paper py-16 text-ink md:py-24">
      <div className="museum-container">
        <Reveal>
          <p className="text-sm uppercase text-cinnabar">{t("eyebrow")}</p>
          <h2 className="serif-title mt-3 text-4xl font-normal leading-tight md:text-6xl">
            {t("title")}
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-4 md:grid-cols-5">
          {categories.map((category, index) => (
            <Reveal key={category.slug} delay={index * 0.04}>
              <Link
                href={`/heritage?category=${category.slug}`}
                className="group flex min-h-64 flex-col justify-between rounded-lg border border-pine/10 bg-rice/72 p-5 shadow-goldline transition hover:-translate-y-1 hover:border-pine/28 hover:bg-paper hover:shadow-porcelain"
              >
                <div>
                  <span
                    className="block h-1 w-12 rounded-full opacity-80"
                    style={{ backgroundColor: category.color }}
                  />
                  <h3 className="serif-title mt-7 text-3xl font-normal">
                    {currentLocale === "en" ? category.englishName : category.name}
                  </h3>
                  <p className="mt-2 text-xs uppercase text-pine/48">
                    {currentLocale === "en" ? category.name : category.englishName}
                  </p>
                </div>
                <div className="flex items-end justify-between gap-4">
                  <p className="text-sm leading-6 text-ink/62">{category.summary}</p>
                  <ArrowUpRight className="size-5 shrink-0 text-cinnabar opacity-70 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
