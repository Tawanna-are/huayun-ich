import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ContactApplicationForm } from "@/components/contact/contact-application-form";
import { defaultLocale, isAppLocale, type AppLocale } from "@/i18n/routing";
import { createMetadata } from "@/lib/metadata";

type PageProps = { params: Promise<{ locale: string }> };

const copy = {
  zh: { title: "联系我们", description: "联系华韵非遗，提交非遗文化交流、传承支持、项目合作或内容授权咨询。", eyebrow: "Contact Huayun Heritage", heading: "与华韵非遗联系", body: "欢迎提交普通咨询、传承支持、项目合作或内容授权申请。我们会在核实后通过您填写的联系方式回复。" },
  en: { title: "Contact Huayun Heritage", description: "Contact Huayun Heritage for cultural exchange, heritage support, project cooperation or content licensing inquiries.", eyebrow: "Contact Huayun Heritage", heading: "Start a conversation", body: "Send a general inquiry, heritage support request, project cooperation proposal or content licensing request. We will review it and reply through the contact details you provide." }
} satisfies Record<AppLocale, Record<string, string>>;

function resolveLocale(locale: string): AppLocale {
  return isAppLocale(locale) ? locale : defaultLocale;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const currentLocale = resolveLocale(locale);
  const content = copy[currentLocale];
  return createMetadata({ title: content.title, description: content.description, path: "/contact", locale: currentLocale, keywords: ["非遗合作", "heritage cooperation", "文化交流"] });
}

export default async function ContactPage({ params }: PageProps) {
  const { locale } = await params;
  const currentLocale = resolveLocale(locale);
  const content = copy[currentLocale];
  setRequestLocale(currentLocale);

  return <main className="bg-[#f4f1ea] px-5 py-28 text-[#18231e] lg:px-12"><section className="mx-auto grid max-w-[1344px] gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:items-start"><div><p className="text-[11px] uppercase text-[#9b3b32]">{content.eyebrow}</p><h1 className="serif-title mt-4 text-4xl font-normal leading-tight md:text-6xl">{content.heading}</h1><p className="mt-6 max-w-md text-base leading-8 text-[#53625b]">{content.body}</p></div><ContactApplicationForm locale={currentLocale} /></section></main>;
}
