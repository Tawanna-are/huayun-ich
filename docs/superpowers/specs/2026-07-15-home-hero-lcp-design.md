# Home Hero LCP Optimization Design

## Goal

Reduce the mobile Lighthouse Largest Contentful Paint for the homepage Hero below 2.5 seconds without changing its composition, crop, motion, CMS selection, or component interface.

## Design

Keep `HeroSection({ imageSrc })` and the existing CMS data flow unchanged. Continue using `next/image` with `fill` and the current object-position classes, but make the LCP request explicit with `priority` and `fetchPriority="high"`. Replace the broad `100vw` sizing hint with responsive expressions matching the actual horizontal page padding and 1400px maximum width.

Recompress the existing tie-dye WebP source in place through the image compression skill. The visual acceptance criterion is no noticeable crop, layout, or color change at 1440x900 and 390x844. Next.js remains responsible for generating device-sized AVIF/WebP responses.

## Verification

Add source-level regression assertions for priority, high fetch priority, quality, and responsive sizing. Verify the focused homepage tests, production build, desktop/mobile screenshots, and a fresh mobile Lighthouse run. The performance gate is LCP below 2.5 seconds; if the gate is missed, report the measured bottleneck instead of claiming completion.

## Scope

No changes to CMS, database, API, homepage data composition, Hero copy, overlay layers, animation classes, or component props.
