create extension if not exists "pgcrypto";
create extension if not exists "vector";

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  english_name text not null,
  summary text not null,
  color text not null default '#C8A96A',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.heritage_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete restrict,
  slug text not null unique,
  name text not null,
  english_name text not null,
  summary text not null,
  region text not null,
  province text not null,
  city text not null,
  inscription_year integer,
  history text[] not null default '{}',
  timeline jsonb not null default '[]'::jsonb,
  tags text[] not null default '{}',
  related_slugs text[] not null default '{}',
  latitude numeric(9, 6),
  longitude numeric(9, 6),
  map_x numeric(5, 2),
  map_y numeric(5, 2),
  sort_order integer not null default 0,
  published boolean not null default true,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.heritage_media (
  id uuid primary key default gen_random_uuid(),
  heritage_item_id uuid not null references public.heritage_items(id) on delete cascade,
  media_type text not null check (media_type in ('image', 'video')),
  role text not null check (role in ('cover', 'hero', 'gallery', 'video', 'poster')),
  url text not null,
  alt text,
  caption text,
  file_name text,
  file_size bigint,
  mime_type text,
  storage_path text,
  thumbnail_url text,
  thumbnail_storage_path text,
  original_file_name text,
  width integer,
  height integer,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (heritage_item_id, role, url)
);

alter table public.heritage_media
  add column if not exists file_name text;

alter table public.heritage_media
  add column if not exists file_size bigint;

alter table public.heritage_media
  add column if not exists mime_type text;

alter table public.heritage_media
  add column if not exists storage_path text;

alter table public.heritage_media
  add column if not exists thumbnail_url text;

alter table public.heritage_media
  add column if not exists thumbnail_storage_path text;

alter table public.heritage_media
  add column if not exists original_file_name text;

alter table public.heritage_media
  add column if not exists width integer;

alter table public.heritage_media
  add column if not exists height integer;

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  file_type text not null check (file_type in ('image', 'video')),
  file_url text not null,
  thumbnail_url text,
  file_size bigint check (file_size is null or file_size >= 0),
  duration integer check (duration is null or duration >= 0),
  heritage_id uuid references public.heritage_items(id) on delete set null,
  asset_role text not null default 'gallery' check (asset_role in ('cover', 'hero', 'gallery', 'poster', 'main_video', 'video')),
  alt text,
  caption text,
  mime_type text,
  storage_path text,
  thumbnail_storage_path text,
  sort_order integer not null default 0,
  featured_on_home boolean not null default false,
  created_at timestamptz not null default now()
);

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
  add column if not exists featured_on_home boolean not null default false;

alter table public.media_assets
  drop constraint if exists media_assets_asset_role_check;

alter table public.media_assets
  add constraint media_assets_asset_role_check
  check (asset_role in ('cover', 'hero', 'gallery', 'poster', 'main_video', 'video'));

create table if not exists public.inheritors (
  id uuid primary key default gen_random_uuid(),
  heritage_item_id uuid not null references public.heritage_items(id) on delete cascade,
  name text not null,
  title text not null,
  bio text not null,
  image_url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (heritage_item_id, name)
);

create table if not exists public.assistant_documents (
  id text primary key,
  source_type text not null check (source_type in ('heritage', 'inheritor', 'category', 'region')),
  source_id text not null,
  locale text not null check (locale in ('zh', 'en')),
  title text not null,
  summary text not null,
  content text not null,
  href text not null,
  metadata jsonb not null default '{}'::jsonb,
  embedding vector(1536),
  checksum text not null,
  updated_at timestamptz not null default now(),
  unique (source_type, source_id, locale)
);

create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  preferred_locale text not null default 'zh' check (preferred_locale in ('zh', 'en')),
  interest_tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  heritage_item_id uuid references public.heritage_items(id) on delete cascade,
  target_type text not null default 'heritage' check (target_type in ('heritage', 'inheritor', 'museum_topic', 'heritage_image')),
  target_id text not null,
  created_at timestamptz not null default now(),
  unique (user_id, target_type, target_id)
);

create table if not exists public.user_browsing_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  heritage_item_id uuid not null references public.heritage_items(id) on delete cascade,
  viewed_at timestamptz not null default now(),
  unique (user_id, heritage_item_id)
);

create table if not exists public.heritage_likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  heritage_item_id uuid not null references public.heritage_items(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, heritage_item_id)
);

create table if not exists public.heritage_image_likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  heritage_item_id uuid not null references public.heritage_items(id) on delete cascade,
  image_id uuid not null,
  created_at timestamptz not null default now(),
  unique (user_id, image_id)
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

