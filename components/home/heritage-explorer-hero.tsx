import Image from "next/image";
import { Link } from "@/i18n/navigation";
import type { HeritageItem } from "@/lib/types/heritage";
import type { AppLocale } from "@/i18n/routing";
import { getHeritageImageAlt } from "@/lib/seo/localized-content";

type HeritageExplorerItem = Pick<HeritageItem, "slug" | "name" | "englishName" | "categoryName" | "region" | "image" | "heroImage">;

type HeritageExplorerHeroProps = {
  mainItem?: HeritageExplorerItem;
  railItems: HeritageExplorerItem[];
  locale: AppLocale;
};

const copy = {
  zh: {
    eyebrow: "中国活态非遗",
    titleFirst: "让中国千年文化",
    titleSecond: "被全世界看见",
    description: "从材料、工具到双手留下的细微痕迹，探索中国非物质文化遗产，连接传承人与未来。",
    viewProject: "查看非遗项目",
    viewAnother: "查看另一个非遗项目",
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
    viewAnother: "View another heritage project",
    imageAlt: "Intangible cultural heritage craft",
    closingPrefix: "Every closer look is a new encounter between tradition and ",
    closingEmphasis: "today",
    closingSuffix: "."
  }
} satisfies Record<AppLocale, Record<string, string>>;

const fallbackImages = [
  "/assets/suzhou-embroidery-hero.png",
  "/assets/jingdezhen-porcelain-detail.png",
  "/assets/jingju-hero.png",
  "/assets/spiral/luodian-dark.webp"
];

function getDisplayImage(item: HeritageExplorerItem | undefined, fallback: string) {
  return item ? item.image || item.heroImage || fallback : fallback;
}

export function HeritageExplorerHero({ mainItem, railItems, locale }: HeritageExplorerHeroProps) {
  const rails = railItems.slice(0, 3);
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

        <div className="grid h-[480px] min-w-0 grid-cols-[minmax(0,1fr)_48px_48px_48px] gap-2 sm:h-[540px] sm:grid-cols-[minmax(0,1fr)_58px_58px_58px] lg:h-[560px] lg:grid-cols-[minmax(0,1fr)_66px_66px_66px]">
          <Link
            href={mainItem ? `/heritage/${mainItem.slug}` : "/heritage"}
            data-heritage-main-visual="true"
            aria-label={t.viewProject}
            className="group relative min-w-0 overflow-hidden rounded-[8px] bg-[#cbd4ce] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9d4b40]"
          >
            <Image
              src={getDisplayImage(mainItem, fallbackImages[0])}
              alt={mainItem ? getHeritageImageAlt(mainItem, locale) : t.imageAlt}
              fill
              priority
              fetchPriority="high"
              quality={78}
              sizes="(min-width: 1024px) 52vw, calc(100vw - 190px)"
              className="object-cover transition duration-700 ease-out group-hover:scale-[1.025] motion-reduce:transform-none motion-reduce:transition-none"
            />
          </Link>

          {Array.from({ length: 3 }, (_, index) => {
            const item = rails[index];

            return (
              <Link
                key={item?.slug ?? `fallback-${index}`}
                href={item ? `/heritage/${item.slug}` : "/heritage"}
                data-heritage-visual-rail="true"
                aria-label={t.viewAnother}
                className="group relative z-0 min-w-0 overflow-hidden rounded-[8px] bg-[#cbd4ce] transition-[transform,width,margin] duration-500 ease-out hover:z-10 hover:-ml-[96px] hover:w-[154px] focus-visible:z-10 focus-visible:-ml-[96px] focus-visible:w-[154px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9d4b40] motion-reduce:transition-none sm:hover:-ml-[112px] sm:hover:w-[170px] sm:focus-visible:-ml-[112px] sm:focus-visible:w-[170px] lg:hover:-ml-[124px] lg:hover:w-[190px] lg:focus-visible:-ml-[124px] lg:focus-visible:w-[190px]"
              >
                <Image
                  src={getDisplayImage(item, fallbackImages[index + 1])}
                  alt={item ? getHeritageImageAlt(item, locale) : t.imageAlt}
                  fill
                  sizes="190px"
                  className="object-cover brightness-[0.82] saturate-[0.88] transition duration-700 group-hover:scale-[1.035] group-hover:brightness-90 group-hover:saturate-100 group-focus-visible:scale-[1.035] motion-reduce:transform-none motion-reduce:transition-none"
                />
              </Link>
            );
          })}
        </div>
      </section>

      <p className="px-5 pb-14 text-center serif-title text-lg font-semibold sm:text-xl">
        {t.closingPrefix}<span className="text-[#a54a3d]">{t.closingEmphasis}</span>{t.closingSuffix}
      </p>
    </main>
  );
}
