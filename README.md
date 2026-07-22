# Huayun ICH

Modern digital museum MVP for Chinese Intangible Cultural Heritage.

## Stack

- Next.js 15
- TypeScript
- Tailwind CSS
- Shadcn-style UI primitives
- Supabase
- Lighthouse

## Structure

```text
huayun-ich/
├─ app/
│  ├─ admin/page.tsx
│  ├─ api/admin/
│  ├─ heritage/
│  ├─ globals.css
│  ├─ layout.tsx
│  ├─ page.tsx
│  ├─ robots.ts
│  └─ sitemap.ts
├─ components/
│  ├─ admin/
│  ├─ heritage/
│  ├─ home/
│  ├─ layout/
│  ├─ motion/
│  ├─ seo/
│  └─ ui/
├─ data/
├─ docs/
├─ lib/
│  ├─ content/
│  └─ supabase/
├─ public/assets/
├─ scripts/
├─ supabase/schema.sql
├─ tests/
└─ package.json
```

## V1.0 Features

- Immersive museum-style homepage with full-screen video hero.
- Supabase-first content repository.
- Admin page for creating/editing heritage items.
- Image/video upload API backed by Supabase Storage.
- Province map exploration through region-filtered archive links.
- Dynamic metadata, Open Graph, robots, sitemap, and JSON-LD.
- Performance-oriented server-rendered homepage.

## Content

Seed content includes:

- Jingju
- Kunqu
- Suzhou Embroidery
- Longquan Celadon
- Jingdezhen Porcelain
- Datiehua

## Supabase

Run `supabase/schema.sql`, then configure:

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_API_KEY=
```

The frontend reads Supabase first. If env vars are missing, local development uses seed-shaped content so the app remains runnable.

## Run

```bash
npm.cmd install
npm.cmd run generate:assets
npm.cmd run dev
```

## Verify

```bash
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
```

Latest local Lighthouse result on `http://127.0.0.1:3001`:

- Performance: 91
- SEO: 100