alter table public.user_favorites
  add column if not exists target_type text not null default 'heritage';

alter table public.user_preferences
  add column if not exists interest_tags text[] not null default '{}';

alter table public.user_favorites
  add column if not exists target_id text;

update public.user_favorites
set target_id = coalesce(target_id, heritage_item_id::text, id::text)
where target_id is null;

alter table public.user_favorites
  alter column heritage_item_id drop not null;

alter table public.user_favorites
  alter column target_id set not null;

alter table public.user_favorites
  drop constraint if exists user_favorites_user_id_heritage_item_id_key;

alter table public.user_favorites
  drop constraint if exists user_favorites_target_type_check;

alter table public.user_favorites
  add constraint user_favorites_target_type_check
  check (target_type in ('heritage', 'inheritor', 'museum_topic', 'heritage_image'));

create index if not exists categories_sort_idx on public.categories(sort_order);
create index if not exists heritage_items_category_idx on public.heritage_items(category_id);
create index if not exists heritage_items_province_idx on public.heritage_items(province);
create index if not exists heritage_items_region_idx on public.heritage_items(region);
create index if not exists heritage_items_tags_idx on public.heritage_items using gin(tags);
create index if not exists heritage_items_related_slugs_idx on public.heritage_items using gin(related_slugs);
create index if not exists heritage_items_featured_idx
  on public.heritage_items(sort_order)
  where published = true and featured = true;
create index if not exists heritage_media_item_idx on public.heritage_media(heritage_item_id, sort_order);
create index if not exists media_assets_heritage_idx on public.media_assets(heritage_id, created_at desc);
create index if not exists media_assets_file_type_idx on public.media_assets(file_type, created_at desc);
create index if not exists media_assets_role_idx on public.media_assets(heritage_id, file_type, asset_role, sort_order);
create index if not exists inheritors_item_idx on public.inheritors(heritage_item_id, sort_order);
create index if not exists assistant_documents_source_idx on public.assistant_documents(source_type, source_id);
create index if not exists assistant_documents_locale_idx on public.assistant_documents(locale);
create index if not exists user_preferences_interest_tags_idx on public.user_preferences using gin(interest_tags);
create index if not exists user_favorites_user_idx on public.user_favorites(user_id, created_at desc);
create unique index if not exists user_favorites_target_unique_idx
  on public.user_favorites(user_id, target_type, target_id);
create index if not exists user_favorites_target_idx
  on public.user_favorites(user_id, target_type, created_at desc);
create index if not exists user_browsing_history_user_idx on public.user_browsing_history(user_id, viewed_at desc);
create index if not exists heritage_likes_item_idx on public.heritage_likes(heritage_item_id, created_at desc);
create index if not exists heritage_image_likes_image_idx on public.heritage_image_likes(image_id, created_at desc);
create index if not exists heritage_image_likes_item_idx on public.heritage_image_likes(heritage_item_id, created_at desc);
create index if not exists heritage_comments_item_status_idx on public.heritage_comments(heritage_item_id, status, created_at desc);
create index if not exists heritage_comments_user_idx on public.heritage_comments(user_id, created_at desc);
create index if not exists contact_submissions_status_idx on public.contact_submissions(status, created_at desc);
create index if not exists contact_submissions_user_idx on public.contact_submissions(user_id, created_at desc) where user_id is not null;
create index if not exists contact_submissions_email_created_idx on public.contact_submissions(lower(email), created_at desc);
create index if not exists assistant_documents_embedding_idx
  on public.assistant_documents
  using hnsw (embedding vector_cosine_ops)
  where embedding is not null;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists heritage_items_set_updated_at on public.heritage_items;
create trigger heritage_items_set_updated_at
before update on public.heritage_items
for each row execute function public.set_updated_at();

drop trigger if exists assistant_documents_set_updated_at on public.assistant_documents;
create trigger assistant_documents_set_updated_at
before update on public.assistant_documents
for each row execute function public.set_updated_at();

drop trigger if exists user_preferences_set_updated_at on public.user_preferences;
create trigger user_preferences_set_updated_at
before update on public.user_preferences
for each row execute function public.set_updated_at();

drop trigger if exists heritage_comments_set_updated_at on public.heritage_comments;
create trigger heritage_comments_set_updated_at
before update on public.heritage_comments
for each row execute function public.set_updated_at();

