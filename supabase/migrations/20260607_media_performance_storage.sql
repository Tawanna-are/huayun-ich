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
