import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { HeritageExplorerHero } from "@/components/home/heritage-explorer-hero";
import { HomeContactEntry } from "@/components/home/home-contact-entry";
import { HomeHeader } from "@/components/home/home-header";
import { HomePromotions } from "@/components/home/home-promotions";
import type { HeritageItem } from "@/lib/types/heritage";
import type { AppLocale } from "@/i18n/routing";

type HomeCmsContentProps = {
  itemsPromise: Promise<HeritageItem[]>;
  locale: AppLocale;
};

export async function HomeCmsContent({ itemsPromise, locale }: HomeCmsContentProps) {
  const items = await itemsPromise;
  const featuredItems = items.filter((item) => item.featured);
  const imageItems = [...featuredItems, ...items.filter((item) => !item.featured)].filter(
    (item, index, source) =>
      Boolean(item.image || item.heroImage) && source.findIndex((candidate) => candidate.id === item.id) === index
  );
  const [mainItem, ...railCandidates] = imageItems;

  return (
    <>
      <HomeHeader />
      <HeritageExplorerHero mainItem={mainItem} railItems={railCandidates.slice(0, 3)} locale={locale} />
      <HomePromotions placement="top" locale={locale} />
      {imageItems.length > 0 && (
        <section aria-label={locale === "zh" ? "非遗作品" : "Heritage works"} className="bg-[#f7f5f0] px-5 py-12 lg:px-12 lg:py-16">
          <div className="mx-auto grid max-w-[1344px] grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-3 md:gap-6">
            {imageItems.map((item) => (
              <Link
                key={item.id}
                href={`/heritage/${item.slug}`}
                locale={locale}
                className="group block min-w-0 overflow-hidden rounded-[6px] border border-[#24483c]/10 bg-[#fffefa] transition-shadow hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#24483c]"
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image
                    src={item.image || item.heroImage}
                    alt={item.name}
                    fill
                    sizes="(min-width: 1440px) 432px, (min-width: 768px) 33vw, 50vw"
                    className="object-contain p-3 motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-[1.02]"
                  />
                </div>
                <div className="px-3 pb-5 pt-3 sm:px-5">
                  <h2 lang="zh" className="serif-title break-words text-base font-normal leading-snug text-[#191f1c] sm:text-xl">{item.name}</h2>
                  {item.englishName && <p lang="en" className="mt-2 break-words text-xs leading-relaxed text-[#65716b] sm:text-sm">{item.englishName}</p>}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
      <HomePromotions placement="bottom" locale={locale} />
      <HomeContactEntry locale={locale} />
    </>
  );
}