drop trigger if exists contact_submissions_set_updated_at on public.contact_submissions;
create trigger contact_submissions_set_updated_at
before update on public.contact_submissions
for each row execute function public.set_updated_at();

alter table public.categories enable row level security;
alter table public.heritage_items enable row level security;
alter table public.heritage_media enable row level security;
alter table public.media_assets enable row level security;
alter table public.inheritors enable row level security;
alter table public.assistant_documents enable row level security;
alter table public.user_preferences enable row level security;
alter table public.user_favorites enable row level security;
alter table public.user_browsing_history enable row level security;
alter table public.heritage_likes enable row level security;
alter table public.heritage_image_likes enable row level security;
alter table public.heritage_comments enable row level security;
alter table public.contact_submissions enable row level security;

drop policy if exists "Public read categories" on public.categories;
create policy "Public read categories"
  on public.categories for select
  using (true);

drop policy if exists "Public read published heritage items" on public.heritage_items;
create policy "Public read published heritage items"
  on public.heritage_items for select
  using (published = true);

drop policy if exists "Public read heritage media" on public.heritage_media;
create policy "Public read heritage media"
  on public.heritage_media for select
  using (
    exists (
      select 1 from public.heritage_items
      where heritage_items.id = heritage_media.heritage_item_id
      and heritage_items.published = true
    )
  );

drop policy if exists "Public read media assets" on public.media_assets;
create policy "Public read media assets"
  on public.media_assets for select
  using (
    heritage_id is null
    or exists (
      select 1 from public.heritage_items
      where heritage_items.id = media_assets.heritage_id
      and heritage_items.published = true
    )
  );

drop policy if exists "Public read inheritors" on public.inheritors;
create policy "Public read inheritors"
  on public.inheritors for select
  using (
    exists (
      select 1 from public.heritage_items
      where heritage_items.id = inheritors.heritage_item_id
      and heritage_items.published = true
    )
  );

drop policy if exists "Public read assistant documents" on public.assistant_documents;
create policy "Public read assistant documents"
  on public.assistant_documents for select
  using (true);

drop policy if exists "Users manage own preferences" on public.user_preferences;
create policy "Users manage own preferences"
  on public.user_preferences for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users manage own favorites" on public.user_favorites;
create policy "Users manage own favorites"
  on public.user_favorites for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users manage own browsing history" on public.user_browsing_history;
create policy "Users manage own browsing history"
  on public.user_browsing_history for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users manage own likes" on public.heritage_likes;
create policy "Users manage own likes"
  on public.heritage_likes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Public read image likes" on public.heritage_image_likes;
drop policy if exists "Users manage own image likes" on public.heritage_image_likes;
drop policy if exists "Public read heritage image likes" on public.heritage_image_likes;
drop policy if exists "Users manage own heritage image likes" on public.heritage_image_likes;

create or replace function public.get_heritage_image_like_state(
  p_item_id uuid,
  p_image_id uuid,
  p_user_id uuid default null
)
returns table ("exists" boolean, liked boolean, count bigint)
language sql
stable
security definer
set search_path = pg_catalog, public
as $function$
  with target as (
    select exists (
      select 1
      from public.heritage_items item
      where item.id = p_item_id
        and item.published = true
        and (
          exists (
            select 1
            from public.media_assets asset
            where asset.id = p_image_id
              and asset.heritage_id = p_item_id
              and asset.file_type = 'image'
          )
          or exists (
            select 1
            from public.heritage_media media
            where media.id = p_image_id
              and media.heritage_item_id = p_item_id
              and media.media_type = 'image'
          )
        )
    ) as image_exists
  )
  select
    target.image_exists,
    case
      when target.image_exists and p_user_id is not null then exists (
        select 1
        from public.heritage_image_likes image_like
        where image_like.user_id = p_user_id
          and image_like.image_id = p_image_id
      )
      else false
    end,
    case
      when target.image_exists then (
        select count(*)
        from public.heritage_image_likes image_like
        where image_like.image_id = p_image_id
      )
      else 0::bigint
    end
  from target;
$function$;

create or replace function public.set_heritage_image_like_state(
  p_item_id uuid,
  p_image_id uuid,
  p_user_id uuid,
  p_liked boolean
)
returns table ("exists" boolean, liked boolean, count bigint)
language plpgsql
security definer
set search_path = pg_catalog, public
as $function$
declare
  item_exists boolean := false;
  image_exists boolean := false;
