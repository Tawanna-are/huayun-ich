import type { HeritageItem } from "@/lib/types/heritage";

export function createHomeHeritageCards(items: HeritageItem[]) {
  return items.flatMap((item) => [
    {
      key: item.id,
      slug: item.slug,
      name: item.name,
      englishName: item.englishName,
      image: item.image || item.heroImage,
      alt: item.name
    },
    ...(item.homeGallery ?? []).map((image) => ({
      key: `${item.id}:${image.id}`,
      slug: item.slug,
      name: item.name,
      englishName: item.englishName,
      image: image.src,
      alt: image.alt
    }))
  ]);
}
