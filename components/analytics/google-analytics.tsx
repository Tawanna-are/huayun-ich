"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

function GoogleAnalyticsPageView({ ready }: { ready: boolean }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!ready || !window.gtag) return;

    const query = searchParams.toString();
    const pagePath = query ? `${pathname}?${query}` : pathname;

    window.gtag("event", "page_view", {
      page_path: pagePath,
      page_location: window.location.href,
      page_title: document.title
    });
  }, [pathname, ready, searchParams]);

  return null;
}

export function GoogleAnalytics() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const [ready, setReady] = useState(false);

  if (process.env.NODE_ENV !== "production" || !measurementId?.startsWith("G-")) {
    return null;
  }

  return (
    <>
      <Script
        id="google-analytics"
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
        onLoad={() => {
          window.dataLayer = window.dataLayer || [];
          window.gtag = function gtag(...args: unknown[]) {
            window.dataLayer.push(args);
          };
          window.gtag("js", new Date());
          window.gtag("config", measurementId, { send_page_view: false });
          setReady(true);
        }}
      />
      <GoogleAnalyticsPageView ready={ready} />
    </>
  );
}
