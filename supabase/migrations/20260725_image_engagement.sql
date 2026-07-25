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
  image_exists boolean;
begin
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
  ) into image_exists;

  if not image_exists then
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
      and image_like.heritage_item_id = p_item_id
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
