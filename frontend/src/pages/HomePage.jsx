import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';
import ProductCard from '../components/ProductCard.jsx';
import {
  Search,
  SlidersHorizontal,
  Truck,
  ShieldCheck,
  BadgePercent,
  PhoneCall,
  MessageCircle,
  Package,
  Layers,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';

export default function HomePage({ settings = {}, products = [], categories = [], loading = false }) {
  const { lang, t, isRtl } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const businessName = lang === 'ur'
    ? (settings.business_name_ur || 'کاشف سینیٹری سپلائیز')
    : (settings.business_name_en || 'Kashif Sanitary Supplies');

  const tagline = lang === 'ur'
    ? (settings.tagline_ur || 'اعلیٰ معیار کی مصنوعات، قابل اعتماد سپلائی')
    : (settings.tagline_en || 'Quality Products. Reliable Supply.');

  const heroTitle = lang === 'ur'
    ? (settings.hero_title_ur || 'ہول سیل سینیٹری ویئر، پائپ اور باتھ روم فٹنگز')
    : (settings.hero_title_en || 'Wholesale Sanitary Ware, Pipes & Bathroom Fittings');

  const heroDesc = lang === 'ur'
    ? (settings.hero_desc_ur || 'ریٹیلرز، پلمبروں اور کنٹریکٹرز کے لیے پائیدار پی پی آر سی، پی وی سی پائپس، براس فٹنگز اور پرتعیش سینیٹری کا قابل اعتماد سپلائر۔')
    : (settings.hero_desc_en || 'Direct wholesale supplier of premium PPRC & PVC pipes, brass fittings, luxury faucets, and modern bathroom sanitary ware.');

  const whatsapp = settings.whatsapp || '+92 300 1234567';
  const rawWhatsApp = whatsapp.replace(/[^0-9]/g, '');

  // Filter products by selected category and search term
  const filteredProducts = products.filter((p) => {
    // Category match
    const categoryMatch =
      selectedCategory === 'all' ||
      String(p.category_id) === String(selectedCategory) ||
      p.category_slug === selectedCategory;

    // Search match in EN, UR, or SKU
    const searchMatch =
      !searchTerm.trim() ||
      p.name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.name_ur.includes(searchTerm) ||
      (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.description_en && p.description_en.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.description_ur && p.description_ur.includes(searchTerm));

    return categoryMatch && searchMatch;
  });

  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* Hero Section */}
      <section id="hero" className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-white to-slate-50 pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            {/* Tagline Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-100 text-brand-800 text-xs sm:text-sm font-bold border border-brand-200 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-brand-600 animate-ping"></span>
              <span>{businessName}</span>
              <span className="text-brand-400">•</span>
              <span>{tagline}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
              {heroTitle}
            </h1>

            {/* Sub-headline / Intro */}
            <p className="text-sm sm:text-lg text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto">
              {heroDesc}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <a
                href="#catalog"
                className="px-6 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-brand-600/30 inline-flex items-center gap-2 transition-all active:scale-95"
              >
                <span>{t('heroCtaOrder')}</span>
                <ArrowIcon className="w-4 h-4" />
              </a>

              <a
                href={`https://wa.me/${rawWhatsApp}?text=${encodeURIComponent('Assalam-o-Alaikum, I need wholesale price catalog from Kashif Sanitary Supplies.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-600/30 inline-flex items-center gap-2 transition-all active:scale-95"
              >
                <MessageCircle className="w-5 h-5" />
                <span>{t('heroCtaWhatsApp')}</span>
              </a>
            </div>

            {/* Value Highlights */}
            <div className="pt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-200/80 mt-10">
              <div className="flex items-center justify-center sm:justify-start gap-3 p-3 rounded-xl bg-white/70 border border-slate-200/60 shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center shrink-0">
                  <BadgePercent className="w-5 h-5" />
                </div>
                <div className="text-start">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">{t('wholesaleRates')}</h4>
                  <p className="text-[11px] text-slate-500">{lang === 'ur' ? 'براہ راست ڈیلر اور مارکیٹ ریٹ' : 'Best margins for retailers'}</p>
                </div>
              </div>

              <div className="flex items-center justify-center sm:justify-start gap-3 p-3 rounded-xl bg-white/70 border border-slate-200/60 shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="text-start">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">{t('authenticQuality')}</h4>
                  <p className="text-[11px] text-slate-500">{lang === 'ur' ? 'مضبوط اور پائیدار میٹریل' : 'Leak-proof virgin material'}</p>
                </div>
              </div>

              <div className="flex items-center justify-center sm:justify-start gap-3 p-3 rounded-xl bg-white/70 border border-slate-200/60 shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div className="text-start">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">{t('quickDelivery')}</h4>
                  <p className="text-[11px] text-slate-500">{lang === 'ur' ? 'تمام شہروں کے لیے تیز ترسیل' : 'Fast cargo dispatch daily'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog & Order Section */}
      <section id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Section Heading & Search */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 uppercase tracking-wider mb-1">
                <Package className="w-4 h-4" />
                <span>{businessName}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {t('catalogTitle')}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
                {t('catalogSubtitle')}
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full ps-9 pe-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                selectedCategory === 'all'
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {t('allCategories')}
            </button>

            {categories.map((cat) => {
              const catName = lang === 'ur' ? cat.name_ur : cat.name_en;
              const isSelected = String(selectedCategory) === String(cat.id) || selectedCategory === cat.slug;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {catName}
                </button>
              );
            })}
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <div key={n} className="bg-white rounded-2xl p-4 border border-slate-200 animate-pulse space-y-4">
                  <div className="aspect-[4/3] bg-slate-200 rounded-xl"></div>
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                  <div className="h-8 bg-slate-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center my-8">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">{t('noProductsFound')}</h3>
              <p className="text-xs text-slate-500 mt-1">Try searching with a different term or clear filters.</p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchTerm('');
                }}
                className="mt-4 px-4 py-2 bg-brand-50 text-brand-700 rounded-lg text-xs font-bold hover:bg-brand-100"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-2">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Wholesale & Project Supply Callout Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 text-white p-8 sm:p-12 shadow-xl border border-slate-800 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl text-center lg:text-start">
            <span className="inline-block px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-bold border border-brand-500/30">
              {businessName} • {tagline}
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {lang === 'ur'
                ? 'پلمبرز، ٹھیکیداروں اور سینیٹری دکانداروں کے لیے خصوصی ہول سیل نرخ'
                : 'Bulk Quotations & Customized Project Orders'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {lang === 'ur'
                ? 'اگر آپ کو اپنے پروجیکٹ یا دکان کے لیے خصوصی سائز کے پائپ، فٹنگز یا سینیٹری سامان کی بڑی تعداد درکار ہے تو براہ راست ہم سے رابطہ کریں۔'
                : 'Need specialized PPRC sizes, uPVC bulk pipe bundles, or luxury sanitary ware containers? Contact our wholesale desk for fast cargo quotes.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <a
              href={`https://wa.me/${rawWhatsApp}?text=${encodeURIComponent('Assalam-o-Alaikum, I want to discuss a bulk project order with Kashif Sanitary Supplies.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              <span>{t('chatWhatsApp')}</span>
            </a>

            <a
              href={`tel:${settings.phone ? settings.phone.replace(/[^0-9+]/g, '') : '+923001234567'}`}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 flex items-center justify-center gap-2"
            >
              <PhoneCall className="w-4 h-4" />
              <span>{t('callNow')}</span>
            </a>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm">
          <div className="max-w-3xl space-y-4">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {t('aboutTitle')}
            </h3>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              {t('aboutDesc')}
            </p>

            <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <CheckCircle2 className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {lang === 'ur' ? 'گارنٹیڈ پائپ اور فٹنگز' : 'Pressure-Tested Pipes'}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {lang === 'ur' ? 'گرم اور ٹھنڈے پانی کے لیے بغیر لیکج آزمودہ سامان۔' : 'Certified PN25 hot & cold potable water ratings.'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {lang === 'ur' ? 'شفاف آرڈرز اور پرچیزنگ' : 'Reliable Supply Chain'}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {lang === 'ur' ? 'ہر گاہک کے سامان کی علیحدہ پیکنگ اور فوری ڈسپیچ۔' : 'Clear packing challans, organized procurement, and verified delivery.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
