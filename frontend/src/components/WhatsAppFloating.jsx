import React, { useState } from 'react';
import { MessageCircle, Phone, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function WhatsAppFloating({ settings = {} }) {
  const { lang, t } = useLanguage();
  const [open, setOpen] = useState(false);

  const phone = settings.phone || '+92 300 1234567';
  const whatsapp = settings.whatsapp || '+92 300 1234567';
  const rawWhatsApp = whatsapp.replace(/[^0-9]/g, '');
  const rawPhone = phone.replace(/[^0-9+]/g, '');

  return (
    <div className="fixed bottom-6 end-6 z-40 flex flex-col items-end gap-3 no-print">
      {/* Pop-up options */}
      {open && (
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 w-72 mb-1 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <span className="font-bold text-xs uppercase tracking-wider text-slate-700">
              {lang === 'ur' ? 'فوری رابطہ کریں' : 'Quick Wholesale Contact'}
            </span>
            <button
              onClick={() => setOpen(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            <a
              href={`https://wa.me/${rawWhatsApp}?text=${encodeURIComponent('Assalam-o-Alaikum, I want to inquire about wholesale sanitary products and prices from Kashif Sanitary Supplies.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div className="text-start">
                <div className="text-xs font-bold">{t('chatWhatsApp')}</div>
                <div className="text-[11px] text-emerald-700 font-mono">{whatsapp}</div>
              </div>
            </a>

            <a
              href={`tel:${rawPhone}`}
              className="flex items-center gap-3 p-2.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-800 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center">
                <Phone className="w-4 h-4" />
              </div>
              <div className="text-start">
                <div className="text-xs font-bold">{t('callNow')}</div>
                <div className="text-[11px] text-brand-700 font-mono">{phone}</div>
              </div>
            </a>
          </div>
        </div>
      )}

      {/* Main floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl shadow-emerald-500/30 flex items-center justify-center transition-all hover:scale-105 active:scale-95 group focus:outline-none"
        aria-label="Contact via WhatsApp or Phone"
      >
        {open ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-7 h-7" />
        )}
      </button>
    </div>
  );
}
