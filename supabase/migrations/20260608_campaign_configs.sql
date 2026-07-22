create table if not exists public.campaign_configs (
  slug text primary key,
  title text not null,
  english_title text not null,
  summary text not null default '',
  english_summary text not null default '',
  description text not null default '',
  english_description text not null default '',
  hero_image text not null default '/assets/hero-museum.png',
  accent text not null default '#C8A96A',
  priority_slugs text[] not null default '{}',
  keywords text[] not null default '{}',
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.campaign_configs enable row level security;

drop policy if exists "Public read published campaign configs" on public.campaign_configs;
create policy "Public read published campaign configs"
  on public.campaign_configs for select
  using (published = true);

create index if not exists campaign_configs_published_sort_idx
  on public.campaign_configs(published, sort_order, slug);
