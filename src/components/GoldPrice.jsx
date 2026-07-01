import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Clock, RefreshCw, Info } from 'lucide-react';

const formatPrice = (num) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);

const CATEGORIES = ['Semua', 'Emas Perhiasan', 'Logam Mulia', 'Emas Tanpa Surat'];

function PriceRow({ item, index }) {
  return (
    <motion.tr
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.04 }}
      className="price-row transition-all duration-200 border-b border-white/5 last:border-0 group"
    >
      <td className="py-4 px-4 md:px-6">
        <div className="flex flex-col">
          <span className="text-white font-semibold text-sm md:text-base">{item.kadar}</span>
          <span className="text-white/40 text-xs">{item.category}</span>
        </div>
      </td>
      <td className="py-4 px-4 md:px-6 text-center">
        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
          item.trend === 'up'
            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
            : 'bg-red-500/15 text-red-400 border border-red-500/20'
        }`}>
          {item.trend === 'up' ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {item.change}
        </span>
      </td>
      <td className="py-4 px-4 md:px-6 text-right">
        <div className="text-gold-400 font-bold text-sm md:text-base font-mono">
          {formatPrice(item.buyPrice)}
        </div>
        <div className="text-white/40 text-xs">Beli</div>
      </td>
      <td className="py-4 px-4 md:px-6 text-right">
        <div className="text-primary-400 font-bold text-sm md:text-base font-mono">
          {formatPrice(item.sellPrice)}
        </div>
        <div className="text-white/40 text-xs">Jual</div>
      </td>
    </motion.tr>
  );
}

export default function GoldPrice({ prices }) {
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const filtered = activeCategory === 'Semua'
    ? prices
    : prices.filter((p) => p.category === activeCategory);

  const tickerItems = prices.slice(0, 5).map(
    (p) => `${p.kadar}: ${formatPrice(p.buyPrice)} | `
  ).join('');

  return (
    <section id="harga" className="py-20 md:py-28 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary-600/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-warm border border-primary-600/30 mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 text-sm font-semibold tracking-wider">HARGA HARI INI</span>
          </div>
          <h2 className="section-title text-white mb-4">
            Harga Emas <span className="gold-text">Terbaru</span>
          </h2>
          <p className="text-white/60 max-w-xl mx-auto text-lg">
            Harga beli dan jual emas terbaik, transparan, dan selalu diperbarui setiap hari
          </p>
        </motion.div>

        {/* Live Ticker */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-8 glass-warm border border-primary-600/20 rounded-2xl overflow-hidden"
        >
          <div className="flex items-center">
            <div className="px-4 py-3 bg-primary-600 flex items-center gap-2 shrink-0">
              <RefreshCw size={14} className="text-white animate-spin" style={{ animationDuration: '3s' }} />
              <span className="text-white text-xs font-bold tracking-wider uppercase">LIVE</span>
            </div>
            <div className="flex-1 overflow-hidden relative">
              <div className="ticker-wrapper py-3">
                <div className="animate-ticker inline-flex whitespace-nowrap text-gold-400 text-sm font-mono font-medium">
                  {tickerItems}{tickerItems}{tickerItems}
                </div>
              </div>
            </div>
            <div className="px-4 py-3 shrink-0 flex items-center gap-1.5 text-white/40 text-xs">
              <Clock size={12} />
              {time.toLocaleTimeString('id-ID')}
            </div>
          </div>
        </motion.div>

        {/* Main Price Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="glass border border-white/8 rounded-3xl overflow-hidden shadow-2xl"
        >
          {/* Card Header */}
          <div className="px-6 py-5 border-b border-white/8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-gold-400 flex items-center justify-center">
                <span className="text-white text-lg">🥇</span>
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">Daftar Harga Emas</h3>
                <p className="text-white/40 text-xs flex items-center gap-1">
                  <Clock size={11} />
                  Diperbarui: {lastUpdated.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    activeCategory === cat
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                      : 'glass text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/8">
                  <th className="text-left py-3 px-4 md:px-6 text-white/40 text-xs font-semibold uppercase tracking-wider">Jenis Emas</th>
                  <th className="text-center py-3 px-4 md:px-6 text-white/40 text-xs font-semibold uppercase tracking-wider">Trend</th>
                  <th className="text-right py-3 px-4 md:px-6 text-white/40 text-xs font-semibold uppercase tracking-wider">Harga Beli / gram</th>
                  <th className="text-right py-3 px-4 md:px-6 text-white/40 text-xs font-semibold uppercase tracking-wider">Harga Jual / gram</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, i) => (
                  <PriceRow key={item.id} item={item} index={i} />
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer note */}
          <div className="px-6 py-4 border-t border-white/8 flex items-center gap-2 text-white/30 text-xs">
            <Info size={12} />
            <span>Harga dapat berubah sewaktu-waktu mengikuti fluktuasi pasar. Hubungi kami untuk konfirmasi harga terkini.</span>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-8 text-center"
        >
          <a
            href="https://wa.me/628123456789"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold text-base px-8 py-3.5"
          >
            <span>💬</span>
            Konsultasi via WhatsApp
          </a>
        </motion.div>
      </div>
    </section>
  );
}
