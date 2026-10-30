import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { api } from '../../api.js';
import { Settings, Save, CheckCircle2, AlertCircle, Phone, MessageCircle, Mail, MapPin, Globe, Sparkles } from 'lucide-react';

export default function SettingsManager({ onSettingsUpdated }) {
  const { lang, t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [settings, setSettings] = useState({
    business_name_en: '',
    business_name_ur: '',
    tagline_en: '',
    tagline_ur: '',
    phone: '',
    whatsapp: '',
    email: '',
    address_en: '',
    address_ur: '',
    hero_title_en: '',
    hero_title_ur: '',
    hero_desc_en: '',
    hero_desc_ur: '',
    delivery_info_en: '',
    delivery_info_ur: '',
  });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminSettings();
      if (res.success && res.settings) {
        setSettings((prev) => ({
          ...prev,
          ...res.settings,
        }));
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    setSettings((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    try {
      setSaving(true);
      const res = await api.updateAdminSettings(settings);
      if (res.success) {
        setSuccessMsg(t('settingsSavedSuccess'));
        if (onSettingsUpdated) {
          onSettingsUpdated(settings);
        }
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        throw new Error(res.error || 'Failed to update settings');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-400 text-sm">Loading website settings...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Intro Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 uppercase tracking-wider mb-1">
            <Settings className="w-4 h-4" />
            <span>Editable Website & Contact Info</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            {t('websiteSettingsTitle')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {t('websiteSettingsSubtitle')}
          </p>
        </div>

        <button
          type="submit"
          form="settings-form"
          disabled={saving}
          className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-md shadow-brand-600/25 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving Changes...' : t('saveSettings')}</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-bold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form id="settings-form" onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Brand & Business Names */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <Globe className="w-4 h-4 text-brand-600" />
            <span>Business Name & Tagline</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Business Name (English)
              </label>
              <input
                type="text"
                name="business_name_en"
                value={settings.business_name_en || ''}
                onChange={handleChange}
                className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Business Name (Urdu)
              </label>
              <input
                type="text"
                name="business_name_ur"
                dir="rtl"
                value={settings.business_name_ur || ''}
                onChange={handleChange}
                className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 font-urdu"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tagline (English)
              </label>
              <input
                type="text"
                name="tagline_en"
                value={settings.tagline_en || ''}
                onChange={handleChange}
                className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tagline (Urdu)
              </label>
              <input
                type="text"
                name="tagline_ur"
                dir="rtl"
                value={settings.tagline_ur || ''}
                onChange={handleChange}
                className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 font-urdu"
              />
            </div>
          </div>
        </div>

        {/* 2. Direct Contact Details & Placeholders */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <Phone className="w-4 h-4 text-emerald-600" />
            <span>Contact Information (Phone, WhatsApp, Email)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t('businessPhone')}
              </label>
              <input
                type="text"
                name="phone"
                value={settings.phone || ''}
                onChange={handleChange}
                placeholder="+92 300 1234567"
                className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t('businessWhatsApp')}
              </label>
              <input
                type="text"
                name="whatsapp"
                value={settings.whatsapp || ''}
                onChange={handleChange}
                placeholder="+92 300 1234567"
                className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t('businessEmail')}
              </label>
              <input
                type="email"
                name="email"
                value={settings.email || ''}
                onChange={handleChange}
                placeholder="sales@kashifsanitary.com"
                className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t('businessAddressEn')}
              </label>
              <textarea
                name="address_en"
                rows="2"
                value={settings.address_en || ''}
                onChange={handleChange}
                className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500"
              ></textarea>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t('businessAddressUr')}
              </label>
              <textarea
                name="address_ur"
                rows="2"
                dir="rtl"
                value={settings.address_ur || ''}
                onChange={handleChange}
                className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 font-urdu"
              ></textarea>
            </div>
          </div>
        </div>

        {/* 3. Homepage Hero Banner Texts */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Homepage Hero Banner & Announcement Content</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t('heroTitleEn')}
              </label>
              <input
                type="text"
                name="hero_title_en"
                value={settings.hero_title_en || ''}
                onChange={handleChange}
                className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t('heroTitleUr')}
              </label>
              <input
                type="text"
                name="hero_title_ur"
                dir="rtl"
                value={settings.hero_title_ur || ''}
                onChange={handleChange}
                className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-lg font-urdu"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t('heroDescEn')}
              </label>
              <textarea
                name="hero_desc_en"
                rows="3"
                value={settings.hero_desc_en || ''}
                onChange={handleChange}
                className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-lg"
              ></textarea>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t('heroDescUr')}
              </label>
              <textarea
                name="hero_desc_ur"
                rows="3"
                dir="rtl"
                value={settings.hero_desc_ur || ''}
                onChange={handleChange}
                className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-lg font-urdu"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Save Button Bar */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-brand-600/30 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Settings...' : t('saveSettings')}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
