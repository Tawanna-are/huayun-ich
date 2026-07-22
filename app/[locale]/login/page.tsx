import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { LoginForm } from "@/components/user/login-form";
import { defaultLocale, isAppLocale, type AppLocale } from "@/i18n/routing";
import { createMetadata } from "@/lib/metadata";

type LoginPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

function resolveLocale(locale: string): AppLocale {
  return isAppLocale(locale) ? locale : defaultLocale;
}

export async function generateMetadata({ params }: LoginPageProps): Promise<Metadata> {
  const { locale } = await params;
  const currentLocale = resolveLocale(locale);

  return createMetadata({
    title: currentLocale === "en" ? "Sign in" : "登录",
    description:
      currentLocale === "en"
        ? "Sign in to Huayun to save heritage items and language preferences."
        : "登录华韵，保存非遗收藏、浏览记录和语言偏好。",
    path: "/login",
    locale: currentLocale,
    noIndex: true
  });
}

export default async function LoginPage({ params }: LoginPageProps) {
  const { locale } = await params;
  const currentLocale = resolveLocale(locale);
  setRequestLocale(currentLocale);

  return (
    <section className="min-h-screen bg-ink px-4 py-32 text-rice">
      <LoginForm />
    </section>
  );
}
