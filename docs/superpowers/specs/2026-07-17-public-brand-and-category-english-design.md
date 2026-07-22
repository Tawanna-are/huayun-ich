# Public Brand And Category English Labels

## Scope

Change only public-facing header brand text and the homepage category index labels. Do not change the admin CMS header, database, CMS fields, APIs, uploads, Supabase schema, or Feishu synchronization.

## Public Header Brand

- Change the visible brand name in `HomeHeader` to `华韵收藏`.
- Change the visible brand name in the shared `SiteHeader` to `华韵收藏`.
- Preserve the existing icon, navigation, mobile menu, locale behavior, and public routes.
- Do not modify admin components or admin login branding.

## Category English Labels

- Keep the six-cell text-only index and current keyword links.
- Add a quiet English name below each Chinese label:
  - 戏曲 / Traditional Opera
  - 刺绣 / Embroidery
  - 陶瓷 / Ceramics
  - 染织 / Dyeing & Weaving
  - 竹编 / Bamboo Weaving
  - 剪纸 / Paper Cutting
- Do not add images, counts, descriptions, or new CMS fields.
- English labels use smaller, lower-contrast typography and must fit mobile cells without overlap.

## Verification

- Add failing tests for both public headers and all English category labels.
- Run focused tests, full type checking, and a production build.
- Inspect desktop and mobile homepage screenshots.
- Confirm no backend, admin, database, or Feishu files changed.
