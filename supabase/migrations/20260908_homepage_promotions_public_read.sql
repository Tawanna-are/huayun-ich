grant select on table public.homepage_promotions to anon, authenticated;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'homepage_promotions'
      and policyname = 'homepage_promotions_public_read_published'
  ) then
    create policy homepage_promotions_public_read_published
      on public.homepage_promotions
      for select
      to anon, authenticated
      using (published = true);
  end if;
end
$$;
