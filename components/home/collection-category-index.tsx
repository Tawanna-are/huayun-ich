import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";

const categoryLinks = [
  { label: "戏曲", englishName: "Traditional Opera", query: "戏曲" },
  { label: "刺绣", englishName: "Embroidery", query: "刺绣" },
  { label: "陶瓷", englishName: "Ceramics", query: "陶瓷" },
  { label: "染织", englishName: "Dyeing & Weaving", query: "染织" },
  { label: "竹编", englishName: "Bamboo Weaving", query: "竹编" },
  { label: "剪纸", englishName: "Paper Cutting", query: "剪纸" }
] as const;

export function CollectionCategoryIndex() {
  return (
    <section className="bg-[#f4f1ea] px-3 pb-20 text-[#17231e] sm:px-5 md:pb-28 lg:px-8">
      <div className="mx-auto max-w-[1400px] border-t border-[#31594c]/15 pt-10 md:pt-14">
        <div className="mb-7 flex items-end justify-between gap-6">
          <div>
            <p className="text-[11px] uppercase text-[#9b3b32]">Explore by Category</p>
            <h2 className="serif-title mt-2 text-3xl font-normal sm:text-4xl">类别索引</h2>
          </div>
          <span className="text-[11px] tabular-nums text-[#69736e]">06</span>
        </div>

        <div className="grid grid-cols-2 border-l border-t border-[#31594c]/15 md:grid-cols-3">
          {categoryLinks.map((item, index) => (
            <Link
              key={item.label}
              href={{ pathname: "/heritage", query: { query: item.query } }}
              className="group flex min-h-28 items-end justify-between gap-4 border-b border-r border-[#31594c]/15 px-4 py-5 transition hover:bg-[#31594c] hover:text-white sm:min-h-36 sm:px-6 sm:py-6"
            >
              <div>
                <span className="text-[10px] tabular-nums opacity-45">{String(index + 1).padStart(2, "0")}</span>
                <h3 className="serif-title mt-2 text-2xl font-normal sm:text-3xl">{item.label}</h3>
                <p className="mt-1 text-[10px] uppercase leading-4 text-[#69736e] transition group-hover:text-white/60 sm:text-[11px]">
                  {item.englishName}
                </p>
              </div>
              <ArrowUpRight className="size-4 shrink-0 opacity-45 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
