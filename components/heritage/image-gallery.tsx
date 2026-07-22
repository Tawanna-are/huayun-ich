"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { ExternalLink, Maximize2, X } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import type { HeritageGalleryImage } from "@/lib/types/heritage";
import { useEffect, useState } from "react";

type ImageGalleryProps = {
  images: HeritageGalleryImage[];
  title: string;
};

export function ImageGallery({ images, title }: ImageGalleryProps) {
  const t = useTranslations("Gallery");
  const [selectedImage, setSelectedImage] = useState<HeritageGalleryImage | null>(null);

  useEffect(() => {
    if (!selectedImage) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSelectedImage(null);
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedImage]);

  function openHighResolution(src: string) {
    window.open(src, "_blank", "noopener,noreferrer");
  }

  return (
    <section id="gallery" className="scroll-mt-28 bg-rice py-16 text-ink md:py-24">
      <div className="museum-container">
        <Reveal>
          <p className="text-sm uppercase text-cinnabar">{t("eyebrow")}</p>
          <h2 className="serif-title mt-3 text-4xl font-normal leading-tight md:text-5xl">
            {t("title")}
          </h2>
        </Reveal>
        <div className="mt-9 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          {images.map((image, index) => (
            <Reveal
              key={image.src}
              delay={index * 0.06}
              className={index === 0 ? "lg:row-span-2" : ""}
            >
              <figure className="group overflow-hidden rounded-lg border border-pine/10 bg-paper shadow-goldline">
                <button
                  type="button"
                  onClick={() => setSelectedImage(image)}
                  className={`relative block w-full overflow-hidden text-left ${
                    index === 0 ? "aspect-[1.05/0.82]" : "aspect-[1.2/0.72]"
                  }`}
                  aria-label={`Preview ${image.alt || title}`}
                >
                  <Image
                    src={image.src}
                    alt={image.alt || title}
                    fill
                    loading="lazy"
                    sizes={index === 0 ? "(min-width: 1024px) 58vw, 100vw" : "(min-width: 1024px) 38vw, 100vw"}
                    className="object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/68 to-transparent opacity-82" />
                  <span className="absolute right-4 top-4 inline-flex size-10 items-center justify-center rounded-full border border-rice/18 bg-ink/56 text-rice opacity-0 backdrop-blur-md transition group-hover:opacity-100">
                    <Maximize2 className="size-4" />
                  </span>
                </button>
                <figcaption className="px-5 py-4 text-sm text-ink/62">{image.caption}</figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>

      {selectedImage ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={selectedImage.alt || title}
          className="fixed inset-0 z-50 bg-ink/94 text-rice backdrop-blur-xl"
        >
          <div className="absolute inset-x-0 top-0 z-10 border-b border-rice/10 bg-ink/70 backdrop-blur-xl">
            <div className="museum-container flex items-center justify-between gap-4 py-4">
              <div className="min-w-0">
                <p className="truncate text-sm uppercase tracking-[0.18em] text-celadon">{title}</p>
                <p className="mt-1 truncate text-sm text-rice/58">{selectedImage.caption}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button type="button" size="sm" variant="outline" onClick={() => openHighResolution(selectedImage.src)}>
                  <ExternalLink className="size-4" />
                  View high resolution
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="text-rice hover:bg-rice/10 hover:text-rice"
                  onClick={() => setSelectedImage(null)}
                  aria-label="Close image preview"
                >
                  <X className="size-4" />
                </Button>
              </div>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close image preview"
            className="absolute inset-0 cursor-zoom-out"
            onClick={() => setSelectedImage(null)}
          />
          <div className="pointer-events-none relative flex h-full items-center justify-center px-4 pt-24 md:px-10">
            <div className="relative h-[72svh] w-full max-w-6xl">
              <Image
                src={selectedImage.src}
                alt={selectedImage.alt || title}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
