import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { api } from '../../api.js';
import {
  Calculator,
  Printer,
  CheckSquare,
  Square,
  RefreshCw,
  Layers,
  ChevronDown,
  ChevronRight,
  Info,
  Building2,
  FileSpreadsheet,
} from 'lucide-react';

export default function PurchasingSummary({ settings = {} }) {
  const { lang, t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [summaryData, setSummaryData] = useState([]);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [selectedOrderIds, setSelectedOrderIds] = useState(new Set());
  const [statusFilter, setStatusFilter] = useState('New,Confirmed,Preparing');
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [totalQuantityAll, setTotalQuantityAll] = useState(0);

  // Fetch initial summary and orders
  const loadPurchasingData = async (orderIdsArray = null) => {
    try {
      setLoading(true);
      const params = {};
      if (orderIdsArray && orderIdsArray.length > 0) {
        params.order_ids = orderIdsArray.join(',');
      } else {
        params.statuses = statusFilter;
      }

      const res = await api.getPurchasingSummary(params);
      if (res.success) {
        setSummaryData(res.summary || []);
        setAvailableOrders(res.availableOrders || []);
        setTotalQuantityAll(res.totalQuantityAll || 0);

        // Update selected set if not set yet or refreshed
        if (!orderIdsArray) {
          const ids = new Set((res.includedOrderIds || []).map(Number));
          setSelectedOrderIds(ids);
        }
      }
    } catch (err) {
      console.error('Failed to load purchasing summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPurchasingData();
  }, [statusFilter]);

  const handleToggleOrder = (orderId) => {
    const nextSet = new Set(selectedOrderIds);
    if (nextSet.has(orderId)) {
      nextSet.delete(orderId);
    } else {
      nextSet.add(orderId);
    }
    setSelectedOrderIds(nextSet);
    // Recalculate with chosen orders
    loadPurchasingData(Array.from(nextSet));
  };

  const handleSelectAll = () => {
    const allIds = availableOrders.map((o) => o.id);
    const nextSet = new Set(allIds);
    setSelectedOrderIds(nextSet);
    loadPurchasingData(allIds);
  };

  const handleDeselectAll = () => {
    setSelectedOrderIds(new Set());
    setSummaryData([]);
    setTotalQuantityAll(0);
  };

  const toggleExpand = (key) => {
    const next = new Set(expandedItems);
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    setExpandedItems(next);
  };

  const handlePrint = () => {
    window.print();
  };

  const businessName = settings.business_name_en || 'Kashif Sanitary Supplies';
  const tagline = settings.tagline_en || 'Quality Products. Reliable Supply.';

  return (
    <div className="space-y-6">
      {/* Top Banner & Procurement Overview */}
      <div className="no-print bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 uppercase tracking-wider mb-1">
            <Calculator className="w-4 h-4" />
            <span>Procurement & Wholesale Supply</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            {t('purchasingTitle')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {t('purchasingSubtitle')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => loadPurchasingData(Array.from(selectedOrderIds))}
            className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5"
            title="Recalculate summary"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{t('recalculate')}</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md shadow-brand-600/20"
          >
            <Printer className="w-4 h-4" />
            <span>{t('printPurchasingList')}</span>
          </button>
        </div>
      </div>

      {/* Order Selection Checklist Card */}
      <div className="no-print bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">
              {t('includeOrdersPrompt')}
            </h3>
            <p className="text-[11px] text-slate-400">
              {t('excludeCancelledNote')} Only checked orders contribute to item counts below.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSelectAll}
              className="text-xs font-bold text-brand-600 hover:text-brand-700"
            >
              {t('selectAll')}
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={handleDeselectAll}
              className="text-xs font-bold text-slate-500 hover:text-slate-700"
            >
              {t('deselectAll')}
            </button>
          </div>
        </div>

        {/* Orders Checklist Badges */}
        {availableOrders.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No eligible active orders found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto p-1">
            {availableOrders.map((ord) => {
              const isChecked = selectedOrderIds.has(ord.id);
              return (
                <div
                  key={ord.id}
                  onClick={() => handleToggleOrder(ord.id)}
                  className={`p-2.5 rounded-xl border text-xs cursor-pointer select-none transition-all flex items-start gap-2.5 ${
                    isChecked
                      ? 'bg-brand-50/80 border-brand-300 text-brand-950 font-medium'
                      : 'bg-slate-50 border-slate-200 text-slate-500 opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="mt-0.5 text-brand-600 shrink-0">
                    {isChecked ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-900">{ord.order_number}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white border border-slate-200 font-semibold">
                        {ord.status}
                      </span>
                    </div>
                    <div className="font-semibold text-slate-800 truncate mt-0.5">
                      {ord.shop_name ? `${ord.shop_name} (${ord.customer_name})` : ord.customer_name}
                    </div>
                    <div className="text-[10px] text-slate-500 flex items-center justify-between mt-0.5">
                      <span>{new Date(ord.created_at).toLocaleDateString()}</span>
                      <span className="font-mono font-bold">{ord.total_items} items</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Aggregate Purchasing Summary Table & Printable Sheet */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden printable-area">
        {/* Printable Sheet Header */}
        <div className="p-6 border-b border-slate-200 flex justify-between items-start">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">
              {businessName} - PURCHASING SUMMARY
            </h1>
            <p className="text-xs font-medium text-slate-500 tracking-wider">
              {tagline}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Generated: {new Date().toLocaleString()} • Active Included Orders: {selectedOrderIds.size}
            </p>
          </div>

          <div className="text-right">
            <span className="inline-block px-3 py-1 bg-brand-900 text-white text-xs font-bold rounded uppercase tracking-wider mb-1">
              BULK WAREHOUSE PROCUREMENT
            </span>
            <div className="text-xs text-slate-600 font-bold">
              Total Required Units: <span className="font-mono text-base text-slate-900">{totalQuantityAll}</span>
            </div>
            <div className="text-[11px] text-slate-400">
              Total Product Variants: <span className="font-mono font-bold">{summaryData.length}</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-600" />
            Calculating combined order totals...
          </div>
        ) : summaryData.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            <Info className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            {t('noActiveOrdersForSummary')}
          </div>
        ) : (
          <div>
            <table className="w-full text-xs sm:text-sm text-left rtl:text-right border-collapse">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-300 text-slate-700 uppercase text-[11px] font-bold tracking-wider">
                  <th className="p-3 sm:p-4 w-12 text-center">#</th>
                  <th className="p-3 sm:p-4">{t('productAndVariant')}</th>
                  <th className="p-3 sm:p-4 w-28 text-center">{t('procurementUnit')}</th>
                  <th className="p-3 sm:p-4 w-36 text-center bg-brand-50/50 font-black text-brand-900 border-x border-brand-200">
                    {t('totalRequiredQty')}
                  </th>
                  <th className="p-3 sm:p-4 w-32 text-center no-print">Orders Count</th>
                  <th className="p-3 sm:p-4 no-print">{t('orderBreakdown')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {summaryData.map((item, index) => {
                  const itemKey = `${item.product_name_en}-${item.variant}-${item.unit}`;
                  const isExpanded = expandedItems.has(itemKey);

                  return (
                    <React.Fragment key={index}>
                      <tr className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 sm:p-4 text-center font-mono font-bold text-slate-400">
                          {index + 1}
                        </td>
                        <td className="p-3 sm:p-4">
                          <div className="font-bold text-slate-900 text-sm sm:text-base">
                            {item.product_name_en}
                          </div>
                          <div className="text-xs text-slate-500 font-urdu mt-0.5">
                            {item.product_name_ur}
                          </div>
                          {item.variant && (
                            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 font-bold text-xs border border-amber-200 font-mono">
                              Size / Variant: {item.variant}
                            </span>
                          )}
                          {item.category_name_en && (
                            <span className="inline-block ms-2 text-[10px] text-slate-400 uppercase font-semibold">
                              ({item.category_name_en})
                            </span>
                          )}
                        </td>
                        <td className="p-3 sm:p-4 text-center font-semibold text-slate-600">
                          {item.unit || 'Piece'}
                        </td>
                        <td className="p-3 sm:p-4 text-center bg-brand-50/30 border-x border-brand-200">
                          <span className="font-mono font-black text-base sm:text-xl text-brand-900 bg-white px-3 py-1 rounded-lg border border-brand-200 shadow-sm inline-block">
                            {item.total_quantity}
                          </span>
                        </td>
                        <td className="p-3 sm:p-4 text-center font-mono font-semibold text-slate-600 no-print">
                          {item.total_orders_count} orders
                        </td>
                        <td className="p-3 sm:p-4 no-print">
                          {item.breakdown && item.breakdown.length > 0 && (
                            <div>
                              <button
                                onClick={() => toggleExpand(itemKey)}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-800"
                              >
                                <span>{item.breakdown.length} Shops / Clients</span>
                                {isExpanded ? (
                                  <ChevronDown className="w-3.5 h-3.5" />
                                ) : (
                                  <ChevronRight className="w-3.5 h-3.5" />
                                )}
                              </button>

                              {isExpanded && (
                                <div className="mt-2 space-y-1 p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                                  {item.breakdown.map((b, bIdx) => (
                                    <div
                                      key={bIdx}
                                      className="flex items-center justify-between gap-2 border-b border-slate-100 last:border-0 pb-1"
                                    >
                                      <div>
                                        <span className="font-bold text-slate-800">{b.client}</span>
                                        <span className="text-[10px] text-slate-400 ms-1 font-mono">
                                          ({b.order_number} - {b.city})
                                        </span>
                                      </div>
                                      <span className="font-mono font-bold text-slate-900">
                                        {b.quantity} {item.unit || 'pcs'}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 font-bold border-t-2 border-slate-400 text-slate-900">
                  <td colSpan="3" className="p-4 text-right uppercase text-xs sm:text-sm">
                    Grand Total Required Units (All Selected Products):
                  </td>
                  <td className="p-4 text-center bg-brand-100 text-brand-950 font-black font-mono text-lg sm:text-2xl border-x border-brand-300">
                    {totalQuantityAll}
                  </td>
                  <td colSpan="2" className="p-4 no-print"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* Footer Notes for Warehouse / Supplier Dispatch */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>
            * Note: This purchasing list aggregates demand across active retail and customer orders. Verify supplier inventory and packing standards before release.
          </p>
          <div className="flex items-center gap-4 text-slate-700 font-bold shrink-0">
            <span>Prepared By: Admin</span>
            <span>Verified: _____________</span>
          </div>
        </div>
      </div>
    </div>
  );
}
