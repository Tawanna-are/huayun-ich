import type { ReactNode } from "react";
import Image from "next/image";
import { Reveal } from "@/components/motion/reveal";
import type { HeritageGalleryImage } from "@/lib/types/heritage";

type FutureWorksPreviewProps = {
  itemName: string;
  images: HeritageGalleryImage[];
  coverImage: string;
  heroImage: string;
  labels: readonly string[];
  comingSoonLabel: string;
  eyebrow: string;
  title: string;
  consultationAction?: ReactNode;
};

export function FutureWorksPreview({
  itemName,
  images,
  coverImage,
  heroImage,
  labels,
  comingSoonLabel,
  eyebrow,
  title,
  consultationAction
}: FutureWorksPreviewProps) {
  const seen = new Set<string>();
  const previewImages = [coverImage, heroImage, ...images.map((image) => image.src)]
    .filter((src) => src && !seen.has(src) && Boolean(seen.add(src)))
    .slice(0, 3);

  if (!previewImages.length) return null;

  return (
    <section data-section="future-works" className="bg-[#f4f1ea] py-16 text-[#18231e] md:py-24">
      <div className="museum-container">
        <Reveal>
          <div className="mb-10 flex items-end justify-between gap-6 border-b border-[#31594c]/15 pb-7">
            <div>
              <p className="text-[11px] uppercase text-[#9b3b32]">{eyebrow}</p>
              <h2 className="serif-title mt-2 text-3xl font-normal md:text-5xl">{title}</h2>
            </div>
            {consultationAction ? <div className="hidden sm:block">{consultationAction}</div> : null}
          </div>
        </Reveal>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
          {previewImages.map((src, index) => (
            <Reveal key={src} delay={index * 0.04} className={previewImages.length % 2 === 1 && index === previewImages.length - 1 ? "col-span-2 md:col-span-1" : ""}>
              <article>
                <div className="relative aspect-[3/4] overflow-hidden rounded-[4px] bg-[#e8e4dc]">
                  <Image src={src} alt={`${itemName} ${labels[index] ?? title}`} fill loading="lazy" sizes="(min-width: 768px) 33vw, 50vw" className="object-cover saturate-[0.9]" />
                  <span className="absolute left-3 top-3 bg-[#fffefa]/90 px-2.5 py-1 text-[9px] text-[#9b3b32] backdrop-blur sm:left-4 sm:top-4 sm:text-[11px]">{comingSoonLabel}</span>
                </div>
                <p className="mt-3 text-xs text-[#59645e] sm:text-sm">{labels[index] ?? title}</p>
              </article>
            </Reveal>
          ))}
        </div>
        {consultationAction ? <div className="mt-8 sm:hidden">{consultationAction}</div> : null}
      </div>
    </section>
  );
}
