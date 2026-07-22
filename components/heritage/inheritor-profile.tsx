import type { ReactNode } from "react";
import Image from "next/image";
import { Reveal } from "@/components/motion/reveal";
import type { HeritageItem } from "@/lib/types/heritage";

type InheritorProfileProps = {
  inheritor: HeritageItem["inheritor"];
  eyebrow: string;
  title: string;
  consultationAction?: ReactNode;
};

const fallbackName = "待补充";
const fallbackTitle = "传承人信息待补充";
const fallbackBio = "该项目的传承人资料将在内容后台补充。";

export function InheritorProfile({ inheritor, eyebrow, title, consultationAction }: InheritorProfileProps) {
  if (
    !inheritor.name.trim() ||
    inheritor.name === fallbackName ||
    inheritor.title === fallbackTitle ||
    inheritor.bio === fallbackBio
  ) {
    return null;
  }

  return (
    <section data-section="inheritor-profile" className="bg-[#102c28] py-16 text-[#f8f4e9] md:py-24">
      <div className="museum-container grid gap-10 md:grid-cols-[0.8fr_1.2fr] md:items-center lg:gap-16">
        <Reveal>
          <div className="relative aspect-[4/5] overflow-hidden rounded-[4px] bg-[#193b35]">
            <Image src={inheritor.image} alt={inheritor.name} fill loading="lazy" sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" />
          </div>
        </Reveal>
        <Reveal delay={0.06}>
          <p className="text-[11px] uppercase text-[#d3bea0]">{eyebrow}</p>
          <h2 className="serif-title mt-2 text-3xl font-normal md:text-5xl">{title}</h2>
          <div className="mt-10 border-t border-white/15 pt-8">
            <h3 className="serif-title text-4xl font-normal">{inheritor.name}</h3>
            <p className="mt-2 text-xs text-[#d3bea0]">{inheritor.title}</p>
            <p className="mt-6 max-w-2xl text-sm leading-7 text-white/65 md:text-base md:leading-8">{inheritor.bio}</p>
            {consultationAction ? <div className="mt-8">{consultationAction}</div> : null}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
