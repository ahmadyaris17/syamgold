import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, TrendingUp, Image, MapPin, LogOut, Plus,
  Trash2, Edit3, Save, Check, ArrowUp, ArrowDown,
  ExternalLink, Eye, Settings, RefreshCw, Wifi, WifiOff, Radio, Key, Shield, Upload,
  Globe, Store, Phone, Mail, FileText, EyeOff, AlertTriangle, Calculator
} from 'lucide-react';
import { calculateKaratPrices, calculateKaratPricesFromSpot, normalizeKaratLabel, saveApiKey, getStoredApiKey, testApiKey } from '../services/goldPriceApi';
import { uploadBannerImage, checkImageSize } from '../utils/imageUpload';
import { DEFAULT_FOOTER_ADDRESS, normalizeMapEmbedUrl, normalizeWhatsAppNumber } from '../utils/settings';
import { FacebookIcon, InstagramIcon, WhatsAppIcon } from '../components/SocialIcons';

const TAB_MENUS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'prices', label: 'Harga Emas', icon: TrendingUp },
  { id: 'banners', label: 'Banner', icon: Image },
  { id: 'outlets', label: 'Outlet', icon: MapPin },
  { id: 'settings', label: 'Pengaturan', icon: Settings },
];

// --- Live Price Status Badge ---
function LiveStatusBadge({ liveStatus, refreshLive, useLive, setUseLive }) {
  const { loading, source, timestamp, error } = liveStatus;

  const statusLabel =
    loading ? 'Memperbarui...' :
    source === 'live' ? 'Harga Live' :
    source === 'cache' ? 'Cache (auto)' :
    source === 'stale-cache' ? 'Cache (lama)' :
    source === 'error' ? 'Gagal Fetch' :
    'Manual';

  const statusColor =
    loading ? 'text-blue-400 bg-blue-400/10 border-blue-400/20' :
    source === 'live' || source === 'cache' ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' :
    source === 'stale-cache' ? 'text-amber-400 bg-amber-400/10 border-amber-400/20' :
    source === 'error' ? 'text-red-400 bg-red-400/10 border-red-400/20' :
    'text-gray-400 dark:text-white/40 bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10';

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
      <div className="flex items-center gap-3">
        {/* Status badge */}
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${statusColor}`}>
          {loading ? <RefreshCw size={12} className="animate-spin" /> :
           useLive ? <Wifi size={12} /> : <WifiOff size={12} />}
          {statusLabel}
        </span>

        {/* Timestamp */}
        {timestamp && (
          <span className="text-gray-400 dark:text-white/30 text-xs">
            {new Date(timestamp).toLocaleString('id-ID', {
              day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
            })}
          </span>
        )}

        {/* Error */}
        {error && (
          <span className="text-red-400/70 text-xs max-w-xs truncate" title={error}>
            {error}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Segmented control — Auto / Manual */}
        <div className="relative flex bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-1 gap-1">
          <motion.div
            className={`absolute top-1 rounded-lg shadow-sm transition-all duration-300 ${
              useLive
                ? 'left-1 bg-emerald-500/20 border border-emerald-500/30'
                : 'left-[calc(50%+2px)] bg-amber-500/20 border border-amber-500/30'
            }`}
            style={{ width: 'calc(50% - 6px)', height: 'calc(100% - 8px)' }}
          />
          <button
            onClick={() => setUseLive(true)}
            className={`relative z-10 flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
              useLive
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-gray-400 dark:text-white/30 hover:text-gray-600 dark:hover:text-white/60'
            }`}
          >
            <Radio size={13} />
            <span className="hidden sm:inline">Auto Live</span>
            <span className="sm:hidden">Auto</span>
          </button>
          <button
            onClick={() => setUseLive(false)}
            className={`relative z-10 flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
              !useLive
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-gray-400 dark:text-white/30 hover:text-gray-600 dark:hover:text-white/60'
            }`}
          >
            <Edit3 size={13} />
            <span className="hidden sm:inline">Manual</span>
            <span className="sm:hidden">Man.</span>
          </button>
        </div>

        {/* Refresh button — only in Auto mode */}
        {useLive && (
          <button
            onClick={refreshLive}
            disabled={loading}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              loading
                ? 'glass text-gray-400 dark:text-white/30 cursor-not-allowed'
                : 'btn-outline text-primary-400 border-primary-600/30 hover:bg-primary-600/10'
            }`}
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            Refresh Live
          </button>
        )}
      </div>
    </div>
  );
}

// --- Common kadar suggestions (datalist, not hardcoded restriction) ---
const COMMON_KARAT_OPTIONS = ['24K', '22K', '18K', '17K', '16K', '8K', 'LM Antam', 'LM UBS', 'Tanpa Surat'];

