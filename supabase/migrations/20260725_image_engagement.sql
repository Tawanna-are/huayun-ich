alter table public.user_favorites
  drop constraint if exists user_favorites_target_type_check;

alter table public.user_favorites
  add constraint user_favorites_target_type_check
  check (target_type in ('heritage', 'inheritor', 'museum_topic', 'heritage_image'));

create table if not exists public.heritage_image_likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  heritage_item_id uuid not null references public.heritage_items(id) on delete cascade,
  image_id uuid not null,
  created_at timestamptz not null default now(),
  unique (user_id, image_id)
);

create index if not exists heritage_image_likes_image_idx
  on public.heritage_image_likes(image_id, created_at desc);
create index if not exists heritage_image_likes_item_idx
  on public.heritage_image_likes(heritage_item_id, created_at desc);

alter table public.heritage_image_likes enable row level security;

drop policy if exists "Public read heritage image likes" on public.heritage_image_likes;
create policy "Public read heritage image likes"
  on public.heritage_image_likes for select
  using (true);

drop policy if exists "Users manage own heritage image likes" on public.heritage_image_likes;
create policy "Users manage own heritage image likes"
  on public.heritage_image_likes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
