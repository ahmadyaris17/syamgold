create table if not exists public.site_settings (
  section text primary key check (section in ('prices', 'banners', 'outlets', 'company')),
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
revoke all on table public.admin_users from anon, authenticated;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

alter table public.site_settings enable row level security;

revoke all on table public.site_settings from anon, authenticated;
grant select on table public.site_settings to anon, authenticated;
grant insert, update, delete on table public.site_settings to authenticated;

drop policy if exists "Public can read site settings" on public.site_settings;
create policy "Public can read site settings"
on public.site_settings for select
to anon, authenticated
using (true);

drop policy if exists "Authenticated admin can insert site settings" on public.site_settings;
create policy "Authenticated admin can insert site settings"
on public.site_settings for insert
to authenticated
with check ((select public.is_admin()));

drop policy if exists "Authenticated admin can update site settings" on public.site_settings;
create policy "Authenticated admin can update site settings"
on public.site_settings for update
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

drop policy if exists "Authenticated admin can delete site settings" on public.site_settings;
create policy "Authenticated admin can delete site settings"
on public.site_settings for delete
to authenticated
using ((select public.is_admin()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('banners', 'banners', true, 1048576, array['image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view banners" on storage.objects;
create policy "Public can view banners"
on storage.objects for select
to public
using (bucket_id = 'banners');

drop policy if exists "Authenticated admin can upload banners" on storage.objects;
create policy "Authenticated admin can upload banners"
on storage.objects for insert
to authenticated
with check (bucket_id = 'banners' and (select public.is_admin()));

drop policy if exists "Authenticated admin can update banners" on storage.objects;
create policy "Authenticated admin can update banners"
on storage.objects for update
to authenticated
using (bucket_id = 'banners' and (select public.is_admin()))
with check (bucket_id = 'banners' and (select public.is_admin()));

drop policy if exists "Authenticated admin can delete banners" on storage.objects;
create policy "Authenticated admin can delete banners"
on storage.objects for delete
to authenticated
using (bucket_id = 'banners' and (select public.is_admin()));

-- Daftarkan akun Auth sebagai satu-satunya admin aplikasi.
insert into public.admin_users (user_id)
select id
from auth.users
where lower(email) = lower('andromaxa732@gmail.com')
on conflict (user_id) do nothing;

-- Data awal seluruh menu publik. ON CONFLICT DO NOTHING menjaga perubahan lama.
insert into public.site_settings (section, value)
values
  (
    'prices',
    $json$[
      {"id":1,"category":"Emas Perhiasan","kadar":"24K","buyPrice":1720000,"sellPrice":1780000,"trend":"up","change":"+0.8%"},
      {"id":2,"category":"Emas Perhiasan","kadar":"22K","buyPrice":1580000,"sellPrice":1640000,"trend":"up","change":"+0.6%"},
      {"id":3,"category":"Emas Perhiasan","kadar":"18K","buyPrice":1290000,"sellPrice":1340000,"trend":"down","change":"-0.2%"},
      {"id":4,"category":"Emas Perhiasan","kadar":"17K","buyPrice":1220000,"sellPrice":1270000,"trend":"up","change":"+0.4%"},
      {"id":5,"category":"Emas Perhiasan","kadar":"16K","buyPrice":1150000,"sellPrice":1200000,"trend":"up","change":"+0.3%"},
      {"id":6,"category":"Emas Perhiasan","kadar":"8K","buyPrice":575000,"sellPrice":610000,"trend":"down","change":"-0.1%"},
      {"id":7,"category":"Logam Mulia","kadar":"LM Antam","buyPrice":1820000,"sellPrice":1890000,"trend":"up","change":"+1.2%"},
      {"id":8,"category":"Logam Mulia","kadar":"LM UBS","buyPrice":1810000,"sellPrice":1880000,"trend":"up","change":"+1.0%"},
      {"id":9,"category":"Emas Tanpa Surat","kadar":"Tanpa Surat","buyPrice":1650000,"sellPrice":1710000,"trend":"up","change":"+0.7%"}
    ]$json$::jsonb
  ),
  (
    'banners',
    $json$[
      {"id":1,"title":"Jual Emas Harga Terbaik","subtitle":"Kami membeli semua jenis emas dengan harga tertinggi & proses cepat","imageUrl":"/src/assets/s.png","ctaText":"Lihat Harga Sekarang","ctaLink":"#harga"},
      {"id":2,"title":"Transparan & Terpercaya","subtitle":"Sudah dipercaya ribuan pelanggan di seluruh Indonesia sejak 2010","imageUrl":"/src/assets/s.png","ctaText":"Temukan Outlet Kami","ctaLink":"#outlet"},
      {"id":3,"title":"Proses Cepat & Aman","subtitle":"Penilaian emas profesional dengan peralatan modern dan tim berpengalaman","imageUrl":"/src/assets/s.png","ctaText":"Hubungi Kami","ctaLink":"#kontak"}
    ]$json$::jsonb
  ),
  (
    'outlets',
    $json$[
      {"id":1,"name":"Syam Gold - Pusat (Kantor Utama)","address":"Jl. Perintis Kemerdekaan No. 1, Makassar, Sulawesi Selatan 90245","phone":"0411-123456","whatsapp":"628123456789","hours":"Senin - Sabtu: 08.00 - 17.00 WITA","mapsUrl":"https://maps.google.com/?q=Makassar","district":"Makassar"},
      {"id":2,"name":"Syam Gold - Cabang Gowa","address":"Jl. Sultan Hasanuddin No. 45, Sungguminasa, Gowa, Sulawesi Selatan","phone":"0411-234567","whatsapp":"628129876543","hours":"Senin - Sabtu: 08.00 - 17.00 WITA","mapsUrl":"https://maps.google.com/?q=Gowa+Sulawesi+Selatan","district":"Gowa"},
      {"id":3,"name":"Syam Gold - Cabang Maros","address":"Jl. Jenderal Sudirman No. 12, Maros, Sulawesi Selatan","phone":"0411-345678","whatsapp":"628127654321","hours":"Senin - Sabtu: 08.00 - 17.00 WITA","mapsUrl":"https://maps.google.com/?q=Maros+Sulawesi+Selatan","district":"Maros"}
    ]$json$::jsonb
  ),
  (
    'company',
    $json${
      "name":"Syam Gold",
      "fullName":"PT. Rahmat Indo Mulia",
      "tagline":"Jual Emas Harga Terbaik – Aman & Transparan",
      "phone":"0411-123456",
      "whatsapp":"628123456789",
      "email":"info@syamgold.co.id",
      "instagram":"https://instagram.com/syamgold",
      "facebook":"https://facebook.com/syamgold",
      "outletsMapEmbedUrl":"https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63414.48767437988!2d119.37893965!3d-5.14291905!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dbee3f7e3f5d67f%3A0x3030bfbcaf770b0!2sMakassar%2C%20Makassar%20City%2C%20South%20Sulawesi!5e0!3m2!1sen!2sid!4v1720000000000!5m2!1sen!2sid",
      "description":"Kami membeli berbagai jenis Logam Mulia dengan harga terbaik."
    }$json$::jsonb
  )
on conflict (section) do nothing;

-- Hasil akhir harus menunjukkan 4, true, true.
select
  (select count(*) from public.site_settings) as settings_sections,
  exists (
    select 1
    from public.admin_users a
    join auth.users u on u.id = a.user_id
    where lower(u.email) = lower('andromaxa732@gmail.com')
  ) as admin_registered,
  exists (
    select 1 from storage.buckets where id = 'banners' and public = true
  ) as banner_bucket_ready;
