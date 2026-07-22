import Image from "next/image";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Link } from "@/i18n/navigation";
import type { HeritageItem } from "@/lib/types/heritage";

export function FeaturedGrid({ items }: { items: HeritageItem[] }) {
  return (
    <section
      id="featured"
      aria-label="精选优秀非遗项目，感受传统文化的独特魅力"
      className="bg-[#f4f1ea] px-3 py-16 text-[#19241f] [contain-intrinsic-size:auto_900px] [content-visibility:auto] sm:px-5 md:py-24 lg:px-8"
    >
      <div className="mx-auto max-w-[1400px]">
        <Reveal>
          <div className="mb-10 flex items-end justify-between gap-5 border-b border-[#31594c]/15 pb-7">
            <div>
              <p className="text-[11px] uppercase text-[#9b3b32]">Curated Collection</p>
              <h2 className="serif-title mt-2 text-4xl font-normal sm:text-5xl">精选非遗</h2>
            </div>
            <span className="text-xs tabular-nums text-[#69736e]">{String(items.length).padStart(2, "0")}</span>
          </div>
        </Reveal>

        {items.length > 0 ? (
          <div
            aria-label="精选非遗横向展廊"
            role="region"
            tabIndex={0}
            className="grid grid-rows-1 snap-x snap-mandatory auto-cols-[86%] grid-flow-col gap-5 overflow-x-auto pb-4 [scrollbar-color:rgba(49,89,76,0.24)_transparent] [scrollbar-width:thin] sm:auto-cols-[47%] lg:auto-cols-[calc((100%_-_4.5rem)/4)] lg:gap-6"
          >
            {items.map((item, index) => {
              const displayImage = item.image || item.heroImage;

              return (
                <Reveal key={item.slug} delay={index * 0.04}>
                  <article data-exhibit className="h-full snap-start">
                    <Link href={`/heritage/${item.slug}`} className="group block h-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9b3b32]/60">
                      <div className="relative aspect-[3/4] overflow-hidden rounded-[6px] bg-[#eeece4]">
                        <Image
                          src={displayImage}
                          alt={item.name}
                          fill
                          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 47vw, 86vw"
                          className="object-cover saturate-[0.92] transition duration-700 ease-out group-hover:scale-[1.045] group-hover:saturate-100 motion-reduce:transform-none"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                        <div className="absolute inset-x-5 top-5 flex items-center justify-between gap-3 text-[11px] text-white/75">
                          <span>{item.categoryName}</span>
                          <span className="tabular-nums">{String(index + 1).padStart(2, "0")}</span>
                        </div>
                        <div className="absolute inset-x-5 bottom-5 text-white">
                          <p className="mb-2 text-xs text-white/60">{item.region}</p>
                          <div className="flex items-end justify-between gap-4">
                            <h3 className="serif-title text-3xl font-normal leading-tight sm:text-[32px]">{item.name}</h3>
                            <ArrowUpRight className="size-5 shrink-0 opacity-60 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </article>
                </Reveal>
              );
            })}
          </div>
        ) : (
          <div className="border-y border-[#31594c]/10 py-16 text-center text-sm text-[#747d78]">精选馆藏正在整理中</div>
        )}

        <div className="mt-10 flex justify-end">
          <Link href="/heritage" className="group inline-flex items-center gap-2 text-sm text-[#63513e] transition hover:text-[#31594c]">
            探索全部馆藏
            <ArrowRight className="size-4 transition group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
