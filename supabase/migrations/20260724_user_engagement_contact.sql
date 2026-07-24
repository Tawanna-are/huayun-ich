create table if not exists public.heritage_likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  heritage_item_id uuid not null references public.heritage_items(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, heritage_item_id)
);

create table if not exists public.heritage_comments (
  id uuid primary key default gen_random_uuid(),
  heritage_item_id uuid not null references public.heritage_items(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 2 and 800),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  moderated_at timestamptz
);

create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  heritage_item_id uuid references public.heritage_items(id) on delete set null,
  kind text not null check (kind in ('general', 'supporter', 'cooperation', 'licensing')),
  name text not null check (char_length(name) between 2 and 80),
  email text not null check (char_length(email) between 3 and 254),
  organization text check (organization is null or char_length(organization) <= 120),
  message text not null check (char_length(message) between 10 and 2000),
  status text not null default 'new' check (status in ('new', 'in_progress', 'resolved')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists heritage_likes_item_idx
  on public.heritage_likes(heritage_item_id, created_at desc);
create index if not exists heritage_comments_item_status_idx
  on public.heritage_comments(heritage_item_id, status, created_at desc);
create index if not exists heritage_comments_user_idx
  on public.heritage_comments(user_id, created_at desc);
create index if not exists contact_submissions_status_idx
  on public.contact_submissions(status, created_at desc);
create index if not exists contact_submissions_user_idx
  on public.contact_submissions(user_id, created_at desc)
  where user_id is not null;
create index if not exists contact_submissions_email_created_idx
  on public.contact_submissions(lower(email), created_at desc);

drop trigger if exists heritage_comments_set_updated_at on public.heritage_comments;
create trigger heritage_comments_set_updated_at
before update on public.heritage_comments
for each row execute function public.set_updated_at();

drop trigger if exists contact_submissions_set_updated_at on public.contact_submissions;
create trigger contact_submissions_set_updated_at
before update on public.contact_submissions
for each row execute function public.set_updated_at();

alter table public.heritage_likes enable row level security;
alter table public.heritage_comments enable row level security;
alter table public.contact_submissions enable row level security;

drop policy if exists "Users manage own likes" on public.heritage_likes;
create policy "Users manage own likes"
  on public.heritage_likes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Public read approved comments" on public.heritage_comments;
create policy "Public read approved comments"
  on public.heritage_comments for select
  using (status = 'approved');

drop policy if exists "Users read own comments" on public.heritage_comments;
create policy "Users read own comments"
  on public.heritage_comments for select
  using (auth.uid() = user_id);

drop policy if exists "Users create pending comments" on public.heritage_comments;
create policy "Users create pending comments"
  on public.heritage_comments for insert
  with check (auth.uid() = user_id and status = 'pending');

drop policy if exists "Users read own contact submissions" on public.contact_submissions;
create policy "Users read own contact submissions"
  on public.contact_submissions for select
  using (auth.uid() = user_id);

create or replace function public.get_heritage_like_count(target_heritage_id uuid)
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select count(*) from public.heritage_likes where heritage_item_id = target_heritage_id;
$$;

grant execute on function public.get_heritage_like_count(uuid) to anon, authenticated;
