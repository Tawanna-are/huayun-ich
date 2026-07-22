import { Play } from "lucide-react";
import type { InheritorInterviewVideo } from "@/lib/types/inheritor";

type InterviewVideoProps = {
  video?: InheritorInterviewVideo;
  eyebrow: string;
  title: string;
  description: string;
  emptyLabel: string;
};

export function InterviewVideo({ video, eyebrow, title, description, emptyLabel }: InterviewVideoProps) {
  return (
    <section className="border-y border-museumGold/18 bg-ink py-16 text-rice md:py-24">
      <div className="museum-container grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
        <div>
          <p className="inline-flex items-center gap-2 text-sm uppercase text-museumGold">
            <Play className="size-4 fill-museumGold" />
            {eyebrow}
          </p>
          <h2 className="serif-title mt-3 text-4xl font-normal leading-tight md:text-5xl">{title}</h2>
          <p className="mt-5 max-w-xl text-base leading-8 text-rice/62">{description}</p>
        </div>
        <div className="overflow-hidden rounded-lg border border-museumGold/18 bg-rice/[0.035] shadow-museum">
          {video ? (
            <video className="aspect-video h-full w-full object-cover" poster={video.poster} controls preload="metadata">
              <source src={video.url} type="video/mp4" />
            </video>
          ) : (
            <div className="grid aspect-video place-items-center px-8 text-center text-sm text-rice/48">{emptyLabel}</div>
          )}
        </div>
      </div>
    </section>
  );
}
