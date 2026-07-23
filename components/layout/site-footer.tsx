"use client";

import { useLocale, useTranslations } from "next-intl";
import { Landmark } from "lucide-react";
import { usePathname } from "@/i18n/navigation";
import { defaultLocale, isAppLocale, type AppLocale } from "@/i18n/routing";
import { siteConfig } from "@/lib/constants";

export function SiteFooter() {
  const pathname = usePathname();
  const locale = useLocale();
  const currentLocale: AppLocale = isAppLocale(locale) ? locale : defaultLocale;
  const t = useTranslations("Site");
  const localizedSite = siteConfig.localized[currentLocale];

  if (pathname === "/") {
    return null;
  }

  return (
    <footer className="border-t border-pine/10 bg-rice py-12 text-ink">
      <div className="museum-container">
        <div className="max-w-xl">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-md border border-pine/18 bg-paper shadow-goldline">
              <Landmark className="size-5 text-pine" />
            </span>
            <span className="serif-title text-xl">{localizedSite.name}</span>
          </div>
          <p className="mt-5 max-w-md text-sm leading-7 text-ink/58">
            {t("footerDescription")}
          </p>
        </div>
      </div>
      <div className="museum-container mt-10 border-t border-pine/10 pt-6 text-xs text-ink/42">
        © 2026 {localizedSite.name}. Digital museum.
      </div>
    </footer>
  );
}
