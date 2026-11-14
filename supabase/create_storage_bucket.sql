-- ====================================================================
-- SUPABASE STORAGE: CREATE 'images' BUCKET & RLS POLICIES
-- ====================================================================

-- 1. Create the 'images' storage bucket for deliverables and project proof
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'images',
  'images',
  true,
  10485760, -- 10MB limit per file
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml', 'application/pdf', 'application/zip']
)
on conflict (id) do update set public = true;

-- 2. Allow public viewing / reading of images
drop policy if exists "Public Access to Images" on storage.objects;
create policy "Public Access to Images"
  on storage.objects for select
  using (bucket_id = 'images');

-- 3. Allow anonymous and authenticated uploads to images
drop policy if exists "Allow Public Uploads to Images" on storage.objects;
create policy "Allow Public Uploads to Images"
  on storage.objects for insert
  with check (bucket_id = 'images');

-- 4. Allow updates and deletes
drop policy if exists "Allow Public Updates on Images" on storage.objects;
create policy "Allow Public Updates on Images"
  on storage.objects for update
  using (bucket_id = 'images');

drop policy if exists "Allow Public Deletes on Images" on storage.objects;
create policy "Allow Public Deletes on Images"
  on storage.objects for delete
  using (bucket_id = 'images');
