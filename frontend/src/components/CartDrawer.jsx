import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { api } from '../api.js';
import { X, Trash2, Plus, Minus, ShoppingBag, Send, AlertCircle, Store, MapPin, Phone, User, FileText } from 'lucide-react';

export default function CartDrawer() {
  const { lang, t } = useLanguage();
  const {
    items,
    isDrawerOpen,
    setIsDrawerOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalCount,
    estimatedTotal,
    setSubmittedOrder,
  } = useCart();

  const [formData, setFormData] = useState({
    customer_name: '',
    shop_name: '',
    phone: '',
    city: '',
    address: '',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isDrawerOpen) return null;

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (items.length === 0) {
      setErrorMsg(t('noItemsInCart'));
      return;
    }

    if (!formData.customer_name.trim()) {
      setErrorMsg(t('fullName') + ' is required');
      return;
    }
    if (!formData.phone.trim()) {
      setErrorMsg(t('phone') + ' is required');
      return;
    }
    if (!formData.city.trim()) {
      setErrorMsg(t('city') + ' is required');
      return;
    }
    if (!formData.address.trim()) {
      setErrorMsg(t('address') + ' is required');
      return;
    }

    try {
      setIsSubmitting(true);

      const orderPayload = {
        customer_name: formData.customer_name,
        shop_name: formData.shop_name,
        phone: formData.phone,
        city: formData.city,
        address: formData.address,
        notes: formData.notes,
        items: items.map((it) => ({
          product_id: it.product_id,
          product_name_en: it.product_name_en,
          product_name_ur: it.product_name_ur,
          variant: it.variant,
          unit: it.unit,
          quantity: it.quantity,
          unit_price: it.unit_price,
          is_price_on_request: it.is_price_on_request,
        })),
      };

      const res = await api.createOrder(orderPayload);

      if (res.success && res.order) {
        clearCart();
        setIsDrawerOpen(false);
        setSubmittedOrder(res.order);
      } else {
        throw new Error(res.error || 'Failed to submit order');
      }
    } catch (err) {
      console.error('Order Submission Error:', err);
      setErrorMsg(err.message || 'Something went wrong while placing order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-sm transition-opacity">
      <div className="absolute inset-y-0 end-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full border-s border-slate-200">
          {/* Header */}
          <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-brand-500/20 text-brand-300 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold">{t('yourOrder')}</h2>
                <p className="text-xs text-slate-400">
                  {totalCount} {t('totalItems')}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
            {/* Items List */}
            {items.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <p className="text-sm text-slate-600 font-medium">{t('noItemsInCart')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {t('orderSummary')}
                  </span>
                  <button
                    onClick={clearCart}
                    className="text-xs text-rose-600 hover:text-rose-700 font-semibold"
                  >
                    Clear All
                  </button>
                </div>

                {items.map((item, idx) => {
                  const displayName = lang === 'ur' ? (item.product_name_ur || item.product_name_en) : (item.product_name_en || item.product_name_ur);
                  return (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3 relative group"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                          {displayName}
                        </h4>
                        {item.variant && (
                          <span className="inline-block mt-0.5 px-2 py-0.5 rounded bg-brand-50 text-brand-700 text-[11px] font-semibold border border-brand-200">
                            {item.variant}
                          </span>
                        )}
                        <div className="mt-1 text-xs text-slate-500 flex items-center gap-2">
                          <span>Unit: {item.unit}</span>
                          <span>•</span>
                          {item.is_price_on_request || !item.unit_price ? (
                            <span className="text-brand-600 font-semibold">{t('requestPrice')}</span>
                          ) : (
                            <span className="font-mono font-medium">PKR {Number(item.unit_price).toLocaleString()}</span>
                          )}
                        </div>
                      </div>

                      {/* Quantity Stepper & Remove */}
                      <div className="flex flex-col items-end gap-2">
                        <button
                          type="button"
                          onClick={() => removeFromCart(idx)}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                          title={t('remove')}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <div className="flex items-center border border-slate-200 rounded bg-white">
                          <button
                            type="button"
                            onClick={() => updateQuantity(idx, item.quantity - 1)}
                            className="p-1 text-slate-600 hover:text-slate-900"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-bold text-slate-800 font-mono">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(idx, item.quantity + 1)}
                            className="p-1 text-slate-600 hover:text-slate-900"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Subtotals & Notice */}
                <div className="bg-brand-50/70 p-3 rounded-xl border border-brand-100 text-xs text-brand-800">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">{t('totalItems')}:</span>
                    <span className="font-bold font-mono">{totalCount}</span>
                  </div>
                  {estimatedTotal > 0 && (
                    <div className="flex justify-between items-center text-sm font-bold border-t border-brand-200 pt-1 mt-1">
                      <span>{t('estimatedTotal')}:</span>
                      <span className="font-mono text-brand-900">PKR {estimatedTotal.toLocaleString()}</span>
                    </div>
                  )}
                  <p className="mt-2 text-[11px] text-slate-600 leading-relaxed flex items-start gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-brand-600 shrink-0 mt-0.5" />
                    <span>{t('priceOnDemandNotice')}</span>
                  </p>
                </div>
              </div>
            )}

            {/* Customer Details Form */}
            {items.length > 0 && (
              <form id="order-form" onSubmit={handleSubmitOrder} className="space-y-4 pt-2 border-t border-slate-200">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-brand-600" />
                  <span>{t('customerDetailsTitle')}</span>
                </h3>

                {errorMsg && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('fullName')} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="customer_name"
                    required
                    value={formData.customer_name}
                    onChange={handleChange}
                    placeholder={t('fullNamePlaceholder')}
                    className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  />
                </div>

                {/* Shop Name / Shop Number */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('shopName')}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="shop_name"
                      value={formData.shop_name}
                      onChange={handleChange}
                      placeholder={t('shopNamePlaceholder')}
                      className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('phone')} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder={t('phonePlaceholder')}
                    className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white font-mono"
                  />
                </div>

                {/* City / Area */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('city')} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    placeholder={t('cityPlaceholder')}
                    className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  />
                </div>

                {/* Full Address */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('address')} <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    name="address"
                    required
                    rows="2"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder={t('addressPlaceholder')}
                    className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  ></textarea>
                </div>

                {/* Additional Instructions */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('instructions')}
                  </label>
                  <textarea
                    name="notes"
                    rows="2"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder={t('instructionsPlaceholder')}
                    className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  ></textarea>
                </div>
              </form>
            )}
          </div>

          {/* Footer Action */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 space-y-2">
              <button
                type="submit"
                form="order-form"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-lg shadow-brand-600/30 flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>{t('submitting')}</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{t('submitOrder')}</span>
                  </>
                )}
              </button>
              <p className="text-[11px] text-center text-slate-500">{t('orderNote')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
