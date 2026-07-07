import { requireSupabase } from './supabase';

const ADMIN_USERNAME = import.meta.env.VITE_ADMIN_USERNAME || 'admin';
const ADMIN_AUTH_EMAIL = import.meta.env.VITE_ADMIN_AUTH_EMAIL || 'andromaxa732@gmail.com';

export async function signInAdmin(username, password) {
  if (username.trim().toLowerCase() !== ADMIN_USERNAME.toLowerCase()) {
    throw new Error('Username atau password salah.');
  }

  const { data, error } = await requireSupabase().auth.signInWithPassword({
    email: ADMIN_AUTH_EMAIL,
    password,
  });
  if (error) throw new Error('Username atau password salah.');
  return data.session;
}

export async function signOutAdmin() {
  const { error } = await requireSupabase().auth.signOut();
  if (error) throw new Error(error.message);
}

export async function changeAdminPassword(currentPassword, newPassword) {
  const client = requireSupabase();
  const { data: userData, error: userError } = await client.auth.getUser();
  if (userError || !userData.user?.email) throw new Error('Sesi admin tidak valid.');

  const { error: loginError } = await client.auth.signInWithPassword({
    email: userData.user.email,
    password: currentPassword,
  });
  if (loginError) throw new Error('Password saat ini salah.');

  const { error } = await client.auth.updateUser({ password: newPassword });
  if (error) throw new Error(error.message);
}
