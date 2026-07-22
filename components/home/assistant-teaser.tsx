import { useTranslations } from "next-intl";
import { ArrowUpRight, Bot } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export function AssistantTeaser() {
  const t = useTranslations("Home.assistant");

  return (
    <section className="bg-mist py-16 text-ink md:py-24">
      <div className="museum-container">
        <Reveal>
          <div className="grid gap-8 rounded-lg border border-pine/12 bg-paper/80 p-8 shadow-porcelain md:grid-cols-[1fr_auto] md:items-center md:p-10">
            <div>
              <p className="inline-flex items-center gap-2 text-sm uppercase text-cinnabar">
                <Bot className="size-4" />
                {t("eyebrow")}
              </p>
              <h2 className="serif-title mt-4 text-4xl font-normal leading-tight md:text-5xl">
                {t("title")}
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-ink/62">
                {t("description")}
              </p>
            </div>
            <Button asChild variant="outline" className="w-fit">
              <Link href="/assistant">
                {t("open")}
                <ArrowUpRight className="size-4" />
              </Link>
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
