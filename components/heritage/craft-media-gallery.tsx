"use client";

import Image from "next/image";
import { Maximize2, X } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Reveal } from "@/components/motion/reveal";
import type { HeritageGalleryImage } from "@/lib/types/heritage";

type CraftMediaGalleryProps = {
  images: HeritageGalleryImage[];
  itemName: string;
  eyebrow: string;
  title: string;
  description: string;
  closeLabel: string;
  actions?: ReactNode;
};

export function CraftMediaGallery({ images, itemName, eyebrow, title, description, closeLabel, actions }: CraftMediaGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<HeritageGalleryImage | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!selectedImage) return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previousOverflow = document.body.style.overflow;

    function closeOnCancel(event: Event) {
      event.preventDefault();
      setSelectedImage(null);
    }

    if (!dialog.open) dialog.showModal();
    closeButtonRef.current?.focus();
    document.body.style.overflow = "hidden";
    dialog.addEventListener("cancel", closeOnCancel);

    return () => {
      document.body.style.overflow = previousOverflow;
      dialog.removeEventListener("cancel", closeOnCancel);
      if (dialog.open) dialog.close();
      lastTriggerRef.current?.focus();
    };
  }, [selectedImage]);

  if (!images.length) return null;
  const [primaryImage, ...detailImages] = images;

  function openImage(image: HeritageGalleryImage, trigger: HTMLButtonElement) {
    lastTriggerRef.current = trigger;
    setSelectedImage(image);
  }

  return (
    <section id="craft-media" className="bg-[#f4f1ea] py-16 text-[#18231e] md:py-24">
      <div className="museum-container">
        <Reveal>
          <div className="mb-9 flex flex-col gap-3 border-b border-[#31594c]/15 pb-7 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] uppercase text-[#9b3b32]">{eyebrow}</p>
              <h2 className="serif-title mt-2 text-3xl font-normal md:text-5xl">{title}</h2>
            </div>
            <p className="max-w-sm text-xs leading-6 text-[#65716b] sm:text-right">{description}</p>
          </div>
        </Reveal>

        <Reveal>
          <figure data-gallery-role="primary" className="group">
            <button
              type="button"
              onClick={(event) => openImage(primaryImage, event.currentTarget)}
              className="relative block aspect-[4/3] w-full overflow-hidden bg-[#e4e0d7] text-left md:aspect-[16/10]"
              aria-label={`${title}: ${primaryImage.alt || itemName}`}
            >
              <Image src={primaryImage.src} alt={primaryImage.alt || itemName} fill loading="lazy" sizes="100vw" className="object-cover transition duration-700 group-hover:scale-[1.025] motion-reduce:transform-none" />
              <span className="absolute right-5 top-5 grid size-10 place-items-center rounded-full border border-white/40 bg-black/15 text-white opacity-0 backdrop-blur transition group-hover:opacity-100 group-focus-within:opacity-100 motion-reduce:transition-none">
                <Maximize2 className="size-4" aria-hidden="true" />
              </span>
            </button>
            {primaryImage.caption ? <figcaption className="border-b border-[#31594c]/10 py-4 text-xs text-[#65716b]">{primaryImage.caption}</figcaption> : null}
          </figure>
        </Reveal>

        {detailImages.length ? (
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {detailImages.map((image, index) => (
              <Reveal key={`${image.src}-${index}`} delay={index * 0.04}>
                <figure className="group">
                  <button
                    type="button"
                    onClick={(event) => openImage(image, event.currentTarget)}
                    className="relative block aspect-[4/3] w-full overflow-hidden bg-[#e4e0d7] text-left"
                    aria-label={`${title}: ${image.alt || itemName}`}
                  >
                    <Image src={image.src} alt={image.alt || itemName} fill loading="lazy" sizes="(min-width: 768px) 50vw, 100vw" className="object-cover transition duration-700 group-hover:scale-[1.035] motion-reduce:transform-none" />
                    <span className="absolute left-4 top-4 text-[11px] tabular-nums text-white/75">{String(index + 2).padStart(2, "0")}</span>
                  </button>
                  {image.caption ? <figcaption className="py-4 text-xs text-[#65716b]">{image.caption}</figcaption> : null}
                </figure>
              </Reveal>
            ))}
          </div>
        ) : null}
      </div>

      {selectedImage ? (
        <dialog ref={dialogRef} role="dialog" aria-modal="true" aria-label={selectedImage.alt || itemName} className="fixed inset-0 z-50 m-0 h-[100dvh] w-screen max-w-none border-0 bg-[#071612]/[0.96] p-0 text-white backdrop:bg-[#071612]/40 backdrop:backdrop-blur-sm">
          <button type="button" tabIndex={-1} className="absolute inset-0 cursor-zoom-out" onClick={() => setSelectedImage(null)} aria-label={closeLabel} />
          <div className="pointer-events-none relative flex h-full items-center justify-center px-4 py-20 md:px-10">
            <div className="relative h-full w-full max-w-6xl"><Image src={selectedImage.src} alt={selectedImage.alt || itemName} fill sizes="100vw" className="object-contain" /></div>
          </div>
          <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4 backdrop-blur md:px-10">
            <p className="max-w-[75%] truncate text-sm text-white/70">{selectedImage.caption}</p>
            <div className="flex shrink-0 items-center gap-3">
              {actions}
              <button ref={closeButtonRef} type="button" onClick={() => setSelectedImage(null)} className="grid size-10 place-items-center rounded-full border border-white/20 transition hover:bg-white/10" aria-label={closeLabel} title={closeLabel}><X className="size-5" aria-hidden="true" /></button>
            </div>
          </div>
        </dialog>
      ) : null}
    </section>
  );
}
