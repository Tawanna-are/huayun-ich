import Image from "next/image";
import { Link } from "@/i18n/navigation";
import type { HeritageItem } from "@/lib/types/heritage";
import type { AppLocale } from "@/i18n/routing";
import { getHeritageImageAlt } from "@/lib/seo/localized-content";

type HeritageExplorerItem = Pick<HeritageItem, "slug" | "name" | "englishName" | "categoryName" | "region" | "image" | "heroImage">;

type HeritageExplorerHeroProps = {
  mainItem?: HeritageExplorerItem;
  locale: AppLocale;
};

const copy = {
  zh: {
    eyebrow: "中国活态非遗",
    titleFirst: "让中国千年文化",
    titleSecond: "被全世界看见",
    description: "从材料、工具到双手留下的细微痕迹，探索中国非物质文化遗产，连接传承人与未来。",
    viewProject: "查看非遗项目",
    imageAlt: "非遗工艺作品",
    closingPrefix: "每一次靠近，都是传统与",
    closingEmphasis: "今天",
    closingSuffix: "的重新相遇。"
  },
  en: {
    eyebrow: "Chinese living heritage",
    titleFirst: "Let China's ancient culture",
    titleSecond: "be seen by the world",
    description: "Explore China's intangible cultural heritage through materials, tools and the traces left by skilled hands, connecting inheritors with the future.",
    viewProject: "View heritage project",
    imageAlt: "Intangible cultural heritage craft",
    closingPrefix: "Every closer look is a new encounter between tradition and ",
    closingEmphasis: "today",
    closingSuffix: "."
  }
} satisfies Record<AppLocale, Record<string, string>>;

const fallbackImage = "/assets/hero-museum.png";

function getDisplayImage(item: HeritageExplorerItem | undefined, fallback: string) {
  return item ? item.image || item.heroImage || fallback : fallback;
}

export function HeritageExplorerHero({ mainItem, locale }: HeritageExplorerHeroProps) {
  const t = copy[locale];

  return (
    <main className="bg-[#f7f5f0] text-[#191f1c] [background-image:repeating-linear-gradient(0deg,rgba(67,76,70,0.015)_0,rgba(67,76,70,0.015)_1px,transparent_1px,transparent_5px)]">
      <section className="mx-auto grid min-h-[650px] max-w-[1440px] grid-cols-1 items-center gap-12 px-5 pb-16 pt-10 lg:grid-cols-[35%_65%] lg:gap-0 lg:px-12 lg:pb-20 lg:pt-6">
        <div className="lg:pr-14">
          <p className="mb-5 text-[10px] uppercase text-[#9d4b40]">{t.eyebrow}</p>
          <h1 className="serif-title text-[42px] font-normal leading-[1.2] sm:text-[48px] lg:text-[54px]">
            <span className="block whitespace-nowrap">{t.titleFirst}</span>
            <span className="block whitespace-nowrap">{t.titleSecond}</span>
          </h1>
          <h2 className="sr-only">
            {locale === "en"
              ? "Chinese Intangible Cultural Heritage and Traditional Chinese Culture"
              : "中国非物质文化遗产与中国传统文化展示平台"}
          </h2>
          <p className="mt-7 max-w-sm text-sm leading-8 text-[#6d7671]">
            {t.description}
          </p>
        </div>

        <div className="h-[480px] min-w-0 sm:h-[540px] lg:h-[560px]">
          <Link
            href={mainItem ? `/heritage/${mainItem.slug}` : "/heritage"}
            data-heritage-main-visual="true"
            aria-label={t.viewProject}
            className="group relative block h-full w-full min-w-0 overflow-hidden rounded-[8px] bg-[#cbd4ce] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9d4b40]"
          >
            <Image
              src={getDisplayImage(mainItem, fallbackImage)}
              alt={mainItem ? getHeritageImageAlt(mainItem, locale) : t.imageAlt}
              fill
              priority
              fetchPriority="high"
              quality={78}
              sizes="(min-width: 1440px) 936px, (min-width: 1024px) 65vw, calc(100vw - 40px)"
              className="object-cover transition duration-700 ease-out group-hover:scale-[1.025] motion-reduce:transform-none motion-reduce:transition-none"
            />
          </Link>
        </div>
      </section>

      <p className="px-5 pb-14 text-center serif-title text-lg font-semibold sm:text-xl">
        {t.closingPrefix}<span className="text-[#a54a3d]">{t.closingEmphasis}</span>{t.closingSuffix}
      </p>
    </main>
  );
}
