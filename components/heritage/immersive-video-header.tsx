"use client";

import Image from "next/image";
import { ArrowLeft, CalendarDays, MapPin, Play, Radio } from "lucide-react";
import { useMemo, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import type { HeritageItem } from "@/lib/types/heritage";

type ImmersiveVideoHeaderProps = {
  item: HeritageItem;
  title: string;
  subtitle: string;
  backLabel: string;
  inscriptionLabel: string;
  videoLabel: string;
  scrollLabel: string;
};

export function ImmersiveVideoHeader({
  item,
  title,
  subtitle,
  backLabel,
  inscriptionLabel,
  videoLabel,
  scrollLabel
}: ImmersiveVideoHeaderProps) {
  const hasTrackedPlay = useRef(false);
  const resolvedPoster = useMemo(() => item.videoPoster || item.heroImage || item.image, [item.heroImage, item.image, item.videoPoster]);

  function trackPlayback(eventName: "play" | "ended") {
    if (eventName === "play" && hasTrackedPlay.current) {
      return;
    }

    if (eventName === "play") {
      hasTrackedPlay.current = true;
    }

    void fetch("/api/media/playback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        heritageId: item.id,
        slug: item.slug,
        event: eventName,
        videoUrl: item.videoUrl
      })
    }).catch(() => undefined);
  }

  return (
    <section id="hero-video" className="relative min-h-[96svh] overflow-hidden bg-rice text-ink">
      {item.videoUrl ? (
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-52"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={resolvedPoster}
          aria-label={`${item.name} video archive background`}
        >
          <source src={item.videoUrl} type="video/mp4" />
        </video>
      ) : (
        <Image
          src={item.heroImage}
          alt={item.name}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-58"
        />
      )}

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_76%_30%,rgba(140,169,154,0.28),transparent_28%),linear-gradient(90deg,rgba(251,248,239,0.98),rgba(251,248,239,0.66),rgba(251,248,239,0.22)),linear-gradient(180deg,rgba(251,248,239,0.2),#fbf8ef_96%)]" />
      <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-rice to-transparent" />
      <div className="pointer-events-none absolute left-6 top-28 hidden h-[62svh] w-px bg-gradient-to-b from-transparent via-pine/34 to-transparent md:block" />

      <div className="museum-container relative z-10 flex min-h-[96svh] flex-col justify-end pb-10 pt-28 md:pb-16">
        <Link
          href="/heritage"
          className="mb-auto inline-flex w-fit items-center gap-2 rounded-md bg-paper/62 px-3 py-2 text-sm text-ink/68 shadow-goldline backdrop-blur transition hover:text-cinnabar"
        >
          <ArrowLeft className="size-4" />
          {backLabel}
        </Link>

        <div className="max-w-5xl">
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <Badge>{item.categoryName}</Badge>
            <span className="inline-flex items-center gap-2 text-sm text-ink/62">
              <MapPin className="size-4 text-pine" />
              {item.region}
            </span>
            <span className="inline-flex items-center gap-2 text-sm text-ink/62">
              <CalendarDays className="size-4 text-pine" />
              {inscriptionLabel}
            </span>
          </div>
          <p className="mb-5 inline-flex items-center gap-3 border-l border-cinnabar/54 pl-4 text-sm uppercase tracking-[0.24em] text-cinnabar">
            <Play className="size-4 fill-cinnabar" />
            {videoLabel}
          </p>
          <h1 className="serif-title text-6xl font-normal leading-[0.98] text-ink md:text-8xl lg:text-9xl">
            {title}
          </h1>
          <p className="mt-5 text-base uppercase tracking-[0.18em] text-pine/72 md:text-lg">{subtitle}</p>
          <p className="mt-8 max-w-2xl text-base leading-8 text-ink/70 md:text-xl md:leading-9">{item.summary}</p>

          {item.videoUrl ? (
            <div className="mt-9 max-w-3xl overflow-hidden rounded-lg border border-pine/12 bg-paper/86 shadow-porcelain backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-pine/10 px-4 py-3 text-xs uppercase tracking-[0.18em] text-ink/52">
                <span className="inline-flex items-center gap-2">
                  <Radio className="size-4 text-cinnabar" />
                  Adaptive player
                </span>
                <span className="text-pine/78">{item.city}</span>
              </div>
              <video
                className="aspect-video w-full bg-soot object-contain"
                controls
                playsInline
                preload="metadata"
                poster={resolvedPoster}
                onPlay={() => trackPlayback("play")}
                onEnded={() => trackPlayback("ended")}
              >
                <source src={item.videoUrl} type="video/mp4" />
              </video>
            </div>
          ) : null}
        </div>

        <div className="mt-12 grid gap-4 border-t border-pine/12 pt-5 text-xs uppercase tracking-[0.2em] text-ink/44 md:grid-cols-[1fr_auto]">
          <span>{scrollLabel}</span>
          <span className="hidden text-cinnabar md:block">{item.province}</span>
        </div>
      </div>
    </section>
  );
}
