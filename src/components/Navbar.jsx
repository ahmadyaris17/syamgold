import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Lock, Phone, Sun, Moon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import logoSyamGold from '../assets/s.png';

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
  const { theme, toggleTheme } = useTheme();

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
          ? 'bg-white/95 dark:bg-dark-900/95 backdrop-blur-lg shadow-2xl shadow-black/10 dark:shadow-black/50 border-b border-gray-200 dark:border-primary-900/30'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <button onClick={() => scrollTo('#beranda')} className="flex items-center gap-2 group">
            <img
              src={logoSyamGold}
              alt="Syam Gold Logo"
              className="h-12 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
            />
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollTo(link.href)}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-white/80 hover:text-gold-600 dark:hover:text-gold-400 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-200 relative group"
              >
                {link.label}
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gold-400 group-hover:w-4 transition-all duration-300 rounded-full" />
              </button>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-500 dark:text-white/40 hover:text-gold-600 dark:hover:text-gold-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-200"
              title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

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
              className="p-2 rounded-lg text-gray-400 dark:text-white/40 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-200"
              title="Admin Panel"
            >
              <Lock size={18} />
            </Link>

            {/* Mobile toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
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
            className="md:hidden overflow-hidden bg-white/98 dark:bg-dark-900/98 backdrop-blur-lg border-t border-gray-200 dark:border-primary-900/30"
          >
            <div className="px-4 py-4 flex flex-col gap-1">
              {NAV_LINKS.map((link, i) => (
                <motion.button
                  key={link.href}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => scrollTo(link.href)}
                  className="text-left px-4 py-3 text-gray-700 dark:text-white/80 hover:text-gold-600 dark:hover:text-gold-400 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-all duration-200 font-medium"
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
