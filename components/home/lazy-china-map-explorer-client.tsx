"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { ProvinceExplorerData } from "@/lib/content/china-map";

type LazyChinaMapExplorerClientProps = {
  data: ProvinceExplorerData;
};

const ChinaMapExplorerClient = dynamic(
  () => import("@/components/home/china-map-explorer-client").then((module) => module.ChinaMapExplorerClient),
  {
    ssr: false,
    loading: () => <MapExplorerSkeleton />
  }
);

export function LazyChinaMapExplorerClient({ data }: LazyChinaMapExplorerClientProps) {
  const boundaryRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const element = boundaryRef.current;

    if (!element || shouldLoad) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "420px 0px" }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [shouldLoad]);

  return (
    <div ref={boundaryRef} className="min-h-[430px]">
      {shouldLoad ? <ChinaMapExplorerClient data={data} /> : <MapExplorerSkeleton />}
    </div>
  );
}

function MapExplorerSkeleton() {
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <div className="relative min-h-[430px] overflow-hidden rounded-lg border border-pine/12 bg-paper/78 p-4 shadow-porcelain md:p-6">
        <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <span className="h-3 w-36 rounded-full bg-pine/14" />
          <span className="h-7 w-24 rounded-full border border-pine/16 bg-mist" />
        </div>
        <div className="relative aspect-[1.18/0.82] min-h-[300px] rounded-lg border border-pine/8 bg-mist/56">
          <div className="absolute left-[18%] top-[20%] h-[58%] w-[72%] rounded-[46%] border border-pine/14 bg-paper/52" />
          <div className="absolute left-[50%] top-[48%] h-px w-[34%] -translate-x-1/2 bg-pine/14" />
        </div>
      </div>
      <div className="grid gap-4">
        <div className="rounded-lg border border-pine/12 bg-paper/78 p-4 shadow-goldline">
          <span className="block h-3 w-32 rounded-full bg-pine/14" />
          <span className="mt-5 block h-10 w-40 rounded-full bg-mist" />
          <div className="mt-6 space-y-3">
            <span className="block h-20 rounded-md border border-pine/8 bg-mist/70" />
            <span className="block h-20 rounded-md border border-pine/8 bg-mist/70" />
          </div>
        </div>
      </div>
    </div>
  );
}
