import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Clock, RefreshCw, Calculator, X, Wifi, WifiOff, Globe } from 'lucide-react';

const fmt = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
const fmtNum = (n) => new Intl.NumberFormat('id-ID').format(n);
const karatValue = (value) => {
  const match = String(value).replace(',', '.').match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : -1;
};
const sortByKaratDesc = (items) => [...items].sort((a, b) => karatValue(b.kadar) - karatValue(a.kadar));

// ─── Kalkulator ──────────────────────────────────────────────────────────────
function PriceCalc({ allPrices, onClose }) {
  const [weight, setWeight] = useState('');
  const [selectedId, setSelectedId] = useState(allPrices[0]?.id ?? '');
  const selected = allPrices.find((k) => k.id === Number(selectedId));
  const grams = parseFloat(weight) || 0;
  const buyTotal = selected ? selected.buyPrice * grams : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="mt-6 bg-white dark:bg-dark-800 border border-gray-200 dark:border-white/10 rounded-2xl p-5 sm:p-6 relative shadow-lg"
    >
      <button
        onClick={onClose}
        className="absolute top-3 right-3 p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
      >
        <X size={16} />
      </button>
      <h3 className="text-gray-900 dark:text-white font-bold text-base mb-4 flex items-center gap-2">
        <Calculator size={18} className="text-gold-500" /> Kalkulator Harga Emas
      </h3>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="text-gray-500 dark:text-white/40 text-[10px] uppercase tracking-wider mb-1.5 block">Berat (gram)</label>
          <input
            type="number" step="0.01" min="0" value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="cth: 5.5"
            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white text-sm font-mono focus:outline-none focus:border-gold-400/60 transition-all"
          />
        </div>
        <div>
          <label className="text-gray-500 dark:text-white/40 text-[10px] uppercase tracking-wider mb-1.5 block">Jenis Emas</label>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-gold-400/60 transition-all"
          >
            {allPrices.map((k) => (
              <option key={k.id} value={k.id} className="bg-white dark:bg-dark-800">
                {k.kadar} — {k.category}
              </option>
            ))}
          </select>
        </div>
      </div>
      {grams > 0 && selected && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5"
        >
          <div className="text-center p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/15">
            <div className="text-gray-500 dark:text-white/40 text-[9px] uppercase tracking-wider mb-1">Kamu Jual · Diterima</div>
            <div className="text-emerald-600 dark:text-emerald-400 font-bold text-lg font-mono">{fmt(buyTotal)}</div>
            <div className="text-gray-400 dark:text-white/25 text-[9px] mt-0.5">{grams}g × {fmtNum(selected.buyPrice)}/g</div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

// ─── Row grup tabel ──────────────────────────────────────────────────────────
function PriceRow({ item, delay }) {
  const isUp = item.trend === 'up';
  return (
    <motion.tr
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="border-b border-gray-100 dark:border-white/5 hover:bg-gold-50/40 dark:hover:bg-white/[0.02] transition-colors group"
    >
      <td className="py-3 pl-4 pr-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-800 dark:text-white text-sm">{item.kadar}</span>
        </div>
        <div className="text-gray-400 dark:text-white/35 text-[10px] leading-none mt-0.5">{item.category}</div>
      </td>
      <td className="py-3 px-2 text-right">
        <span className="text-emerald-600 dark:text-emerald-400 font-mono font-semibold text-sm">{fmt(item.buyPrice)}</span>
      </td>
      <td className="py-3 pl-2 pr-4 text-right">
        <span className={`inline-flex items-center gap-0.5 text-[11px] font-bold ${isUp ? 'text-emerald-500' : 'text-red-500'}`}>
          {isUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {item.change}
        </span>
      </td>
    </motion.tr>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function GoldPrice({ prices, liveStatus, onRefresh, companyInfo }) {
  const [updated, setUpdated] = useState(new Date());
  const [now, setNow] = useState(new Date());
  const [showCalc, setShowCalc] = useState(false);

  useEffect(() => {
    if (liveStatus?.timestamp) setUpdated(new Date(liveStatus.timestamp));
  }, [liveStatus?.timestamp]);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const sortedPrices = sortByKaratDesc(prices || []);
  const noData = sortedPrices.length === 0;
  const spot24k = sortedPrices.find((p) => p.kadar === '24K' && p.category === 'Emas Perhiasan') || sortedPrices[0];
  const trend = spot24k?.trend || 'up';
  const change = spot24k?.change || '+0.0%';

  // Group prices by category
  const categories = sortedPrices.reduce((acc, p) => {
    if (!acc[p.category]) acc[p.category] = [];
    acc[p.category].push(p);
    return acc;
  }, {});

  const sourceIcon = liveStatus?.source === 'live'
    ? <Wifi size={11} className="text-emerald-400" />
    : liveStatus?.source === 'error'
    ? <WifiOff size={11} className="text-red-400" />
    : <Globe size={11} className="text-blue-400" />;

  const sourceBadge = {
    live: { label: 'GoldAPI · LIVE', cls: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' },
    cache: { label: 'Cache · Auto', cls: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400' },
    'stale-cache': { label: 'Data Lama', cls: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400' },
    error: { label: 'Offline', cls: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400' },
  }[liveStatus?.source] ?? null;

  return (
    <section id="harga" className="py-20 md:py-28 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-primary-600/4 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 dark:bg-white/5 border border-amber-200 dark:border-primary-600/30 mb-4">
            <span className={`w-2 h-2 rounded-full ${noData ? 'bg-gray-300' : 'bg-emerald-400 animate-pulse'}`} />
            <span className="text-amber-700 dark:text-gold-400 text-sm font-semibold tracking-wider">
              {noData ? 'MEMUAT DATA...' : 'HARGA EMAS HARI INI'}
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 dark:text-white mb-3">
            Harga Emas <span className="gold-text">Hari Ini</span>
          </h2>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <p className="text-gray-400 dark:text-white/40 text-xs flex items-center gap-1">
              <Clock size={11} />
              {updated.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              {' · '}{now.toLocaleTimeString('id-ID')}
            </p>
            {sourceBadge && (
              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${sourceBadge.cls}`}>
                {sourceIcon}{sourceBadge.label}
              </span>
            )}
          </div>
        </motion.div>

        {noData ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 bg-white dark:bg-dark-800/50 border border-gray-100 dark:border-white/8 rounded-3xl"
          >
            {liveStatus?.loading ? (
              <>
                <RefreshCw size={36} className="mx-auto mb-4 text-gray-300 dark:text-white/20 animate-spin" style={{ animationDuration: '2.5s' }} />
                <p className="text-gray-500 dark:text-white/40 font-medium">Mengambil data dari GoldAPI.io...</p>
              </>
            ) : (
              <>
                <div className="text-5xl mb-4">📊</div>
                <p className="text-gray-500 dark:text-white/40 font-medium">Belum ada data harga emas</p>
                <p className="text-gray-400 dark:text-white/25 text-sm mt-1">Admin dapat mengatur harga melalui panel admin</p>
              </>
            )}
          </motion.div>
        ) : (
          <>
            {/* ── Spotlight 24K ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-6 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-dark-800 dark:to-dark-700 border border-amber-200 dark:border-gold-400/20 rounded-2xl p-5 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-xs font-bold text-amber-600 dark:text-gold-400 uppercase tracking-widest mb-0.5">Emas 24 Karat</div>
                  <div className="text-gray-500 dark:text-white/40 text-[10px]">Harga spot dunia · per gram</div>
                </div>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${trend === 'up' ? 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-500/15 text-red-600 dark:text-red-400'}`}>
                  {trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {change}
                </span>
              </div>
              <div>
                <div className="bg-white/70 dark:bg-white/5 rounded-xl p-3 text-center border border-amber-100 dark:border-white/5">
                  <div className="text-[10px] text-gray-400 dark:text-white/35 uppercase tracking-wider mb-1">Kami Beli</div>
                  <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">{fmt(spot24k?.buyPrice || 0)}</div>
                  <div className="text-[9px] text-gray-400 dark:text-white/25 mt-0.5">Harga kami beli dari Anda</div>
                </div>
              </div>
            </motion.div>

            {/* ── Tabel lengkap per kategori ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-dark-800/60 border border-gray-100 dark:border-white/8 rounded-2xl overflow-hidden shadow-sm"
            >
              {/* Table header */}
              <div className="grid grid-cols-[1fr_auto_auto] bg-gray-50 dark:bg-white/[0.03] border-b border-gray-100 dark:border-white/8">
                <div className="py-2.5 pl-4 pr-2 text-[10px] font-bold text-gray-400 dark:text-white/30 uppercase tracking-wider">Jenis Emas</div>
                <div className="py-2.5 px-2 text-[10px] font-bold text-gray-400 dark:text-white/30 uppercase tracking-wider text-right">Harga Beli</div>
                <div className="py-2.5 pl-2 pr-4 text-[10px] font-bold text-gray-400 dark:text-white/30 uppercase tracking-wider text-right">Tren</div>
              </div>

              <table className="w-full">
                <tbody>
                  {Object.entries(categories).map(([cat, items], gi) => (
                    <>
                      {/* Subheader kategori */}
                      <tr key={`cat-${cat}`} className="bg-amber-50/60 dark:bg-gold-400/5">
                        <td colSpan={3} className="py-1.5 pl-4 text-[10px] font-bold text-amber-700 dark:text-gold-500 uppercase tracking-widest">
                          {cat}
                        </td>
                      </tr>
                      {items.map((item, ri) => (
                        <PriceRow
                          key={item.id}
                          item={item}
                          delay={gi * 0.05 + ri * 0.04}
                        />
                      ))}
                    </>
                  ))}
                </tbody>
              </table>

              {/* Table footer */}
              <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-100 dark:border-white/8 bg-gray-50/50 dark:bg-white/[0.02]">
                <span className="text-[10px] text-gray-400 dark:text-white/25 flex items-center gap-1">
                  <RefreshCw size={10} className={liveStatus?.loading ? 'animate-spin' : ''} />
                  {liveStatus?.loading ? 'Memperbarui...' : liveStatus?.source === 'live' ? 'Data dari GoldAPI.io · Update otomatis tiap jam' : 'Data dari database · Diperbarui oleh admin'}
                </span>
                {onRefresh && (
                  <button
                    onClick={onRefresh}
                    disabled={liveStatus?.loading}
                    className="text-[10px] font-semibold text-primary-500 hover:text-gold-500 transition-colors disabled:opacity-40 flex items-center gap-1"
                  >
                    <RefreshCw size={10} /> Refresh
                  </button>
                )}
              </div>
            </motion.div>

            {/* ── Kalkulator ── */}
            <div className="mt-5">
              <div className="text-center">
                {!showCalc ? (
                  <button
                    onClick={() => setShowCalc(true)}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-gold-600 dark:hover:text-gold-400 transition-colors"
                  >
                    <Calculator size={15} /> Buka Kalkulator Harga Emas
                  </button>
                ) : null}
              </div>
              <AnimatePresence>
                {showCalc && (
                  <PriceCalc allPrices={sortedPrices} onClose={() => setShowCalc(false)} />
                )}
              </AnimatePresence>
            </div>
          </>
        )}

        {/* ── WhatsApp CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-8 text-center"
        >
          <a
            href={`https://wa.me/${companyInfo?.whatsapp || '628123456789'}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold text-sm sm:text-base px-7 py-3.5 inline-flex items-center gap-2"
          >
            <span>💬</span> Konsultasi via WhatsApp
          </a>
        </motion.div>
      </div>
    </section>
  );
}
