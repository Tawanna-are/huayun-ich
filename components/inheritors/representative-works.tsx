import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import type { RepresentativeWork } from "@/lib/types/inheritor";

type RepresentativeWorksProps = {
  works: RepresentativeWork[];
  eyebrow: string;
  title: string;
  description: string;
  viewLabel: string;
};

export function RepresentativeWorks({ works, eyebrow, title, description, viewLabel }: RepresentativeWorksProps) {
  return (
    <section className="bg-rice py-16 text-ink md:py-24">
      <div className="museum-container">
        <div className="mb-10 max-w-2xl">
          <p className="text-sm uppercase text-cinnabar">{eyebrow}</p>
          <h2 className="serif-title mt-3 text-4xl font-normal leading-tight md:text-5xl">{title}</h2>
          <p className="mt-5 text-base leading-8 text-ink/64">{description}</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {works.map((work) => (
            <Link
              key={work.href}
              href={work.href}
              className="group grid overflow-hidden rounded-lg border border-ink/10 bg-white/64 shadow-museum transition hover:-translate-y-1 hover:border-cinnabar/34 md:grid-cols-[0.82fr_1fr]"
            >
              <div className="relative min-h-[260px] overflow-hidden">
                <Image
                  src={work.image}
                  alt={work.title}
                  fill
                  sizes="(min-width: 768px) 42vw, 100vw"
                  className="object-cover transition duration-700 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-col p-6">
                <Badge className="w-fit">{work.categoryName}</Badge>
                <h3 className="serif-title mt-6 text-4xl font-normal">{work.title}</h3>
                <p className="mt-2 text-xs uppercase tracking-[0.16em] text-ink/42">{work.englishTitle}</p>
                <p className="mt-5 line-clamp-4 text-sm leading-7 text-ink/64">{work.summary}</p>
                <span className="mt-auto inline-flex items-center gap-2 pt-7 text-sm text-cinnabar">
                  {viewLabel}
                  <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
