-- Avatars
create policy "Avatar images are publicly viewable"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'avatars');

create policy "Authenticated users can upload own avatars"
on storage.objects
for insert
to authenticated
with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can update own avatars"
on storage.objects
for update
to authenticated
using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can delete own avatars"
on storage.objects
for delete
to authenticated
using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
);

-- Banners
create policy "Banner images are publicly viewable"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'banners');

create policy "Authenticated users can upload own banners"
on storage.objects
for insert
to authenticated
with check (
    bucket_id = 'banners'
    and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can update own banners"
on storage.objects
for update
to authenticated
using (
    bucket_id = 'banners'
    and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
    bucket_id = 'banners'
    and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can delete own banners"
on storage.objects
for delete
to authenticated
using (
    bucket_id = 'banners'
    and (storage.foldername(name))[1] = auth.uid()::text
);

-- Post images
create policy "Post images are publicly viewable"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'post-images');

create policy "Authenticated users can upload own post images"
on storage.objects
for insert
to authenticated
with check (
    bucket_id = 'post-images'
    and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can update own post images"
on storage.objects
for update
to authenticated
using (
    bucket_id = 'post-images'
    and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
    bucket_id = 'post-images'
    and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can delete own post images"
on storage.objects
for delete
to authenticated
using (
    bucket_id = 'post-images'
    and (storage.foldername(name))[1] = auth.uid()::text
);