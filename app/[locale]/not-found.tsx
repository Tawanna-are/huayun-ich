import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const t = useTranslations("NotFound");

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink px-6 text-rice">
      <div className="max-w-xl text-center">
        <p className="text-sm uppercase text-museumGold">404</p>
        <h1 className="serif-title mt-4 text-5xl font-normal">{t("title")}</h1>
        <p className="mt-5 text-rice/68">{t("description")}</p>
        <Button asChild className="mt-8">
          <Link href="/heritage">{t("back")}</Link>
        </Button>
      </div>
    </main>
  );
}
