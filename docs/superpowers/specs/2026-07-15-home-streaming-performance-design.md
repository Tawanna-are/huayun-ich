# Homepage Streaming Performance Design

## Goal

Reduce homepage TTFB and first-screen JavaScript while preserving the current museum visuals, CSS animations, and per-request live CMS data.

## Architecture

`app/[locale]/page.tsx` starts `getHeritageItems()` without awaiting it at the page root. A server-only `HomeCmsContent` awaits that single promise inside `Suspense`, selects the Hero and featured items, and renders the existing `HeroSection` and `FeaturedGrid`. The Suspense fallback renders the existing fallback Hero immediately, allowing the browser to discover the LCP image before Supabase completes.

`HomeHeader` becomes a server component. Its desktop navigation and branding remain server-rendered, while a new `HomeMobileMenu` client component owns only the mobile `open` state and toggle interaction. No CMS data crosses that client boundary.

`FeaturedGrid` remains server-rendered for SEO and zero hydration. Its section uses CSS `content-visibility: auto` and an intrinsic-size estimate so the browser delays below-fold layout and paint without adding a client request or changing the visual result.

## Data and Freshness

The homepage remains `force-dynamic` and calls `noStore()` on every request. The CMS promise is created once and shared by the streamed server component; there is no ISR, React cache, API proxy, or duplicate Supabase query.

## Verification

Source regressions verify the streaming boundary, single promise, server/client split, and deferred featured rendering. Production build, desktop/mobile screenshots, mobile menu interaction, and Lighthouse record Performance, LCP, TBT, and document TTFB.
