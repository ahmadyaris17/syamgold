import { requireSupabase } from './supabase';

export async function fetchSettings() {
  const { data, error } = await requireSupabase()
    .from('site_settings')
    .select('section, value');

  if (error) throw new Error(`Pengaturan gagal dimuat: ${error.message}`);

  return Object.fromEntries(data.map(({ section, value }) => [section, value]));
}

export async function saveSettingsSection(section, value) {
  const { data, error } = await requireSupabase()
    .from('site_settings')
    .upsert({ section, value, updated_at: new Date().toISOString() })
    .select('value')
    .single();

  if (error) throw new Error(`Pengaturan gagal disimpan: ${error.message}`);

  return data.value;
}
