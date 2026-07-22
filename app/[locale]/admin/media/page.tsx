import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { MediaLibraryClient } from "@/components/admin/media-library-client";
import { PageTransition } from "@/components/motion/page-transition";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { defaultLocale, isAppLocale, type AppLocale } from "@/i18n/routing";
import { getAdminHeritageRows } from "@/lib/content/heritage-repository";
import { createMetadata } from "@/lib/metadata";

type AdminMediaPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

function resolveLocale(locale: string): AppLocale {
  return isAppLocale(locale) ? locale : defaultLocale;
}

const pageCopy = {
  zh: {
    metaTitle: "媒体资源库",
    metaDescription: "华韵非遗 CMS 媒体资源管理后台。",
    eyebrow: "Media Library",
    title: "媒体资源库",
    description: "集中管理所有非遗项目图片与视频资源，支持搜索、筛选、缩略图预览和批量删除。",
    back: "返回内容后台"
  },
  en: {
    metaTitle: "Media Library",
    metaDescription: "Huayun ICH CMS media asset management.",
    eyebrow: "Media Library",
    title: "Media Library",
    description: "Manage image and video assets across heritage items with search, filters, previews and bulk deletion.",
    back: "Back to CMS"
  }
} satisfies Record<AppLocale, Record<string, string>>;

export async function generateMetadata({ params }: AdminMediaPageProps): Promise<Metadata> {
  const { locale } = await params;
  const currentLocale = resolveLocale(locale);
  const t = pageCopy[currentLocale];

  return createMetadata({
    title: t.metaTitle,
    description: t.metaDescription,
    path: "/admin/media",
    noIndex: true,
    locale: currentLocale
  });
}

export default async function AdminMediaPage({ params }: AdminMediaPageProps) {
  const { locale } = await params;
  const currentLocale = resolveLocale(locale);
  const t = pageCopy[currentLocale];
  setRequestLocale(currentLocale);
  const rows = await getAdminHeritageRows();
  const heritageOptions = rows.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    region: row.region
  }));

  return (
    <PageTransition>
      <section className="border-b border-museumGold/18 bg-ink pt-32 text-rice">
        <div className="museum-container flex flex-col justify-between gap-6 pb-12 md:flex-row md:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-museumGold">{t.eyebrow}</p>
            <h1 className="serif-title mt-4 text-5xl font-normal md:text-7xl">{t.title}</h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-rice/64">{t.description}</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/admin">{t.back}</Link>
          </Button>
        </div>
      </section>
      <MediaLibraryClient locale={currentLocale} heritageOptions={heritageOptions} />
    </PageTransition>
  );
}
