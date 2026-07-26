import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { routing } from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);

const cspDirectives = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.supabase.co https://images.unsplash.com https://images.pexels.com",
  "media-src 'self' blob: https://*.supabase.co https://interactive-examples.mdn.mozilla.net",
  "connect-src 'self' https://*.supabase.co https://api.openai.com https://*.sentry.io https://*.ingest.sentry.io https://www.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com",
  "font-src 'self' data:",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'"
];

export function applySecurityHeaders(response: ReturnType<typeof intlMiddleware>) {
  response.headers.set("Content-Security-Policy", cspDirectives.join("; "));
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(self)");
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  return response;
}

export default function middleware(request: NextRequest) {
  return applySecurityHeaders(intlMiddleware(request));
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"]
};
