"use client";

import { Film, Play } from "lucide-react";
import { useMemo, useRef } from "react";
import { Reveal } from "@/components/motion/reveal";
import type { HeritageItem, HeritageVideo } from "@/lib/types/heritage";

type HeritageVideoArchiveProps = {
  item: HeritageItem;
  eyebrow: string;
  title: string;
  description: string;
};

export function HeritageVideoArchive({ item, eyebrow, title, description }: HeritageVideoArchiveProps) {
  const trackedVideos = useRef(new Set<string>());
  const videos = useMemo(() => {
    const uploaded = item.videos ?? [];
    const combined: HeritageVideo[] = item.videoUrl
      ? [{ title: item.name, url: item.videoUrl, poster: item.videoPoster || item.image || item.heroImage }, ...uploaded]
      : uploaded;

    return combined.filter((video, index) => combined.findIndex((candidate) => candidate.url === video.url) === index);
  }, [item.heroImage, item.image, item.name, item.videoPoster, item.videoUrl, item.videos]);

  function trackPlayback(videoUrl: string, event: "play" | "ended") {
    if (event === "play" && trackedVideos.current.has(videoUrl)) return;
    if (event === "play") trackedVideos.current.add(videoUrl);

    void fetch("/api/media/playback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ heritageId: item.id, slug: item.slug, event, videoUrl })
    }).catch(() => undefined);
  }

  if (!videos.length) return null;

  return (
    <section id="heritage-video" className="relative scroll-mt-28 overflow-hidden bg-[#102c28] py-20 text-[#f8f4e9] [background-image:repeating-linear-gradient(135deg,transparent_0,transparent_28px,rgba(255,255,255,0.018)_29px,transparent_30px)] md:py-28">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-[8%] top-0 h-px bg-gradient-to-r from-transparent via-[#d3bea0]/[0.42] to-transparent" />
      <div className="museum-container relative">
        <Reveal>
          <div className="mb-12 grid gap-7 border-b border-white/10 pb-9 md:grid-cols-[1fr_0.72fr] md:items-end">
            <div>
              <p className="inline-flex items-center gap-2 text-xs text-[#d3bea0]">
                <Film className="size-4" aria-hidden="true" />
                {eyebrow}
              </p>
              <h2 className="serif-title mt-3 text-4xl font-normal md:text-6xl">{title}</h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-white/[0.62] md:justify-self-end">{description}</p>
          </div>
        </Reveal>

        <div className="grid gap-6 lg:grid-cols-2">
          {videos.map((video, index) => (
            <Reveal key={video.url} delay={index * 0.06} className={index === 0 ? "lg:col-span-2" : ""}>
              <figure
                data-video-stage="immersive"
                className="relative overflow-hidden rounded-[6px] border border-[#d3bea0]/[0.18] bg-[#071613] p-2 shadow-[0_36px_90px_rgba(0,0,0,0.34)]"
              >
                <div aria-hidden="true" className="pointer-events-none absolute inset-x-4 top-0 h-2 opacity-35 [background-image:repeating-linear-gradient(90deg,#d3bea0_0,#d3bea0_8px,transparent_8px,transparent_18px)]" />
                <video
                  className={`w-full rounded-[3px] bg-black object-contain ${index === 0 ? "aspect-video" : "aspect-[16/10]"}`}
                  controls
                  playsInline
                  preload="metadata"
                  aria-label={`${video.title || item.name} · ${title}`}
                  poster={video.poster || item.videoPoster || item.image || item.heroImage}
                  onPlay={() => trackPlayback(video.url, "play")}
                  onEnded={() => trackPlayback(video.url, "ended")}
                >
                  <source src={video.url} type="video/mp4" />
                </video>
                <figcaption className="flex items-center justify-between gap-4 border-t border-white/10 px-4 py-4 text-sm text-white/[0.72]">
                  <span className="inline-flex items-center gap-2">
                    <Play className="size-3.5 fill-current text-[#d3bea0]" aria-hidden="true" />
                    {video.title || item.name}
                  </span>
                  <span className="text-xs tabular-nums text-white/[0.38]">{String(index + 1).padStart(2, "0")}</span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
