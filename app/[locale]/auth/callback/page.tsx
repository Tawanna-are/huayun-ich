import { Suspense } from "react";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { AuthCallbackClient } from "@/components/user/auth-callback-client";
import { defaultLocale, isAppLocale, type AppLocale } from "@/i18n/routing";
import { createMetadata } from "@/lib/metadata";

type AuthCallbackPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

function resolveLocale(locale: string): AppLocale {
  return isAppLocale(locale) ? locale : defaultLocale;
}

export async function generateMetadata({ params }: AuthCallbackPageProps): Promise<Metadata> {
  const { locale } = await params;
  const currentLocale = resolveLocale(locale);

  return createMetadata({
    title: currentLocale === "en" ? "Completing sign in" : "正在完成登录",
    path: "/auth/callback",
    locale: currentLocale,
    noIndex: true
  });
}

export default async function AuthCallbackPage({ params }: AuthCallbackPageProps) {
  const { locale } = await params;
  const currentLocale = resolveLocale(locale);
  setRequestLocale(currentLocale);

  return (
    <section className="min-h-screen bg-ink pt-24">
      <Suspense fallback={null}>
        <AuthCallbackClient />
      </Suspense>
    </section>
  );
}
