"use client";

import * as Sentry from "@sentry/nextjs";
import NextError from "next/error";
import { useEffect } from "react";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    Sentry.captureException(error, {
      tags: {
        area: "app-router",
        boundary: "global-error"
      },
      extra: {
        digest: error.digest
      }
    });
  }, [error]);

  return (
    <html lang="zh-CN" className="dark">
      <body>
        <main className="min-h-screen bg-[#0F0F0F] px-6 py-20 text-[#F8F6F2]">
          <div className="mx-auto flex max-w-3xl flex-col gap-8">
            <NextError statusCode={0} />
            <button
              type="button"
              onClick={reset}
              className="w-fit border border-[#C8A96A]/50 px-5 py-3 text-sm text-[#C8A96A] transition hover:border-[#C8A96A] hover:text-[#F8F6F2]"
            >
              重新加载
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
