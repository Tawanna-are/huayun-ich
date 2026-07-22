import { Phone } from "lucide-react";
import { HomeMobileMenu } from "@/components/home/home-mobile-menu";
import { Link } from "@/i18n/navigation";

const primaryNav = [
  { label: "首页", href: "/" },
  { label: "传承文化", href: "/museum" },
  { label: "非遗项目", href: "/heritage" }
];

export function HomeHeader() {
  return (
    <header className="relative z-40 bg-[#f7f5f0] px-5 [background-image:repeating-linear-gradient(0deg,rgba(67,76,70,0.015)_0,rgba(67,76,70,0.015)_1px,transparent_1px,transparent_5px)] lg:px-12">
      <div className="relative mx-auto grid min-h-[90px] max-w-[1344px] grid-cols-[1fr_auto] items-center gap-6 lg:grid-cols-[250px_1fr_auto]">
        <Link href="/" className="serif-title text-2xl font-semibold text-[#191f1c]">
          华韵非遗<span className="ml-1 text-[#a44a3d]">·</span>
        </Link>

        <nav aria-label="首页导航" className="hidden items-center justify-center gap-9 text-sm text-[#59635e] lg:flex">
          {primaryNav.map((item) => (
            <Link key={item.label} href={item.href} className="transition hover:text-[#a44a3d]">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-5 text-sm text-[#59635e] lg:flex">
          <Link href="/login" className="transition hover:text-[#a44a3d]">
            注册
          </Link>
          <Link href="/login" className="transition hover:text-[#a44a3d]">
            登录
          </Link>
          <Link
            href="#contact"
            className="inline-flex items-center gap-2 rounded-full bg-[#24483c] px-5 py-3 text-white transition hover:bg-[#19382f]"
          >
            <Phone className="size-4" />
            联系我们
          </Link>
        </div>

        <HomeMobileMenu items={[...primaryNav, { label: "注册", href: "/login" }, { label: "登录", href: "/login" }]} />
      </div>
    </header>
  );
}
