import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";

export function HomeContactEntry() {
  return (
    <section id="contact" className="bg-[#f7f5f0] px-5 pb-20 text-[#191f1c] lg:px-12">
      <div className="mx-auto flex max-w-[1344px] flex-col items-start justify-between gap-6 border-t border-[#24483c]/15 pt-8 sm:flex-row sm:items-center">
        <div>
          <p className="text-[10px] uppercase text-[#9d4b40]">Connect with heritage</p>
          <h2 className="serif-title mt-2 text-2xl font-normal">让传统与今天产生新的连接</h2>
        </div>
        <Link href="/heritage" className="inline-flex items-center gap-2 text-sm text-[#24483c] hover:text-[#9d4b40]">
          联系我们
          <ArrowUpRight className="size-4" />
        </Link>
      </div>
    </section>
  );
}
