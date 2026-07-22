create table if not exists public.feishu_sync_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null default '飞书非遗内容表',
  app_token text not null,
  table_id text not null,
  view_id text,
  active boolean not null default true,
  last_sync_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (app_token, table_id)
);

create table if not exists public.feishu_record_mappings (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.feishu_sync_sources(id) on delete cascade,
  feishu_record_id text not null,
  heritage_id uuid references public.heritage_items(id) on delete set null,
  slug text not null,
  last_feishu_modified_time bigint,
  last_payload_hash text,
  deleted_at timestamptz,
  synced_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (source_id, feishu_record_id)
);

create table if not exists public.feishu_sync_logs (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references public.feishu_sync_sources(id) on delete set null,
  source text not null check (source in ('manual', 'cron')),
  status text not null default 'processing' check (status in ('processing', 'completed', 'failed')),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  inserted_count integer not null default 0,
  updated_count integer not null default 0,
  deleted_count integer not null default 0,
  skipped_count integer not null default 0,
  failed_count integer not null default 0,
  message text,
  errors jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists feishu_sync_sources_active_idx
  on public.feishu_sync_sources(active, updated_at desc);

create index if not exists feishu_record_mappings_source_idx
  on public.feishu_record_mappings(source_id, deleted_at, synced_at desc);

create index if not exists feishu_record_mappings_heritage_idx
  on public.feishu_record_mappings(heritage_id)
  where heritage_id is not null;

create index if not exists feishu_sync_logs_started_idx
  on public.feishu_sync_logs(started_at desc);

drop trigger if exists feishu_sync_sources_set_updated_at on public.feishu_sync_sources;
create trigger feishu_sync_sources_set_updated_at
before update on public.feishu_sync_sources
for each row execute function public.set_updated_at();

alter table public.feishu_sync_sources enable row level security;
alter table public.feishu_record_mappings enable row level security;
alter table public.feishu_sync_logs enable row level security;
