import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, TrendingUp, Image, MapPin, LogOut, Plus,
  Trash2, Edit3, Save, X, Check, ChevronDown, ArrowUp, ArrowDown,
  ExternalLink, Eye, Settings, Lock, Upload
} from 'lucide-react';

const formatPrice = (num) =>
  new Intl.NumberFormat('id-ID').format(num);

const TAB_MENUS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'prices', label: 'Harga Emas', icon: TrendingUp },
  { id: 'banners', label: 'Banner', icon: Image },
  { id: 'outlets', label: 'Outlet', icon: MapPin },
  { id: 'settings', label: 'Pengaturan', icon: Settings },
];

// --- Gold Price Management ---
function PriceManager({ prices, onSave }) {
  const [data, setData] = useState(prices.map((p) => ({ ...p })));
  const [editId, setEditId] = useState(null);

  const update = (id, field, value) => {
    setData((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        
        const updatedRow = { ...p, [field]: value };
        
        // Auto calculate change based on sellPrice vs buyPrice
        if (field === 'buyPrice' || field === 'sellPrice') {
          const buy = Number(updatedRow.buyPrice) || 0;
          const sell = Number(updatedRow.sellPrice) || 0;
          
          if (buy > 0 && sell > 0) {
            const diff = sell - buy;
            if (diff !== 0) {
              const percent = ((Math.abs(diff) / buy) * 100).toFixed(1);
              updatedRow.trend = diff > 0 ? 'up' : 'down';
              updatedRow.change = diff > 0 ? `+${percent}%` : `-${percent}%`;
            } else {
              updatedRow.trend = 'up';
              updatedRow.change = '+0%';
            }
          } else if (buy > 0 && sell === 0) {
            updatedRow.change = '+0%';
            updatedRow.trend = 'up';
          }
        }
        
        // Handle explicit trend change
        if (field === 'trend') {
          // If they manually change the trend, update the sign of the change text if applicable
          if (value === 'up' && updatedRow.change.startsWith('-')) {
            updatedRow.change = '+' + updatedRow.change.substring(1);
          } else if (value === 'down' && updatedRow.change.startsWith('+')) {
            updatedRow.change = '-' + updatedRow.change.substring(1);
          }
        }

        return updatedRow;
      })
    );
  };

  const handlePriceInput = (id, field, rawValue) => {
    // Remove non-digits
    const digits = rawValue.replace(/\D/g, '');
    const num = digits === '' ? 0 : Number(digits);
    update(id, field, num);
  };

  const addRow = () => {
    const newId = Date.now();
    setData((prev) => [
      ...prev,
      { id: newId, category: 'Emas Perhiasan', kadar: 'Baru', buyPrice: 0, sellPrice: 0, trend: 'up', change: '+0%' },
    ]);
    setEditId(newId);
  };

  const deleteRow = (id) => {
    setData((prev) => prev.filter((p) => p.id !== id));
    if (editId === id) setEditId(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white font-bold text-xl">Kelola Harga Emas</h2>
        <div className="flex gap-3">
          <button onClick={addRow} className="btn-outline text-sm py-2 px-4">
            <Plus size={16} /> Tambah Baris
          </button>
          <button onClick={() => onSave(data)} className="btn-primary text-sm py-2 px-4">
            <Save size={16} /> Simpan Semua
          </button>
        </div>
      </div>

      <div className="glass border border-white/8 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/8 bg-white/2">
                <th className="text-left py-3 px-4 text-white/40 text-xs uppercase tracking-wider">Kadar</th>
                <th className="text-left py-3 px-4 text-white/40 text-xs uppercase tracking-wider">Kategori</th>
                <th className="text-left py-3 px-4 text-white/40 text-xs uppercase tracking-wider">Harga Beli/gr</th>
                <th className="text-left py-3 px-4 text-white/40 text-xs uppercase tracking-wider">Harga Jual/gr</th>
                <th className="text-left py-3 px-4 text-white/40 text-xs uppercase tracking-wider">Trend</th>
                <th className="text-left py-3 px-4 text-white/40 text-xs uppercase tracking-wider">Perubahan</th>
                <th className="text-right py-3 px-4 text-white/40 text-xs uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.id} className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors">
                  {editId === row.id ? (
                    <>
                      <td className="py-3 px-4">
                        <input value={row.kadar} onChange={(e) => update(row.id, 'kadar', e.target.value)}
                          className="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-white text-sm w-24 focus:outline-none focus:border-primary-600/60" />
                      </td>
                      <td className="py-3 px-4">
                        <select value={row.category} onChange={(e) => update(row.id, 'category', e.target.value)}
                          className="bg-dark-700 border border-white/20 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-primary-600/60">
                          <option>Emas Perhiasan</option>
                          <option>Logam Mulia</option>
                          <option>Emas Tanpa Surat</option>
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <input type="text" value={row.buyPrice === 0 ? '' : formatPrice(row.buyPrice)} onChange={(e) => handlePriceInput(row.id, 'buyPrice', e.target.value)}
                          className="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-white text-sm w-32 focus:outline-none focus:border-primary-600/60" placeholder="0" />
                      </td>
                      <td className="py-3 px-4">
                        <input type="text" value={row.sellPrice === 0 ? '' : formatPrice(row.sellPrice)} onChange={(e) => handlePriceInput(row.id, 'sellPrice', e.target.value)}
                          className="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-white text-sm w-32 focus:outline-none focus:border-primary-600/60" placeholder="0" />
                      </td>
                      <td className="py-3 px-4">
                        <select value={row.trend} onChange={(e) => update(row.id, 'trend', e.target.value)}
                          className="bg-dark-700 border border-white/20 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-primary-600/60">
                          <option value="up">Naik ↑</option>
                          <option value="down">Turun ↓</option>
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <input value={row.change} onChange={(e) => update(row.id, 'change', e.target.value)}
                          className="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-white text-sm w-20 focus:outline-none focus:border-primary-600/60" />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button onClick={() => { setEditId(null); onSave(data); }} className="p-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/40 transition-colors mr-1" title="Selesai & Simpan">
                          <Check size={15} />
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-3 px-4 text-white text-sm font-medium">{row.kadar}</td>
                      <td className="py-3 px-4 text-white/50 text-sm">{row.category}</td>
                      <td className="py-3 px-4 text-gold-400 text-sm font-mono">Rp {formatPrice(row.buyPrice)}</td>
                      <td className="py-3 px-4 text-primary-400 text-sm font-mono">Rp {formatPrice(row.sellPrice)}</td>
                      <td className="py-3 px-4">
                        <span className={`flex items-center gap-1 text-xs font-bold ${row.trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                          {row.trend === 'up' ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                          {row.trend === 'up' ? 'Naik' : 'Turun'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-white/50 text-sm">{row.change}</td>
                      <td className="py-3 px-4 text-right flex items-center justify-end gap-1">
                        <button onClick={() => setEditId(row.id)} className="p-1.5 rounded-lg bg-white/5 text-white/50 hover:bg-primary-600/20 hover:text-primary-400 transition-colors">
                          <Edit3 size={15} />
                        </button>
                        <button onClick={() => deleteRow(row.id)} className="p-1.5 rounded-lg bg-white/5 text-white/50 hover:bg-red-600/20 hover:text-red-400 transition-colors">
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
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
      { id: Date.now(), title: 'Judul Banner Baru', subtitle: 'Deskripsi banner', imageUrl: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=1920&q=80', ctaText: 'Lihat Selengkapnya', ctaLink: '#harga' },
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
        <h2 className="text-white font-bold text-xl">Kelola Banner</h2>
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
            className="glass border border-white/8 rounded-2xl overflow-hidden"
          >
            <div className="flex gap-4 p-5">
              {/* Preview */}
              <div className="w-40 h-24 rounded-xl overflow-hidden shrink-0 bg-dark-700 relative">
                <img src={banner.imageUrl} alt="preview" className="w-full h-full object-cover opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2">
                  <span className="text-white text-xs font-bold truncate">{banner.title}</span>
                </div>
              </div>

              {/* Fields */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-white/40 text-xs mb-1 block">Judul</label>
                  <input value={banner.title} onChange={(e) => update(banner.id, 'title', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary-600/60" />
                </div>
                <div>
                  <label className="text-white/40 text-xs mb-1 block">URL Gambar / Upload Local</label>
                  <div className="flex gap-2">
                    <input value={banner.imageUrl} onChange={(e) => update(banner.id, 'imageUrl', e.target.value)}
                      className="flex-1 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary-600/60" />
                    <label className="shrink-0 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg px-3 py-2 cursor-pointer flex items-center justify-center transition-colors">
                      <Upload size={16} className="text-white/60" />
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
                  <label className="text-white/40 text-xs mb-1 block">Deskripsi</label>
                  <input value={banner.subtitle} onChange={(e) => update(banner.id, 'subtitle', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary-600/60" />
                </div>
                <div>
                  <label className="text-white/40 text-xs mb-1 block">Teks Tombol</label>
                  <input value={banner.ctaText} onChange={(e) => update(banner.id, 'ctaText', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary-600/60" />
                </div>
                <div>
                  <label className="text-white/40 text-xs mb-1 block">Link Tombol</label>
                  <input value={banner.ctaLink} onChange={(e) => update(banner.id, 'ctaLink', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary-600/60" />
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
        <h2 className="text-white font-bold text-xl">Kelola Outlet</h2>
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
            className="glass border border-white/8 rounded-2xl p-5"
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
                      <label className="text-white/40 text-xs mb-1 block">{label}</label>
                      {textarea ? (
                        <textarea value={outlet[field]} onChange={(e) => update(outlet.id, field, e.target.value)} rows={2}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary-600/60 resize-none" />
                      ) : (
                        <input value={outlet[field]} onChange={(e) => update(outlet.id, field, e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary-600/60" />
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
                    <h3 className="text-white font-bold">{outlet.name}</h3>
                  </div>
                  <p className="text-white/40 text-sm">{outlet.address}</p>
                  <div className="flex gap-4 mt-2 text-white/40 text-xs">
                    <span>📞 {outlet.phone}</span>
                    <span>⏰ {outlet.hours}</span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <a href={outlet.mapsUrl} target="_blank" rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-white/5 text-white/40 hover:text-blue-400 hover:bg-blue-400/10 transition-colors">
                    <ExternalLink size={16} />
                  </a>
                  <button onClick={() => setEditId(outlet.id)}
                    className="p-2 rounded-lg bg-white/5 text-white/40 hover:text-primary-400 hover:bg-primary-600/20 transition-colors">
                    <Edit3 size={16} />
                  </button>
                  <button onClick={() => deleteOutlet(outlet.id)}
                    className="p-2 rounded-lg bg-white/5 text-white/40 hover:text-red-400 hover:bg-red-600/20 transition-colors">
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
function Dashboard({ prices, banners, outlets }) {
  const stats = [
    { label: 'Total Harga Emas', value: prices.length, icon: TrendingUp, color: 'text-gold-400', bg: 'bg-gold-400/10' },
    { label: 'Banner Aktif', value: banners.length, icon: Image, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Outlet Aktif', value: outlets.length, icon: MapPin, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  ];

  return (
    <div>
      <h2 className="text-white font-bold text-xl mb-6">Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass border border-white/8 rounded-2xl p-6"
            >
              <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center mb-4`}>
                <Icon size={22} className={s.color} />
              </div>
              <div className={`text-3xl font-bold ${s.color} font-display mb-1`}>{s.value}</div>
              <div className="text-white/40 text-sm">{s.label}</div>
            </motion.div>
          );
        })}
      </div>

      <div className="glass border border-white/8 rounded-2xl p-6">
        <h3 className="text-white font-bold mb-4">Panduan Singkat</h3>
        <div className="space-y-3 text-white/50 text-sm">
          <p>✅ Gunakan menu <strong className="text-primary-400">Harga Emas</strong> untuk mengubah harga beli/jual emas</p>
          <p>✅ Gunakan menu <strong className="text-blue-400">Banner</strong> untuk mengganti gambar banner di halaman utama</p>
          <p>✅ Gunakan menu <strong className="text-emerald-400">Outlet</strong> untuk menambah atau mengedit lokasi outlet</p>
          <p>⚠️ Klik <strong className="text-gold-400">Simpan</strong> setelah setiap perubahan agar tersimpan permanen</p>
        </div>
      </div>
    </div>
  );
}