begin
  select true
  into item_exists
  from public.heritage_items item
  where item.id = p_item_id
    and item.published = true
  for update;

  if item_exists is not true then
    return query select false, false, 0::bigint;
    return;
  end if;

  select true
  into image_exists
  from public.media_assets asset
  where asset.id = p_image_id
    and asset.heritage_id = p_item_id
    and asset.file_type = 'image'
  for update;

  if image_exists is not true then
    select true
    into image_exists
    from public.heritage_media media
    where media.id = p_image_id
      and media.heritage_item_id = p_item_id
      and media.media_type = 'image'
    for update;
  end if;

  if image_exists is not true then
    return query select false, false, 0::bigint;
    return;
  end if;

  if p_user_id is null then
    raise exception 'user required' using errcode = '22004';
  end if;

  if p_liked then
    insert into public.heritage_image_likes (user_id, heritage_item_id, image_id)
    values (p_user_id, p_item_id, p_image_id)
    on conflict (user_id, image_id) do update
      set heritage_item_id = excluded.heritage_item_id;
  else
    delete from public.heritage_image_likes image_like
    where image_like.user_id = p_user_id
      and image_like.image_id = p_image_id;
  end if;

  return query
  select
    true,
    p_liked,
    (
      select count(*)
      from public.heritage_image_likes image_like
      where image_like.image_id = p_image_id
    );
end;
$function$;

revoke execute on function public.get_heritage_image_like_state(uuid, uuid, uuid) from public, anon, authenticated;
revoke execute on function public.set_heritage_image_like_state(uuid, uuid, uuid, boolean) from public, anon, authenticated;
grant execute on function public.get_heritage_image_like_state(uuid, uuid, uuid) to service_role;
grant execute on function public.set_heritage_image_like_state(uuid, uuid, uuid, boolean) to service_role;

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

create or replace function public.match_assistant_documents(
  query_embedding vector(1536),
  match_count integer default 8,
  match_locale text default null
)
returns table (
  id text,
  source_type text,
  source_id text,
  locale text,
  title text,
  summary text,
  content text,
  href text,
  metadata jsonb,
  similarity double precision
)
language sql
stable
as $$
  select
    assistant_documents.id,
    assistant_documents.source_type,
    assistant_documents.source_id,
    assistant_documents.locale,
    assistant_documents.title,
    assistant_documents.summary,
    assistant_documents.content,
    assistant_documents.href,
    assistant_documents.metadata,
    1 - (assistant_documents.embedding <=> query_embedding) as similarity
  from public.assistant_documents
  where assistant_documents.embedding is not null
    and (match_locale is null or assistant_documents.locale = match_locale)
  order by assistant_documents.embedding <=> query_embedding
  limit match_count;
$$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'heritage-media',
  'heritage-media',
  true,
  524288000,
  array['image/png', 'image/jpeg', 'image/webp', 'video/mp4', 'video/quicktime', 'video/webm']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read storage heritage media" on storage.objects;
create policy "Public read storage heritage media"
  on storage.objects for select
  using (bucket_id = 'heritage-media');

insert into public.categories (slug, name, english_name, summary, color, sort_order) values
  ('traditional-opera', '传统戏曲', 'Opera', '以声腔、身段、程式和舞台美学构成的东方剧场体系。', '#B22222', 10),
  ('traditional-craft', '传统工艺', 'Craft', '以手、器、材与时间共同沉淀的造物经验。', '#C8A96A', 20),
  ('traditional-technique', '传统技艺', 'Technique', '在生产和生活中延续的复杂技术与身体记忆。', '#94A995', 30),
  ('folk-activity', '民俗活动', 'Ritual', '节令、仪式、庆典与地方共同体的公共表达。', '#E0DDD4', 40),
  ('folk-literature', '民间文学', 'Literature', '通过口头叙事、传说与歌谣流动的精神档案。', '#DCE7EA', 50)
on conflict (slug) do update
set name = excluded.name,
    english_name = excluded.english_name,
    summary = excluded.summary,
    color = excluded.color,
    sort_order = excluded.sort_order;

with category_map as (
  select id, slug from public.categories
)
insert into public.heritage_items (
  id,
  category_id,
  slug,
  name,
  english_name,
  summary,
  region,
  province,
  city,
  inscription_year,
  history,
  timeline,
  tags,
  related_slugs,
  latitude,
  longitude,
  map_x,
  map_y,
  sort_order,
  published,
  featured,
  created_at,
  updated_at
)
select
  seed.id,
  category_map.id,
  seed.slug,
  seed.name,
  seed.english_name,
  seed.summary,
  seed.region,
  seed.province,
  seed.city,
  seed.inscription_year,
  seed.history,
  seed.timeline,
  seed.tags,
  seed.related_slugs,
  seed.latitude,
  seed.longitude,
  seed.map_x,
  seed.map_y,
  seed.sort_order,
  seed.published,
  seed.featured,
  seed.created_at,
  seed.updated_at
