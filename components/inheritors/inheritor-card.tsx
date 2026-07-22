import Image from "next/image";
import { ArrowUpRight, MapPin, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FavoriteButton } from "@/components/user/favorite-button";
import { Link } from "@/i18n/navigation";
import type { InheritorProfile } from "@/lib/types/inheritor";

type InheritorCardProps = {
  profile: InheritorProfile;
  viewLabel: string;
};

export function InheritorCard({ profile, viewLabel }: InheritorCardProps) {
  return (
    <article className="group relative h-full transition duration-300 hover:-translate-y-2 hover:scale-[1.01]">
      <div className="absolute right-4 top-4 z-30">
        <FavoriteButton targetType="inheritor" targetId={profile.id} compact />
      </div>
      <Link
        href={`/inheritors/${profile.id}`}
        className="grid h-full overflow-hidden rounded-lg border border-museumGold/18 bg-rice/[0.045] shadow-goldline md:grid-rows-[auto_1fr]"
      >
        <div className="relative aspect-[1.05/0.72] overflow-hidden">
          <Image
            src={profile.image}
            alt={profile.name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/84 via-ink/14 to-transparent" />
          <div className="absolute left-4 top-4">
            <Badge>{profile.heritageCategoryName}</Badge>
          </div>
        </div>
        <div className="flex flex-col p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-museumGold/72">
                <Sparkles className="size-3" />
                {profile.heritageName}
              </p>
              <h2 className="serif-title mt-3 text-3xl font-normal text-rice">{profile.name}</h2>
              <p className="mt-2 text-sm leading-6 text-rice/58">{profile.title}</p>
            </div>
            <ArrowUpRight className="mt-1 size-5 shrink-0 text-museumGold transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
          <p className="mt-4 line-clamp-3 text-sm leading-7 text-rice/62">{profile.bio}</p>
          <div className="mt-auto flex items-center justify-between gap-4 pt-5 text-xs text-rice/48">
            <span className="inline-flex items-center gap-2">
              <MapPin className="size-4 text-museumGold" />
              {profile.region}
            </span>
            <span className="text-museumGold">{viewLabel}</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
