# Setup Supabase dan Netlify

1. Buat project di Supabase.
2. Buka **Authentication > Users**, buat akun `andromaxa732@gmail.com` dengan password awal `syamgold`.
3. Buka **SQL Editor**, salin seluruh isi `supabase/schema.sql`, lalu klik **Run**. Hasil akhirnya harus menunjukkan `settings_sections = 4`, `admin_registered = true`, dan `banner_bucket_ready = true`.
4. Buka **Project Settings > API**, salin Project URL dan Publishable key.
5. Tambahkan variabel berikut di Netlify melalui **Site configuration > Environment variables**:

```text
VITE_SUPABASE_URL=https://PROJECT_ID.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxxxxxx
VITE_ADMIN_USERNAME=admin
VITE_ADMIN_AUTH_EMAIL=andromaxa732@gmail.com
```

6. Jalankan deploy ulang di Netlify.

Jangan memasukkan `service_role` atau secret key ke variabel yang diawali `VITE_`.

Login panel menggunakan username `admin`. Email Auth hanya dipakai internal oleh aplikasi.
