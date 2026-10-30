import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { api } from '../../api.js';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Package,
  X,
  Check,
  AlertCircle,
  Tag,
  Layers,
  Image as ImageIcon,
} from 'lucide-react';

export default function ProductsManager() {
  const { lang, t } = useLanguage();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name_en: '',
    name_ur: '',
    sku: '',
    category_id: '',
    price: 0,
    is_price_on_request: 0,
    unit: 'Piece',
    variants: '',
    is_available: 1,
    is_featured: 0,
    image_url: '',
    description_en: '',
    description_ur: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        api.getAdminProducts(),
        api.getAdminCategories(),
      ]);

      if (prodRes.success) setProducts(prodRes.products || []);
      if (catRes.success) setCategories(catRes.categories || []);
    } catch (err) {
      console.error('Failed to load products/categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name_en: '',
      name_ur: '',
      sku: '',
      category_id: categories.length > 0 ? categories[0].id : '',
      price: 0,
      is_price_on_request: 0,
      unit: 'Piece',
      variants: '1/2 inch, 3/4 inch, 1 inch',
      is_available: 1,
      is_featured: 0,
      image_url: '',
      description_en: '',
      description_ur: '',
    });
    setErrorMsg('');
    setModalOpen(true);
  };

  const openEditModal = (prod) => {
    setEditingProduct(prod);
    setFormData({
      name_en: prod.name_en || '',
      name_ur: prod.name_ur || '',
      sku: prod.sku || '',
      category_id: prod.category_id || '',
      price: prod.price || 0,
      is_price_on_request: prod.is_price_on_request ? 1 : 0,
      unit: prod.unit || 'Piece',
      variants: Array.isArray(prod.variants) ? prod.variants.join(', ') : '',
      is_available: prod.is_available ?? 1,
      is_featured: prod.is_featured ? 1 : 0,
      image_url: prod.image_url || '',
      description_en: prod.description_en || '',
      description_ur: prod.description_ur || '',
    });
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await api.deleteProduct(id);
      if (res.success) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      alert(err.message || 'Failed to delete product');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name_en.trim() || !formData.name_ur.trim()) {
      setErrorMsg('Product name in both English and Urdu is required');
      return;
    }

    try {
      setSubmitting(true);

      // Parse variants
      const parsedVariants = formData.variants
        ? formData.variants
            .split(/[\n,]+/)
            .map((v) => v.trim())
            .filter(Boolean)
        : [];

      const payload = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        variants: parsedVariants,
      };

      if (editingProduct) {
        const res = await api.updateProduct(editingProduct.id, payload);
        if (res.success) {
          setModalOpen(false);
          fetchData();
        }
      } else {
        const res = await api.createProduct(payload);
        if (res.success) {
          setModalOpen(false);
          fetchData();
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered products
  const filtered = products.filter((p) => {
    const catMatch =
      filterCategory === 'all' || String(p.category_id) === String(filterCategory);
    const searchMatch =
      !searchTerm.trim() ||
      p.name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.name_ur.includes(searchTerm) ||
      (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()));
    return catMatch && searchMatch;
  });

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products by name or SKU..."
              className="w-full ps-9 pe-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl bg-slate-50 font-medium text-slate-700"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name_en}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-md shadow-brand-600/25"
        >
          <Plus className="w-4 h-4" />
          <span>{t('addProduct')}</span>
        </button>
      </div>

      {/* Products Grid / Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading products...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No products found matching filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm text-left rtl:text-right border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[11px] font-bold tracking-wider">
                  <th className="p-3 sm:p-4">Product</th>
                  <th className="p-3 sm:p-4">Category</th>
                  <th className="p-3 sm:p-4">SKU / Code</th>
                  <th className="p-3 sm:p-4 text-center">Unit</th>
                  <th className="p-3 sm:p-4 text-right">Price</th>
                  <th className="p-3 sm:p-4 text-center">Availability</th>
                  <th className="p-3 sm:p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 sm:p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={prod.image_url || 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=150&q=80'}
                          alt={prod.name_en}
                          className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-200"
                        />
                        <div>
                          <div className="font-bold text-slate-900">{prod.name_en}</div>
                          <div className="text-xs text-slate-500 font-urdu">{prod.name_ur}</div>
                          {prod.variants && prod.variants.length > 0 && (
                            <div className="text-[11px] text-amber-700 font-mono mt-0.5">
                              {prod.variants.join(' | ')}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-3 sm:p-4 text-slate-600 font-medium">
                      {prod.category_name_en || '-'}
                    </td>
                    <td className="p-3 sm:p-4 font-mono text-slate-600">
                      {prod.sku || '-'}
                    </td>
                    <td className="p-3 sm:p-4 text-center font-medium text-slate-600">
                      {prod.unit}
                    </td>
                    <td className="p-3 sm:p-4 text-right font-mono font-bold text-slate-900">
                      {prod.is_price_on_request || !prod.price ? (
                        <span className="text-brand-600 text-xs font-sans">Request Price</span>
                      ) : (
                        `PKR ${Number(prod.price).toLocaleString()}`
                      )}
                    </td>
                    <td className="p-3 sm:p-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                          prod.is_available === 1
                            ? 'bg-emerald-100 text-emerald-800'
                            : prod.is_available === 2
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {prod.is_available === 1
                          ? 'In Stock'
                          : prod.is_available === 2
                          ? 'On Order'
                          : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="p-3 sm:p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(prod)}
                          className="p-1.5 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-lg"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(prod.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                          title="Delete Product"
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

      {/* Product Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 end-5 p-2 rounded-lg text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-slate-900 mb-1">
              {editingProduct ? t('editProduct') : t('addProduct')}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter product details in both English and Urdu for dual-language catalog support.
            </p>

            {errorMsg && (
              <div className="p-3 mb-4 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('productNameEn')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name_en}
                    onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                    placeholder="e.g. PPRC 90° Elbow (L-Bow)"
                    className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('productNameUr')} *
                  </label>
                  <input
                    type="text"
                    required
                    dir="rtl"
                    value={formData.name_ur}
                    onChange={(e) => setFormData({ ...formData, name_ur: e.target.value })}
                    placeholder="مثلاً: پی پی آر سی 90 ڈگری ایلبو"
                    className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 font-urdu"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('category')}
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="">No Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name_en}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('sku')}
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="e.g. PPR-ELB-90"
                    className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('productUnit')}
                  </label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="Piece, Bundle, Meter, Carton"
                    className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('pricePkr')}
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    disabled={formData.is_price_on_request === 1}
                    className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-lg font-mono disabled:opacity-50"
                  />
                  <label className="inline-flex items-center gap-2 mt-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_price_on_request === 1}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          is_price_on_request: e.target.checked ? 1 : 0,
                        })
                      }
                      className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                    />
                    <span>{t('isPriceOnRequest')}</span>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('availability')}
                  </label>
                  <select
                    value={formData.is_available}
                    onChange={(e) => setFormData({ ...formData, is_available: Number(e.target.value) })}
                    className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value={1}>In Stock</option>
                    <option value={2}>Available on Order</option>
                    <option value={0}>Out of Stock</option>
                  </select>

                  <label className="inline-flex items-center gap-2 mt-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_featured === 1}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          is_featured: e.target.checked ? 1 : 0,
                        })
                      }
                      className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                    />
                    <span>{t('featuredOnHome')}</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('variantsHelp')}
                </label>
                <input
                  type="text"
                  value={formData.variants}
                  onChange={(e) => setFormData({ ...formData, variants: e.target.value })}
                  placeholder="e.g. 1/2 inch (20mm), 3/4 inch (25mm), 1 inch (32mm)"
                  className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('imageUrl')}
                </label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-lg font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('descriptionEn')}
                  </label>
                  <textarea
                    rows="2"
                    value={formData.description_en}
                    onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                    className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-lg"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('descriptionUr')}
                  </label>
                  <textarea
                    rows="2"
                    dir="rtl"
                    value={formData.description_ur}
                    onChange={(e) => setFormData({ ...formData, description_ur: e.target.value })}
                    className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-lg font-urdu"
                  ></textarea>
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
                  {submitting ? 'Saving...' : t('saveProduct')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
