"use client";

import { useLocale } from "next-intl";
import { useEffect, useState } from "react";
import { Phone } from "lucide-react";
import { HomeMobileMenu } from "@/components/home/home-mobile-menu";
import { Link } from "@/i18n/navigation";
import { getAlternateLocale, localeMeta, type AppLocale } from "@/i18n/routing";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

const copy = {
  zh: {
    brand: "华韵非遗",
    home: "首页",
    culture: "传承文化",
    projects: "非遗项目",
    register: "注册",
    login: "登录",
    profile: "个人中心",
    contact: "联系我们",
    navigation: "首页导航"
  },
  en: {
    brand: "Huayun Heritage",
    home: "Home",
    culture: "Living Culture",
    projects: "Heritage Projects",
    register: "Register",
    login: "Sign in",
    profile: "Profile",
    contact: "Contact us",
    navigation: "Home navigation"
  }
} satisfies Record<AppLocale, Record<string, string>>;

export function HomeHeader() {
  const locale = useLocale() as AppLocale;
  const [authenticated, setAuthenticated] = useState(false);
  const alternateLocale = getAlternateLocale(locale);
  const t = copy[locale];
  const primaryNav = [
    { label: t.home, href: "/" },
    { label: t.culture, href: "/museum" },
    { label: t.projects, href: "/heritage" }
  ];
  const accountNav = authenticated
    ? [{ label: t.profile, href: "/profile" }]
    : [
        { label: t.register, href: "/login" },
        { label: t.login, href: "/login" }
      ];

  useEffect(() => {
    let active = true;
    const supabase = createBrowserSupabaseClient();

    void supabase.auth.getUser().then(({ data }) => {
      if (active) setAuthenticated(Boolean(data.user));
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setAuthenticated(Boolean(session?.user));
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <header className="relative z-40 bg-[#f7f5f0] px-5 [background-image:repeating-linear-gradient(0deg,rgba(67,76,70,0.015)_0,rgba(67,76,70,0.015)_1px,transparent_1px,transparent_5px)] lg:px-12">
      <div className="relative mx-auto grid min-h-[90px] max-w-[1344px] grid-cols-[1fr_auto] items-center gap-6 lg:grid-cols-[250px_1fr_auto]">
        <Link href="/" className="serif-title text-2xl font-semibold text-[#191f1c]">
          {t.brand}<span className="ml-1 text-[#a44a3d]">·</span>
        </Link>

        <nav aria-label={t.navigation} className="hidden items-center justify-center gap-9 text-sm text-[#59635e] lg:flex">
          {primaryNav.map((item) => (
            <Link key={item.label} href={item.href} className="transition hover:text-[#a44a3d]">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-5 text-sm text-[#59635e] lg:flex">
          {accountNav.map((item) => (
            <Link key={item.label} href={item.href} className="transition hover:text-[#a44a3d]">
              {item.label}
            </Link>
          ))}
          <Link
            href="#contact"
            className="inline-flex items-center gap-2 rounded-full bg-[#24483c] px-5 py-3 text-white transition hover:bg-[#19382f]"
          >
            <Phone className="size-4" />
            {t.contact}
          </Link>
          <Link
            href="/"
            locale={alternateLocale}
            className="transition hover:text-[#a44a3d]"
          >
            {localeMeta[alternateLocale].label}
          </Link>
        </div>

        <HomeMobileMenu
          items={[
            ...primaryNav,
            ...accountNav,
            { label: localeMeta[alternateLocale].label, href: "/", locale: alternateLocale }
          ]}
        />
      </div>
    </header>
  );
}
