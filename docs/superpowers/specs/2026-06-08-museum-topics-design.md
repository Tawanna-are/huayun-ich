# Museum Topics Design Spec

## Goal

Add four curated museum topic pages so the digital museum reads as an editorial exhibition space instead of only a searchable archive.

## Topics

- 中国四大名绣 / The Four Great Chinese Embroideries
- 中国传统戏曲 / Chinese Traditional Opera
- 中国茶文化 / Chinese Tea Culture
- 中国传统节庆 / Chinese Traditional Festivals

## Experience

Each topic page uses the existing museum visual language: dark immersive hero, generous rice-paper editorial sections, gold rules, restrained cards, and image-led exhibit grids. Pages should remain server-rendered, localized under `/zh` and `/en`, and compatible with existing SEO helpers.

## Content Model

Curated topic definitions live in code as exhibition curation metadata, while representative items are resolved from Supabase-backed `HeritageItem` content at render time. This lets the pages launch now and become richer automatically as the content library expands.

## Routes

- `/zh/museum/topics/four-embroideries`
- `/zh/museum/topics/traditional-opera`
- `/zh/museum/topics/tea-culture`
- `/zh/museum/topics/traditional-festivals`
- English equivalents under `/en`

## Acceptance Criteria

- `/museum` shows the four curated topics as featured topic cards.
- Each topic detail page renders even when the database lacks matching items.
- Representative heritage links are sourced from existing Supabase content where possible.
- Metadata, Open Graph, hreflang alternates, breadcrumb JSON-LD, and ItemList JSON-LD are present.
- Sitemap includes localized topic URLs.
