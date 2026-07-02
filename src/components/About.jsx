import { motion } from 'framer-motion';
import { Shield, Zap, Eye, Award, Users, Star } from 'lucide-react';
import logoSyamGold from '../assets/s.png';

const FEATURES = [
  { icon: Shield, title: 'Aman & Terpercaya', desc: 'Sudah berpengalaman lebih dari 10 tahun. Proses penilaian emas transparan dan jujur.', color: 'from-blue-500/20 to-blue-600/10', border: 'border-blue-500/20', iconColor: 'text-blue-500' },
  { icon: Zap, title: 'Proses Cepat', desc: 'Penilaian dan pembayaran dilakukan langsung di tempat, tanpa antri lama.', color: 'from-gold-400/20 to-gold-500/10', border: 'border-gold-400/20', iconColor: 'text-gold-500' },
  { icon: Eye, title: 'Transparan', desc: 'Penimbangan dilakukan di depan Anda dengan timbangan terverifikasi.', color: 'from-primary-600/20 to-primary-700/10', border: 'border-primary-600/20', iconColor: 'text-primary-600' },
  { icon: Award, title: 'Harga Terbaik', desc: 'Kami memberikan harga terbaik di pasaran, selalu update mengikuti harga dunia.', color: 'from-emerald-500/20 to-emerald-600/10', border: 'border-emerald-500/20', iconColor: 'text-emerald-600' },
];

const STATS = [
  { value: '10+', label: 'Tahun Berpengalaman', icon: Award },
  { value: '15.000+', label: 'Pelanggan Puas', icon: Users },
  { value: '4.9★', label: 'Rating Kepuasan', icon: Star },
  { value: '3', label: 'Outlet Aktif', icon: Shield },
];

export default function About() {
  return (
    <section id="tentang" className="py-20 md:py-28 relative overflow-hidden">
      {/* Bg gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50 dark:from-dark-900 via-white dark:via-dark-800/50 to-white dark:to-dark-900 pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-96 h-96 bg-primary-600/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-warm border border-primary-600/30 mb-4">
            <Star size={14} className="text-gold-500" />
            <span className="text-gold-600 dark:text-gold-400 text-sm font-semibold tracking-wider">MENGAPA KAMI</span>
          </div>
          <h2 className="section-title text-gray-900 dark:text-white mb-4">
            Keunggulan <span className="gold-text">Syam Gold</span>
          </h2>
          <p className="text-gray-500 dark:text-white/60 max-w-2xl mx-auto text-lg">
            PT. Rahmat Indo Mulia hadir memberikan layanan jual beli emas terpercaya dengan standar profesional tertinggi
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
          {FEATURES.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative p-6 rounded-3xl bg-gradient-to-br ${feat.color} border ${feat.border} card-hover group overflow-hidden bg-white/80 dark:bg-transparent`}
              >
                <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-white/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 scale-0 group-hover:scale-100 transform" />
                <div className="w-12 h-12 rounded-2xl glass flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <Icon size={24} className={feat.iconColor} />
                </div>
                <h3 className="text-gray-900 dark:text-white font-bold text-lg mb-2">{feat.title}</h3>
                <p className="text-gray-500 dark:text-white/55 text-sm leading-relaxed">{feat.desc}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="glass-warm border border-primary-600/20 rounded-3xl p-8 md:p-12"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 + 0.3 }}
                  className="text-center"
                >
                  <Icon size={28} className="text-primary-500 mx-auto mb-3" />
                  <div className="font-display text-3xl md:text-4xl font-bold gold-text mb-1">
                    {stat.value}
                  </div>
                  <div className="text-gray-500 dark:text-white/50 text-sm">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* About text */}
        <div className="mt-16 grid md:grid-cols-2 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-5">
              Kami Membeli <span className="gold-text">Semua Jenis</span> Emas
            </h3>
            <p className="text-gray-500 dark:text-white/60 leading-relaxed mb-5">
              Syam Gold — PT. Rahmat Indo Mulia membeli berbagai jenis logam mulia dengan harga terbaik di pasaran.
              Tim kami yang profesional dan berpengalaman siap membantu Anda mendapatkan nilai terbaik untuk emas Anda.
            </p>
            <ul className="space-y-3">
              {[
                'Emas Perhiasan (8K – 24K)',
                'Emas Batangan / Logam Mulia',
                'Emas Tanpa Surat / Tanpa Kwitansi',
                'Emas Lama, Warisan & Rusak',
                'Emas Patah & Tidak Utuh',
              ].map((item, i) => (
                <motion.li
                  key={item}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  className="flex items-center gap-3 text-gray-600 dark:text-white/70"
                >
                  <div className="w-5 h-5 rounded-full bg-primary-600/20 border border-primary-600/40 flex items-center justify-center shrink-0">
                    <div className="w-2 h-2 rounded-full bg-gold-400" />
                  </div>
                  {item}
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <div className="glass-warm border border-primary-600/20 rounded-3xl p-8 text-center">
              <div className="flex items-center justify-center mx-auto mb-6 animate-float">
                <img src={logoSyamGold} alt="Syam Gold" className="w-40 h-40 object-contain drop-shadow-2xl" />
              </div>
              <h4 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-2">Syam Gold</h4>
              <p className="text-primary-600 dark:text-primary-400 font-medium mb-4">PT. Rahmat Indo Mulia</p>
              <div className="w-full h-px bg-gradient-to-r from-transparent via-primary-600/40 to-transparent my-5" />
              <p className="text-gray-500 dark:text-white/60 text-sm italic leading-relaxed">
                "Kepercayaan Anda adalah amanah kami. Kami hadir untuk memberikan nilai terbaik bagi setiap gram emas Anda."
              </p>
              <div className="mt-4 text-gold-500 dark:text-gold-400 font-bold">— Tim Syam Gold</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
