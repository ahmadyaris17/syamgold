import { Phone, Mail, MapPin, Heart, ChevronRight } from 'lucide-react';
import logoSyamGold from '../assets/s.png';
import { DEFAULT_FOOTER_ADDRESS } from '../utils/settings';
import { FacebookIcon, InstagramIcon, WhatsAppIcon } from './SocialIcons';

const NAV_LINKS = [
  { label: 'Beranda', href: '#beranda' },
  { label: 'Harga Emas', href: '#harga' },
  { label: 'Tentang Kami', href: '#tentang' },
  { label: 'Outlet', href: '#outlet' },
  { label: 'Kontak', href: '#kontak' },
];

export default function Footer({ companyInfo, outlets }) {
  const scrollTo = (href) => {
    const el = document.getElementById(href.replace('#', ''));
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer id="kontak" className="relative overflow-hidden">
      <div className="h-px bg-gradient-to-r from-transparent via-primary-600/50 to-transparent" />

      <div className="bg-gray-900 dark:bg-dark-900 pt-16 pb-8 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-5">
                <img src={logoSyamGold} alt="Syam Gold" className="h-16 w-auto object-contain" />
              </div>
              <p className="text-white/50 text-sm leading-relaxed mb-6 max-w-sm">
                {companyInfo?.description || 'Kami membeli berbagai jenis Logam Mulia dengan harga terbaik di pasaran. Proses cepat, aman, dan transparan.'}
              </p>
              <div className="flex flex-wrap gap-3" aria-label="Media sosial Syam Gold">
                <a href={companyInfo?.whatsapp ? `https://wa.me/${companyInfo.whatsapp}` : '#'} target="_blank" rel="noopener noreferrer"
                  aria-label="WhatsApp Syam Gold"
                  className="w-11 h-11 rounded-xl glass border border-white/10 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/30 transition-[transform,background-color,border-color,color] duration-200 hover:-translate-y-0.5 active:scale-95">
                  <WhatsAppIcon size={20} />
                </a>
                <a href={companyInfo?.instagram || '#'} target="_blank" rel="noopener noreferrer"
                  aria-label="Instagram Syam Gold"
                  className="w-11 h-11 rounded-xl glass border border-white/10 flex items-center justify-center text-pink-400 hover:bg-pink-500/20 hover:border-pink-500/30 transition-[transform,background-color,border-color,color] duration-200 hover:-translate-y-0.5 active:scale-95">
                  <InstagramIcon size={20} />
                </a>
                <a href={companyInfo?.facebook || '#'} target="_blank" rel="noopener noreferrer"
                  aria-label="Facebook Syam Gold"
                  className="w-11 h-11 rounded-xl glass border border-white/10 flex items-center justify-center text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/30 transition-[transform,background-color,border-color,color] duration-200 hover:-translate-y-0.5 active:scale-95">
                  <FacebookIcon size={20} />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-bold text-base mb-5 flex items-center gap-2">
                <span className="w-6 h-0.5 bg-primary-600 rounded-full" /> Menu
              </h4>
              <ul className="space-y-3">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <button onClick={() => scrollTo(link.href)}
                      className="text-white/50 hover:text-gold-400 text-sm flex items-center gap-2 transition-colors duration-200 group">
                      <ChevronRight size={14} className="text-primary-600 group-hover:translate-x-1 transition-transform duration-200" />
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white font-bold text-base mb-5 flex items-center gap-2">
                <span className="w-6 h-0.5 bg-primary-600 rounded-full" /> Kontak
              </h4>
              <div className="space-y-3">
                <a href={`tel:${companyInfo?.phone}`}
                  className="flex items-center gap-3 text-white/50 hover:text-gold-400 text-sm transition-colors duration-200 group">
                  <Phone size={15} className="text-primary-500 group-hover:text-gold-400 transition-colors" />
                  {companyInfo?.phone || '0411-123456'}
                </a>
                <a href={`mailto:${companyInfo?.email}`}
                  className="flex items-center gap-3 text-white/50 hover:text-gold-400 text-sm transition-colors duration-200 group">
                  <Mail size={15} className="text-primary-500 group-hover:text-gold-400 transition-colors" />
                  {companyInfo?.email || 'info@syamgold.co.id'}
                </a>
                <div className="flex items-start gap-3 text-white/50 text-sm">
                  <MapPin size={15} className="text-primary-500 mt-0.5 shrink-0" />
                  <span>{companyInfo?.footerAddress || outlets?.[0]?.address || DEFAULT_FOOTER_ADDRESS}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-white/30 text-sm text-center">
              © {new Date().getFullYear()} Syam Gold – PT. Rahmat Indo Mulia. Semua hak dilindungi.
            </p>
            <p className="text-white/20 text-xs flex items-center gap-1">
              Dibuat dengan <Heart size={12} className="text-primary-600" /> untuk Syam Gold
            </p>
          </div>
        </div>
      </div>

      {/* Floating WA button */}
      <a
        href={`https://wa.me/${companyInfo?.whatsapp || '628123456789'}`}
        target="_blank" rel="noopener noreferrer"
        aria-label="Chat WhatsApp Syam Gold"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-emerald-500 hover:bg-emerald-400 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/40 transition-[transform,background-color,box-shadow] duration-200 hover:scale-105 active:scale-95 animate-pulse-gold"
        title="Chat WhatsApp"
      >
        <WhatsAppIcon size={28} className="text-white" />
      </a>
    </footer>
  );
}
