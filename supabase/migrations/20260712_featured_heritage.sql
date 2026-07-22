alter table public.heritage_items
  add column if not exists featured boolean not null default false;

update public.heritage_items
set featured = true
where tags @> array['homepage-featured']::text[]
   or slug in (
  'chuanju',
  'datiehua',
  'suzhou-embroidery',
  'luodian',
  'tie-dye',
  'paper-cutting',
  'miao-jewelry',
  'song-brocade'
);

update public.heritage_items
set tags = array_remove(tags, 'homepage-featured')
where tags @> array['homepage-featured']::text[];

create index if not exists heritage_items_featured_idx
  on public.heritage_items(sort_order)
  where published = true and featured = true;

comment on column public.heritage_items.featured is
  'Controls whether a published heritage item appears in the homepage featured collection.';
