import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ProfileDashboard } from "@/components/user/profile-dashboard";
import { defaultLocale, isAppLocale, type AppLocale } from "@/i18n/routing";
import { getHeritageItems } from "@/lib/content/heritage-repository";
import { createInheritorProfilesFromHeritageItems } from "@/lib/content/inheritor-repository";
import { createMuseumCuration } from "@/lib/content/museum-curation";
import { createMetadata } from "@/lib/metadata";

type ProfilePageProps = {
  params: Promise<{
    locale: string;
  }>;
};

function resolveLocale(locale: string): AppLocale {
  return isAppLocale(locale) ? locale : defaultLocale;
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { locale } = await params;
  const currentLocale = resolveLocale(locale);

  return createMetadata({
    title: currentLocale === "en" ? "Profile" : "个人中心",
    description:
      currentLocale === "en"
        ? "Manage saved heritage items, browsing history and language preference."
        : "管理非遗收藏、浏览记录和语言偏好。",
    path: "/profile",
    locale: currentLocale,
    noIndex: true
  });
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { locale } = await params;
  const currentLocale = resolveLocale(locale);
  setRequestLocale(currentLocale);
  const items = await getHeritageItems();
  const inheritors = createInheritorProfilesFromHeritageItems(items);
  const museumTopics = createMuseumCuration(items).featuredTopics;

  return <ProfileDashboard items={items} inheritors={inheritors} museumTopics={museumTopics} />;
}
