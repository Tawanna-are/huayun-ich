"use client";

import { useEffect, useRef, useState } from "react";
import { formatCompactNumber } from "@/lib/utils";

type CountUpProps = {
  value: number;
  suffix?: string;
  duration?: number;
};

export function CountUp({ value, suffix = "", duration = 1.3 }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    let frame = 0;
    let started = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || started) {
          return;
        }

        started = true;
        const start = performance.now();
        const durationMs = duration * 1000;

        const tick = (now: number) => {
          const progress = Math.min((now - start) / durationMs, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setDisplay(Math.round(value * eased));

          if (progress < 1) {
            frame = requestAnimationFrame(tick);
          }
        };

        frame = requestAnimationFrame(tick);
        observer.disconnect();
      },
      { rootMargin: "0px 0px -80px" }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [duration, value]);

  return (
    <span ref={ref}>
      {formatCompactNumber(display)}
      {suffix}
    </span>
  );
}