// --- Settings Management ---
function SettingsManager({ adminPassword, onChangePassword, onSave }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
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

  return (
    <div className="max-w-xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white font-bold text-xl">Pengaturan Keamanan</h2>
        <button onClick={handleSave} className="btn-primary text-sm py-2 px-4">
          <Save size={16} /> Simpan Password
        </button>
      </div>

      <div className="glass border border-white/8 rounded-2xl p-6">
        <h3 className="text-white font-bold mb-5 flex items-center gap-2">
          <Lock size={18} className="text-primary-400" />
          Ganti Password Admin
        </h3>
        
        {error && (
          <div className="mb-4 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-white/40 text-xs mb-1 block">Password Saat Ini</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary-600/60"
              placeholder="Masukkan password yang sekarang"
            />
          </div>
          <div>
            <label className="text-white/40 text-xs mb-1 block">Password Baru</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary-600/60"
              placeholder="Minimal 6 karakter"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Main Admin Page ---
export default function Admin({ prices, banners, outlets, onSavePrices, onSaveBanners, onSaveOutlets, onLogout, adminPassword, onChangePassword }) {
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
    <div className="min-h-screen bg-dark-900 flex">
      {/* Sidebar */}
      <div className="w-64 shrink-0 bg-dark-800/80 border-r border-white/8 flex flex-col hidden md:flex">
        {/* Logo */}
        <div className="p-6 border-b border-white/8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-600 to-gold-400 flex items-center justify-center">
              <span className="text-white font-display font-bold text-sm">SG</span>
            </div>
            <div>
              <div className="text-white font-bold text-sm">SYAM GOLD</div>
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
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t border-white/8 space-y-2">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/40 hover:text-white hover:bg-white/5 text-sm transition-all"
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
        <div className="h-16 border-b border-white/8 px-6 flex items-center justify-between bg-dark-800/40">
          <div className="flex items-center gap-3 md:hidden">
            {TAB_MENUS.map((t) => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${activeTab === t.id ? 'bg-primary-600 text-white' : 'text-white/50 hover:text-white'}`}>
                {t.label}
              </button>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-2">
            <span className="text-white/40 text-sm">Panel Admin</span>
            <span className="text-white/20">/</span>
            <span className="text-white/80 text-sm capitalize">{TAB_MENUS.find((t) => t.id === activeTab)?.label}</span>
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
              {activeTab === 'dashboard' && <Dashboard prices={prices} banners={banners} outlets={outlets} />}
              {activeTab === 'prices' && <PriceManager prices={prices} onSave={handleSave(onSavePrices)} />}
              {activeTab === 'banners' && <BannerManager banners={banners} onSave={handleSave(onSaveBanners)} />}
              {activeTab === 'outlets' && <OutletManager outlets={outlets} onSave={handleSave(onSaveOutlets)} />}
              {activeTab === 'settings' && (
                <SettingsManager 
                  adminPassword={adminPassword} 
                  onChangePassword={onChangePassword} 
                  onSave={() => handleSave(() => {})()} 
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
