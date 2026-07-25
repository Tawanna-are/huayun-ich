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

drop policy if exists "Public read heritage image likes" on public.heritage_image_likes;
create policy "Public read heritage image likes"
  on public.heritage_image_likes for select
  using (true);

drop policy if exists "Users manage own heritage image likes" on public.heritage_image_likes;
create policy "Users manage own heritage image likes"
  on public.heritage_image_likes for all
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
  published
)
select
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
  true
from (
  values
    (
      'traditional-opera',
      'jingju',
      '京剧',
      'Peking Opera',
      '京剧以唱、念、做、打为核心，将音乐、身段、脸谱和服饰凝练为高度程式化的东方舞台语言。',
      '北京',
      '北京市',
      '北京',
      2010,
      array[
        '京剧形成于清代中后期，吸收徽班、汉调、昆曲、秦腔等多种声腔与表演传统，在北京的城市文化环境中逐渐成熟。',
        '它通过行当、程式、脸谱、锣鼓点和舞台调度建立起独特的审美秩序，也让历史故事、伦理观念与人物精神在舞台上被反复讲述。'
      ]::text[],
      jsonb_build_array(
        jsonb_build_object('year', '1790', 'title', '徽班进京', 'description', '徽班入京演出，为京剧日后的融合与形成提供重要基础。'),
        jsonb_build_object('year', '19 世纪', 'title', '声腔融合', 'description', '多种地方戏曲声腔在北京交汇，表演体系逐渐定型。'),
        jsonb_build_object('year', '2010', 'title', '入选名录', 'description', '京剧列入人类非物质文化遗产代表作名录。')
      ),
      array['国粹', '剧场', '脸谱', '梅派']::text[],
      array['kunqu', 'datiehua', 'suzhou-embroidery']::text[],
      39.9042,
      116.4074,
      68,
      31,
      10
    ),
    (
      'traditional-opera',
      'kunqu',
      '昆曲',
      'Kunqu Opera',
      '昆曲以细腻曲唱、雅致辞章和水磨腔闻名，被视为中国古典戏曲审美的高峰之一。',
      '江苏苏州',
      '江苏省',
      '苏州',
      2001,
      array[
        '昆曲发源于元末明初的昆山一带，经魏良辅等人的整理革新，形成委婉清丽、节奏舒缓的水磨腔。',
        '它深刻影响明清传奇创作与戏曲表演传统，《牡丹亭》《长生殿》等经典作品至今仍是东方剧场美学的重要参照。'
      ]::text[],
      jsonb_build_array(
        jsonb_build_object('year', '14 世纪', 'title', '昆山腔兴起', 'description', '昆山一带声腔逐渐形成地方影响。'),
        jsonb_build_object('year', '16 世纪', 'title', '水磨腔成熟', 'description', '经音乐家整理后，昆曲音乐与表演气质趋于典雅精密。'),
        jsonb_build_object('year', '2001', 'title', '入选名录', 'description', '昆曲成为首批入选人类非物质文化遗产代表作的中国项目之一。')
      ),
      array['水磨腔', '牡丹亭', '雅部', '苏州']::text[],
      array['jingju', 'suzhou-embroidery', 'jingdezhen-porcelain']::text[],
      31.2989,
      120.5853,
      73,
      48,
      20
    ),
    (
      'traditional-craft',
      'suzhou-embroidery',
      '苏绣',
      'Suzhou Embroidery',
      '苏绣以针法精细、色阶柔和、双面绣巧妙著称，将丝线转化为近似绘画的细密视觉层次。',
      '江苏苏州',
      '江苏省',
      '苏州',
      2006,
      array[
        '苏绣在江南丝织传统中成长，明清时期因文人审美、园林生活和商品经济而不断精进。',
        '它以平、齐、细、密、匀、顺、和、光为美学标准，既服务于日常服饰，也进入屏风、陈设和当代艺术创作。'
      ]::text[],
      jsonb_build_array(
        jsonb_build_object('year', '宋元', 'title', '丝绣繁盛', 'description', '江南丝织与刺绣生产形成成熟基础。'),
        jsonb_build_object('year', '明清', 'title', '文人审美介入', 'description', '画绣结合，题材与技法更趋精雅。'),
        jsonb_build_object('year', '2006', 'title', '入选名录', 'description', '苏绣列入国家级非物质文化遗产代表性项目名录。')
      ),
      array['双面绣', '江南', '丝线', '针法']::text[],
      array['kunqu', 'jingdezhen-porcelain', 'longquan-celadon']::text[],
      31.2989,
      120.5853,
      73,
      48,
      30
    ),
    (
      'traditional-craft',
      'hunan-embroidery',
      '湘绣',
      'Hunan Embroidery',
      '湘绣以写实造型、浓郁色彩和多变针法见长，是湖湘地区代表性的刺绣传统。',
      '湖南长沙',
      '湖南省',
      '长沙',
      2006,
      array[
        '湘绣在长沙及周边地区的民间绣作与画稿传统中成长，题材常见虎、狮、花鸟与人物，强调形神兼备的表现力。',
        '它通过掺针、鬅毛针等技法呈现毛发、肌理和明暗变化，使丝线具有接近绘画与雕塑的视觉张力。'
      ]::text[],
      jsonb_build_array(
        jsonb_build_object('year', '清代', 'title', '地方绣作成熟', 'description', '长沙绣坊与民间绣作逐渐形成鲜明风格。'),
        jsonb_build_object('year', '20 世纪', 'title', '题材拓展', 'description', '写实动物、人物与现代画稿推动湘绣表现力扩展。'),
        jsonb_build_object('year', '2006', 'title', '入选名录', 'description', '湘绣列入国家级非物质文化遗产代表性项目名录。')
      ),
      array['刺绣', '湖湘', '丝绸', '针法', '写实']::text[],
      array['suzhou-embroidery', 'shu-embroidery', 'yue-embroidery']::text[],
      28.2282,
      112.9388,
      64,
      59,
      31
    ),
    (
      'traditional-craft',
      'shu-embroidery',
      '蜀绣',
      'Shu Embroidery',
      '蜀绣以细密针脚、平整光亮和巴蜀丝织传统著称，形成温润而秩序分明的刺绣美学。',
      '四川成都',
      '四川省',
      '成都',
      2006,
      array[
        '蜀绣依托成都平原发达的蚕桑与丝织传统，在服饰、屏风、日用陈设和礼仪用品中延续。',
        '它讲究针脚整齐、设色雅致和层次细腻，常以花鸟、山水、鱼虫和吉祥纹样表现巴蜀生活情趣。'
      ]::text[],
      jsonb_build_array(
        jsonb_build_object('year', '汉唐', 'title', '蜀地丝织兴盛', 'description', '巴蜀地区丝织生产为刺绣发展提供基础。'),
        jsonb_build_object('year', '明清', 'title', '技法精进', 'description', '蜀绣在地方手工体系中形成稳定审美与针法规范。'),
        jsonb_build_object('year', '2006', 'title', '入选名录', 'description', '蜀绣列入国家级非物质文化遗产代表性项目名录。')
      ),
      array['刺绣', '巴蜀', '丝线', '针脚', '手工']::text[],
      array['suzhou-embroidery', 'hunan-embroidery', 'yue-embroidery']::text[],
      30.5728,
      104.0668,
      56,
      55,
      32
    ),
    (
      'traditional-craft',
      'yue-embroidery',
      '粤绣',
      'Yue Embroidery',
      '粤绣包含广绣、潮绣等岭南绣艺，以构图饱满、色彩明快和装饰性强而闻名。',
      '广东广州、潮州',
      '广东省',
      '广州',
      2006,
      array[
        '粤绣在岭南商业、民俗礼仪与外销工艺环境中发展，常用于服饰、戏服、屏风和节庆陈设。',
        '它重视金银线、垫绣和强烈色彩对比，形成华丽、饱满、富于装饰意味的南方刺绣风格。'
      ]::text[],
      jsonb_build_array(
        jsonb_build_object('year', '明清', 'title', '外销与礼俗推动', 'description', '岭南商贸与民俗活动推动广绣、潮绣成熟。'),
        jsonb_build_object('year', '近现代', 'title', '工艺体系延续', 'description', '戏服、礼仪用品和陈设绣品持续丰富粤绣面貌。'),
        jsonb_build_object('year', '2006', 'title', '入选名录', 'description', '粤绣列入国家级非物质文化遗产代表性项目名录。')
      ),
      array['刺绣', '粤绣', '广绣', '潮绣', '岭南', '金银线']::text[],
      array['suzhou-embroidery', 'hunan-embroidery', 'shu-embroidery']::text[],
      23.1291,
      113.2644,
      64,
      68,
      33
    ),
    (
      'traditional-craft',
      'longquan-celadon',
      '龙泉青瓷',
      'Longquan Celadon',
      '龙泉青瓷以温润釉色、厚釉层次和克制器形闻名，呈现东方器物中含蓄而持久的美。',
      '浙江丽水',
      '浙江省',
      '丽水',
      2009,
      array[
        '龙泉青瓷烧制技艺兴盛于宋元时期，依托浙江西南的瓷土、山林燃料与窑炉经验，形成独具辨识度的青釉体系。',
        '它的美感不依赖繁复纹饰，而在釉色的深浅、器形的比例和火候的微妙变化中呈现。'
      ]::text[],
      jsonb_build_array(
        jsonb_build_object('year', '宋代', 'title', '窑业兴盛', 'description', '龙泉窑成为重要青瓷产地，产品广泛流通。'),
        jsonb_build_object('year', '元代', 'title', '海上交流', 'description', '青瓷随海上贸易进入更广阔的国际视野。'),
        jsonb_build_object('year', '2009', 'title', '入选名录', 'description', '龙泉青瓷烧制技艺入选人类非物质文化遗产代表作名录。')
      ),
      array['青釉', '宋韵', '窑火', '器物']::text[],
      array['jingdezhen-porcelain', 'suzhou-embroidery', 'kunqu']::text[],
      28.0743,
      119.1417,
      72,
      55,
      40
    ),
    (
      'traditional-technique',
      'jingdezhen-porcelain',
      '景德镇陶瓷',
      'Jingdezhen Porcelain',
      '景德镇陶瓷以制瓷分工、釉彩体系和千年窑火传统构成中国瓷器文化的核心坐标。',
      '江西景德镇',
      '江西省',
      '景德镇',
      2006,
      array[
        '景德镇因瓷而兴，自宋代以来形成制坯、绘画、施釉、烧成等高度协作的产业体系。',
        '青花、粉彩、颜色釉等技艺不断丰富瓷器的表现力，也让景德镇成为连接中国工艺与世界贸易的重要地名。'
      ]::text[],
      jsonb_build_array(
        jsonb_build_object('year', '1004', 'title', '景德年号', 'description', '景德镇因宋真宗景德年号而得名，制瓷声名渐盛。'),
        jsonb_build_object('year', '明清', 'title', '御窑体系', 'description', '官窑与民窑共同推动陶瓷工艺高度成熟。'),
        jsonb_build_object('year', '2006', 'title', '入选名录', 'description', '景德镇手工制瓷技艺列入国家级非物质文化遗产代表性项目名录。')
      ),
      array['青花', '御窑', '制瓷', '釉彩']::text[],
      array['longquan-celadon', 'suzhou-embroidery', 'datiehua']::text[],
      29.2688,
      117.1784,
      67,
      55,
      50
    ),
    (
      'folk-activity',
      'datiehua',
      '打铁花',
      'Datiehua Iron Flower',
      '打铁花把熔化铁水击向空中，化成漫天火雨，是力量、节庆与民间想象共同完成的夜色仪式。',
      '河南、河北等地',
      '河南省',
      '开封',
      2008,
      array[
        '打铁花源于冶铁、铸造和节庆习俗的结合，匠人将高温铁水击打成火花，以震撼的视觉场面祝愿丰收、平安与兴旺。',
        '这一活动对经验、胆识和协作要求极高，既是民俗展演，也是金属工艺与身体技术在夜晚留下的光痕。'
      ]::text[],
      jsonb_build_array(
        jsonb_build_object('year', '宋金', 'title', '冶铁习俗基础', 'description', '金属冶炼和民间节庆活动形成早期文化土壤。'),
        jsonb_build_object('year', '明清', 'title', '节庆展演', 'description', '打铁花逐渐成为地方节日与庙会中的重要场面。'),
        jsonb_build_object('year', '2008', 'title', '入选名录', 'description', '打铁花列入国家级非物质文化遗产代表性项目名录。')
      ),
      array['火雨', '节庆', '冶铁', '民俗']::text[],
      array['jingju', 'jingdezhen-porcelain', 'longquan-celadon']::text[],
      34.7973,
      114.3076,
      61,
      45,
      60
    )
) as seed(
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
  sort_order
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
    published = true;

with heritage_map as (
  select id, slug from public.heritage_items
)
insert into public.inheritors (heritage_item_id, name, title, bio, image_url, sort_order)
select heritage_map.id, seed.name, seed.title, seed.bio, seed.image_url, seed.sort_order
from (
  values
    ('jingju', '梅派传承群体', '京剧表演艺术传承代表', '以梅派为代表的传承群体持续推动经典剧目整理、舞台表演训练和青年演员培养，使京剧在剧场、影像与国际交流中保持新的生命力。', '/assets/inheritor-opera.png', 0),
    ('kunqu', '苏州昆剧院传承群体', '昆曲表演与剧目整理传承代表', '传承群体通过经典剧目复排、曲牌训练和跨界展演，让昆曲从专业剧场延伸到校园、园林和国际艺术节。', '/assets/inheritor-opera.png', 0),
    ('suzhou-embroidery', '姚建萍', '苏绣代表性传承人', '长期从事苏绣创作、教学与国际展示，以肖像绣、双面绣和现代题材推动传统针法进入更广阔的视觉语境。', '/assets/inheritor-craft.png', 0),
    ('longquan-celadon', '龙泉青瓷烧制传承群体', '青瓷烧制技艺传承代表', '当代传承群体在矿料选择、拉坯修坯、素烧施釉与窑火控制中延续传统，也通过现代器形设计回应新的生活空间。', '/assets/inheritor-craft.png', 0),
    ('jingdezhen-porcelain', '景德镇手工制瓷传承群体', '陶瓷制作技艺传承代表', '从拉坯、利坯到画坯、烧窑，传承群体保存了复杂分工体系，也持续吸引当代艺术家和设计师进入陶瓷创作。', '/assets/inheritor-craft.png', 0),
    ('datiehua', '王德安', '打铁花代表性传承人', '长期参与打铁花展演、教学和安全规范整理，在保留民俗震撼力的同时，让这项高风险技艺以更稳定的方式进入公共文化空间。', '/assets/inheritor-ritual.png', 0)
) as seed(slug, name, title, bio, image_url, sort_order)
join heritage_map on heritage_map.slug = seed.slug
on conflict (heritage_item_id, name) do update
set title = excluded.title,
    bio = excluded.bio,
    image_url = excluded.image_url,
    sort_order = excluded.sort_order;

with heritage_map as (
  select id, slug from public.heritage_items
)
insert into public.heritage_media (heritage_item_id, media_type, role, url, alt, caption, sort_order)
select heritage_map.id, seed.media_type, seed.role, seed.url, seed.alt, seed.caption, seed.sort_order
from (
  values
    ('jingju', 'image', 'cover', '/assets/jingju.png', '京剧脸谱意象', '脸谱与色彩秩序', 0),
    ('jingju', 'image', 'hero', '/assets/jingju-hero.png', '京剧展陈影像', '剧场光影档案', 1),
    ('jingju', 'image', 'gallery', '/assets/jingju.png', '京剧脸谱意象', '脸谱与色彩秩序', 10),
    ('jingju', 'image', 'gallery', '/assets/jingju-detail.png', '京剧舞台身段', '程式化舞台身段', 11),
    ('jingju', 'image', 'gallery', '/assets/jingju-hero.png', '京剧展陈影像', '剧场光影档案', 12),
    ('jingju', 'video', 'video', 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4', '京剧影像档案', '影像档案', 100),
    ('kunqu', 'image', 'cover', '/assets/kunqu.png', '昆曲水袖意象', '水袖与雅部声腔', 0),
    ('kunqu', 'image', 'hero', '/assets/kunqu-hero.png', '昆曲影像展陈', '慢声与留白', 1),
    ('kunqu', 'image', 'gallery', '/assets/kunqu.png', '昆曲水袖意象', '水袖与雅部声腔', 10),
    ('kunqu', 'image', 'gallery', '/assets/kunqu-detail.png', '昆曲园林舞台', '园林中的曲唱', 11),
    ('kunqu', 'image', 'gallery', '/assets/kunqu-hero.png', '昆曲影像展陈', '慢声与留白', 12),
    ('kunqu', 'video', 'video', 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4', '昆曲影像档案', '影像档案', 100),
    ('suzhou-embroidery', 'image', 'cover', '/assets/suzhou-embroidery.png', '苏绣丝线', '丝线的色阶', 0),
    ('suzhou-embroidery', 'image', 'hero', '/assets/suzhou-embroidery-hero.png', '苏绣展陈', '双面绣意象', 1),
    ('suzhou-embroidery', 'image', 'gallery', '/assets/suzhou-embroidery.png', '苏绣丝线', '丝线的色阶', 10),
    ('suzhou-embroidery', 'image', 'gallery', '/assets/suzhou-embroidery-detail.png', '苏绣针脚', '细密针法', 11),
    ('suzhou-embroidery', 'image', 'gallery', '/assets/suzhou-embroidery-hero.png', '苏绣展陈', '双面绣意象', 12),
    ('suzhou-embroidery', 'video', 'video', 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4', '苏绣影像档案', '影像档案', 100),
    ('longquan-celadon', 'image', 'cover', '/assets/longquan-celadon.png', '龙泉青瓷器形', '温润青釉', 0),
    ('longquan-celadon', 'image', 'hero', '/assets/longquan-celadon-hero.png', '龙泉青瓷展陈', '器物的沉静', 1),
    ('longquan-celadon', 'image', 'gallery', '/assets/longquan-celadon.png', '龙泉青瓷器形', '温润青釉', 10),
    ('longquan-celadon', 'image', 'gallery', '/assets/longquan-celadon-detail.png', '龙泉青瓷釉色', '厚釉与火候', 11),
    ('longquan-celadon', 'image', 'gallery', '/assets/longquan-celadon-hero.png', '龙泉青瓷展陈', '器物的沉静', 12),
    ('longquan-celadon', 'video', 'video', 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4', '龙泉青瓷影像档案', '影像档案', 100),
    ('jingdezhen-porcelain', 'image', 'cover', '/assets/jingdezhen-porcelain.png', '景德镇青花瓷', '青花与白瓷', 0),
    ('jingdezhen-porcelain', 'image', 'hero', '/assets/jingdezhen-porcelain-hero.png', '景德镇陶瓷展陈', '千年窑火', 1),
    ('jingdezhen-porcelain', 'image', 'gallery', '/assets/jingdezhen-porcelain.png', '景德镇青花瓷', '青花与白瓷', 10),
    ('jingdezhen-porcelain', 'image', 'gallery', '/assets/jingdezhen-porcelain-detail.png', '景德镇瓷器绘制', '釉彩与笔触', 11),
    ('jingdezhen-porcelain', 'image', 'gallery', '/assets/jingdezhen-porcelain-hero.png', '景德镇陶瓷展陈', '千年窑火', 12),
    ('jingdezhen-porcelain', 'video', 'video', 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4', '景德镇陶瓷影像档案', '影像档案', 100),
    ('datiehua', 'image', 'cover', '/assets/datiehua.png', '打铁花火雨', '夜色中的火雨', 0),
    ('datiehua', 'image', 'hero', '/assets/datiehua-hero.png', '打铁花展演', '节庆仪式', 1),
    ('datiehua', 'image', 'gallery', '/assets/datiehua.png', '打铁花火雨', '夜色中的火雨', 10),
    ('datiehua', 'image', 'gallery', '/assets/datiehua-detail.png', '打铁花火花细节', '铁水与瞬间', 11),
    ('datiehua', 'image', 'gallery', '/assets/datiehua-hero.png', '打铁花展演', '节庆仪式', 12),
    ('datiehua', 'video', 'video', 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4', '打铁花影像档案', '影像档案', 100)
) as seed(slug, media_type, role, url, alt, caption, sort_order)
join heritage_map on heritage_map.slug = seed.slug
on conflict (heritage_item_id, role, url) do update
set media_type = excluded.media_type,
    alt = excluded.alt,
    caption = excluded.caption,
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
