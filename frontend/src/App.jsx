import React, { useState, useEffect } from 'react';
import { useLanguage } from './context/LanguageContext.jsx';
import { useAuth } from './context/AuthContext.jsx';
import { api } from './api.js';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import OrderSuccessModal from './components/OrderSuccessModal.jsx';
import WhatsAppFloating from './components/WhatsAppFloating.jsx';
import HomePage from './pages/HomePage.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';

export default function App() {
  const { lang } = useLanguage();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'admin'
  const [settings, setSettings] = useState({});
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  const loadData = async () => {
    try {
      setDataLoading(true);
      const [settRes, catRes, prodRes] = await Promise.all([
        api.getSettings(),
        api.getCategories(),
        api.getProducts(),
      ]);

      if (settRes.success) setSettings(settRes.settings || {});
      if (catRes.success) setCategories(catRes.categories || []);
      if (prodRes.success) setProducts(prodRes.products || []);
    } catch (err) {
      console.error('Failed to load store data:', err);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSettingsUpdated = (newSettings) => {
    setSettings(newSettings);
  };

  // If viewing admin portal
  if (activeTab === 'admin') {
    if (authLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
          <p className="font-semibold text-sm animate-pulse">Verifying secure session...</p>
        </div>
      );
    }

    if (!isAuthenticated) {
      return (
        <AdminLogin onBackToHome={() => setActiveTab('home')} />
      );
    }

    return (
      <AdminDashboard
        onBackToStore={() => {
          setActiveTab('home');
          loadData(); // Refresh data in case edits were made
        }}
        settings={settings}
        onSettingsUpdated={handleSettingsUpdated}
      />
    );
  }

  // Customer facing website
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar
        settings={settings}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main className="flex-1">
        <HomePage
          settings={settings}
          products={products}
          categories={categories}
          loading={dataLoading}
        />
      </main>

      <Footer
        settings={settings}
        onAdminClick={() => setActiveTab('admin')}
      />

      {/* Slide-over Customer Cart / Order Submission Drawer */}
      <CartDrawer />

      {/* Order Confirmation Screen with Order Number & WhatsApp share */}
      <OrderSuccessModal settings={settings} />

      {/* Floating Action Button for WhatsApp and Direct Phone Call */}
      <WhatsAppFloating settings={settings} />
    </div>
  );
}
