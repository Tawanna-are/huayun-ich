import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { defaultLocale, isAppLocale, type AppLocale } from "@/i18n/routing";
import { createMetadata } from "@/lib/metadata";

type PageProps = { params: Promise<{ locale: string }> };

const copy = {
  zh: {
    title: "关于华韵非遗",
    description: "了解华韵非遗如何以数字化方式展示中国非物质文化遗产、传统手工艺与当代传承。",
    eyebrow: "About Huayun Heritage",
    heading: "让中国千年文化被全世界看见",
    body: "华韵非遗是一个面向全球访问者的中国非物质文化遗产展示平台。我们通过项目资料、影像、工艺细节与传承线索，帮助更多人理解中国非遗、中国传统文化和传统手工艺的当代生命力。",
    missionTitle: "我们的关注",
    mission: "我们关注工艺、人物与文化语境，尊重资料来源和权利归属，并持续完善中英文内容，让不同语言背景的访问者都能更接近真实、鲜活的非遗实践。"
  },
  en: {
    title: "About Huayun Heritage",
    description: "Learn how Huayun Heritage presents Chinese Intangible Cultural Heritage, traditional crafts and living transmission for a global audience.",
    eyebrow: "About Huayun Heritage",
    heading: "Let China's ancient culture be seen by the world",
    body: "Huayun Heritage is a global platform for Chinese Intangible Cultural Heritage. Through project research, images, craft detail and stories of transmission, we help more people encounter the living presence of Chinese heritage, traditional culture and traditional crafts.",
    missionTitle: "What we focus on",
    mission: "We focus on craft, people and cultural context. We respect sources and rights, and continue to improve Chinese and English content so visitors from different language backgrounds can connect with living heritage more closely."
  }
} satisfies Record<AppLocale, Record<string, string>>;

function resolveLocale(locale: string): AppLocale {
  return isAppLocale(locale) ? locale : defaultLocale;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const currentLocale = resolveLocale(locale);
  const content = copy[currentLocale];
  return createMetadata({ title: content.title, description: content.description, path: "/about", locale: currentLocale, keywords: ["中国非物质文化遗产", "Chinese Intangible Cultural Heritage", "华韵非遗"] });
}

export default async function AboutPage({ params }: PageProps) {
  const { locale } = await params;
  const currentLocale = resolveLocale(locale);
  const content = copy[currentLocale];
  setRequestLocale(currentLocale);

  return <main className="bg-[#f4f1ea] text-[#18231e]"><section className="museum-container py-28 md:py-36"><p className="text-[11px] uppercase text-[#9b3b32]">{content.eyebrow}</p><h1 className="serif-title mt-4 max-w-4xl text-4xl font-normal leading-tight md:text-6xl">{content.heading}</h1><p className="mt-8 max-w-3xl text-base leading-8 text-[#53625b]">{content.body}</p><section className="mt-16 max-w-3xl border-t border-[#31594c]/10 pt-9"><h2 className="serif-title text-2xl font-normal md:text-3xl">{content.missionTitle}</h2><p className="mt-5 text-base leading-8 text-[#53625b]">{content.mission}</p></section></section></main>;
}
