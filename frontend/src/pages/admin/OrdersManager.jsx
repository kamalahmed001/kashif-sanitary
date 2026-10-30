import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { api } from '../../api.js';
import PrintDeliverySlip from '../../components/PrintDeliverySlip.jsx';
import {
  Search,
  Filter,
  Calendar,
  Eye,
  Printer,
  Trash2,
  Clock,
  CheckCircle,
  PhoneCall,
  Package,
  X,
  AlertCircle,
  RefreshCw,
  Bell,
} from 'lucide-react';

export default function OrdersManager({ settings = {} }) {
  const { lang, t } = useLanguage();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Selected Order for Modal View
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Selected Order for Printable Delivery Slip
  const [printOrder, setPrintOrder] = useState(null);

  // Status updating state
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminOrders({
        search,
        status: statusFilter,
        date_from: dateFrom,
        date_to: dateTo,
      });
      if (res.success) {
        setOrders(res.orders || []);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, dateFrom, dateTo]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      const res = await api.updateOrderStatus(orderId, newStatus);
      if (res.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
        }
      }
    } catch (err) {
      alert(err.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const openOrderDetails = async (orderId) => {
    try {
      setDetailLoading(true);
      const res = await api.getAdminOrder(orderId);
      if (res.success && res.order) {
        setSelectedOrder(res.order);
      }
    } catch (err) {
      alert('Failed to load order details');
    } finally {
      setDetailLoading(false);
    }
  };

  const openPrintSlip = async (orderId) => {
    try {
      const res = await api.getAdminOrder(orderId);
      if (res.success && res.order) {
        setPrintOrder(res.order);
      }
    } catch (err) {
      alert('Failed to load order for printing');
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to permanently delete this order?')) return;
    try {
      const res = await api.deleteOrder(orderId);
      if (res.success) {
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(null);
        }
      }
    } catch (err) {
      alert(err.message || 'Failed to delete order');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'New':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Confirmed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Contacted':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Preparing':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Completed':
        return 'bg-slate-100 text-slate-800 border-slate-300';
      case 'Cancelled':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Search & Filter Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('searchOrders')}
              className="w-full ps-9 pe-20 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50"
            />
            <button
              type="submit"
              className="absolute end-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-brand-600 text-white rounded-lg text-xs font-bold hover:bg-brand-700"
            >
              Search
            </button>
          </form>

          <div className="flex flex-wrap items-center gap-3">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5 text-xs font-medium">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 font-medium text-slate-700"
              >
                <option value="All">{t('allStatuses')}</option>
                <option value="New">{t('statusNew')}</option>
                <option value="Confirmed">{t('statusConfirmed')}</option>
                <option value="Contacted">{t('statusContacted')}</option>
                <option value="Preparing">{t('statusPreparing')}</option>
                <option value="Completed">{t('statusCompleted')}</option>
                <option value="Cancelled">{t('statusCancelled')}</option>
              </select>
            </div>

            {/* Date Filters */}
            <div className="flex items-center gap-2 text-xs font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-2 py-1 border border-slate-200 rounded-lg bg-slate-50 text-slate-700"
                title="From Date"
              />
              <span className="text-slate-400">to</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="px-2 py-1 border border-slate-200 rounded-lg bg-slate-50 text-slate-700"
                title="To Date"
              />
            </div>

            <button
              onClick={fetchOrders}
              className="p-2 border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-600"
              title="Refresh Orders"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-600" />
            Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            <Package className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            {t('noOrdersFound')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm text-left rtl:text-right border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[11px] font-bold tracking-wider">
                  <th className="p-3 sm:p-4">Order #</th>
                  <th className="p-3 sm:p-4">{t('orderDate')}</th>
                  <th className="p-3 sm:p-4">{t('orderCustomer')}</th>
                  <th className="p-3 sm:p-4">{t('orderPhone')}</th>
                  <th className="p-3 sm:p-4 text-center">{t('orderItemsCount')}</th>
                  <th className="p-3 sm:p-4">{t('orderStatus')}</th>
                  <th className="p-3 sm:p-4 text-center">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 sm:p-4 font-mono font-bold text-brand-700">
                      {ord.order_number}
                    </td>
                    <td className="p-3 sm:p-4 text-slate-500 whitespace-nowrap">
                      {new Date(ord.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-3 sm:p-4">
                      <div className="font-bold text-slate-900">{ord.customer_name}</div>
                      {ord.shop_name && (
                        <div className="text-xs text-brand-600 font-semibold">{ord.shop_name}</div>
                      )}
                      <div className="text-[11px] text-slate-400">{ord.city}</div>
                    </td>
                    <td className="p-3 sm:p-4 font-mono text-slate-700">
                      <a href={`tel:${ord.phone.replace(/[^0-9+]/g, '')}`} className="hover:underline text-brand-700">
                        {ord.phone}
                      </a>
                    </td>
                    <td className="p-3 sm:p-4 text-center font-mono font-bold text-slate-800">
                      {ord.total_items}
                    </td>
                    <td className="p-3 sm:p-4">
                      <select
                        value={ord.status}
                        disabled={updatingId === ord.id}
                        onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg border focus:outline-none ${getStatusColor(
                          ord.status
                        )}`}
                      >
                        <option value="New">New</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Preparing">Preparing</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="p-3 sm:p-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => openOrderDetails(ord.id)}
                          className="p-1.5 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                          title={t('viewDetails')}
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => openPrintSlip(ord.id)}
                          className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title={t('printOrder')}
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteOrder(ord.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Order"
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

      {/* Single Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-5 end-5 p-2 rounded-lg text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-4">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Order Details
                </span>
                <div className="flex flex-wrap items-center justify-between gap-2 mt-1">
                  <h3 className="text-xl font-black font-mono text-brand-700">
                    {selectedOrder.order_number}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Placed on: {new Date(selectedOrder.created_at).toLocaleString()}
                </p>
              </div>

              {/* Customer Info Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 font-bold block mb-1">CUSTOMER</span>
                  <p className="font-bold text-slate-900 text-sm">{selectedOrder.customer_name}</p>
                  {selectedOrder.shop_name && (
                    <p className="text-brand-700 font-semibold">Shop: {selectedOrder.shop_name}</p>
                  )}
                  <p className="font-mono text-slate-700 mt-1">Phone: {selectedOrder.phone}</p>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block mb-1">DELIVERY ADDRESS</span>
                  <p className="font-bold text-slate-800">City: {selectedOrder.city}</p>
                  <p className="text-slate-600 mt-0.5">{selectedOrder.address}</p>
                  {selectedOrder.notes && (
                    <div className="mt-2 p-2 rounded bg-amber-50 text-amber-900 border border-amber-200">
                      <span className="font-bold">Notes: </span>
                      {selectedOrder.notes}
                    </div>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Ordered Items ({selectedOrder.total_items} items total)
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
                  {(selectedOrder.items || []).map((it, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between gap-3">
                      <div>
                        <div className="font-bold text-slate-900">{it.product_name_en}</div>
                        <div className="text-[11px] text-slate-500 font-urdu">{it.product_name_ur}</div>
                        {it.variant && (
                          <span className="inline-block mt-0.5 px-2 py-0.5 rounded bg-brand-50 text-brand-700 font-semibold text-[10px]">
                            {it.variant}
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-sm text-slate-900">
                          {it.quantity} {it.unit || 'Piece'}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {it.is_price_on_request || !it.unit_price ? 'Rate On Call' : `PKR ${Number(it.unit_price).toLocaleString()} / ${it.unit}`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  onClick={() => openPrintSlip(selectedOrder.id)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md shadow-emerald-600/20"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Delivery Slip</span>
                </button>

                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print Delivery Slip Modal */}
      {printOrder && (
        <PrintDeliverySlip
          order={printOrder}
          settings={settings}
          onClose={() => setPrintOrder(null)}
        />
      )}
    </div>
  );
}
