import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { LegalPage } from "@/components/legal/legal-page";
import { defaultLocale, isAppLocale, type AppLocale } from "@/i18n/routing";
import { getLegalDocument } from "@/lib/legal/legal-content";
import { createMetadata } from "@/lib/metadata";

type PageProps = { params: Promise<{ locale: string }> };

function resolveLocale(locale: string): AppLocale {
  return isAppLocale(locale) ? locale : defaultLocale;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const currentLocale = resolveLocale(locale);
  const document = getLegalDocument("privacy", currentLocale);
  return createMetadata({ title: document.title, description: document.description, path: "/privacy", locale: currentLocale });
}

export default async function PrivacyPage({ params }: PageProps) {
  const { locale } = await params;
  const currentLocale = resolveLocale(locale);
  setRequestLocale(currentLocale);
  return <LegalPage document={getLegalDocument("privacy", currentLocale)} locale={currentLocale} />;
}
