import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { api } from '../../api.js';
import { Plus, Edit2, Trash2, Layers, X, AlertCircle } from 'lucide-react';

export default function CategoriesManager() {
  const { lang, t } = useLanguage();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    name_en: '',
    name_ur: '',
    slug: '',
    description_en: '',
    description_ur: '',
    display_order: 0,
    is_active: 1,
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminCategories();
      if (res.success) {
        setCategories(res.categories || []);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    setFormData({
      name_en: '',
      name_ur: '',
      slug: '',
      description_en: '',
      description_ur: '',
      display_order: categories.length + 1,
      is_active: 1,
    });
    setErrorMsg('');
    setModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name_en: cat.name_en || '',
      name_ur: cat.name_ur || '',
      slug: cat.slug || '',
      description_en: cat.description_en || '',
      description_ur: cat.description_ur || '',
      display_order: cat.display_order ?? 0,
      is_active: cat.is_active ?? 1,
    });
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category? Associated products may lose their category link.')) return;
    try {
      const res = await api.deleteCategory(id);
      if (res.success) {
        setCategories((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (err) {
      alert(err.message || 'Failed to delete category');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name_en.trim() || !formData.name_ur.trim()) {
      setErrorMsg('Category name in both English and Urdu is required');
      return;
    }

    try {
      setSubmitting(true);
      if (editingCategory) {
        const res = await api.updateCategory(editingCategory.id, formData);
        if (res.success) {
          setModalOpen(false);
          fetchCategories();
        }
      } else {
        const res = await api.createCategory(formData);
        if (res.success) {
          setModalOpen(false);
          fetchCategories();
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900">Product Categories</h3>
          <p className="text-xs text-slate-500">Organize sanitary products into customer-facing filter sections.</p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center gap-2 shadow-md shadow-brand-600/25"
        >
          <Plus className="w-4 h-4" />
          <span>{t('addCategory')}</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">No categories configured yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm text-left rtl:text-right border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[11px] font-bold tracking-wider">
                  <th className="p-3 sm:p-4 w-16 text-center">Order</th>
                  <th className="p-3 sm:p-4">Category Name (English & Urdu)</th>
                  <th className="p-3 sm:p-4">Slug</th>
                  <th className="p-3 sm:p-4 text-center">Products Count</th>
                  <th className="p-3 sm:p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 sm:p-4 text-center font-mono font-bold text-slate-500">
                      {cat.display_order}
                    </td>
                    <td className="p-3 sm:p-4">
                      <div className="font-bold text-slate-900">{cat.name_en}</div>
                      <div className="text-xs text-slate-500 font-urdu">{cat.name_ur}</div>
                    </td>
                    <td className="p-3 sm:p-4 font-mono text-slate-600 text-xs">
                      {cat.slug}
                    </td>
                    <td className="p-3 sm:p-4 text-center font-mono font-bold text-brand-700">
                      {cat.product_count || 0}
                    </td>
                    <td className="p-3 sm:p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(cat)}
                          className="p-1.5 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-lg"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Category Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 end-5 p-2 rounded-lg text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {editingCategory ? t('editCategory') : t('addCategory')}
            </h3>

            {errorMsg && (
              <div className="p-3 mb-4 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Category Name (English) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name_en}
                  onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                  placeholder="e.g. Pipes & Fittings"
                  className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Category Name (Urdu) *
                </label>
                <input
                  type="text"
                  required
                  dir="rtl"
                  value={formData.name_ur}
                  onChange={(e) => setFormData({ ...formData, name_ur: e.target.value })}
                  placeholder="مثلاً: پائپ اور فٹنگز"
                  className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-lg font-urdu"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Slug
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="pipes-fittings"
                    className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: Number(e.target.value) })}
                    className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : t('saveCategory')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
