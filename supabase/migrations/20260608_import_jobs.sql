create table if not exists public.import_jobs (
  id uuid primary key default gen_random_uuid(),
  job_type text not null check (job_type in ('heritage', 'media')),
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  source_file_name text,
  source_file_type text,
  total_rows integer not null default 0,
  success_rows integer not null default 0,
  error_rows integer not null default 0,
  duplicate_rows integer not null default 0,
  skipped_rows integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.import_job_rows (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.import_jobs(id) on delete cascade,
  row_number integer not null,
  entity_key text,
  entity_type text not null default 'heritage',
  action text not null default 'skipped' check (action in ('create', 'update', 'duplicate', 'skipped', 'error')),
  status text not null default 'pending' check (status in ('pending', 'success', 'failed', 'duplicate', 'skipped')),
  errors jsonb not null default '{}'::jsonb,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists import_jobs_type_status_idx
  on public.import_jobs(job_type, status, created_at desc);

create index if not exists import_job_rows_job_idx
  on public.import_job_rows(job_id, row_number);

create index if not exists import_job_rows_entity_idx
  on public.import_job_rows(entity_type, entity_key);

drop trigger if exists import_jobs_set_updated_at on public.import_jobs;
create trigger import_jobs_set_updated_at
before update on public.import_jobs
for each row execute function public.set_updated_at();

alter table public.import_jobs enable row level security;
alter table public.import_job_rows enable row level security;

drop policy if exists "Public cannot read import jobs" on public.import_jobs;
create policy "Public cannot read import jobs"
  on public.import_jobs for select
  using (false);

drop policy if exists "Public cannot read import job rows" on public.import_job_rows;
create policy "Public cannot read import job rows"
  on public.import_job_rows for select
  using (false);