from (
  values
    (
      '08d7f672-4220-42df-9bd5-7e5bc7aa62d9'::uuid,
      'traditional-technique',
      'tie-dye',
      '扎染',
      'Tie-dye Craft',
      E'扎染，古称“绞缬”，是中国一种古老而独特的纺织品染色工艺，与蜡染、夹缬并称“三染”。它起源于秦汉，盛于唐代，如今以云南大理的白族扎染和四川的自贡扎染最具代表性，被列入国家级非物质文化遗产名录。\n    扎染的精髓在于“扎结”与“染色”两道工序。先用棉线、木夹或竹板将织物按设计意图紧密捆扎、折叠或缝绞，再将其浸入板蓝根等天然植物染料中。由于扎结处染料无法渗透，拆线后便形成了自然晕染、深浅不一的纹理。扎染的颜色素雅古朴，以蓝底白花最为经典；每一件作品的纹样都独一无二，晕纹天成，充满“无画笔之画”般的偶发性艺术魅力。',
      '云南大理',
      '云南省',
      '大理',
      2006,
      array[
        '大理白族扎染以植物染料、手工绞扎和反复浸染延续日常织物传统，纹样承载着地方生活与审美记忆。'
      ]::text[],
      jsonb_build_array(
        jsonb_build_object('year', '2006', 'title', '列入国家级名录', 'description', '白族扎染技艺列入第一批国家级非物质文化遗产代表性项目名录。')
      ),
      array['扎染', '蓝染', '白族', '手工染色']::text[],
      array[]::text[],
      25.6065,
      100.2676,
      27,
      63,
      50,
      true,
      true,
      '2026-07-12T08:18:18.466619+00:00'::timestamptz,
      '2026-07-25T08:56:33.498753+00:00'::timestamptz
    )
) as seed(
  id,
  category_slug,
  slug,
  name,
  english_name,
  summary,
  region,
  province,
  city,
  inscription_year,
  history,
  timeline,
  tags,
  related_slugs,
  latitude,
  longitude,
  map_x,
  map_y,
  sort_order,
  published,
  featured,
  created_at,
  updated_at
)
join category_map on category_map.slug = seed.category_slug
on conflict (slug) do update
set category_id = excluded.category_id,
    name = excluded.name,
    english_name = excluded.english_name,
    summary = excluded.summary,
    region = excluded.region,
    province = excluded.province,
    city = excluded.city,
    inscription_year = excluded.inscription_year,
    history = excluded.history,
    timeline = excluded.timeline,
    tags = excluded.tags,
    related_slugs = excluded.related_slugs,
    latitude = excluded.latitude,
    longitude = excluded.longitude,
    map_x = excluded.map_x,
    map_y = excluded.map_y,
    sort_order = excluded.sort_order,
    published = excluded.published,
    featured = excluded.featured,
    updated_at = excluded.updated_at;

with heritage_map as (
  select id, slug from public.heritage_items
)
insert into public.heritage_media (
  id,
  heritage_item_id,
  media_type,
  role,
  url,
  alt,
  caption,
  file_name,
  file_size,
  mime_type,
  storage_path,
  thumbnail_url,
  thumbnail_storage_path,
  original_file_name,
  width,
  height,
  sort_order,
  created_at
)
select
  seed.id,
  heritage_map.id,
  seed.media_type,
  seed.role,
  seed.url,
  seed.alt,
  seed.caption,
  seed.file_name,
  seed.file_size,
  seed.mime_type,
  seed.storage_path,
  seed.thumbnail_url,
  seed.thumbnail_storage_path,
  seed.original_file_name,
  seed.width,
  seed.height,
  seed.sort_order,
  seed.created_at
