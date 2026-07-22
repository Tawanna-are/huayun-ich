import { getHeritageItems } from "@/lib/content/heritage-repository";
import type { HeritageItem } from "@/lib/types/heritage";
import type { InheritorProfile, RepresentativeWork } from "@/lib/types/inheritor";

const pinyinMap: Record<string, string> = {
  京: "jing",
  剧: "ju",
  昆: "kun",
  曲: "qu",
  苏: "su",
  绣: "xiu",
  龙: "long",
  泉: "quan",
  青: "qing",
  瓷: "ci",
  景: "jing",
  德: "de",
  镇: "zhen",
  陶: "tao",
  打: "da",
  铁: "tie",
  花: "hua",
  梅: "mei",
  派: "pai",
  传: "chuan",
  承: "cheng",
  群: "qun",
  体: "ti",
  习: "xi",
  工: "gong",
  艺: "yi",
  大: "da",
  师: "shi",
  代: "dai",
  表: "biao"
};

function slugify(value: string, fallback: string) {
  const asciiSlug = value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (asciiSlug) {
    return asciiSlug;
  }

  const transliterated = Array.from(value)
    .map((char) => pinyinMap[char])
    .filter(Boolean)
    .join("-");

  return transliterated || fallback;
}

function createRepresentativeWork(item: HeritageItem): RepresentativeWork {
  return {
    title: item.name,
    englishTitle: item.englishName,
    summary: item.summary,
    image: item.image,
    href: `/heritage/${item.slug}`,
    categoryName: item.categoryName,
    region: item.region
  };
}

export function createInheritorProfilesFromHeritageItems(items: HeritageItem[]): InheritorProfile[] {
  return items
    .filter((item) => item.inheritor.name.trim())
    .map((item, index) => {
      const inheritorSlug = slugify(item.inheritor.name, `inheritor-${index + 1}`);
      const id = `${item.slug}-${inheritorSlug}`;

      return {
        id,
        name: item.inheritor.name,
        title: item.inheritor.title,
        bio: item.inheritor.bio,
        image: item.inheritor.image,
        region: item.region,
        province: item.province,
        city: item.city,
        heritageName: item.name,
        heritageEnglishName: item.englishName,
        heritageSlug: item.slug,
        heritageCategoryName: item.categoryName,
        representativeWorks: [createRepresentativeWork(item)],
        interviewVideo: item.videoUrl
          ? {
              url: item.videoUrl,
              poster: item.videoPoster || item.heroImage,
              title: `${item.inheritor.name} · ${item.name}`
            }
          : undefined
      };
    });
}

export async function getInheritorProfiles() {
  const items = await getHeritageItems();
  return createInheritorProfilesFromHeritageItems(items);
}

export async function getInheritorProfileById(id: string) {
  const profiles = await getInheritorProfiles();
  return profiles.find((profile) => profile.id === id);
}

export async function getInheritorProfileIds() {
  const profiles = await getInheritorProfiles();
  return profiles.map((profile) => profile.id);
}
