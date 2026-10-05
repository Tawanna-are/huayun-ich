alter table public.media_assets
  add column if not exists featured_on_home boolean not null default false;