from (
  values
    (
      'cf4e2ffd-ef1e-4ef1-874e-392e4d17c025'::uuid,
      'tie-dye',
      'image',
      'gallery',
      'https://mmmmicpckawafgxfzbaw.supabase.co/storage/v1/object/public/heritage-media/08d7f672-4220-42df-9bd5-7e5bc7aa62d9/1784250859124-1.webp',
      '扎染',
      '扎染包包',
      '1.webp',
      293634,
      'image/webp',
      '08d7f672-4220-42df-9bd5-7e5bc7aa62d9/1784250859124-1.webp',
      'https://mmmmicpckawafgxfzbaw.supabase.co/storage/v1/object/public/heritage-media/08d7f672-4220-42df-9bd5-7e5bc7aa62d9/thumbnails/1784250859124-1.webp',
      '08d7f672-4220-42df-9bd5-7e5bc7aa62d9/thumbnails/1784250859124-1.webp',
      '1.png',
      1238,
      2200,
      0,
      '2026-07-17T01:14:21.118271+00:00'::timestamptz
    ),
    (
      '59e2e5bf-c6b8-4774-9790-43b0e99c86cd',
      'tie-dye',
      'image',
      'gallery',
      'https://mmmmicpckawafgxfzbaw.supabase.co/storage/v1/object/public/heritage-media/08d7f672-4220-42df-9bd5-7e5bc7aa62d9/1784250869915-5.webp',
      '扎染',
      '扎染包包',
      '5.webp',
      235246,
      'image/webp',
      '08d7f672-4220-42df-9bd5-7e5bc7aa62d9/1784250869915-5.webp',
      'https://mmmmicpckawafgxfzbaw.supabase.co/storage/v1/object/public/heritage-media/08d7f672-4220-42df-9bd5-7e5bc7aa62d9/thumbnails/1784250869915-5.webp',
      '08d7f672-4220-42df-9bd5-7e5bc7aa62d9/thumbnails/1784250869915-5.webp',
      '5.png',
      941,
      1672,
      0,
      '2026-07-17T01:14:31.656527+00:00'
    ),
    (
      '760db850-5e21-4b04-b1de-9dac47536b88',
      'tie-dye',
      'image',
      'gallery',
      'https://mmmmicpckawafgxfzbaw.supabase.co/storage/v1/object/public/heritage-media/08d7f672-4220-42df-9bd5-7e5bc7aa62d9/1784250890037-12.webp',
      '扎染',
      '扎染包包',
      '12.webp',
      244608,
      'image/webp',
      '08d7f672-4220-42df-9bd5-7e5bc7aa62d9/1784250890037-12.webp',
      'https://mmmmicpckawafgxfzbaw.supabase.co/storage/v1/object/public/heritage-media/08d7f672-4220-42df-9bd5-7e5bc7aa62d9/thumbnails/1784250890037-12.webp',
      '08d7f672-4220-42df-9bd5-7e5bc7aa62d9/thumbnails/1784250890037-12.webp',
      '12.png',
      941,
      1672,
      0,
      '2026-07-17T01:14:51.666622+00:00'
    ),
    (
      '2b28b0b9-8191-488f-813b-8b72c0669227',
      'tie-dye',
      'image',
      'gallery',
      'https://mmmmicpckawafgxfzbaw.supabase.co/storage/v1/object/public/heritage-media/08d7f672-4220-42df-9bd5-7e5bc7aa62d9/1784250905339-18.webp',
      '扎染',
      '扎染包包',
      '18.webp',
      280856,
      'image/webp',
      '08d7f672-4220-42df-9bd5-7e5bc7aa62d9/1784250905339-18.webp',
      'https://mmmmicpckawafgxfzbaw.supabase.co/storage/v1/object/public/heritage-media/08d7f672-4220-42df-9bd5-7e5bc7aa62d9/thumbnails/1784250905339-18.webp',
      '08d7f672-4220-42df-9bd5-7e5bc7aa62d9/thumbnails/1784250905339-18.webp',
      '18.png',
      941,
      1672,
      0,
      '2026-07-17T01:15:06.874991+00:00'
    ),
    (
      '03e199ac-da2c-4902-8890-bec860514a97',
      'tie-dye',
      'image',
      'gallery',
      'https://mmmmicpckawafgxfzbaw.supabase.co/storage/v1/object/public/heritage-media/08d7f672-4220-42df-9bd5-7e5bc7aa62d9/1784251293434-2.webp',
      '扎染',
      '扎染玩偶',
      '2.webp',
      382050,
      'image/webp',
      '08d7f672-4220-42df-9bd5-7e5bc7aa62d9/1784251293434-2.webp',
      'https://mmmmicpckawafgxfzbaw.supabase.co/storage/v1/object/public/heritage-media/08d7f672-4220-42df-9bd5-7e5bc7aa62d9/thumbnails/1784251293434-2.webp',
      '08d7f672-4220-42df-9bd5-7e5bc7aa62d9/thumbnails/1784251293434-2.webp',
      '2.png',
      1238,
      2200,
      0,
      '2026-07-17T01:21:35.198478+00:00'
    ),
    (
      '34c3b677-4351-4be7-8f45-38aea8019aba',
      'tie-dye',
      'image',
      'gallery',
      'https://mmmmicpckawafgxfzbaw.supabase.co/storage/v1/object/public/heritage-media/08d7f672-4220-42df-9bd5-7e5bc7aa62d9/1784251008498-8862b638703bb1cd5325c1b8befa8996.webp',
      '蜡染',
      '蜡染包包',
      '8862b638703bb1cd5325c1b8befa8996.webp',
      137636,
      'image/webp',
      '08d7f672-4220-42df-9bd5-7e5bc7aa62d9/1784251008498-8862b638703bb1cd5325c1b8befa8996.webp',
      'https://mmmmicpckawafgxfzbaw.supabase.co/storage/v1/object/public/heritage-media/08d7f672-4220-42df-9bd5-7e5bc7aa62d9/thumbnails/1784251008498-8862b638703bb1cd5325c1b8befa8996.webp',
      '08d7f672-4220-42df-9bd5-7e5bc7aa62d9/thumbnails/1784251008498-8862b638703bb1cd5325c1b8befa8996.webp',
      '8862b638703bb1cd5325c1b8befa8996.jpg',
      828,
      1792,
      0,
      '2026-07-17T01:16:49.878166+00:00'
    ),
    (
      '7fd8ac11-1c4d-4cbd-b185-b636935a0307',
      'tie-dye',
      'image',
      'gallery',
      'https://mmmmicpckawafgxfzbaw.supabase.co/storage/v1/object/public/heritage-media/08d7f672-4220-42df-9bd5-7e5bc7aa62d9/1784251010584-d0ce2d29d0d9186c6211d55e85ffd1f1.webp',
      '蜡染',
      '蜡染包包',
      'd0ce2d29d0d9186c6211d55e85ffd1f1.webp',
      94400,
      'image/webp',
      '08d7f672-4220-42df-9bd5-7e5bc7aa62d9/1784251010584-d0ce2d29d0d9186c6211d55e85ffd1f1.webp',
      'https://mmmmicpckawafgxfzbaw.supabase.co/storage/v1/object/public/heritage-media/08d7f672-4220-42df-9bd5-7e5bc7aa62d9/thumbnails/1784251010584-d0ce2d29d0d9186c6211d55e85ffd1f1.webp',
      '08d7f672-4220-42df-9bd5-7e5bc7aa62d9/thumbnails/1784251010584-d0ce2d29d0d9186c6211d55e85ffd1f1.webp',
      'd0ce2d29d0d9186c6211d55e85ffd1f1.jpg',
      828,
      1792,
      0,
      '2026-07-17T01:16:51.9464+00:00'
    ),
    (
      '5a6484e4-be87-42d7-bdf3-0f0de36ab7c8',
      'tie-dye',
      'image',
      'gallery',
      'https://mmmmicpckawafgxfzbaw.supabase.co/storage/v1/object/public/heritage-media/08d7f672-4220-42df-9bd5-7e5bc7aa62d9/1784251094346-5.webp',
      '扎染',
      '扎染饰品',
      '5.webp',
      494600,
      'image/webp',
      '08d7f672-4220-42df-9bd5-7e5bc7aa62d9/1784251094346-5.webp',
      'https://mmmmicpckawafgxfzbaw.supabase.co/storage/v1/object/public/heritage-media/08d7f672-4220-42df-9bd5-7e5bc7aa62d9/thumbnails/1784251094346-5.webp',
      '08d7f672-4220-42df-9bd5-7e5bc7aa62d9/thumbnails/1784251094346-5.webp',
      '5.png',
      1238,
      2200,
      0,
      '2026-07-17T01:18:16.154673+00:00'
    ),
    (
      '250fb464-7209-4206-b093-6c33b6cd2192',
      'tie-dye',
      'image',
      'gallery',
      'https://mmmmicpckawafgxfzbaw.supabase.co/storage/v1/object/public/heritage-media/08d7f672-4220-42df-9bd5-7e5bc7aa62d9/1784251098144-6.webp',
      '扎染',
      '扎染饰品',
      '6.webp',
      682078,
      'image/webp',
      '08d7f672-4220-42df-9bd5-7e5bc7aa62d9/1784251098144-6.webp',
      'https://mmmmicpckawafgxfzbaw.supabase.co/storage/v1/object/public/heritage-media/08d7f672-4220-42df-9bd5-7e5bc7aa62d9/thumbnails/1784251098144-6.webp',
      '08d7f672-4220-42df-9bd5-7e5bc7aa62d9/thumbnails/1784251098144-6.webp',
      '6.png',
      1238,
      2200,
      0,
      '2026-07-17T01:18:20.345815+00:00'
    ),
    (
      '3fb47212-fa65-489c-9c4a-628e1f8aee1e',
      'tie-dye',
      'image',
      'gallery',
      'https://mmmmicpckawafgxfzbaw.supabase.co/storage/v1/object/public/heritage-media/08d7f672-4220-42df-9bd5-7e5bc7aa62d9/1784251286660-7.webp',
      '扎染',
      '扎染玩偶',
      '7.webp',
      296440,
      'image/webp',
      '08d7f672-4220-42df-9bd5-7e5bc7aa62d9/1784251286660-7.webp',
      'https://mmmmicpckawafgxfzbaw.supabase.co/storage/v1/object/public/heritage-media/08d7f672-4220-42df-9bd5-7e5bc7aa62d9/thumbnails/1784251286660-7.webp',
      '08d7f672-4220-42df-9bd5-7e5bc7aa62d9/thumbnails/1784251286660-7.webp',
      '7.png',
      1238,
      2200,
      0,
      '2026-07-17T01:21:28.969368+00:00'
    ),
    (
      'dd9b76b1-6b15-44cb-b654-e303051dff2f',
      'tie-dye',
      'image',
      'gallery',
      'https://mmmmicpckawafgxfzbaw.supabase.co/storage/v1/object/public/heritage-media/08d7f672-4220-42df-9bd5-7e5bc7aa62d9/1784251296191-3.webp',
      '扎染',
      '扎染玩偶',
      '3.webp',
      294186,
      'image/webp',
      '08d7f672-4220-42df-9bd5-7e5bc7aa62d9/1784251296191-3.webp',
      'https://mmmmicpckawafgxfzbaw.supabase.co/storage/v1/object/public/heritage-media/08d7f672-4220-42df-9bd5-7e5bc7aa62d9/thumbnails/1784251296191-3.webp',
      '08d7f672-4220-42df-9bd5-7e5bc7aa62d9/thumbnails/1784251296191-3.webp',
      '3.png',
      941,
      1672,
      0,
      '2026-07-17T01:21:37.731739+00:00'
    ),
    (
      'd03183e5-6f56-4a13-aefd-5b8e1241d884',
      'tie-dye',
      'image',
      'gallery',
      'https://mmmmicpckawafgxfzbaw.supabase.co/storage/v1/object/public/heritage-media/08d7f672-4220-42df-9bd5-7e5bc7aa62d9/1784251012760-d9269ea831f94602e83600f1600ea7db.webp',
      '蜡染',
      '蜡染包包',
      'd9269ea831f94602e83600f1600ea7db.webp',
      130342,
      'image/webp',
      '08d7f672-4220-42df-9bd5-7e5bc7aa62d9/1784251012760-d9269ea831f94602e83600f1600ea7db.webp',
      'https://mmmmicpckawafgxfzbaw.supabase.co/storage/v1/object/public/heritage-media/08d7f672-4220-42df-9bd5-7e5bc7aa62d9/thumbnails/1784251012760-d9269ea831f94602e83600f1600ea7db.webp',
      '08d7f672-4220-42df-9bd5-7e5bc7aa62d9/thumbnails/1784251012760-d9269ea831f94602e83600f1600ea7db.webp',
      'd9269ea831f94602e83600f1600ea7db.jpg',
      828,
      1792,
      0,
      '2026-07-17T01:16:54.207892+00:00'
    )
) as seed(
  id,
  slug,
  media_type,
  role,
  url,
  alt,
  caption,
  file_name,
  file_size,
  mime_type,
  storage_path,
  thumbnail_url,
  thumbnail_storage_path,
  original_file_name,
  width,
  height,
  sort_order,
  created_at
)
join heritage_map on heritage_map.slug = seed.slug
on conflict (heritage_item_id, role, url) do update
set media_type = excluded.media_type,
    alt = excluded.alt,
    caption = excluded.caption,
    file_name = excluded.file_name,
    file_size = excluded.file_size,
    mime_type = excluded.mime_type,
    storage_path = excluded.storage_path,
    thumbnail_url = excluded.thumbnail_url,
    thumbnail_storage_path = excluded.thumbnail_storage_path,
    original_file_name = excluded.original_file_name,
    width = excluded.width,
    height = excluded.height,
    sort_order = excluded.sort_order;

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
