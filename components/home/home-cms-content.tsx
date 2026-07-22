import { HeritageExplorerHero } from "@/components/home/heritage-explorer-hero";
import { HomeContactEntry } from "@/components/home/home-contact-entry";
import { HomeHeader } from "@/components/home/home-header";
import type { HeritageItem } from "@/lib/types/heritage";

type HomeCmsContentProps = {
  itemsPromise: Promise<HeritageItem[]>;
};

export async function HomeCmsContent({ itemsPromise }: HomeCmsContentProps) {
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
      <HeritageExplorerHero mainItem={mainItem} railItems={railCandidates.slice(0, 3)} />
      <HomeContactEntry />
    </>
  );
}
