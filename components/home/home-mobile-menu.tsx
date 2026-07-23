"use client";

import { useLocale } from "next-intl";
import { useState } from "react";
import { Menu, Phone, X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";

type MobileNavItem = {
  label: string;
  href: string;
  locale?: AppLocale;
};

export function HomeMobileMenu({ items }: { items: MobileNavItem[] }) {
  const [open, setOpen] = useState(false);
  const locale = useLocale() as AppLocale;
  const labels = locale === "en"
    ? { open: "Open navigation", close: "Close navigation", navigation: "Home mobile navigation", contact: "Contact us" }
    : { open: "打开导航", close: "关闭导航", navigation: "首页移动导航", contact: "联系我们" };

  return (
    <>
      <button
        type="button"
        aria-label={open ? labels.close : labels.open}
        aria-expanded={open}
        className="grid size-10 shrink-0 place-items-center rounded-full border border-[#31594c]/20 bg-white/80 text-[#25362f] shadow-[0_5px_16px_rgba(21,44,37,0.08)] lg:hidden"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      {open ? (
        <nav
          aria-label={labels.navigation}
          className="absolute left-0 right-0 top-[calc(100%+10px)] grid gap-1 rounded-[22px] border border-white/80 bg-white/[0.96] p-3 shadow-[0_22px_54px_rgba(21,44,37,0.16)] backdrop-blur-xl lg:hidden"
        >
          {items.map((item) => (
            <Link
              key={`mobile-${item.label}`}
              href={item.href}
              locale={item.locale}
              className="rounded-2xl px-4 py-3 text-sm text-[#293630] transition hover:bg-[#edf1ed]"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="#contact"
            className="mt-1 inline-flex items-center gap-2 rounded-2xl bg-[#31594c] px-4 py-3 text-sm text-white"
            onClick={() => setOpen(false)}
          >
            <Phone className="size-4" />
            {labels.contact}
          </Link>
        </nav>
      ) : null}
    </>
  );
}
