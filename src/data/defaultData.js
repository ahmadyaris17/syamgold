// Default data for the website - stored in localStorage

export const DEFAULT_GOLD_PRICES = [
  { id: 1, category: 'Emas Perhiasan', kadar: '24K', buyPrice: 1720000, sellPrice: 1780000, trend: 'up', change: '+0.8%' },
  { id: 2, category: 'Emas Perhiasan', kadar: '22K', buyPrice: 1580000, sellPrice: 1640000, trend: 'up', change: '+0.6%' },
  { id: 3, category: 'Emas Perhiasan', kadar: '18K', buyPrice: 1290000, sellPrice: 1340000, trend: 'down', change: '-0.2%' },
  { id: 4, category: 'Emas Perhiasan', kadar: '17K', buyPrice: 1220000, sellPrice: 1270000, trend: 'up', change: '+0.4%' },
  { id: 5, category: 'Emas Perhiasan', kadar: '16K', buyPrice: 1150000, sellPrice: 1200000, trend: 'up', change: '+0.3%' },
  { id: 6, category: 'Emas Perhiasan', kadar: '8K', buyPrice: 575000,  sellPrice: 610000,  trend: 'down', change: '-0.1%' },
  { id: 7, category: 'Logam Mulia',    kadar: 'LM Antam',  buyPrice: 1820000, sellPrice: 1890000, trend: 'up', change: '+1.2%' },
  { id: 8, category: 'Logam Mulia',    kadar: 'LM UBS',    buyPrice: 1810000, sellPrice: 1880000, trend: 'up', change: '+1.0%' },
  { id: 9, category: 'Emas Tanpa Surat', kadar: 'Tanpa Surat', buyPrice: 1650000, sellPrice: 1710000, trend: 'up', change: '+0.7%' },
];

export const DEFAULT_BANNERS = [
  {
    id: 1,
    title: 'Jual Emas Harga Terbaik',
    subtitle: 'Kami membeli semua jenis emas dengan harga tertinggi & proses cepat',
    imageUrl: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=1920&q=80',
    ctaText: 'Lihat Harga Sekarang',
    ctaLink: '#harga',
  },
  {
    id: 2,
    title: 'Transparan & Terpercaya',
    subtitle: 'Sudah dipercaya ribuan pelanggan di seluruh Indonesia sejak 2010',
    imageUrl: 'https://images.unsplash.com/photo-1624365169198-38255a2de20a?w=1920&q=80',
    ctaText: 'Temukan Outlet Kami',
    ctaLink: '#outlet',
  },
  {
    id: 3,
    title: 'Proses Cepat & Aman',
    subtitle: 'Penilaian emas profesional dengan peralatan modern dan tim berpengalaman',
    imageUrl: 'https://images.unsplash.com/photo-1542385151-efd9000785c0?w=1920&q=80',
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

export const ADMIN_PASSWORD = 'syamgold2024';

export const COMPANY_INFO = {
  name: 'Syam Gold',
  fullName: 'PT. Rahmat Indo Mulia',
  tagline: 'Jual Emas Harga Terbaik – Aman & Transparan',
  phone: '0411-123456',
  whatsapp: '628123456789',
  email: 'info@syamgold.co.id',
  instagram: 'https://instagram.com/syamgold',
  facebook: 'https://facebook.com/syamgold',
  description: 'Kami membeli berbagai jenis Logam Mulia seperti Emas Perhiasan, Emas Batangan, Emas Tanpa Surat, Emas Lama, Emas Warisan dan Emas Patah dengan harga terbaik di pasaran.',
  updatedAt: new Date().toISOString(),
};