// --- Confirm Modal ---
function ConfirmModal({ onClose, onConfirm, title, message, confirmLabel, confirmVariant = 'warning' }) {
  const variantStyles = {
    warning: 'bg-amber-500 hover:bg-amber-400 text-black',
    danger: 'bg-red-500 hover:bg-red-400 text-white',
    primary: 'bg-primary-600 hover:bg-primary-500 text-white',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl p-6 w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 mb-4">
          <div className={`p-2 rounded-xl shrink-0 ${
            confirmVariant === 'danger' ? 'bg-red-500/10 text-red-400' :
            confirmVariant === 'warning' ? 'bg-amber-500/10 text-amber-400' :
            'bg-primary-500/10 text-primary-400'
          }`}>
            <AlertTriangle size={20} />
          </div>
          <div>
            <h3 className="text-gray-900 dark:text-white font-bold text-sm mb-1">{title}</h3>
            <p className="text-gray-500 dark:text-white/40 text-xs leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${variantStyles[confirmVariant]}`}
          >
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// --- Gold Price Management (CRUD — categories are free-text input) ---
function PriceManager({ prices, onSave, liveStatus, refreshLive, useLive, setUseLive, hidden_karats, onSaveHiddenKarats, companyInfo }) {
  const [data, setData] = useState(() => prices.map((p) => ({ ...p })));
  const [editId, setEditId] = useState(null);
  const [toast, setToast] = useState(null); // { message, type }
  const [confirm, setConfirm] = useState(null); // { title, message, confirmLabel, confirmVariant, onConfirm }
  const hiddenSet = new Set(hidden_karats || []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  };

  const confirmThen = (opts) => {
    setConfirm({ ...opts, onClose: () => setConfirm(null) });
  };

  const executeConfirm = () => {
    if (confirm?.onConfirm) confirm.onConfirm();
    setConfirm(null);
  };

  // Sync when the active Auto/Manual price source changes or a save completes.
  const prevPricesRef = useRef(prices);
  useEffect(() => {
    if (prices !== prevPricesRef.current) {
      setData(prices.map((p) => ({ ...p })));
      prevPricesRef.current = prices;
    }
  }, [prices]);

  const formatPrice = (num) => new Intl.NumberFormat('id-ID').format(num);

  // Price input helpers — format with dots, strip leading zeros
  const formatPriceInput = (n) => (n === 0 ? '' : n.toLocaleString('id-ID'));
  const parsePriceInput = (raw) => {
    const digits = raw.replace(/\D/g, '');
    return digits === '' ? 0 : parseInt(digits, 10);
  };

  const update = (id, field, value) => {
    setData((prev) => {
      const reference24k = field === 'kadar'
        ? prev.find((price) => /^24\s*K?$/i.test(String(price.kadar).trim()))
        : null;
      const calculatedFromSpot = field === 'kadar'
        ? calculateKaratPricesFromSpot(liveStatus.spotIdrPerGram, value, {
            buyMargin: (companyInfo?.buyMargin ?? 3) / 100,
            sellMargin: (companyInfo?.sellMargin ?? 3) / 100,
          })
        : null;
      const calculated = calculatedFromSpot
        || (field === 'kadar' ? calculateKaratPrices(reference24k, value) : null);

      return prev.map((price) => {
        if (price.id !== id) return price;

        const nextPrice = {
          ...price,
          [field]: field === 'buyPrice' || field === 'sellPrice' ? Number(value) || 0 : value,
        };

        if (!calculated) return nextPrice;

        return {
          ...nextPrice,
          ...calculated,
          category: nextPrice.category || 'Emas Perhiasan',
          trend: reference24k?.trend ?? nextPrice.trend,
          change: reference24k?.change ?? nextPrice.change,
        };
      });
    });
  };

  const addPrice = () => {
    const newId = Date.now();
    setData((prev) => [
      ...prev,
      { id: newId, category: '', kadar: '', buyPrice: 0, sellPrice: 0, trend: 'up', change: '+0.0%' },
    ]);
    setEditId(newId);
  };

  const editPrice = (id) => {
    if (useLive) setUseLive(false);
    setEditId(id);
  };

  const deletePrice = (id) => {
    if (useLive) setUseLive(false);
    setData((prev) => prev.filter((p) => p.id !== id));
    if (editId === id) setEditId(null);
  };

  const handleSave = () => {
    const normalizedByKarat = new Map();
    data.forEach((price) => {
      const normalizedPrice = { ...price, kadar: normalizeKaratLabel(price.kadar) };
      const key = `${normalizedPrice.category.trim().toLowerCase()}::${normalizedPrice.kadar.toLowerCase()}`;
      normalizedByKarat.set(key, normalizedPrice);
    });
    const normalizedData = [...normalizedByKarat.values()];
    setData(normalizedData);
    onSave(normalizedData);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h2 className="text-gray-900 dark:text-white font-bold text-xl">Harga Emas</h2>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-gray-400 dark:text-white/30 text-xs flex items-center gap-1">
            <RefreshCw size={11} />
            Sumber: Spot Emas Internasional
          </span>
          {!useLive && (
            <>
              <button onClick={addPrice} className="btn-outline text-sm py-2 px-4">
                <Plus size={16} /> Tambah Harga
              </button>
              <button onClick={handleSave} className="btn-primary text-sm py-2 px-4">
                <Save size={16} /> Simpan
              </button>
            </>
          )}
        </div>
      </div>

      <LiveStatusBadge
        liveStatus={liveStatus}
        refreshLive={refreshLive}
        useLive={useLive}
        setUseLive={setUseLive}
      />

      {/* Toast notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`mb-4 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              toast.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                : 'bg-red-500/10 border border-red-500/20 text-red-400'
            }`}
          >
            <Check size={13} />
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {useLive && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-blue-400/10 border border-blue-400/20 text-blue-400/80 text-xs flex items-center gap-2">
          <Wifi size={13} />
          Mode Auto aktif — harga dari GoldAPI.io. Klik ikon <EyeOff size={11} className="inline" /> untuk sembunyikan baris dari halaman publik. Edit/hapus akan mengaktifkan mode Manual.
        </div>
      )}

      {!useLive && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400/80 text-xs flex items-center gap-2">
          <WifiOff size={13} />
          Mode Manual aktif. Isi kadar seperti <strong className="text-amber-400">22</strong> atau <strong className="text-amber-400">22K</strong> agar harga otomatis dihitung dari harga 24K, lalu klik <strong className="text-amber-400">Simpan</strong>.
        </div>
      )}

      {/* Desktop table */}
      <div className="hidden md:block glass border border-gray-200 dark:border-white/8 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-white/8 bg-gray-50/50 dark:bg-white/[0.02]">
                <th className="text-left py-3 px-4 text-gray-400 dark:text-white/40 text-xs uppercase tracking-wider">Kadar</th>
                <th className="text-left py-3 px-4 text-gray-400 dark:text-white/40 text-xs uppercase tracking-wider">Kategori</th>
                <th className="text-right py-3 px-4 text-gray-400 dark:text-white/40 text-xs uppercase tracking-wider">Harga Beli / gr</th>
                <th className="text-right py-3 px-4 text-gray-400 dark:text-white/40 text-xs uppercase tracking-wider">Harga Jual / gr</th>
                <th className="text-center py-3 px-4 text-gray-400 dark:text-white/40 text-xs uppercase tracking-wider">Trend</th>
                <th className="text-center py-3 px-4 text-gray-400 dark:text-white/40 text-xs uppercase tracking-wider">Change</th>
                <th className="text-center py-3 px-4 text-gray-400 dark:text-white/40 text-xs uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) =>
                editId === row.id ? (
                  <tr key={row.id} className="border-b border-gray-100 dark:border-white/5 bg-primary-600/5">
                    <td className="py-2 px-3">
                      <input
                        value={row.kadar}
                        onChange={(e) => update(row.id, 'kadar', e.target.value)}
                        className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-2 py-1.5 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-primary-600/60"
                        placeholder="cth: 22 atau 22K"
                        list="kadar-list"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        value={row.category}
                        onChange={(e) => update(row.id, 'category', e.target.value)}
                        className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-2 py-1.5 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-primary-600/60"
                        placeholder="cth: Emas Perhiasan"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formatPriceInput(row.buyPrice)}
                        onChange={(e) => update(row.id, 'buyPrice', parsePriceInput(e.target.value))}
                        className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-2 py-1.5 text-gold-400 text-sm font-mono text-right focus:outline-none focus:border-primary-600/60"
                        placeholder="0"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formatPriceInput(row.sellPrice)}
                        onChange={(e) => update(row.id, 'sellPrice', parsePriceInput(e.target.value))}
                        className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-2 py-1.5 text-primary-400 text-sm font-mono text-right focus:outline-none focus:border-primary-600/60"
                        placeholder="0"
                      />
                    </td>
                    <td className="py-2 px-3 text-center">
                      <select
                        value={row.trend}
                        onChange={(e) => update(row.id, 'trend', e.target.value)}
                        className="bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-2 py-1.5 text-gray-900 dark:text-white text-xs focus:outline-none focus:border-primary-600/60"
                      >
                        <option value="up">🟢 Naik</option>
                        <option value="down">🔴 Turun</option>
                      </select>
                    </td>
                    <td className="py-2 px-3">
                      <input
                        value={row.change}
                        onChange={(e) => update(row.id, 'change', e.target.value)}
                        className="w-20 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-2 py-1.5 text-gray-900 dark:text-white text-sm text-center focus:outline-none focus:border-primary-600/60"
                        placeholder="+0.0%"
                      />
                    </td>
                    <td className="py-2 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setEditId(null)}
                          className="p-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/40 transition-colors"
                          title="Selesai edit"
                        >
                          <Check size={15} />
                        </button>
                        <button
                          onClick={() => {
                            confirmThen({
                              title: 'Hapus Harga',
                              message: `Yakin ingin menghapus "${row.kadar} — ${row.category}"?`,
                              confirmLabel: 'Hapus',
                              confirmVariant: 'danger',
                              onConfirm: () => {
                                deletePrice(row.id);
                                showToast(`"${row.kadar}" dihapus`, 'success');
                              },
                            });
                          }}
                          className="p-1.5 rounded-lg bg-red-600/10 text-red-400 hover:bg-red-600/30 transition-colors"
                          title="Hapus"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={row.id} className="border-b border-gray-100 dark:border-white/5 last:border-0 hover:bg-gray-50/50 dark:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 text-gray-900 dark:text-white text-sm font-medium">
                      <div className="flex items-center gap-2">
                        {row.kadar}
                        {useLive && hiddenSet.has(row.kadar) && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/10 text-gray-400">Disembunyikan</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-500 dark:text-white/50 text-sm">{row.category}</td>
                    <td className="py-3 px-4 text-gold-400 text-sm font-mono text-right">
                      Rp {formatPrice(row.buyPrice)}
                    </td>
                    <td className="py-3 px-4 text-primary-400 text-sm font-mono text-right">
                      Rp {formatPrice(row.sellPrice)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 text-xs font-bold ${
                        row.trend === 'up' ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {row.trend === 'up' ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                        {row.trend === 'up' ? 'Naik' : 'Turun'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500 dark:text-white/50 text-sm text-center">{row.change}</td>
                    <td className="py-2 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {useLive ? (
                          <button
                            onClick={() => {
                              const isHidden = hiddenSet.has(row.kadar);
                              const action = isHidden ? 'menampilkan' : 'menyembunyikan';
                              confirmThen({
                                title: isHidden ? 'Tampilkan Harga' : 'Sembunyikan Harga',
                                message: `Yakin ingin ${action} "${row.kadar} — ${row.category}" ${isHidden ? 'di halaman publik' : 'dari halaman publik'}?`,
                                confirmLabel: isHidden ? 'Tampilkan' : 'Sembunyikan',
                                confirmVariant: isHidden ? 'primary' : 'warning',
                                onConfirm: () => {
                                  const next = isHidden
                                    ? (hidden_karats || []).filter((k) => k !== row.kadar)
                                    : [...(hidden_karats || []), row.kadar];
                                  onSaveHiddenKarats(next);
                                  showToast(
                                    isHidden ? `"${row.kadar}" ditampilkan kembali` : `"${row.kadar}" disembunyikan`,
                                    'success'
                                  );
                                },
                              });
                            }}
                            className={`p-1.5 rounded-lg transition-colors ${
                              hiddenSet.has(row.kadar)
                                ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                                : 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-white/40 hover:text-amber-400 hover:bg-amber-500/10'
                            }`}
                            title={hiddenSet.has(row.kadar) ? 'Tampilkan di halaman publik' : 'Sembunyikan dari halaman publik'}
                            aria-label={`${hiddenSet.has(row.kadar) ? 'Tampilkan' : 'Sembunyikan'} ${row.kadar}`}
                          >
                            {hiddenSet.has(row.kadar) ? <Eye size={15} /> : <EyeOff size={15} />}
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => editPrice(row.id)}
                              className="p-1.5 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-white/40 hover:text-primary-400 hover:bg-primary-600/20 transition-colors"
                              title="Edit"
                              aria-label={`Edit harga ${row.kadar}`}
                            >
                              <Edit3 size={15} />
                            </button>
                            <button
                              onClick={() => {
                                confirmThen({
                                  title: 'Hapus Harga',
                                  message: `Yakin ingin menghapus "${row.kadar} — ${row.category}"? Data akan otomatis disembunyikan di mode Auto.`,
                                  confirmLabel: 'Hapus',
                                  confirmVariant: 'danger',
                                  onConfirm: () => {
                                    deletePrice(row.id);
                                    showToast(`"${row.kadar}" dihapus`, 'success');
                                  },
                                });
                              }}
                              className="p-1.5 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-white/40 hover:text-red-400 hover:bg-red-600/20 transition-colors"
                              title="Hapus"
                              aria-label={`Hapus harga ${row.kadar}`}
                            >
                              <Trash2 size={15} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              )}
              {data.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400 dark:text-white/25 text-sm">
                    Belum ada data harga. {!useLive && 'Klik "Tambah Harga" untuk menambahkan.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {!useLive && (
          <datalist id="kadar-list">
            {COMMON_KARAT_OPTIONS.map((k) => (
              <option key={k} value={k} />
            ))}
          </datalist>
        )}
        <div className="px-6 py-3 border-t border-gray-200 dark:border-white/8 text-gray-400 dark:text-white/25 text-xs text-center">
          {useLive
            ? `Harga dikalkulasi otomatis dari spot price emas internasional. Margin beli ${companyInfo?.buyMargin ?? 3}% | Margin jual ${companyInfo?.sellMargin ?? 3}%.`
            : 'Mode manual — harga diatur sendiri. Klik Simpan setelah selesai mengedit.'}
        </div>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {data.map((row) =>
          editId === row.id ? (
            <div key={row.id} className="glass border border-primary-600/30 rounded-2xl p-4 bg-primary-600/5">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-gray-400 dark:text-white/40 text-[10px] uppercase tracking-wider mb-0.5 block">Kadar</label>
                    <input
                      value={row.kadar}
                      onChange={(e) => update(row.id, 'kadar', e.target.value)}
                      className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-2 py-1.5 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-primary-600/60"
                      placeholder="cth: 22 atau 22K"
                      list="kadar-list-mobile"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 dark:text-white/40 text-[10px] uppercase tracking-wider mb-0.5 block">Kategori</label>
                    <input
                      value={row.category}
                      onChange={(e) => update(row.id, 'category', e.target.value)}
                      className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-2 py-1.5 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-primary-600/60"
                      placeholder="cth: Emas Perhiasan"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-gray-400 dark:text-white/40 text-[10px] uppercase tracking-wider mb-0.5 block">Harga Beli / gr</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formatPriceInput(row.buyPrice)}
                      onChange={(e) => update(row.id, 'buyPrice', parsePriceInput(e.target.value))}
                      className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-2 py-1.5 text-gold-400 text-sm font-mono focus:outline-none focus:border-primary-600/60"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 dark:text-white/40 text-[10px] uppercase tracking-wider mb-0.5 block">Harga Jual / gr</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formatPriceInput(row.sellPrice)}
                      onChange={(e) => update(row.id, 'sellPrice', parsePriceInput(e.target.value))}
                      className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-2 py-1.5 text-primary-400 text-sm font-mono focus:outline-none focus:border-primary-600/60"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-gray-400 dark:text-white/40 text-[10px] uppercase tracking-wider mb-0.5 block">Trend</label>
                    <select
                      value={row.trend}
                      onChange={(e) => update(row.id, 'trend', e.target.value)}
                      className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-2 py-1.5 text-gray-900 dark:text-white text-xs focus:outline-none focus:border-primary-600/60"
                    >
                      <option value="up">🟢 Naik</option>
                      <option value="down">🔴 Turun</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-400 dark:text-white/40 text-[10px] uppercase tracking-wider mb-0.5 block">Change</label>
                    <input
                      value={row.change}
                      onChange={(e) => update(row.id, 'change', e.target.value)}
                      className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-2 py-1.5 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-primary-600/60"
                      placeholder="+0.0%"
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <button onClick={() => setEditId(null)} className="btn-primary text-xs py-2 px-4 flex-1">
                    <Check size={14} /> Selesai
                  </button>
                  <button
                    onClick={() => {
                      confirmThen({
                        title: 'Hapus Harga',
                        message: `Yakin ingin menghapus "${row.kadar} — ${row.category}"? Data akan otomatis disembunyikan di mode Auto.`,
                        confirmLabel: 'Hapus',
                        confirmVariant: 'danger',
                        onConfirm: () => {
                          deletePrice(row.id);
                          showToast(`"${row.kadar}" dihapus`, 'success');
                        },
                      });
                    }}
                    className="btn-outline text-xs py-2 px-4 border-red-600/40 text-red-400 hover:bg-red-600/20"
                  >
                    <Trash2 size={14} /> Hapus
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div
              key={row.id}
              className="glass border border-gray-200 dark:border-white/8 rounded-2xl p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-gray-900 dark:text-white font-semibold text-sm">{row.kadar}</span>
                  <span className="text-gray-400 dark:text-white/40 text-xs ml-2">{row.category}</span>
                  {useLive && hiddenSet.has(row.kadar) && (
                    <span className="text-[9px] ml-2 px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/10 text-gray-400">Disembunyikan</span>
                  )}
                </div>
                <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
                  row.trend === 'up'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                  {row.trend === 'up' ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
                  {row.change}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-gray-400 dark:text-white/40 text-[10px] uppercase tracking-wider mb-0.5">Beli / gr</div>
                  <div className="text-gold-400 font-mono text-sm font-bold">
                    Rp {formatPrice(row.buyPrice)}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 dark:text-white/40 text-[10px] uppercase tracking-wider mb-0.5">Jual / gr</div>
                  <div className="text-primary-400 font-mono text-sm font-bold">
                    Rp {formatPrice(row.sellPrice)}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-white/5">
                {useLive ? (
                  <button
                    onClick={() => {
                      const isHidden = hiddenSet.has(row.kadar);
                      const action = isHidden ? 'menampilkan' : 'menyembunyikan';
                      confirmThen({
                        title: isHidden ? 'Tampilkan Harga' : 'Sembunyikan Harga',
                        message: `Yakin ingin ${action} "${row.kadar} — ${row.category}" ${isHidden ? 'di halaman publik' : 'dari halaman publik'}?`,
                        confirmLabel: isHidden ? 'Tampilkan' : 'Sembunyikan',
                        confirmVariant: isHidden ? 'primary' : 'warning',
                        onConfirm: () => {
                          const next = isHidden
                            ? (hidden_karats || []).filter((k) => k !== row.kadar)
                            : [...(hidden_karats || []), row.kadar];
                          onSaveHiddenKarats(next);
                          showToast(
                            isHidden ? `"${row.kadar}" ditampilkan kembali` : `"${row.kadar}" disembunyikan`,
                            'success'
                          );
                        },
                      });
                    }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg transition-colors text-xs font-medium ${
                      hiddenSet.has(row.kadar)
                        ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                        : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-white/50 hover:text-amber-400 hover:bg-amber-500/10'
                    }`}
                  >
                    {hiddenSet.has(row.kadar) ? <><Eye size={13} /> Tampilkan</> : <><EyeOff size={13} /> Sembunyikan</>}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => editPrice(row.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-white/50 hover:text-primary-400 hover:bg-primary-600/20 transition-colors text-xs font-medium"
                    >
                      <Edit3 size={13} /> Edit
                    </button>
                    <button
                      onClick={() => {
                        confirmThen({
                          title: 'Hapus Harga',
                          message: `Yakin ingin menghapus "${row.kadar} — ${row.category}"? Data akan otomatis disembunyikan di mode Auto.`,
                          confirmLabel: 'Hapus',
                          confirmVariant: 'danger',
                          onConfirm: () => {
                            deletePrice(row.id);
                            showToast(`"${row.kadar}" dihapus`, 'success');
                          },
                        });
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-white/50 hover:text-red-400 hover:bg-red-600/20 transition-colors text-xs font-medium"
                    >
                      <Trash2 size={13} /> Hapus
                    </button>
                  </>
                )}
              </div>
            </div>
          )
        )}
        {!useLive && (
          <datalist id="kadar-list-mobile">
            {COMMON_KARAT_OPTIONS.map((k) => (
              <option key={k} value={k} />
            ))}
          </datalist>
        )}
        {data.length === 0 && (
          <div className="text-center py-12 text-gray-400 dark:text-white/25 text-sm">
            Belum ada data harga. {!useLive && 'Klik "Tambah Harga" untuk menambahkan.'}
          </div>
        )}
        <div className="px-4 py-3 text-gray-400 dark:text-white/25 text-[10px] text-center">
          {useLive
            ? `Harga dari spot emas internasional. Margin beli ${companyInfo?.buyMargin ?? 3}% | Margin jual ${companyInfo?.sellMargin ?? 3}%.`
            : 'Mode manual — klik Simpan setelah selesai.'}
        </div>
      </div>

      {/* Mobile floating action buttons for manual mode */}
      {!useLive && (
        <div className="md:hidden flex gap-3 mt-4">
          <button onClick={addPrice} className="btn-outline text-sm py-2.5 px-4 flex-1">
            <Plus size={16} /> Tambah Harga
          </button>
          <button onClick={handleSave} className="btn-primary text-sm py-2.5 px-4 flex-1">
            <Save size={16} /> Simpan
          </button>
        </div>
      )}

      {/* Custom Confirm Modal */}
      <AnimatePresence>
        {confirm && (
          <ConfirmModal
            onClose={confirm.onClose}
            onConfirm={executeConfirm}
            title={confirm.title}
            message={confirm.message}
            confirmLabel={confirm.confirmLabel}
            confirmVariant={confirm.confirmVariant}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Banner Management ---
function BannerManager({ banners, onSave }) {
  const [data, setData] = useState(banners.map((b) => ({ ...b })));
  const [uploadingId, setUploadingId] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [previewUrls, setPreviewUrls] = useState({});
  const [compressStatus, setCompressStatus] = useState('');

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      Object.values(previewUrls).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const update = (id, field, value) => {
    setData((prev) => prev.map((b) => (b.id === id ? { ...b, [field]: value } : b)));
  };

  const addBanner = () => {
    setData((prev) => [
      ...prev,
      { id: Date.now(), title: 'Judul Banner Baru', subtitle: 'Deskripsi banner', imageUrl: '/src/assets/s.png', ctaText: 'Lihat Selengkapnya', ctaLink: '#harga' },
    ]);
  };

  const deleteBanner = (id) => {
    setData((prev) => prev.filter((b) => b.id !== id));
    // Clean up any preview URL for this banner
    setPreviewUrls((prev) => {
      if (prev[id]) {
        URL.revokeObjectURL(prev[id]);
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return prev;
    });
  };

  const handleImageUpload = async (id, file) => {
    if (!file) return;
    setUploadingId(id);
    setUploadError('');
    setCompressStatus('');

    // Periksa ukuran gambar — jika > 8 MB, beri tahu user bahwa gambar akan dikompresi
    const { oversized, sizeMB } = checkImageSize(file);
    if (oversized) {
      setCompressStatus(`Gambar ${sizeMB} MB > 8 MB, otomatis mengompresi...`);
    }

    // Immediately show local preview via object URL
    const localUrl = URL.createObjectURL(file);
    setPreviewUrls((prev) => {
      if (prev[id]) URL.revokeObjectURL(prev[id]);
      return { ...prev, [id]: localUrl };
    });

    try {
      const permanentUrl = await uploadBannerImage(file, {
        onProgress: (message) => setCompressStatus(message),
      });
      update(id, 'imageUrl', permanentUrl);
      // Remove local preview after permanent URL is set
      setPreviewUrls((prev) => {
        if (prev[id]) URL.revokeObjectURL(prev[id]);
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } catch (error) {
      setUploadError(error.message);
      // Keep local preview even on upload error so user still sees the image
    } finally {
      setUploadingId(null);
      setCompressStatus('');
    }
  };

  const getBannerImageSrc = (banner) => {
    // Prefer local preview URL while uploading; fall back to stored imageUrl
    return previewUrls[banner.id] || banner.imageUrl;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-gray-900 dark:text-white font-bold text-xl">Kelola Banner</h2>
        <div className="flex gap-3">
          <button onClick={addBanner} className="btn-outline text-sm py-2 px-4">
            <Plus size={16} /> Tambah Banner
          </button>
          <button onClick={() => onSave(data)} className="btn-primary text-sm py-2 px-4">
            <Save size={16} /> Simpan
          </button>
        </div>
      </div>

      {/* Petunjuk gambar */}
      <div className="mb-4 px-4 py-3 rounded-xl bg-blue-400/10 border border-blue-400/20 text-blue-400/80 text-xs flex items-center gap-2">
        <Image size={13} />
        Upload JPG, PNG, atau WebP. Gambar &gt; 8 MB otomatis dikompresi lebih agresif. Disimpan di <code className="text-blue-400">Supabase Storage / banners</code>.
      </div>
      {uploadError && <div role="alert" className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">{uploadError}</div>}
      {compressStatus && !uploadError && (
        <div role="status" aria-live="polite" className="mb-4 px-4 py-3 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs flex items-center gap-2">
          <RefreshCw size={13} className="animate-spin" />
          {compressStatus}
        </div>
      )}

      <div className="space-y-5">
        {data.map((banner, i) => (
          <motion.div
            key={banner.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass border border-gray-200 dark:border-white/8 rounded-2xl overflow-hidden"
          >
            <div className="flex gap-4 p-5">
              {/* Preview */}
              <div className="w-40 h-24 rounded-xl overflow-hidden shrink-0 bg-gray-100 dark:bg-dark-700 relative">
                <img
                  src={getBannerImageSrc(banner)}
                  alt={`Preview ${banner.title}`}
                  className="w-full h-full object-cover opacity-80"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2">
                  <span className="text-white text-xs font-bold truncate drop-shadow-md">{banner.title}</span>
                </div>
              </div>

              {/* Fields */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 dark:text-white/40 text-xs mb-1 block">Judul</label>
                  <input value={banner.title} onChange={(e) => update(banner.id, 'title', e.target.value)}
                    className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-primary-600/60" />
                </div>
                <div>
                  <label className="text-gray-400 dark:text-white/40 text-xs mb-1 block">Gambar Banner</label>
                  <div className="flex gap-2">
                    <input value={banner.imageUrl} onChange={(e) => update(banner.id, 'imageUrl', e.target.value)}
                      aria-label={`URL gambar banner ${i + 1}`}
                      className="min-w-0 flex-1 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-primary-600/60 font-mono text-xs" />
                    <label className="btn-outline text-xs px-3 py-2 cursor-pointer shrink-0">
                      <Upload size={14} /> {uploadingId === banner.id ? 'Memproses...' : 'Upload'}
                      <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only"
                        disabled={uploadingId !== null}
                        onChange={(e) => handleImageUpload(banner.id, e.target.files?.[0])} />
                    </label>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="text-gray-400 dark:text-white/40 text-xs mb-1 block">Deskripsi</label>
                  <input value={banner.subtitle} onChange={(e) => update(banner.id, 'subtitle', e.target.value)}
                    className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-primary-600/60" />
                </div>
                <div>
                  <label className="text-gray-400 dark:text-white/40 text-xs mb-1 block">Teks Tombol</label>
                  <input value={banner.ctaText} onChange={(e) => update(banner.id, 'ctaText', e.target.value)}
                    className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-primary-600/60" />
                </div>
                <div>
                  <label className="text-gray-400 dark:text-white/40 text-xs mb-1 block">Link Tombol</label>
                  <input value={banner.ctaLink} onChange={(e) => update(banner.id, 'ctaLink', e.target.value)}
                    className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-primary-600/60" />
                </div>
              </div>

              {/* Delete */}
              <button onClick={() => deleteBanner(banner.id)}
                className="shrink-0 p-2 rounded-xl bg-red-600/10 text-red-400 hover:bg-red-600/30 transition-colors h-fit">
                <Trash2 size={18} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// --- Outlet Management ---
function OutletManager({ outlets, onSave }) {
  const [data, setData] = useState(outlets.map((o) => ({ ...o })));
  const [editId, setEditId] = useState(null);

  const update = (id, field, value) => {
    setData((prev) => prev.map((o) => (o.id === id ? { ...o, [field]: value } : o)));
  };

  const addOutlet = () => {
    const newId = Date.now();
    setData((prev) => [...prev, {
      id: newId, name: 'Outlet Baru', address: 'Alamat outlet', phone: '0411-000000',
      whatsapp: '62811111111', hours: 'Senin - Sabtu: 08.00 - 17.00', mapsUrl: 'https://maps.google.com', district: 'Kota',
    }]);
    setEditId(newId);
  };

  const deleteOutlet = (id) => {
    setData((prev) => prev.filter((o) => o.id !== id));
    if (editId === id) setEditId(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-gray-900 dark:text-white font-bold text-xl">Kelola Outlet</h2>
        <div className="flex gap-3">
          <button onClick={addOutlet} className="btn-outline text-sm py-2 px-4">
            <Plus size={16} /> Tambah Outlet
          </button>
          <button onClick={() => onSave(data)} className="btn-primary text-sm py-2 px-4">
            <Save size={16} /> Simpan
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {data.map((outlet, i) => (
          <motion.div
            key={outlet.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass border border-gray-200 dark:border-white/8 rounded-2xl p-5"
          >
            {editId === outlet.id ? (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {[
                    { field: 'name', label: 'Nama Outlet', span: 2 },
                    { field: 'district', label: 'Kecamatan/Kota' },
                    { field: 'phone', label: 'Telepon' },
                    { field: 'whatsapp', label: 'WhatsApp (tanpa +)' },
                    { field: 'hours', label: 'Jam Operasional' },
                    { field: 'mapsUrl', label: 'Link Google Maps', span: 2 },
                    { field: 'address', label: 'Alamat Lengkap', span: 2, textarea: true },
                  ].map(({ field, label, span, textarea }) => (
                    <div key={field} className={span === 2 ? 'md:col-span-2' : ''}>
                      <label className="text-gray-400 dark:text-white/40 text-xs mb-1 block">{label}</label>
                      {textarea ? (
                        <textarea value={outlet[field]} onChange={(e) => update(outlet.id, field, e.target.value)} rows={2}
                          className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-primary-600/60 resize-none" />
                      ) : (
                        <input value={outlet[field]} onChange={(e) => update(outlet.id, field, e.target.value)}
                          className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-primary-600/60" />
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => { setEditId(null); onSave(data); }} className="btn-primary text-sm py-2 px-4">
                    <Check size={16} /> Selesai & Simpan
                  </button>
                  <button onClick={() => deleteOutlet(outlet.id)} className="btn-outline text-sm py-2 px-4 border-red-600/40 text-red-400 hover:bg-red-600/20">
                    <Trash2 size={16} /> Hapus
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-full bg-primary-600/20 text-primary-400 text-xs font-semibold">{outlet.district}</span>
                    <h3 className="text-gray-900 dark:text-white font-bold">{outlet.name}</h3>
                  </div>
                  <p className="text-gray-400 dark:text-white/40 text-sm">{outlet.address}</p>
                  <div className="flex gap-4 mt-2 text-gray-400 dark:text-white/40 text-xs">
                    <span>📞 {outlet.phone}</span>
                    <span>⏰ {outlet.hours}</span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <a href={outlet.mapsUrl} target="_blank" rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-white/40 hover:text-blue-400 hover:bg-blue-400/10 transition-colors">
                    <ExternalLink size={16} />
                  </a>
                  <button onClick={() => setEditId(outlet.id)}
                    className="p-2 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-white/40 hover:text-primary-400 hover:bg-primary-600/20 transition-colors">
                    <Edit3 size={16} />
                  </button>
                  <button onClick={() => deleteOutlet(outlet.id)}
                    className="p-2 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-white/40 hover:text-red-400 hover:bg-red-600/20 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// --- Dashboard Summary ---
function Dashboard({ prices, banners, outlets, liveStatus, refreshLive, useLive, setUseLive }) {
  const stats = [
    { label: 'Total Harga Emas', value: prices.length, icon: TrendingUp, color: 'text-gold-400', bg: 'bg-gold-400/10' },
    { label: 'Banner Aktif', value: banners.length, icon: Image, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Outlet Aktif', value: outlets.length, icon: MapPin, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  ];

  return (
    <div>
      <h2 className="text-gray-900 dark:text-white font-bold text-xl mb-6">Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass border border-gray-200 dark:border-white/8 rounded-2xl p-6"
            >
              <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center mb-4`}>
                <Icon size={22} className={s.color} />
              </div>
              <div className={`text-3xl font-bold ${s.color} font-display mb-1`}>{s.value}</div>
              <div className="text-gray-400 dark:text-white/40 text-sm">{s.label}</div>
            </motion.div>
          );
        })}
      </div>

      <LiveStatusBadge
        liveStatus={liveStatus}
        refreshLive={refreshLive}
        useLive={useLive}
        setUseLive={setUseLive}
      />

      <div className="glass border border-gray-200 dark:border-white/8 rounded-2xl p-6">
        <h3 className="text-gray-900 dark:text-white font-bold mb-4">Panduan Singkat</h3>
        <div className="space-y-3 text-gray-500 dark:text-white/50 text-sm">
          <p>🔴 Mode <strong className="text-gold-400">Auto</strong>: harga diambil otomatis dari GoldAPI.io</p>
          <p>✏️ Mode <strong className="text-amber-400">Manual</strong>: edit, tambah, atau hapus harga sesuka hati lalu klik Simpan</p>
          <p>🔄 Klik <strong className="text-blue-400">Refresh Live</strong> untuk memperbarui harga dari GoldAPI.io</p>
          <p>⚙️ Masukkan <strong className="text-gold-400">GoldAPI.io API Key</strong> di menu Pengaturan agar live price berfungsi</p>
          <p>✅ Gunakan menu <strong className="text-blue-400">Banner</strong> untuk mengganti gambar banner di halaman utama</p>
          <p>✅ Gunakan menu <strong className="text-emerald-400">Outlet</strong> untuk menambah atau mengedit lokasi outlet</p>
          <p>⚠️ Klik <strong className="text-gold-400">Simpan</strong> setelah setiap perubahan agar tersimpan permanen</p>
        </div>
      </div>
    </div>
  );
}

// --- Settings Management ---
function SettingsManager({ onChangePassword, onSave, refreshLive, companyInfo, onSaveCompany, liveStatus }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');

  // GoldAPI.io key
  const [goldApiKey, setGoldApiKey] = useState(() => getStoredApiKey() || '');
  const [keySaved, setKeySaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  // Website info
  const [site, setSite] = useState(() => ({
    ...companyInfo,
    footerAddress: companyInfo?.footerAddress || DEFAULT_FOOTER_ADDRESS,
  }));
  const [siteSaved, setSiteSaved] = useState(false);
  const [siteError, setSiteError] = useState('');

  const handleSavePassword = async () => {
    if (newPassword.length < 6) { setError('Password baru minimal 6 karakter!'); return; }
    setError('');
    try {
      await onChangePassword(currentPassword, newPassword);
      onSave();
      setCurrentPassword('');
      setNewPassword('');
    } catch (passwordError) {
      setError(passwordError.message || 'Password gagal diperbarui.');
    }
  };

  const handleSaveApiKey = () => { saveApiKey(goldApiKey.trim()); setKeySaved(true); setTimeout(() => setKeySaved(false), 2500); };

  const handleTestApiKey = async () => {
    if (!goldApiKey.trim()) return; setTesting(true); setTestResult(null);
    try { const r = await testApiKey(goldApiKey.trim()); setTestResult({ ok: true, message: `Koneksi berhasil! Harga emas: Rp ${new Intl.NumberFormat('id-ID').format(Math.round(r.price / 31.1034768))}/gram (24K)` }); saveApiKey(goldApiKey.trim()); if (refreshLive) refreshLive(); }
    catch (e) { setTestResult({ ok: false, message: `Gagal: ${e.message}` }); }
    finally { setTesting(false); }
  };

  const handleSaveSite = async () => {
    const mapValue = site.outletsMapEmbedUrl?.trim() || '';
    const normalizedMapUrl = normalizeMapEmbedUrl(mapValue);
    const previousMapUrl = normalizeMapEmbedUrl(companyInfo?.outletsMapEmbedUrl);

    const normalizedSite = {
      ...site,
      whatsapp: normalizeWhatsAppNumber(site.whatsapp),
      footerAddress: site.footerAddress?.trim() || DEFAULT_FOOTER_ADDRESS,
      outletsMapEmbedUrl: normalizedMapUrl || previousMapUrl,
    };
    setSite(normalizedSite);
    setSiteError('');
    try {
      await onSaveCompany(normalizedSite);
      // Simpan margin ke localStorage — pakai timestamp biar fetchLivePrices deteksi perubahan
      const buyPct = parseFloat(site.buyMargin) || 3;
      const sellPct = parseFloat(site.sellMargin) || 3;
      try {
        localStorage.setItem('sg_margins', JSON.stringify({
          buyMargin: buyPct / 100,
          sellMargin: sellPct / 100,
          updatedAt: Date.now(),
        }));
      } catch { /* ignore */ }
      // Refresh dengan margin baru
      if (refreshLive) refreshLive();
      setSiteSaved(true);
      setTimeout(() => setSiteSaved(false), 2500);
    } catch (saveError) {
      setSiteError(saveError.message || 'Pengaturan gagal disimpan.');
    }
  };

  const updateSite = (field, value) => setSite((prev) => ({ ...prev, [field]: value }));

  const inputCls = 'w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-primary-600/60';
  const labelCls = 'text-gray-400 dark:text-white/40 text-xs mb-1 block';

  const FIELDS = [
    { field: 'name', label: 'Nama Brand', icon: Store, placeholder: 'Syam Gold' },
    { field: 'fullName', label: 'Nama Perusahaan', icon: Globe, placeholder: 'PT. Rahmat Indo Mulia' },
    { field: 'tagline', label: 'Tagline', icon: FileText, placeholder: 'Jual Emas Harga Terbaik' },
    { field: 'phone', label: 'Nomor Telepon', icon: Phone, placeholder: '0411-123456' },
    { field: 'whatsapp', label: 'WhatsApp (boleh diawali 08 atau 62)', icon: WhatsAppIcon, placeholder: '082129178211' },
    { field: 'email', label: 'Email', icon: Mail, placeholder: 'info@syamgold.co.id' },
    { field: 'instagram', label: 'URL Instagram', icon: InstagramIcon, placeholder: 'https://instagram.com/syamgold' },
    { field: 'facebook', label: 'URL Facebook', icon: FacebookIcon, placeholder: 'https://facebook.com/syamgold' },
    { field: 'footerAddress', label: 'Alamat Footer', icon: MapPin, placeholder: DEFAULT_FOOTER_ADDRESS, span: 2 },
    { field: 'outletsMapEmbedUrl', label: 'URL Embed Peta Semua Outlet', icon: MapPin, placeholder: 'https://www.google.com/maps/embed?pb=...', span: 2 },
  ];

  return (
    <div className="w-full max-w-6xl space-y-8">
      {/* ═══ Pengaturan Website + panel pendukung ═══ */}
      <div className="grid xl:grid-cols-5 gap-6 xl:gap-8 items-start">
        {/* Pengaturan Website */}
        <div className="xl:col-span-3 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
            <h2 className="text-gray-900 dark:text-white font-bold text-xl">Pengaturan Website</h2>
            <div className="flex items-center gap-2 sm:justify-end">
              {siteSaved && (
                <motion.span initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                  className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-1 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-lg">
                  <Check size={13} /> Tersimpan!
                </motion.span>
              )}
              <button onClick={handleSaveSite} className="btn-primary min-h-10 text-sm py-2 px-4 shrink-0"><Save size={16} /> Simpan</button>
            </div>
          </div>
          {siteError && <div role="alert" className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">{siteError}</div>}
          <div className="glass border border-gray-200 dark:border-white/8 rounded-2xl p-4 sm:p-6 shadow-sm">
            <h3 className="text-gray-900 dark:text-white font-bold mb-1 flex items-center gap-2">
              <Globe size={18} className="text-primary-400" /> Informasi Perusahaan
            </h3>
            <p className="text-gray-400 dark:text-white/40 text-xs mb-5">Data ini akan tampil di seluruh halaman website. Klik <strong>Simpan</strong> setelah selesai edit.</p>
            <div className="grid sm:grid-cols-2 gap-4">
              {FIELDS.map(({ field, label, icon: Ic, placeholder, span }) => (
                <div key={field} className={span === 2 || field === 'tagline' ? 'sm:col-span-2' : 'min-w-0'}>
                  <label className={labelCls}>
                    <Ic size={11} className="inline mr-1" />{label}
                  </label>
                  <input value={site[field] || ''} onChange={(e) => updateSite(field, e.target.value)}
                    className={inputCls} placeholder={placeholder} />
                  {field === 'outletsMapEmbedUrl' && (
                    <p className="mt-1.5 text-[11px] leading-relaxed text-gray-400 dark:text-white/35 text-pretty">
                      Link pendek maps.app.goo.gl tidak mendukung preview. Pilih Bagikan → Sematkan peta, lalu salin nilai URL pada atribut src.
                    </p>
                  )}
                </div>
              ))}
            </div>
            {/* Description */}
            <div className="mt-4">
              <label className={labelCls}><FileText size={11} className="inline mr-1" />Deskripsi Perusahaan</label>
              <textarea value={site.description || ''} onChange={(e) => updateSite('description', e.target.value)}
                rows={3} className={inputCls + ' resize-none'} placeholder="Deskripsi singkat perusahaan..." />
            </div>
          </div>
        </div>

        {/* Keamanan + GoldAPI.io */}
        <div className="xl:col-span-2 min-w-0 space-y-6 xl:space-y-8">
          <section>
            <h2 className="text-gray-900 dark:text-white font-bold text-xl mb-5">Keamanan</h2>
            <div className="glass border border-gray-200 dark:border-white/8 rounded-2xl p-4 sm:p-6 space-y-6 shadow-sm">
            {/* Password */}
            <div>
              <h3 className="text-gray-900 dark:text-white font-bold mb-4 flex items-center gap-2"><Shield size={18} className="text-primary-400" /> Ganti Password</h3>
              {error && <div className="mb-4 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</div>}
              <div className="space-y-4">
                <div><label className={labelCls}>Password Saat Ini</label><input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className={inputCls} placeholder="Password sekarang" /></div>
                <div><label className={labelCls}>Password Baru</label><input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={inputCls} placeholder="Minimal 6 karakter" /></div>
              </div>
              <button onClick={handleSavePassword} className="btn-primary text-sm py-2 px-4 mt-4"><Save size={16} /> Simpan Password</button>
            </div>
            </div>
          </section>

          <section>
            <h2 className="text-gray-900 dark:text-white font-bold text-xl mb-5">Pengaturan Harga Emas</h2>

            {/* Margin Settings — ATAS */}
            <div className="glass border border-gray-200 dark:border-white/8 rounded-2xl p-4 sm:p-6 shadow-sm">
              <h3 className="text-gray-900 dark:text-white font-bold mb-2 flex items-center gap-2">
                <TrendingUp size={18} className="text-gold-400" /> Margin Harga
              </h3>
              <p className="text-gray-400 dark:text-white/40 text-xs leading-relaxed text-pretty mb-5">
                Persentase margin yang ditambahkan ke harga spot emas. Disimpan di pengaturan website.
              </p>
              <div className="grid sm:grid-cols-2 gap-4 mb-5">
                <div>
                  <label className={labelCls}>Margin Beli (%)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={site.buyMargin ?? 3}
                      onChange={(e) => {
                        const v = e.target.value.replace(/[^0-9.]/g, '');
                        updateSite('buyMargin', v === '' ? '' : v);
                      }}
                      className={'w-20 ' + inputCls + ' text-center font-mono'}
                      placeholder="3"
                    />
                    <span className="text-gray-400 dark:text-white/40 text-sm">%</span>
                  </div>
                  <p className="text-gray-400 dark:text-white/25 text-[10px] mt-1">Harga kami beli dari pelanggan</p>
                </div>
                <div>
                  <label className={labelCls}>Margin Jual (%)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={site.sellMargin ?? 3}
                      onChange={(e) => {
                        const v = e.target.value.replace(/[^0-9.]/g, '');
                        updateSite('sellMargin', v === '' ? '' : v);
                      }}
                      className={'w-20 ' + inputCls + ' text-center font-mono'}
                      placeholder="3"
                    />
                    <span className="text-gray-400 dark:text-white/40 text-sm">%</span>
                  </div>
                  <p className="text-gray-400 dark:text-white/25 text-[10px] mt-1">Harga kami jual ke pelanggan</p>
                </div>
              </div>

              {/* Kalkulasi preview */}
              <div className="bg-amber-50/50 dark:bg-amber-500/5 border border-amber-200/50 dark:border-amber-500/15 rounded-xl p-4 space-y-2">
                <h4 className="text-amber-700 dark:text-amber-400 text-xs font-bold flex items-center gap-1.5">
                  <Calculator size={13} /> Simulasi Perhitungan (24K)
                </h4>
                {(() => {
                  const buyPct = parseFloat(site.buyMargin) || 3;
                  const sellPct = parseFloat(site.sellMargin) || 3;
                  const liveSpot = liveStatus?.spotIdrPerGram;
                  const spot = liveSpot || 1700000;
                  const buyResult = Math.round(spot * (1 - buyPct / 100) / 1000) * 1000;
                  const sellResult = Math.round(spot * (1 + sellPct / 100) / 1000) * 1000;
                  const fmt = (n) => new Intl.NumberFormat('id-ID').format(n);
                  return (
                    <>
                      {/* Spot price info */}
                      {liveSpot ? (
                        <div className="bg-white dark:bg-dark-800/60 rounded-xl p-4 border border-emerald-200/50 dark:border-emerald-500/20 mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-500 dark:text-white/40 text-[10px] uppercase tracking-wider">Harga Spot Live 24K</span>
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-100/50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full">
                              <Wifi size={10} />
                              GoldAPI.io
                            </span>
                          </div>
                          <div className="text-2xl font-bold font-mono text-gray-900 dark:text-white">
                            Rp {fmt(liveSpot)}
                            <span className="text-sm font-normal text-gray-400 dark:text-white/30">/gram</span>
                          </div>
                          <p className="text-gray-400 dark:text-white/30 text-[10px] mt-1.5 border-t border-gray-100 dark:border-white/5 pt-2">
                            Dihitung dari harga emas dunia (XAU/USD) dikonversi ke Rupiah per gram
                          </p>
                        </div>
                      ) : (
                        <div className="bg-white dark:bg-dark-800/60 rounded-xl p-4 border border-gray-200 dark:border-white/10 mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-500 dark:text-white/40 text-[10px] uppercase tracking-wider">Harga Spot Live 24K</span>
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-gray-400 bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-full">
                              <WifiOff size={10} />
                              Offline
                            </span>
                          </div>
                          <div className="text-2xl font-bold font-mono text-gray-300 dark:text-white/15">
                            Rp 1.700.000
                            <span className="text-sm font-normal text-gray-300/50 dark:text-white/10">/gram</span>
                          </div>
                          <p className="text-gray-400 dark:text-white/30 text-[10px] mt-1.5 border-t border-gray-100 dark:border-white/5 pt-2">
                            Spot belum tersedia — menggunakan contoh untuk simulasi
                          </p>
                        </div>
                      )}
                      <div className="grid sm:grid-cols-2 gap-3 text-xs">
                        <div className="bg-white dark:bg-dark-800/50 rounded-lg p-3 border border-gray-100 dark:border-white/5">
                          <div className="text-gray-400 dark:text-white/40 mb-1">Harga Beli</div>
                          <div className="text-gray-500 dark:text-white/50 font-mono">
                            Rp {fmt(spot)} × (1 - {buyPct}%)
                          </div>
                          <div className="text-gray-500 dark:text-white/50 font-mono">
                            = Rp {fmt(spot)} × {((100 - buyPct) / 100).toFixed(3)}
                          </div>
                          <div className="text-emerald-600 dark:text-emerald-400 font-bold font-mono text-sm mt-1">
                            ≈ Rp {fmt(buyResult)}/g
                          </div>
                        </div>
                        <div className="bg-white dark:bg-dark-800/50 rounded-lg p-3 border border-gray-100 dark:border-white/5">
                          <div className="text-gray-400 dark:text-white/40 mb-1">Harga Jual</div>
                          <div className="text-gray-500 dark:text-white/50 font-mono">
                            Rp {fmt(spot)} × (1 + {sellPct}%)
                          </div>
                          <div className="text-gray-500 dark:text-white/50 font-mono">
                            = Rp {fmt(spot)} × {((100 + sellPct) / 100).toFixed(3)}
                          </div>
                          <div className="text-primary-600 dark:text-primary-400 font-bold font-mono text-sm mt-1">
                            ≈ Rp {fmt(sellResult)}/g
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })()}
                <div className="flex items-center gap-3 mt-5">
                <button onClick={handleSaveSite} className="btn-primary text-sm py-2 px-5">
                  <Save size={16} /> Simpan Margin
                </button>
                <AnimatePresence>
                  {siteSaved && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-1"
                    >
                      <Check size={13} /> Tersimpan!
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              </div>
            </div>

            {/* API Key — BAWAH */}
            <div className="glass border border-gray-200 dark:border-white/8 rounded-2xl p-4 sm:p-6 shadow-sm mt-6">
              <h3 className="text-gray-900 dark:text-white font-bold mb-2 flex items-center gap-2">
                <Key size={18} className="text-gold-400" /> API Key GoldAPI.io
              </h3>
              <p className="text-gray-400 dark:text-white/40 text-xs leading-relaxed text-pretty mb-5">
                Dapatkan API key gratis dari{' '}
                <a href="https://www.goldapi.io" target="_blank" rel="noopener noreferrer" className="text-primary-500 dark:text-primary-400 hover:underline">goldapi.io</a>
                {' '}untuk harga emas live.
              </p>
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>GoldAPI.io API Key</label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input type="password" value={goldApiKey} onChange={(e) => setGoldApiKey(e.target.value)}
                      className={'flex-1 ' + inputCls + ' font-mono'} placeholder="goldapi-xxxxxxxxxxxxxxxx" />
                    <button onClick={handleSaveApiKey} className="btn-primary text-sm py-2 px-4 shrink-0"><Save size={16} /> Simpan</button>
                  </div>
                </div>
                <button onClick={handleTestApiKey} disabled={testing || !goldApiKey.trim()}
                  className={`flex min-h-10 items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${testing ? 'glass text-gray-400 dark:text-white/30 cursor-not-allowed' : 'btn-outline text-gold-500 dark:text-gold-400 border-gold-400/30 hover:bg-gold-400/10'}`}>
                  <RefreshCw size={13} className={testing ? 'animate-spin' : ''} /> {testing ? 'Testing...' : 'Test Koneksi'}
                </button>
                {testResult && <div className={`px-4 py-3 rounded-xl text-xs leading-relaxed ${testResult.ok ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400'}`}>{testResult.message}</div>}
                {keySaved && <div className="px-4 py-2 bg-emerald-600/10 border border-emerald-600/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-semibold flex items-center gap-2"><Check size={13} /> API key tersimpan!</div>}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

// --- Main Admin Page ---
export default function Admin({ prices, banners, outlets, companyInfo, hidden_karats, onSavePrices, onSaveBanners, onSaveOutlets, onSaveCompany, onSaveHiddenKarats, onLogout, onChangePassword, liveStatus, refreshLive, useLive, setUseLive }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');
  const navigate = useNavigate();

  const handleSave = (saveFn) => async (data) => {
    setSaveError('');
    try {
      await saveFn(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (error) {
      setSaveError(error.message || 'Perubahan gagal disimpan.');
    }
  };

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex">
      {/* Sidebar */}
      <div className="w-64 shrink-0 bg-white dark:bg-dark-800/80 border-r border-gray-200 dark:border-white/8 flex flex-col hidden md:flex">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200 dark:border-white/8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-600 to-gold-400 flex items-center justify-center">
              <span className="text-gray-900 dark:text-white font-display font-bold text-sm">SG</span>
            </div>
            <div>
              <div className="text-gray-900 dark:text-white font-bold text-sm">SYAM GOLD</div>
              <div className="text-primary-400 text-xs">Panel Admin</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {TAB_MENUS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-primary-600 text-gray-900 dark:text-white shadow-lg shadow-primary-600/30'
                    : 'text-gray-500 dark:text-white/50 hover:text-gray-900 dark:text-white hover:bg-gray-100 dark:bg-white/5'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t border-gray-200 dark:border-white/8 space-y-2">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 dark:text-white/40 hover:text-gray-900 dark:text-white hover:bg-gray-100 dark:bg-white/5 text-sm transition-all"
          >
            <Eye size={18} />
            Lihat Website
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-600/10 text-sm transition-all"
          >
            <LogOut size={18} />
            Keluar
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="h-16 border-b border-gray-200 dark:border-white/8 px-6 flex items-center justify-between bg-white dark:bg-dark-800/40">
          <div className="flex items-center gap-3 md:hidden">
            {TAB_MENUS.map((t) => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${activeTab === t.id ? 'bg-primary-600 text-gray-900 dark:text-white' : 'text-gray-500 dark:text-white/50 hover:text-gray-900 dark:text-white'}`}>
                {t.label}
              </button>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-2">
            <span className="text-gray-400 dark:text-white/40 text-sm">Panel Admin</span>
            <span className="text-gray-400 dark:text-white/20">/</span>
            <span className="text-gray-700 dark:text-white/80 text-sm capitalize">{TAB_MENUS.find((t) => t.id === activeTab)?.label}</span>
          </div>

          {/* Saved toast */}
          <AnimatePresence>
            {saved && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600/20 border border-emerald-600/30 text-emerald-400 rounded-xl text-sm font-semibold"
              >
                <Check size={15} />
                Perubahan tersimpan!
              </motion.div>
            )}
          </AnimatePresence>
          {saveError && <div role="alert" className="text-red-400 text-xs">{saveError}</div>}

          <button onClick={() => { onLogout(); navigate('/'); }}
            className="md:hidden flex items-center gap-2 text-red-400 text-sm">
            <LogOut size={16} /> Keluar
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {activeTab === 'dashboard' && <Dashboard prices={prices} banners={banners} outlets={outlets} liveStatus={liveStatus} refreshLive={refreshLive} useLive={useLive} setUseLive={setUseLive} />}
              {activeTab === 'prices' && <PriceManager prices={prices} onSave={handleSave(onSavePrices)} liveStatus={liveStatus} refreshLive={refreshLive} useLive={useLive} setUseLive={setUseLive} hidden_karats={hidden_karats} onSaveHiddenKarats={onSaveHiddenKarats} companyInfo={companyInfo} />}
              {activeTab === 'banners' && <BannerManager banners={banners} onSave={handleSave(onSaveBanners)} />}
              {activeTab === 'outlets' && <OutletManager outlets={outlets} onSave={handleSave(onSaveOutlets)} />}
              {activeTab === 'settings' && (
                <SettingsManager
                  onChangePassword={onChangePassword}
                  onSave={() => handleSave(() => {})()}
                  refreshLive={refreshLive}
                  companyInfo={companyInfo}
                  onSaveCompany={onSaveCompany}
                  liveStatus={liveStatus}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
