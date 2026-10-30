import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import {
  Phone,
  MessageCircle,
  ShoppingCart,
  ShieldCheck,
  Globe,
  Menu,
  X,
  Droplets,
  Layers,
} from 'lucide-react';

export default function Navbar({ settings = {}, activeTab, setActiveTab }) {
  const { lang, toggleLanguage, t, isRtl } = useLanguage();
  const { totalCount, setIsDrawerOpen } = useCart();
  const { isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const phone = settings.phone || '+92 300 1234567';
  const whatsapp = settings.whatsapp || '+92 300 1234567';
  const rawPhone = phone.replace(/[^0-9+]/g, '');
  const rawWhatsApp = whatsapp.replace(/[^0-9]/g, '');

  const businessName = lang === 'ur'
    ? (settings.business_name_ur || 'کاشف سینیٹری سپلائیز')
    : (settings.business_name_en || 'Kashif Sanitary Supplies');

  const tagline = lang === 'ur'
    ? (settings.tagline_ur || 'اعلیٰ معیار کی مصنوعات، قابل اعتماد سپلائی')
    : (settings.tagline_en || 'Quality Products. Reliable Supply.');

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    if (activeTab !== 'home') {
      setActiveTab('home');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200">
      {/* Top Bar for quick contact & announcement */}
      <div className="bg-brand-900 text-slate-100 text-xs sm:text-sm py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 font-medium text-brand-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {lang === 'ur' ? 'ہول سیل آرڈرز و ملک گیر سپلائی' : 'Wholesale Sanitary & Plumbing Supply'}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <a
              href={`tel:${rawPhone}`}
              className="inline-flex items-center gap-1 hover:text-brand-300 transition-colors"
              title={t('callNow')}
            >
              <Phone className="w-3.5 h-3.5 text-brand-300" />
              <span className="hidden sm:inline font-mono">{phone}</span>
              <span className="sm:hidden">{t('callNow')}</span>
            </a>
            <span className="text-slate-600">|</span>
            <a
              href={`https://wa.me/${rawWhatsApp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
              title={t('chatWhatsApp')}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>{t('chatWhatsApp')}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo & Name */}
          <div
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <Droplets className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-brand-600 transition-colors">
                {businessName}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium tracking-wide">
                {tagline}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => scrollToSection('hero')}
              className="text-sm font-semibold text-slate-700 hover:text-brand-600 transition-colors"
            >
              {t('navHome')}
            </button>
            <button
              onClick={() => scrollToSection('catalog')}
              className="text-sm font-semibold text-slate-700 hover:text-brand-600 transition-colors"
            >
              {t('navProducts')}
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className="text-sm font-semibold text-slate-700 hover:text-brand-600 transition-colors"
            >
              {t('navAbout')}
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="text-sm font-semibold text-slate-700 hover:text-brand-600 transition-colors"
            >
              {t('navContact')}
            </button>
          </nav>

          {/* Action Buttons: Language toggle, Cart drawer button, Admin shortcut */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-semibold transition-all shadow-sm active:scale-95"
              title="Switch English / اردو"
            >
              <Globe className="w-4 h-4 text-brand-600" />
              <span>{lang === 'en' ? 'اردو' : 'English'}</span>
            </button>

            {/* Cart / Order List Trigger */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="relative inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-brand-600/25 transition-all active:scale-95"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">{t('navCart')}</span>
              {totalCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold bg-amber-400 text-slate-900 rounded-full animate-bounce">
                  {totalCount}
                </span>
              )}
            </button>

            {/* Admin Portal Shortcut */}
            <button
              onClick={() => setActiveTab(activeTab === 'admin' ? 'home' : 'admin')}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold border transition-all ${
                activeTab === 'admin'
                  ? 'bg-brand-100 text-brand-800 border-brand-300'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
              title="Admin Portal"
            >
              <ShieldCheck className="w-4 h-4 text-brand-600" />
              <span className="hidden lg:inline">
                {isAuthenticated ? t('adminDashboard') : t('navAdmin')}
              </span>
            </button>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <button
            onClick={() => scrollToSection('hero')}
            className="block w-full text-left rtl:text-right py-2 text-base font-semibold text-slate-700 hover:text-brand-600"
          >
            {t('navHome')}
          </button>
          <button
            onClick={() => scrollToSection('catalog')}
            className="block w-full text-left rtl:text-right py-2 text-base font-semibold text-slate-700 hover:text-brand-600"
          >
            {t('navProducts')}
          </button>
          <button
            onClick={() => scrollToSection('about')}
            className="block w-full text-left rtl:text-right py-2 text-base font-semibold text-slate-700 hover:text-brand-600"
          >
            {t('navAbout')}
          </button>
          <button
            onClick={() => scrollToSection('contact')}
            className="block w-full text-left rtl:text-right py-2 text-base font-semibold text-slate-700 hover:text-brand-600"
          >
            {t('navContact')}
          </button>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <a
              href={`tel:${rawPhone}`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800"
            >
              <Phone className="w-4 h-4 text-brand-600" />
              <span>{phone}</span>
            </a>
            <a
              href={`https://wa.me/${rawWhatsApp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
