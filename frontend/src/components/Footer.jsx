import React from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { Droplets, Phone, MessageCircle, Mail, MapPin, Clock, ShieldCheck } from 'lucide-react';

export default function Footer({ settings = {}, onAdminClick }) {
  const { lang, t } = useLanguage();

  const businessName = lang === 'ur'
    ? (settings.business_name_ur || 'کاشف سینیٹری سپلائیز')
    : (settings.business_name_en || 'Kashif Sanitary Supplies');

  const tagline = lang === 'ur'
    ? (settings.tagline_ur || 'اعلیٰ معیار کی مصنوعات، قابل اعتماد سپلائی')
    : (settings.tagline_en || 'Quality Products. Reliable Supply.');

  const address = lang === 'ur'
    ? (settings.address_ur || 'دکان نمبر 18-اے، سینیٹری مارکیٹ، مین بلیوارڈ، لاہور')
    : (settings.address_en || 'Shop # 18-A, Sanitary Market, Main Boulevard, Lahore, Pakistan');

  const phone = settings.phone || '+92 300 1234567';
  const whatsapp = settings.whatsapp || '+92 300 1234567';
  const email = settings.email || 'sales@kashifsanitary.com';

  const rawPhone = phone.replace(/[^0-9+]/g, '');
  const rawWhatsApp = whatsapp.replace(/[^0-9]/g, '');

  return (
    <footer id="contact" className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-lg">
                <Droplets className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-lg tracking-tight">
                  {businessName}
                </h3>
                <p className="text-xs text-brand-400 font-medium">{tagline}</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {lang === 'ur'
                ? 'پاکستان بھر میں سینیٹری، پائپ فٹنگز، واٹر مکسرز اور باتھ روم اشیاء کی ہول سیل ترسیل کا بااعتماد مرکز۔'
                : 'Direct wholesale distributor for premium PPRC pipes, uPVC drainage, CPVC fittings, luxury brass faucets, and designer sanitary ware.'}
            </p>

            <div className="pt-2 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                {t('quickDelivery')}
              </span>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">
              {t('contactTitle')}
            </h4>

            <div className="space-y-2.5 text-xs sm:text-sm">
              <a
                href={`tel:${rawPhone}`}
                className="flex items-start gap-2.5 hover:text-white transition-colors group"
              >
                <Phone className="w-4 h-4 text-brand-400 mt-0.5 shrink-0 group-hover:scale-110 transition-transform" />
                <div>
                  <span className="text-slate-400 text-xs block">{t('phoneLabel')}</span>
                  <span className="font-mono text-white">{phone}</span>
                </div>
              </a>

              <a
                href={`https://wa.me/${rawWhatsApp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2.5 hover:text-white transition-colors group"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0 group-hover:scale-110 transition-transform" />
                <div>
                  <span className="text-slate-400 text-xs block">{t('whatsappLabel')}</span>
                  <span className="font-mono text-emerald-400 font-medium">{whatsapp}</span>
                </div>
              </a>

              <a
                href={`mailto:${email}`}
                className="flex items-start gap-2.5 hover:text-white transition-colors"
              >
                <Mail className="w-4 h-4 text-brand-400 mt-0.5 shrink-0" />
                <div>
                  <span className="text-slate-400 text-xs block">{t('emailLabel')}</span>
                  <span className="text-slate-200">{email}</span>
                </div>
              </a>
            </div>
          </div>

          {/* Warehouse Location & Hours */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">
              {t('addressLabel')}
            </h4>

            <div className="space-y-2.5 text-xs sm:text-sm">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-400 mt-0.5 shrink-0" />
                <p className="text-slate-300 leading-relaxed">{address}</p>
              </div>

              <div className="flex items-start gap-2.5 pt-2">
                <Clock className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <p className="text-slate-400 text-xs">{t('workingHours')}</p>
              </div>
            </div>
          </div>

          {/* Wholesale Trust & Admin Link */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">
              {lang === 'ur' ? 'ہول سیل سپلائی' : 'Wholesale Distribution'}
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {lang === 'ur'
                ? 'ہم دکانداروں اور پروجیکٹس کو مناسب ترین ہول سیل ریٹس پر گارنٹیڈ کوالٹی فراہم کرتے ہیں۔'
                : 'Supplying verified sanitary items to retailers, hardware stores, and construction contractors nationwide.'}
            </p>

            <div className="pt-3">
              <button
                onClick={onAdminClick}
                className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
                <span>{t('adminLoginTitle')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="mt-12 pt-6 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} {businessName}. {t('copyright')}</p>
          <p className="font-mono text-[11px] text-slate-600">
            Render • Netlify • Turso LibSQL
          </p>
        </div>
      </div>
    </footer>
  );
}
