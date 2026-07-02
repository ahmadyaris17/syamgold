import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function HeroBanner({ banners }) {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef(null);

  const startTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 5000);
  };

  useEffect(() => {
    startTimer();
    return () => clearInterval(timerRef.current);
  }, [banners.length]);

  const goTo = (idx) => {
    setCurrent(idx);
    startTimer();
  };
  const prev = () => goTo((current - 1 + banners.length) % banners.length);
  const next = () => goTo((current + 1) % banners.length);

  if (!banners.length) return null;

  return (
    <section id="beranda" className="relative h-screen min-h-[600px] max-h-[900px] overflow-hidden">
      {/* Slides */}
      <AnimatePresence initial={false}>
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          className="absolute inset-0"
        >
          <img
            src={banners[current].imageUrl}
            alt={banners[current].title}
            className="w-full h-full object-cover"
          />
          {/* Multi-layer overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 dark:from-dark-900/80 via-transparent to-gray-900/40 dark:to-dark-900/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 dark:from-dark-900/60 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Decorative particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute particle w-1 h-1 rounded-full bg-gold-400/40"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
              '--duration': `${3 + i}s`,
              '--delay': `${i * 0.5}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="max-w-2xl"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-warm border border-primary-600/40 mb-6"
              >
                <span className="w-2 h-2 rounded-full bg-gold-400 animate-pulse" />
                <span className="text-gold-400 text-sm font-semibold tracking-wider">SYAM GOLD</span>
              </motion.div>

              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-5 text-shadow">
                <span className="text-white">{banners[current].title.split(' ').slice(0, 2).join(' ')}</span>
                {' '}
                <span className="gold-text">{banners[current].title.split(' ').slice(2).join(' ')}</span>
              </h1>

              <p className="text-white/80 text-lg md:text-xl leading-relaxed mb-8 max-w-xl">
                {banners[current].subtitle}
              </p>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => {
                    const el = document.getElementById(banners[current].ctaLink.replace('#', ''));
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="btn-gold text-base px-8 py-3.5"
                >
                  {banners[current].ctaText}
                </button>
                <button
                  onClick={() => {
                    const el = document.getElementById('outlet');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="btn-outline text-base px-8 py-3.5"
                >
                  Lokasi Kami
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Arrow controls */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 glass rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300 hover:scale-110"
      >
        <ChevronLeft size={22} />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 glass rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300 hover:scale-110"
      >
        <ChevronRight size={22} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`transition-all duration-300 rounded-full ${
              i === current
                ? 'w-8 h-2.5 bg-gold-400'
                : 'w-2.5 h-2.5 bg-white/30 hover:bg-white/60'
            }`}
          />
        ))}
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 right-8 z-20 hidden md:flex flex-col items-center gap-2 text-white/30">
        <span className="text-xs tracking-widest rotate-90 origin-center">SCROLL</span>
        <div className="w-px h-12 bg-gradient-to-b from-white/30 to-transparent" />
      </div>
    </section>
  );
}
