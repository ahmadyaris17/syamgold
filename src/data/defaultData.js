// Fallback data used while shared settings.json is unavailable or loading.
// All prices are sourced from Supabase — these are empty defaults only.

export const DEFAULT_GOLD_PRICES = [];

export const DEFAULT_BANNERS = [
  {
    id: 1,
    title: 'Jual Emas Harga Terbaik',
    subtitle: 'Kami membeli semua jenis emas dengan harga tertinggi & proses cepat',
    imageUrl: '/src/assets/s.png',
    ctaText: 'Lihat Harga Sekarang',
    ctaLink: '#harga',
  },
  {
    id: 2,
    title: 'Transparan & Terpercaya',
    subtitle: 'Sudah dipercaya ribuan pelanggan di seluruh Indonesia sejak 2010',
    imageUrl: '/src/assets/s.png',
    ctaText: 'Temukan Outlet Kami',
    ctaLink: '#outlet',
  },
  {
    id: 3,
    title: 'Proses Cepat & Aman',
    subtitle: 'Penilaian emas profesional dengan peralatan modern dan tim berpengalaman',
    imageUrl: '/src/assets/s.png',
    ctaText: 'Hubungi Kami',
    ctaLink: '#kontak',
  },
];

export const DEFAULT_OUTLETS = [
  {
    id: 1,
    name: 'Syam Gold - Pusat (Kantor Utama)',
    address: 'Jl. Perintis Kemerdekaan No. 1, Makassar, Sulawesi Selatan 90245',
    phone: '0411-123456',
    whatsapp: '628123456789',
    hours: 'Senin - Sabtu: 08.00 - 17.00 WITA',
    mapsUrl: 'https://maps.google.com/?q=Makassar',
    district: 'Makassar',
  },
  {
    id: 2,
    name: 'Syam Gold - Cabang Gowa',
    address: 'Jl. Sultan Hasanuddin No. 45, Sungguminasa, Gowa, Sulawesi Selatan',
    phone: '0411-234567',
    whatsapp: '628129876543',
    hours: 'Senin - Sabtu: 08.00 - 17.00 WITA',
    mapsUrl: 'https://maps.google.com/?q=Gowa+Sulawesi+Selatan',
    district: 'Gowa',
  },
  {
    id: 3,
    name: 'Syam Gold - Cabang Maros',
    address: 'Jl. Jenderal Sudirman No. 12, Maros, Sulawesi Selatan',
    phone: '0411-345678',
    whatsapp: '628127654321',
    hours: 'Senin - Sabtu: 08.00 - 17.00 WITA',
    mapsUrl: 'https://maps.google.com/?q=Maros+Sulawesi+Selatan',
    district: 'Maros',
  },
];

// Company info — .env vars take priority, fallback to hardcoded defaults
export const COMPANY_INFO = {
  name: import.meta.env.VITE_BRAND_NAME || 'Syam Gold',
  fullName: import.meta.env.VITE_COMPANY_NAME || 'PT. Rahmat Indo Mulia',
  tagline: import.meta.env.VITE_TAGLINE || 'Jual Emas Harga Terbaik – Aman & Transparan',
  phone: import.meta.env.VITE_PHONE || '0411-123456',
  whatsapp: import.meta.env.VITE_WHATSAPP || '628123456789',
  email: import.meta.env.VITE_EMAIL || 'info@syamgold.co.id',
  instagram: import.meta.env.VITE_INSTAGRAM || 'https://instagram.com/syamgold',
  facebook: import.meta.env.VITE_FACEBOOK || 'https://facebook.com/syamgold',
  description: import.meta.env.VITE_DESCRIPTION || 'Kami membeli berbagai jenis Logam Mulia seperti Emas Perhiasan, Emas Batangan, Emas Tanpa Surat, Emas Lama, Emas Warisan dan Emas Patah dengan harga terbaik di pasaran.',
  updatedAt: new Date().toISOString(),
};
