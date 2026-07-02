import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, TrendingUp, Image, MapPin, LogOut, Plus,
  Trash2, Edit3, Save, Check, ArrowUp, ArrowDown,
  ExternalLink, Eye, Settings, Upload, RefreshCw, Wifi, WifiOff, Radio, Key, Shield
} from 'lucide-react';
import { saveApiKey, getStoredApiKey, testApiKey } from '../services/goldPriceApi';

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
        {/* Auto/Manual toggle */}
        <button
          onClick={() => setUseLive(!useLive)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            useLive
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
              : 'glass text-gray-500 dark:text-white/50 border border-gray-200 dark:border-white/10 hover:text-gray-900 dark:text-white'
          }`}
          title={useLive ? 'Mode Auto: harga ikut live' : 'Mode Manual: harga diatur sendiri'}
        >
          <Radio size={12} />
          {useLive ? 'Auto' : 'Manual'}
        </button>

        {/* Refresh button */}
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
      </div>
    </div>
  );
}

// --- Gold Price Display (READ-ONLY — prices are live) ---
function PriceManager({ prices, liveStatus, refreshLive, useLive, setUseLive }) {
  const formatPriceRead = (num) =>
    new Intl.NumberFormat('id-ID').format(num);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-gray-900 dark:text-white font-bold text-xl">Harga Emas Live</h2>
        <div className="flex items-center gap-2">
          <span className="text-gray-400 dark:text-white/30 text-xs flex items-center gap-1">
            <RefreshCw size={11} />
            Sumber: Spot Emas Internasional
          </span>
        </div>
      </div>

      <LiveStatusBadge
        liveStatus={liveStatus}
        refreshLive={refreshLive}
        useLive={useLive}
        setUseLive={setUseLive}
      />

      {!useLive && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400/80 text-xs flex items-center gap-2">
          <WifiOff size={13} />
          Mode Manual aktif. Harga tidak akan diperbarui otomatis. Klik <strong className="text-amber-400">Auto</strong> untuk mengaktifkan harga live.
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
              </tr>
            </thead>
            <tbody>
              {prices.map((row) => (
                <tr key={row.id} className="border-b border-gray-100 dark:border-white/5 last:border-0 hover:bg-gray-50/50 dark:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 text-gray-900 dark:text-white text-sm font-medium">{row.kadar}</td>
                  <td className="py-3 px-4 text-gray-500 dark:text-white/50 text-sm">{row.category}</td>
                  <td className="py-3 px-4 text-gold-400 text-sm font-mono text-right">
                    Rp {formatPriceRead(row.buyPrice)}
                  </td>
                  <td className="py-3 px-4 text-primary-400 text-sm font-mono text-right">
                    Rp {formatPriceRead(row.sellPrice)}
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 border-t border-gray-200 dark:border-white/8 text-gray-400 dark:text-white/25 text-xs text-center">
          Harga dikalkulasi otomatis dari spot price emas internasional. Margin beli 3% | Margin jual 3%.
        </div>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {prices.map((row) => (
          <div
            key={row.id}
            className="glass border border-gray-200 dark:border-white/8 rounded-2xl p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-gray-900 dark:text-white font-semibold text-sm">{row.kadar}</span>
                <span className="text-gray-400 dark:text-white/40 text-xs ml-2">{row.category}</span>
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
                  Rp {formatPriceRead(row.buyPrice)}
                </div>
              </div>
              <div>
                <div className="text-gray-400 dark:text-white/40 text-[10px] uppercase tracking-wider mb-0.5">Jual / gr</div>
                <div className="text-primary-400 font-mono text-sm font-bold">
                  Rp {formatPriceRead(row.sellPrice)}
                </div>
              </div>
            </div>
          </div>
        ))}
        <div className="px-4 py-3 text-gray-400 dark:text-white/25 text-[10px] text-center">
          Harga dari spot emas internasional. Margin beli 3% | Margin jual 3%.
        </div>
      </div>
    </div>
  );
}

// --- Banner Management ---
function BannerManager({ banners, onSave }) {
  const [data, setData] = useState(banners.map((b) => ({ ...b })));

  const update = (id, field, value) => {
    setData((prev) => prev.map((b) => (b.id === id ? { ...b, [field]: value } : b)));
  };

  const addBanner = () => {
    setData((prev) => [
      ...prev,
      { id: Date.now(), title: 'Judul Banner Baru', subtitle: 'Deskripsi banner', imageUrl: '/src/assets/s.png', ctaText: 'Lihat Selengkapnya', ctaLink: '#harga' },
    ]);
  };

  const deleteBanner = (id) => setData((prev) => prev.filter((b) => b.id !== id));

  const handleImageUpload = (id, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1280;
        const MAX_HEIGHT = 720;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Compress to JPEG with 0.7 quality to save localStorage space
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        update(id, 'imageUrl', dataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
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
                <img src={banner.imageUrl} alt="preview" className="w-full h-full object-cover opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2">
                  <span className="text-gray-900 dark:text-white text-xs font-bold truncate">{banner.title}</span>
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
                  <label className="text-gray-400 dark:text-white/40 text-xs mb-1 block">URL Gambar / Upload Local</label>
                  <div className="flex gap-2">
                    <input value={banner.imageUrl} onChange={(e) => update(banner.id, 'imageUrl', e.target.value)}
                      className="flex-1 w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-primary-600/60" />
                    <label className="shrink-0 bg-gray-200 dark:bg-white/10 hover:bg-gray-50 dark:bg-white/20 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 cursor-pointer flex items-center justify-center transition-colors">
                      <Upload size={16} className="text-gray-500 dark:text-white/60" />
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => handleImageUpload(banner.id, e.target.files[0])} 
                      />
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
          <p>🔴 Harga emas diambil <strong className="text-gold-400">otomatis</strong> dari GoldAPI.io — tidak perlu edit manual</p>
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
function SettingsManager({ adminPassword, onChangePassword, onSave, refreshLive }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');

  // GoldAPI.io key
  const [goldApiKey, setGoldApiKey] = useState(() => getStoredApiKey() || '');
  const [keySaved, setKeySaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleSavePassword = () => {
    if (currentPassword !== adminPassword) {
      setError('Password saat ini salah!');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password baru minimal 6 karakter!');
      return;
    }
    setError('');
    onChangePassword(newPassword);
    onSave();
    setCurrentPassword('');
    setNewPassword('');
  };

  const handleSaveApiKey = () => {
    saveApiKey(goldApiKey.trim());
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 2500);
  };

  const handleTestApiKey = async () => {
    if (!goldApiKey.trim()) return;
    setTesting(true);
    setTestResult(null);
    try {
      const result = await testApiKey(goldApiKey.trim());
      setTestResult({
        ok: true,
        message: `Koneksi berhasil! Harga emas: Rp ${new Intl.NumberFormat('id-ID').format(Math.round(result.price / 31.1034768))}/gram (24K)`,
      });
      // Auto-save if test passes
      saveApiKey(goldApiKey.trim());
      if (refreshLive) refreshLive();
    } catch (err) {
      setTestResult({
        ok: false,
        message: `Gagal: ${err.message}`,
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="max-w-xl space-y-8">
      {/* GoldAPI.io Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-gray-900 dark:text-white font-bold text-xl">Pengaturan GoldAPI.io</h2>
        </div>

        <div className="glass border border-gray-200 dark:border-white/8 rounded-2xl p-6">
          <h3 className="text-gray-900 dark:text-white font-bold mb-2 flex items-center gap-2">
            <Key size={18} className="text-gold-400" />
            API Key GoldAPI.io
          </h3>
          <p className="text-gray-400 dark:text-white/40 text-xs mb-5">
            Dapatkan API key gratis dari{' '}
            <a href="https://www.goldapi.io" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:underline">
              goldapi.io
            </a>
            {' '}untuk mengambil harga emas live otomatis.
          </p>

          <div className="space-y-4">
            <div>
              <label className="text-gray-400 dark:text-white/40 text-xs mb-1 block">GoldAPI.io API Key</label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={goldApiKey}
                  onChange={(e) => setGoldApiKey(e.target.value)}
                  className="flex-1 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-gold-400/60 font-mono"
                  placeholder="goldapi-xxxxxxxxxxxxxxxx"
                />
                <button
                  onClick={handleSaveApiKey}
                  className="btn-primary text-sm py-2 px-4 shrink-0"
                >
                  <Save size={16} /> Simpan
                </button>
              </div>
            </div>

            <button
              onClick={handleTestApiKey}
              disabled={testing || !goldApiKey.trim()}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                testing
                  ? 'glass text-gray-400 dark:text-white/30 cursor-not-allowed'
                  : 'btn-outline text-gold-400 border-gold-400/30 hover:bg-gold-400/10'
              }`}
            >
              <RefreshCw size={13} className={testing ? 'animate-spin' : ''} />
              {testing ? 'Testing...' : 'Test Koneksi'}
            </button>

            {/* Test result */}
            {testResult && (
              <div className={`px-4 py-3 rounded-xl text-xs ${
                testResult.ok
                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                  : 'bg-red-500/10 border border-red-500/20 text-red-400'
              }`}>
                {testResult.message}
              </div>
            )}

            {/* Saved toast */}
            {keySaved && (
              <div className="px-4 py-2 bg-emerald-600/20 border border-emerald-600/30 text-emerald-400 rounded-xl text-xs font-semibold flex items-center gap-2">
                <Check size={13} />
                API key tersimpan!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Password Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-gray-900 dark:text-white font-bold text-xl">Pengaturan Keamanan</h2>
          <button onClick={handleSavePassword} className="btn-primary text-sm py-2 px-4">
            <Save size={16} /> Simpan Password
          </button>
        </div>

        <div className="glass border border-gray-200 dark:border-white/8 rounded-2xl p-6">
          <h3 className="text-gray-900 dark:text-white font-bold mb-5 flex items-center gap-2">
            <Shield size={18} className="text-primary-400" />
            Ganti Password Admin
          </h3>

          {error && (
            <div className="mb-4 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-gray-400 dark:text-white/40 text-xs mb-1 block">Password Saat Ini</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-primary-600/60"
                placeholder="Masukkan password yang sekarang"
              />
            </div>
            <div>
              <label className="text-gray-400 dark:text-white/40 text-xs mb-1 block">Password Baru</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-primary-600/60"
                placeholder="Minimal 6 karakter"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Main Admin Page ---
export default function Admin({ prices, banners, outlets, onSavePrices: _onSavePrices, onSaveBanners, onSaveOutlets, onLogout, adminPassword, onChangePassword, liveStatus, refreshLive, useLive, setUseLive }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [saved, setSaved] = useState(false);
  const navigate = useNavigate();

  const handleSave = (saveFn) => (data) => {
    saveFn(data);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
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
              {activeTab === 'prices' && <PriceManager prices={prices} liveStatus={liveStatus} refreshLive={refreshLive} useLive={useLive} setUseLive={setUseLive} />}
              {activeTab === 'banners' && <BannerManager banners={banners} onSave={handleSave(onSaveBanners)} />}
              {activeTab === 'outlets' && <OutletManager outlets={outlets} onSave={handleSave(onSaveOutlets)} />}
              {activeTab === 'settings' && (
                <SettingsManager
                  adminPassword={adminPassword}
                  onChangePassword={onChangePassword}
                  onSave={() => handleSave(() => {})()}
                  refreshLive={refreshLive}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
