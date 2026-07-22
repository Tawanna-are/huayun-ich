"use client";

import { Reveal } from "@/components/motion/reveal";
import type { HeritageTimelineEvent } from "@/lib/types/heritage";

export function Timeline({ events }: { events: HeritageTimelineEvent[] }) {
  return (
    <div className="relative w-full min-w-0 max-w-[calc(100vw-2rem)] overflow-hidden sm:max-w-full">
      <div
        className="absolute left-0 right-0 top-5 h-px origin-left bg-gradient-to-r from-[#9b3b32]/[0.5] via-[#31594c]/[0.24] to-transparent"
      />
      <div
        role="region"
        aria-label="Timeline"
        tabIndex={0}
        className="grid grid-rows-1 snap-x snap-mandatory auto-cols-[86%] grid-flow-col gap-5 overflow-x-auto pb-16 pt-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#31594c]/[0.45] [scrollbar-color:rgba(49,89,76,0.22)_transparent] [scrollbar-width:thin] sm:auto-cols-[48%] xl:auto-cols-[calc((100%_-_2.5rem)/3)]"
      >
        {events.map((event, index) => (
          <Reveal key={`${event.year}-${event.title}`} delay={index * 0.08} className="h-full snap-start">
            <article className="relative h-full min-h-[250px] overflow-hidden rounded-[6px] border border-[#31594c]/[0.12] bg-[#fffefa] px-6 pb-7 pt-8 shadow-[0_18px_44px_rgba(43,56,49,0.09)] transition duration-500 hover:-translate-y-1 hover:border-[#9b3b32]/[0.24] hover:shadow-[0_26px_56px_rgba(43,56,49,0.14)] motion-reduce:transform-none motion-reduce:transition-none">
              <span
                className="absolute left-6 top-0 h-5 w-px bg-[#9b3b32] shadow-[0_0_0_4px_rgba(155,59,50,0.08)]"
              />
              <div className="flex items-start justify-between gap-4">
                <div className="serif-title text-3xl text-[#9b3b32]">{event.year}</div>
                <span className="text-xs tabular-nums text-[#31594c]/[0.36]">{String(index + 1).padStart(2, "0")}</span>
              </div>
              <div className="mt-8 h-px bg-gradient-to-r from-[#31594c]/[0.18] to-transparent" />
              <h3 className="serif-title mt-6 text-2xl font-normal text-[#18231e]">{event.title}</h3>
              <p className="mt-4 text-sm leading-7 text-[#5f6b65]">{event.description}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
