import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { PageTransition } from "@/components/motion/page-transition";
import { PasswordResetForm } from "@/components/user/password-reset-form";
import { defaultLocale, isAppLocale, type AppLocale } from "@/i18n/routing";
import { createMetadata } from "@/lib/metadata";

type Props = { params: Promise<{ locale: string }> };
const copy = { zh: { title: "重置密码", description: "为你的华韵账号设置新密码。" }, en: { title: "Reset Password", description: "Set a new password for your Huayun account." } } satisfies Record<AppLocale, { title: string; description: string }>;
function localeOf(value: string): AppLocale { return isAppLocale(value) ? value : defaultLocale; }
export async function generateMetadata({ params }: Props): Promise<Metadata> { const locale = localeOf((await params).locale); return createMetadata({ title: copy[locale].title, description: copy[locale].description, path: "/reset-password", noIndex: true, locale }); }
export default async function ResetPasswordPage({ params }: Props) { const locale = localeOf((await params).locale); setRequestLocale(locale); return <PageTransition><main className="min-h-[70vh] bg-ink px-6 pb-20 pt-32 text-rice"><div className="mx-auto max-w-xl"><PasswordResetForm locale={locale} /></div></main></PageTransition>; }
