import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import type { LegalDocument } from "@/lib/legal/legal-content";

type LegalPageProps = {
  document: LegalDocument;
  locale: AppLocale;
};

export function LegalPage({ document, locale }: LegalPageProps) {
  const updatedLabel = locale === "en" ? "Last updated" : "最后更新";

  return (
    <main className="min-h-screen bg-[#f4f1ea] text-[#18231e]">
      <header className="border-b border-[#31594c]/10 pt-24 md:pt-28">
        <div className="museum-container py-12 md:py-16">
          <p className="text-[11px] uppercase text-[#9b3b32]">
            {locale === "en" ? "Legal information" : "法律信息"}
          </p>
          <h1 className="serif-title mt-4 max-w-4xl text-4xl font-normal leading-tight sm:text-5xl md:text-6xl">
            {document.title}
          </h1>
          <p className="mt-6 max-w-3xl text-sm leading-7 text-[#53625b] md:text-base md:leading-8">
            {document.intro}
          </p>
          <p className="mt-5 text-xs text-[#7a847e]">
            {updatedLabel}: {document.updatedAt}
          </p>
        </div>
      </header>

      <article className="museum-container py-12 md:py-20">
        <div className="max-w-3xl divide-y divide-[#31594c]/10">
          {document.sections.map((section) => (
            <section key={section.title} className="py-9 first:pt-0 md:py-11">
              <h2 className="serif-title text-2xl font-normal leading-snug md:text-3xl">
                {section.title}
              </h2>
              <div className="mt-5 space-y-5 text-sm leading-8 text-[#45544d] md:text-base md:leading-8">
                {section.paragraphs.map((paragraph, paragraphIndex) => (
                  <p key={`${section.title}-${paragraphIndex}`}>
                    {paragraph.map((segment, segmentIndex) =>
                      segment.href ? (
                        <Link
                          key={`${segment.text}-${segmentIndex}`}
                          href={segment.href}
                          className="font-medium text-[#9b3b32] underline decoration-[#9b3b32]/35 underline-offset-4 transition hover:decoration-[#9b3b32]"
                        >
                          {segment.text}
                        </Link>
                      ) : (
                        <span key={`${segment.text}-${segmentIndex}`}>{segment.text}</span>
                      )
                    )}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}
