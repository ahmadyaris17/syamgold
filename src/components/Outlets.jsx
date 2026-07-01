import { motion } from 'framer-motion';
import { MapPin, Phone, Clock, ExternalLink, MessageCircle } from 'lucide-react';

function OutletCard({ outlet, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="glass border border-white/8 rounded-3xl p-6 card-hover group relative overflow-hidden"
    >
      {/* Glow on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary-600/10 rounded-full blur-2xl" />
      </div>

      {/* Header */}
      <div className="flex items-start gap-4 mb-5 relative">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-600/30 to-gold-400/20 border border-primary-600/30 flex items-center justify-center shrink-0 group-hover:from-primary-600/50 transition-all duration-300">
          <MapPin size={22} className="text-primary-400" />
        </div>
        <div>
          <div className="inline-block px-2.5 py-0.5 rounded-full bg-primary-600/20 border border-primary-600/30 text-primary-400 text-xs font-semibold mb-2">
            {outlet.district}
          </div>
          <h3 className="text-white font-bold text-base leading-tight group-hover:text-gold-400 transition-colors duration-300">
            {outlet.name}
          </h3>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-3 mb-6 relative">
        <div className="flex gap-3">
          <MapPin size={15} className="text-primary-500 shrink-0 mt-0.5" />
          <p className="text-white/60 text-sm leading-relaxed">{outlet.address}</p>
        </div>
        <div className="flex gap-3 items-center">
          <Phone size={15} className="text-primary-500 shrink-0" />
          <a href={`tel:${outlet.phone}`} className="text-white/60 text-sm hover:text-gold-400 transition-colors">
            {outlet.phone}
          </a>
        </div>
        <div className="flex gap-3 items-center">
          <Clock size={15} className="text-primary-500 shrink-0" />
          <p className="text-white/60 text-sm">{outlet.hours}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 relative">
        <a
          href={outlet.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary-600/20 border border-primary-600/30 text-primary-400 text-sm font-semibold hover:bg-primary-600 hover:text-white transition-all duration-300 hover:border-primary-600"
        >
          <ExternalLink size={14} />
          Peta
        </a>
        <a
          href={`https://wa.me/${outlet.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600/20 border border-emerald-600/30 text-emerald-400 text-sm font-semibold hover:bg-emerald-600 hover:text-white transition-all duration-300 hover:border-emerald-600"
        >
          <MessageCircle size={14} />
          WhatsApp
        </a>
      </div>
    </motion.div>
  );
}

export default function Outlets({ outlets }) {
  return (
    <section id="outlet" className="py-20 md:py-28 relative overflow-hidden">
      {/* Bg decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-600/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-600/30 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-warm border border-primary-600/30 mb-4">
            <MapPin size={14} className="text-primary-400" />
            <span className="text-primary-400 text-sm font-semibold tracking-wider">LOKASI KAMI</span>
          </div>
          <h2 className="section-title text-white mb-4">
            Temukan <span className="gold-text">Outlet</span> Terdekat
          </h2>
          <p className="text-white/60 max-w-xl mx-auto text-lg">
            Kunjungi outlet Syam Gold terdekat dan dapatkan pelayanan terbaik dari tim profesional kami
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {outlets.map((outlet, i) => (
            <OutletCard key={outlet.id} outlet={outlet} index={i} />
          ))}
        </div>

        {/* Map embed placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-10 glass border border-white/8 rounded-3xl overflow-hidden"
        >
          <div className="p-4 border-b border-white/8 flex items-center gap-2">
            <MapPin size={16} className="text-primary-400" />
            <span className="text-white/70 text-sm font-semibold">Peta Semua Outlet Syam Gold</span>
          </div>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63414.48767437988!2d119.37893965!3d-5.14291905!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dbee3f7e3f5d67f%3A0x3030bfbcaf770b0!2sMakassar%2C%20Makassar%20City%2C%20South%20Sulawesi!5e0!3m2!1sen!2sid!4v1720000000000!5m2!1sen!2sid"
            className="w-full h-72 grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
            style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)' }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Peta Outlet Syam Gold"
          />
        </motion.div>
      </div>
    </section>
  );
}
