import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { ShoppingCart, Check, Plus, Minus, Tag, AlertCircle } from 'lucide-react';

export default function ProductCard({ product }) {
  const { lang, t } = useLanguage();
  const { addToCart } = useCart();

  const [selectedVariant, setSelectedVariant] = useState(() => {
    return product.variants && product.variants.length > 0 ? product.variants[0] : '';
  });
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const productName = lang === 'ur' ? (product.name_ur || product.name_en) : (product.name_en || product.name_ur);
  const secondaryName = lang === 'ur' ? product.name_en : product.name_ur;
  const description = lang === 'ur' ? (product.description_ur || product.description_en) : (product.description_en || product.description_ur);
  const categoryName = lang === 'ur' ? (product.category_name_ur || product.category_name_en) : (product.category_name_en || product.category_name_ur);

  const handleAdd = () => {
    addToCart(product, selectedVariant, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const getStockBadge = () => {
    if (product.is_available === 1) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 me-1.5"></span>
          {t('inStock')}
        </span>
      );
    } else if (product.is_available === 2) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 me-1.5"></span>
          {t('onOrder')}
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 me-1.5"></span>
          {t('outOfStock')}
        </span>
      );
    }
  };

  const fallbackImage = 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 hover:border-brand-400 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group">
      {/* Product Image Area */}
      <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
        <img
          src={imgError || !product.image_url ? fallbackImage : product.image_url}
          alt={productName}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-3 start-3 end-3 flex items-center justify-between pointer-events-none">
          {categoryName && (
            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wider uppercase bg-slate-900/80 text-white backdrop-blur-sm">
              {categoryName}
            </span>
          )}
          {getStockBadge()}
        </div>

        {product.sku && (
          <div className="absolute bottom-2 start-3">
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-white/90 text-slate-700 shadow-sm">
              {product.sku}
            </span>
          </div>
        )}
      </div>

      {/* Product Details Area */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-base sm:text-lg text-slate-900 leading-snug group-hover:text-brand-600 transition-colors">
            {productName}
          </h3>
          {secondaryName && secondaryName !== productName && (
            <p className="text-xs text-slate-400 font-medium mt-0.5 line-clamp-1">
              {secondaryName}
            </p>
          )}

          {description && (
            <p className="text-xs sm:text-sm text-slate-500 mt-2 line-clamp-2 leading-relaxed">
              {description}
            </p>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 space-y-3">
          {/* Variant Selector */}
          {product.variants && product.variants.length > 0 && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                {t('selectVariant')}
              </label>
              <select
                value={selectedVariant}
                onChange={(e) => setSelectedVariant(e.target.value)}
                className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium text-slate-800"
              >
                {product.variants.map((v, i) => (
                  <option key={i} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Price & Unit Display */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">
                {product.unit ? `${t('unit')}: ${product.unit}` : ''}
              </span>
              {product.is_price_on_request || !product.price || product.price === 0 ? (
                <div className="inline-flex items-center gap-1 text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-md border border-brand-200">
                  <Tag className="w-3 h-3" />
                  <span>{t('requestPrice')}</span>
                </div>
              ) : (
                <div className="text-lg font-extrabold text-slate-900 font-mono">
                  <span className="text-xs font-normal text-slate-500 me-1">PKR</span>
                  {Number(product.price).toLocaleString()}
                </div>
              )}
            </div>

            {/* Quantity Stepper */}
            <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 p-0.5">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-7 h-7 flex items-center justify-center rounded text-slate-600 hover:bg-white hover:text-slate-900 transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-8 text-center text-xs font-bold text-slate-800 font-mono">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-7 h-7 flex items-center justify-center rounded text-slate-600 hover:bg-white hover:text-slate-900 transition-colors"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Add to Order Button */}
          <button
            type="button"
            disabled={product.is_available === 0}
            onClick={handleAdd}
            className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-sm active:scale-98 ${
              product.is_available === 0
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                : added
                ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                : 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-600/25'
            }`}
          >
            {added ? (
              <>
                <Check className="w-4 h-4" />
                <span>{t('itemAdded')}</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                <span>{t('addToOrder')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
