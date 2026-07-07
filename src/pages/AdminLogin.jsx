import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, LogIn, User } from 'lucide-react';

export default function AdminLogin({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await onLogin(username.trim(), password);
      navigate('/admin/dashboard');
    } catch (loginError) {
      setError(loginError.message || 'Username atau password salah.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-dark-900 flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gold-400/5 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-600 to-gold-400 flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-primary-600/40 animate-float">
            <span className="font-display font-bold text-3xl text-white">SG</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Panel Admin</h1>
          <p className="text-gray-400 dark:text-white/40 text-sm mt-1">Syam Gold – PT. Rahmat Indo Mulia</p>
        </div>

        <div className="glass border border-gray-200 dark:border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary-600/20 border border-primary-600/30 flex items-center justify-center">
              <Lock size={20} className="text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h2 className="text-gray-900 dark:text-white font-bold">Masuk Admin</h2>
              <p className="text-gray-400 dark:text-white/40 text-xs">Masukkan username dan password admin</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-gray-500 dark:text-white/60 text-sm mb-2 block">Username</label>
              <div className="relative">
                <input
                  type="text"
                  value={username} onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 pl-11 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/25 focus:outline-none focus:border-primary-600/60 focus:ring-1 focus:ring-primary-600/20 transition-all duration-300"
                  required
                />
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/30" />
              </div>
            </div>
            <div>
              <label className="text-gray-500 dark:text-white/60 text-sm mb-2 block">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password admin"
                  className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 pl-11 pr-12 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/25 focus:outline-none focus:border-primary-600/60 focus:ring-1 focus:ring-primary-600/20 transition-all duration-300"
                  required
                />
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/30" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/30 hover:text-gray-600 dark:hover:text-white/60 transition-colors">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl px-4 py-3">
                {error}
              </motion.div>
            )}

            <button type="submit" disabled={loading} className="w-full btn-gold justify-center py-3.5 text-base">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><LogIn size={18} /> Masuk</>}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-gray-200 dark:border-white/8 text-center">
            <button onClick={() => navigate('/')} className="text-gray-400 dark:text-white/30 text-sm hover:text-gray-600 dark:hover:text-white/60 transition-colors">
              ← Kembali ke Website
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
