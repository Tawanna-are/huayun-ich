import Image from "next/image";
import { Reveal } from "@/components/motion/reveal";
import type { HeritageGalleryImage } from "@/lib/types/heritage";

type MakingProcessProps = {
  images: HeritageGalleryImage[];
  itemName: string;
  eyebrow: string;
  title: string;
};

export function MakingProcess({ images, itemName, eyebrow, title }: MakingProcessProps) {
  if (images.length < 2) return null;

  return (
    <section data-section="making-process" className="bg-[#fffefa] py-16 text-[#18231e] [content-visibility:auto] md:py-24">
      <div className="museum-container">
        <Reveal>
          <div className="mb-10 border-b border-[#31594c]/15 pb-7">
            <p className="text-[11px] uppercase text-[#9b3b32]">{eyebrow}</p>
            <h2 className="serif-title mt-2 text-3xl font-normal md:text-5xl">{title}</h2>
          </div>
        </Reveal>
        <div className="grid gap-x-6 gap-y-10 md:grid-cols-2">
          {images.map((image, index) => (
            <Reveal key={`${image.src}-${index}`} delay={index * 0.04}>
              <figure className="grid gap-4">
                <div className="relative aspect-[4/3] overflow-hidden rounded-[4px] bg-[#e8e4dc]">
                  <Image
                    src={image.src}
                    alt={image.alt || itemName}
                    fill
                    loading="lazy"
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <figcaption className="grid grid-cols-[auto_1fr] gap-4 border-t border-[#31594c]/10 pt-4">
                  <span className="text-[11px] tabular-nums text-[#9b3b32]">{String(index + 1).padStart(2, "0")}</span>
                  {image.caption ? <span className="text-sm leading-6 text-[#59645e]">{image.caption}</span> : <span aria-hidden="true" />}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
