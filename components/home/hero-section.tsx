import { HomeHeader } from "@/components/home/home-header";

export function HeroSection() {
  return (
    <div className="min-h-screen bg-[#f7f5f0] text-[#191f1c]">
      <HomeHeader />
      <section className="mx-auto grid min-h-[650px] max-w-[1440px] grid-cols-1 items-center gap-12 px-5 pb-16 pt-10 lg:grid-cols-[35%_65%] lg:gap-0 lg:px-12 lg:pb-20 lg:pt-6">
        <div className="lg:pr-14">
          <div className="h-3 w-36 animate-pulse rounded bg-[#24483c]/10 motion-reduce:animate-none" />
          <div className="mt-7 h-28 max-w-sm animate-pulse rounded bg-[#24483c]/10 motion-reduce:animate-none" />
          <div className="mt-7 h-20 max-w-sm animate-pulse rounded bg-[#24483c]/10 motion-reduce:animate-none" />
        </div>
        <div className="grid h-[480px] grid-cols-[minmax(0,1fr)_48px_48px_48px] gap-2 sm:h-[540px] sm:grid-cols-[minmax(0,1fr)_58px_58px_58px] lg:h-[560px] lg:grid-cols-[minmax(0,1fr)_66px_66px_66px]">
          <div className="animate-pulse rounded-[8px] bg-[#cbd4ce] motion-reduce:animate-none" />
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="animate-pulse rounded-[8px] bg-[#b9c5bd] motion-reduce:animate-none" />
          ))}
        </div>
      </section>
    </div>
  );
}
