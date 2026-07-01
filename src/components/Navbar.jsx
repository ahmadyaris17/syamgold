import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Lock, Phone, ChevronDown } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Beranda', href: '#beranda' },
  { label: 'Harga Emas', href: '#harga' },
  { label: 'Tentang Kami', href: '#tentang' },
  { label: 'Outlet', href: '#outlet' },
  { label: 'Kontak', href: '#kontak' },
];

export default function Navbar({ companyInfo }) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('beranda');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (href) => {
    setIsOpen(false);
    const id = href.replace('#', '');
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-dark-900/95 backdrop-blur-lg shadow-2xl shadow-black/50 border-b border-primary-900/30'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <button onClick={() => scrollTo('#beranda')} className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-600 to-gold-400 flex items-center justify-center shadow-lg group-hover:shadow-primary-500/40 transition-all duration-300 group-hover:scale-110">
              <span className="text-white font-display font-bold text-sm">SG</span>
            </div>
            <div className="leading-tight">
              <div className="text-white font-display font-bold text-lg leading-none group-hover:text-gold-400 transition-colors duration-300">
                SYAM GOLD
              </div>
              <div className="text-primary-400 text-xs font-medium">PT. Rahmat Indo Mulia</div>
            </div>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollTo(link.href)}
                className="px-4 py-2 text-sm font-medium text-white/80 hover:text-gold-400 rounded-lg hover:bg-white/5 transition-all duration-200 relative group"
              >
                {link.label}
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gold-400 group-hover:w-4 transition-all duration-300 rounded-full" />
              </button>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <a
              href={`https://wa.me/${companyInfo?.whatsapp || '628123456789'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex btn-gold text-sm py-2 px-4"
            >
              <Phone size={15} />
              Hubungi Kami
            </a>
            <Link
              to="/admin"
              className="p-2 rounded-lg text-white/40 hover:text-primary-400 hover:bg-white/5 transition-all duration-200"
              title="Admin Panel"
            >
              <Lock size={18} />
            </Link>

            {/* Mobile toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden overflow-hidden bg-dark-900/98 backdrop-blur-lg border-t border-primary-900/30"
          >
            <div className="px-4 py-4 flex flex-col gap-1">
              {NAV_LINKS.map((link, i) => (
                <motion.button
                  key={link.href}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => scrollTo(link.href)}
                  className="text-left px-4 py-3 text-white/80 hover:text-gold-400 hover:bg-white/5 rounded-xl transition-all duration-200 font-medium"
                >
                  {link.label}
                </motion.button>
              ))}
              <a
                href={`https://wa.me/${companyInfo?.whatsapp || '628123456789'}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 btn-gold justify-center"
              >
                <Phone size={16} />
                Hubungi via WhatsApp
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
