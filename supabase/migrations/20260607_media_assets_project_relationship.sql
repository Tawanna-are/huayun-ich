alter table public.media_assets
  add column if not exists asset_role text not null default 'gallery';

alter table public.media_assets
  add column if not exists alt text;

alter table public.media_assets
  add column if not exists caption text;

alter table public.media_assets
  add column if not exists mime_type text;

alter table public.media_assets
  add column if not exists storage_path text;

alter table public.media_assets
  add column if not exists thumbnail_storage_path text;

alter table public.media_assets
  add column if not exists sort_order integer not null default 0;

alter table public.media_assets
  drop constraint if exists media_assets_asset_role_check;

alter table public.media_assets
  add constraint media_assets_asset_role_check
  check (asset_role in ('cover', 'hero', 'gallery', 'poster', 'main_video', 'video'));

create index if not exists media_assets_role_idx
  on public.media_assets(heritage_id, file_type, asset_role, sort_order);
