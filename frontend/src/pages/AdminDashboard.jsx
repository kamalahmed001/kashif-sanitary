import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api.js';
import OrdersManager from './admin/OrdersManager.jsx';
import PurchasingSummary from './admin/PurchasingSummary.jsx';
import ProductsManager from './admin/ProductsManager.jsx';
import CategoriesManager from './admin/CategoriesManager.jsx';
import SettingsManager from './admin/SettingsManager.jsx';
import AccountSettings from './admin/AccountSettings.jsx';
import {
  ClipboardList,
  Calculator,
  Package,
  Layers,
  Settings,
  ShieldCheck,
  LogOut,
  Store,
  Bell,
  RefreshCw,
  Droplets,
} from 'lucide-react';

export default function AdminDashboard({ onBackToStore, settings = {}, onSettingsUpdated }) {
  const { lang, t } = useLanguage();
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState('orders');
  const [stats, setStats] = useState(null);
  const [newOrderAlert, setNewOrderAlert] = useState(false);
  const [lastNewCount, setLastNewCount] = useState(null);

  // Play subtle web audio notification chime
  const playChime = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      // AudioContext might require user gesture on some browsers
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.getAdminStats();
      if (res.success && res.stats) {
        setStats(res.stats);

        // Check for new order arrival
        if (lastNewCount !== null && res.stats.newOrders > lastNewCount) {
          setNewOrderAlert(true);
          playChime();
        }
        setLastNewCount(res.stats.newOrders);
      }
    } catch (err) {
      console.warn('Stats poll failed:', err);
    }
  };

  useEffect(() => {
    fetchStats();
    // Poll stats every 25 seconds for new order notification
    const interval = setInterval(fetchStats, 25000);
    return () => clearInterval(interval);
  }, [lastNewCount]);

  const tabs = [
    { id: 'orders', label: t('tabOrders'), icon: ClipboardList, badge: stats?.newOrders },
    { id: 'purchasing', label: t('tabPurchasing'), icon: Calculator },
    { id: 'products', label: t('tabProducts'), icon: Package },
    { id: 'categories', label: t('tabCategories'), icon: Layers },
    { id: 'settings', label: t('tabSettings'), icon: Settings },
    { id: 'account', label: t('tabAccount'), icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Admin Top Header */}
      <header className="no-print bg-slate-900 text-white shadow-md border-b border-slate-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Brand in Admin */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-sm">
                <Droplets className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                  <span>Kashif Sanitary Supplies</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 uppercase tracking-wider">
                    Admin
                  </span>
                </h1>
                <p className="text-xs text-slate-400 font-medium hidden sm:block">
                  Quality Products. Reliable Supply.
                </p>
              </div>
            </div>

            {/* Notification and Actions */}
            <div className="flex items-center gap-3">
              {newOrderAlert && (
                <div
                  onClick={() => {
                    setActiveTab('orders');
                    setNewOrderAlert(false);
                  }}
                  className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500 text-white text-xs font-bold animate-pulse"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>{t('newOrdersBadge')}</span>
                </div>
              )}

              <button
                onClick={onBackToStore}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
                title="Return to customer website"
              >
                <Store className="w-4 h-4 text-brand-400" />
                <span className="hidden sm:inline">View Customer Website</span>
              </button>

              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="bg-slate-950 border-t border-slate-800/80 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto scrollbar-none py-1.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.badge > 0 && (
                    <span className="min-w-[18px] h-4 px-1 rounded-full text-[10px] font-black bg-rose-500 text-white flex items-center justify-center">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'orders' && <OrdersManager settings={settings} />}
        {activeTab === 'purchasing' && <PurchasingSummary settings={settings} />}
        {activeTab === 'products' && <ProductsManager />}
        {activeTab === 'categories' && <CategoriesManager />}
        {activeTab === 'settings' && <SettingsManager onSettingsUpdated={onSettingsUpdated} />}
        {activeTab === 'account' && <AccountSettings />}
      </main>
    </div>
  );
}
