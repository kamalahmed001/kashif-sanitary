import React from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { CheckCircle2, MessageCircle, Phone, X, Copy, ExternalLink } from 'lucide-react';

export default function OrderSuccessModal({ settings = {} }) {
  const { lang, t } = useLanguage();
  const { submittedOrder, setSubmittedOrder } = useCart();

  if (!submittedOrder) return null;

  const whatsapp = settings.whatsapp || '+92 300 1234567';
  const phone = settings.phone || '+92 300 1234567';
  const rawWhatsApp = whatsapp.replace(/[^0-9]/g, '');
  const rawPhone = phone.replace(/[^0-9+]/g, '');

  // Build formatted WhatsApp message
  const itemsText = (submittedOrder.items || [])
    .map((it) => `• ${it.quantity}x ${it.product_name_en} ${it.variant ? `(${it.variant})` : ''} [${it.unit}]`)
    .join('\n');

  const waMessage = `*KASHIF SANITARY SUPPLIES - ORDER SUBMISSION*
*Order Number:* ${submittedOrder.order_number}
*Customer Name:* ${submittedOrder.customer_name}
${submittedOrder.shop_name ? `*Shop:* ${submittedOrder.shop_name}\n` : ''}*Phone:* ${submittedOrder.phone}
*City:* ${submittedOrder.city}
*Address:* ${submittedOrder.address}
${submittedOrder.notes ? `*Instructions:* ${submittedOrder.notes}\n` : ''}
*Ordered Items:*
${itemsText}

${submittedOrder.estimated_total > 0 ? `*Estimated Total:* PKR ${Number(submittedOrder.estimated_total).toLocaleString()}` : ''}

Please confirm my order and share cargo dispatch details. Thank you!`;

  const waUrl = `https://wa.me/${rawWhatsApp}?text=${encodeURIComponent(waMessage)}`;

  const copyOrderNumber = () => {
    navigator.clipboard.writeText(submittedOrder.order_number);
    alert(`Order Number ${submittedOrder.order_number} copied to clipboard!`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={() => setSubmittedOrder(null)}
          className="absolute top-5 end-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & Heading */}
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            {t('orderSuccessTitle')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t('orderSuccessSubtitle')}
          </p>
        </div>

        {/* Unique Order Number Banner */}
        <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            {t('orderNumberLabel')}
          </span>
          <div className="flex items-center justify-center gap-2">
            <span className="text-xl sm:text-2xl font-black font-mono text-brand-700 tracking-wide">
              {submittedOrder.order_number}
            </span>
            <button
              onClick={copyOrderNumber}
              className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
              title="Copy Order Number"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {t('saveOrderNumberHint')}
          </p>
        </div>

        {/* Order Details Brief */}
        <div className="mt-5 space-y-2 text-xs sm:text-sm border-t border-slate-100 pt-4">
          <div className="flex justify-between text-slate-600">
            <span>Customer:</span>
            <span className="font-semibold text-slate-900">{submittedOrder.customer_name}</span>
          </div>
          {submittedOrder.shop_name && (
            <div className="flex justify-between text-slate-600">
              <span>Shop:</span>
              <span className="font-semibold text-slate-900">{submittedOrder.shop_name}</span>
            </div>
          )}
          <div className="flex justify-between text-slate-600">
            <span>City:</span>
            <span className="font-semibold text-slate-900">{submittedOrder.city}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Items Count:</span>
            <span className="font-semibold text-slate-900 font-mono">{submittedOrder.total_items} items</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 space-y-3">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all"
          >
            <MessageCircle className="w-5 h-5" />
            <span>{t('confirmViaWhatsApp')}</span>
            <ExternalLink className="w-4 h-4 opacity-75" />
          </a>

          <div className="grid grid-cols-2 gap-3">
            <a
              href={`tel:${rawPhone}`}
              className="py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <Phone className="w-4 h-4 text-brand-600" />
              <span>{t('callNow')}</span>
            </a>

            <button
              onClick={() => setSubmittedOrder(null)}
              className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm transition-colors"
            >
              {t('backToCatalog')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
