import { ContactApplicationForm } from "@/components/contact/contact-application-form";
import type { AppLocale } from "@/i18n/routing";

const copy = {
  zh: {
    eyebrow: "连接非遗",
    title: "让传统与今天产生新的连接",
    description: "普通咨询、传承支持、项目合作与内容授权均可在这里提交。"
  },
  en: {
    eyebrow: "Connect with heritage",
    title: "Connect tradition with today",
    description: "Submit general inquiries, heritage support, project cooperation or content licensing requests here."
  }
} satisfies Record<AppLocale, Record<string, string>>;

export function HomeContactEntry({ locale }: { locale: AppLocale }) {
  const t = copy[locale];

  return (
    <section id="contact" className="bg-[#f7f5f0] px-5 pb-20 text-[#191f1c] lg:px-12">
      <div className="mx-auto grid max-w-[1344px] gap-10 border-t border-[#24483c]/15 pt-12 lg:grid-cols-[0.7fr_1.3fr] lg:items-start">
        <div>
          <p className="text-[10px] uppercase text-[#9d4b40]">{t.eyebrow}</p>
          <h2 className="serif-title mt-3 max-w-md text-3xl font-normal leading-tight md:text-5xl">{t.title}</h2>
          <p className="mt-5 max-w-md text-sm leading-7 text-[#65716b]">{t.description}</p>
        </div>
        <ContactApplicationForm locale={locale} />
      </div>
    </section>
  );
}
