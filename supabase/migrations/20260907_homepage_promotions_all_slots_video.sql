do $$
declare
  constraint_name text;
begin
  select con.conname
    into constraint_name
  from pg_constraint con
  join pg_class rel on rel.oid = con.conrelid
  join pg_namespace nsp on nsp.oid = rel.relnamespace
  where nsp.nspname = 'public'
    and rel.relname = 'homepage_promotions'
    and con.contype = 'c'
    and pg_get_constraintdef(con.oid) ilike '%slot%'
    and pg_get_constraintdef(con.oid) ilike '%media_type%'
  limit 1;

  if constraint_name is not null then
    execute format(
      'alter table public.homepage_promotions drop constraint %I',
      constraint_name
    );
  end if;
end
$$;

alter table public.homepage_promotions
  add constraint homepage_promotions_slot_media_type_check
  check (
    slot in ('top_banner', 'middle_card_1', 'middle_card_2', 'video', 'bottom_banner')
    and media_type in ('image', 'video')
  );
