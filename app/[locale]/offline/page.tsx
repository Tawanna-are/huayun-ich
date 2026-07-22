import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { CloudOff, Download, Home } from "lucide-react";
import { PageTransition } from "@/components/motion/page-transition";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { defaultLocale, getLocalizedPath, isAppLocale, type AppLocale } from "@/i18n/routing";
import { createMetadata } from "@/lib/metadata";

type OfflinePageProps = {
  params: Promise<{
    locale: string;
  }>;
};

const copy = {
  zh: {
    title: "离线参观模式",
    description: "网络暂时不可用。你仍可浏览已缓存的精选非遗内容，并在网络恢复后继续探索完整展馆。",
    eyebrow: "Offline",
    home: "返回首页",
    archive: "查看缓存名录",
    note: "建议将华韵添加到主屏幕，离线状态下也能快速打开。"
  },
  en: {
    title: "Offline Visit Mode",
    description:
      "The network is temporarily unavailable. You can still browse cached highlights and continue the full museum visit when connectivity returns.",
    eyebrow: "Offline",
    home: "Back home",
    archive: "Cached archive",
    note: "Install Huayun to your home screen for faster offline access."
  }
} as const;

function resolveLocale(locale: string): AppLocale {
  return isAppLocale(locale) ? locale : defaultLocale;
}

export async function generateMetadata({ params }: OfflinePageProps): Promise<Metadata> {
  const { locale } = await params;
  const currentLocale = resolveLocale(locale);
  const text = copy[currentLocale];

  return createMetadata({
    title: text.title,
    description: text.description,
    path: "/offline",
    noIndex: true,
    locale: currentLocale
  });
}

export default async function OfflinePage({ params }: OfflinePageProps) {
  const { locale } = await params;
  const currentLocale = resolveLocale(locale);
  setRequestLocale(currentLocale);
  const text = copy[currentLocale];

  return (
    <PageTransition>
      <section className="relative flex min-h-screen items-center overflow-hidden bg-ink pt-24 text-rice">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_26%_22%,rgba(200,169,106,0.18),transparent_28%),linear-gradient(180deg,rgba(248,246,242,0.08),transparent_48%)]" />
        <div className="museum-container grid gap-10 py-16 md:grid-cols-[0.8fr_1.2fr] md:items-center">
          <div className="flex size-24 items-center justify-center rounded-lg border border-museumGold/30 bg-museumGold/10">
            <CloudOff className="size-10 text-museumGold" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-museumGold">{text.eyebrow}</p>
            <h1 className="serif-title mt-5 max-w-3xl text-5xl font-normal leading-tight md:text-7xl">
              {text.title}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-rice/68 md:text-lg">{text.description}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href={getLocalizedPath("/", currentLocale)}>
                  <Home className="size-4" />
                  {text.home}
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href={getLocalizedPath("/heritage", currentLocale)}>
                  <Download className="size-4" />
                  {text.archive}
                </Link>
              </Button>
            </div>
            <p className="mt-8 text-sm leading-7 text-rice/42">{text.note}</p>
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
