import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ImportAdminClient } from "@/components/admin/import-admin-client";
import { PageTransition } from "@/components/motion/page-transition";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { defaultLocale, isAppLocale, type AppLocale } from "@/i18n/routing";
import { createMetadata } from "@/lib/metadata";

type AdminImportPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

function resolveLocale(locale: string): AppLocale {
  return isAppLocale(locale) ? locale : defaultLocale;
}

export async function generateMetadata({ params }: AdminImportPageProps): Promise<Metadata> {
  const { locale } = await params;
  const currentLocale = resolveLocale(locale);

  return createMetadata({
    title: currentLocale === "en" ? "Bulk Import" : "批量导入",
    description: "Import heritage content and media assets in batches.",
    path: "/admin/import",
    noIndex: true,
    locale: currentLocale
  });
}

export default async function AdminImportPage({ params }: AdminImportPageProps) {
  const { locale } = await params;
  const currentLocale = resolveLocale(locale);
  setRequestLocale(currentLocale);

  return (
    <PageTransition>
      <section className="border-b border-museumGold/18 bg-ink pt-32 text-rice">
        <div className="museum-container flex flex-col justify-between gap-6 pb-12 md:flex-row md:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-museumGold">Bulk Import</p>
            <h1 className="serif-title mt-4 text-5xl font-normal md:text-7xl">
              {currentLocale === "en" ? "Content Import Center" : "内容批量导入"}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-rice/64">
              {currentLocale === "en"
                ? "Import Excel or CSV heritage records, upload media in batches, and keep row-level logs."
                : "导入 Excel / CSV 非遗数据，批量上传图片与视频，并保留逐行导入日志。"}
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/admin">{currentLocale === "en" ? "Back to CMS" : "返回内容后台"}</Link>
          </Button>
        </div>
      </section>
      <ImportAdminClient locale={currentLocale} />
    </PageTransition>
  );
}
