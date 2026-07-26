import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import { isAppLocale, localeMeta, routing, type AppLocale } from "@/i18n/routing";
import { createMetadata, getSiteLocaleConfig } from "@/lib/metadata";
import "../globals.css";

type LocaleParamsProps = {
  params: Promise<{
    locale: string;
  }>;
};

type LocaleLayoutProps = Readonly<
  LocaleParamsProps & {
    children: React.ReactNode;
  }
>;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LocaleParamsProps): Promise<Metadata> {
  const { locale } = await params;
  const currentLocale = isAppLocale(locale) ? locale : routing.defaultLocale;
  const localeConfig = getSiteLocaleConfig(currentLocale);

  return createMetadata({
    title: localeConfig.name,
    description: localeConfig.description,
    locale: currentLocale
  });
}

export const viewport: Viewport = {
  themeColor: "#0F0F0F",
  colorScheme: "dark"
};

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  if (!isAppLocale(locale)) {
    notFound();
  }

  const currentLocale: AppLocale = locale;
  setRequestLocale(currentLocale);

  return (
    <html lang={localeMeta[currentLocale].language} className="dark">
      <body>
        <Suspense fallback={null}>
          <GoogleAnalytics />
        </Suspense>
        <NextIntlClientProvider>
          <ServiceWorkerRegister />
          <SiteHeader />
          {children}
          <SiteFooter />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
