"use client";

import { useState } from "react";
import { Landmark, Menu, UserCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { useLocale, useTranslations } from "next-intl";
import { getAlternateLocale, localeMeta, type AppLocale } from "@/i18n/routing";

export function SiteHeader() {
  const pathname = usePathname();
  const locale = useLocale() as AppLocale;
  const alternateLocale = getAlternateLocale(locale);
  const t = useTranslations("Site");
  const [open, setOpen] = useState(false);
  const navItems = [
    { href: "/", label: t("nav.home") },
    { href: "/heritage", label: t("nav.heritage") }
  ];

  if (pathname === "/") return null;

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[#36584e]/15 bg-[#fbf8ef]/95 text-[#23312d] shadow-[0_18px_55px_rgba(54,88,78,0.08)] backdrop-blur-xl">
      <div className="museum-container flex h-18 items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <span className="flex size-9 items-center justify-center rounded-md border border-pine/18 bg-paper shadow-goldline">
            <Landmark className="size-5 text-pine" />
          </span>
          <span className="serif-title text-lg text-ink">华韵收藏</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn("rounded-md px-4 py-2 text-sm text-[#23312d]/70 transition hover:bg-[#36584e]/10 hover:text-[#23312d]", active && "text-[#b85042]")}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button asChild size="sm" variant="ghost" className="text-[#23312d] hover:bg-[#36584e]/10"><Link href="/login">注册</Link></Button>
          <Button asChild size="sm" variant="ghost" className="text-[#23312d] hover:bg-[#36584e]/10"><Link href="/login">登录</Link></Button>
          <Button asChild size="sm" variant="outline" className="border-[#36584e]/35 bg-white/70 text-[#23312d] hover:bg-white"><Link href="#contact">联系我们</Link></Button>
          <Button asChild size="sm" variant="ghost" className="text-[#23312d] hover:bg-[#36584e]/10">
            <Link href={pathname || "/"} locale={alternateLocale} aria-label={t("language")}>{localeMeta[alternateLocale].label}</Link>
          </Button>
          <Button asChild size="sm" variant="ghost" className="text-[#23312d] hover:bg-[#36584e]/10">
            <Link href="/profile"><UserCircle className="size-4" />{locale === "en" ? "Profile" : "个人中心"}</Link>
          </Button>
        </div>

        <button
          aria-label={open ? t("closeMenu") : t("openMenu")}
          className="inline-flex size-10 items-center justify-center rounded-md border border-pine/14 bg-paper text-ink md:hidden"
          onClick={() => setOpen((value) => !value)}
          type="button"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-[#36584e]/15 bg-[#fbf8ef]/98 md:hidden">
          <nav className="museum-container grid gap-1 py-4">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="rounded-md px-3 py-3 text-sm text-[#23312d]/75 hover:bg-[#36584e]/10" onClick={() => setOpen(false)}>
                {item.label}
              </Link>
            ))}
            <Link href="/login" className="rounded-md px-3 py-3 text-sm text-cinnabar hover:bg-pine/8" onClick={() => setOpen(false)}>注册</Link>
            <Link href="/login" className="rounded-md px-3 py-3 text-sm text-cinnabar hover:bg-pine/8" onClick={() => setOpen(false)}>登录</Link>
            <Link href="#contact" className="rounded-md px-3 py-3 text-sm text-cinnabar hover:bg-pine/8" onClick={() => setOpen(false)}>联系我们</Link>
            <Link href={pathname || "/"} locale={alternateLocale} className="rounded-md px-3 py-3 text-sm text-cinnabar hover:bg-pine/8" onClick={() => setOpen(false)}>{localeMeta[alternateLocale].label}</Link>
            <Link href="/profile" className="rounded-md px-3 py-3 text-sm text-cinnabar hover:bg-pine/8" onClick={() => setOpen(false)}>{locale === "en" ? "Profile" : "个人中心"}</Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
