import { redirect } from "next/navigation";

type Props = { params: Promise<{ locale: string }> };
export default async function LegacyPromotionsRedirect({ params }: Props) {
  const { locale } = await params;
  redirect(`/${locale === "en" ? "en" : "zh"}/admin`);
}
