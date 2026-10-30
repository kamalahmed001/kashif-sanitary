import React from 'react';
import { Printer, X } from 'lucide-react';

export default function PrintDeliverySlip({ order, onClose, settings = {} }) {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const businessName = settings.business_name_en || 'Kashif Sanitary Supplies';
  const tagline = settings.tagline_en || 'Quality Products. Reliable Supply.';
  const phone = settings.phone || '+92 300 1234567';
  const address = settings.address_en || 'Sanitary Market, Main Boulevard, Lahore';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative my-8">
        {/* Actions Bar (hidden when printing) */}
        <div className="no-print flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-800">Delivery Packing Slip</span>
            <span className="text-xs px-2 py-0.5 rounded bg-brand-100 text-brand-800 font-mono">
              {order.order_number}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs sm:text-sm font-bold shadow-md"
            >
              <Printer className="w-4 h-4" />
              <span>Print Delivery Slip</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div className="printable-area space-y-6 text-slate-900">
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
                {businessName}
              </h1>
              <p className="text-xs font-semibold text-slate-600 tracking-wider">
                {tagline}
              </p>
              <p className="text-xs text-slate-500 mt-1">{address}</p>
              <p className="text-xs text-slate-500">Phone: {phone}</p>
            </div>

            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-slate-900 text-white text-xs font-bold rounded uppercase tracking-wider mb-1">
                DELIVERY CHALLAN / SLIP
              </span>
              <p className="font-mono text-base font-bold text-slate-900">{order.order_number}</p>
              <p className="text-xs text-slate-500">
                Date: {new Date(order.created_at).toLocaleDateString()}
              </p>
              <p className="text-xs font-semibold uppercase text-brand-700">
                Status: {order.status}
              </p>
            </div>
          </div>

          {/* Customer / Consignee Info Box */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-slate-50 border border-slate-300 text-xs">
            <div>
              <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">
                DELIVER TO (CUSTOMER / SHOP)
              </span>
              <p className="text-sm font-black text-slate-900">{order.customer_name}</p>
              {order.shop_name && (
                <p className="font-bold text-slate-700">Shop: {order.shop_name}</p>
              )}
              <p className="font-mono text-slate-800 mt-0.5">Contact: {order.phone}</p>
            </div>

            <div>
              <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">
                DESTINATION & CARGO
              </span>
              <p className="font-bold text-slate-800">City: {order.city}</p>
              <p className="text-slate-700 mt-0.5">Address: {order.address}</p>
              {order.notes && (
                <div className="mt-2 p-2 rounded bg-amber-50 border border-amber-200 text-amber-900">
                  <span className="font-bold">Instructions: </span>
                  {order.notes}
                </div>
              )}
            </div>
          </div>

          {/* Ordered Line Items Table */}
          <div>
            <table className="w-full text-xs text-left border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-bold uppercase text-[11px] border-b border-slate-300">
                  <th className="p-2 border border-slate-300 w-10 text-center">#</th>
                  <th className="p-2 border border-slate-300">Product Description</th>
                  <th className="p-2 border border-slate-300 w-28 text-center">Size / Variant</th>
                  <th className="p-2 border border-slate-300 w-16 text-center">Unit</th>
                  <th className="p-2 border border-slate-300 w-20 text-center">Qty</th>
                  <th className="p-2 border border-slate-300 w-24 text-right">Unit Rate</th>
                  <th className="p-2 border border-slate-300 w-24 text-right">Total (PKR)</th>
                </tr>
              </thead>
              <tbody>
                {(order.items || []).map((item, index) => (
                  <tr key={index} className="border-b border-slate-200">
                    <td className="p-2 border border-slate-300 text-center font-mono">{index + 1}</td>
                    <td className="p-2 border border-slate-300 font-medium">
                      <div className="font-bold text-slate-900">{item.product_name_en}</div>
                      <div className="text-[11px] text-slate-500 font-urdu">{item.product_name_ur}</div>
                    </td>
                    <td className="p-2 border border-slate-300 text-center font-mono text-slate-700">
                      {item.variant || 'Standard'}
                    </td>
                    <td className="p-2 border border-slate-300 text-center">{item.unit || 'Piece'}</td>
                    <td className="p-2 border border-slate-300 text-center font-mono font-bold text-sm text-slate-900">
                      {item.quantity}
                    </td>
                    <td className="p-2 border border-slate-300 text-right font-mono">
                      {item.is_price_on_request || !item.unit_price ? 'Rate On Req.' : Number(item.unit_price).toLocaleString()}
                    </td>
                    <td className="p-2 border border-slate-300 text-right font-mono font-bold">
                      {item.is_price_on_request || !item.line_total ? '-' : Number(item.line_total).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 font-bold border-t-2 border-slate-400">
                  <td colSpan="4" className="p-2 border border-slate-300 text-right uppercase">
                    Total Quantity / Items:
                  </td>
                  <td className="p-2 border border-slate-300 text-center font-mono text-base">
                    {order.total_items}
                  </td>
                  <td className="p-2 border border-slate-300 text-right uppercase">
                    Est. Total:
                  </td>
                  <td className="p-2 border border-slate-300 text-right font-mono text-base text-slate-900">
                    {order.estimated_total > 0 ? `PKR ${Number(order.estimated_total).toLocaleString()}` : 'Rate on Call'}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Delivery & Signatures Footer */}
          <div className="pt-8 grid grid-cols-3 gap-6 text-xs text-center border-t border-slate-200 mt-6">
            <div>
              <div className="border-b border-slate-400 pb-8 mb-2"></div>
              <p className="font-bold text-slate-700">Packed By (Warehouse)</p>
            </div>
            <div>
              <div className="border-b border-slate-400 pb-8 mb-2"></div>
              <p className="font-bold text-slate-700">Cargo / Transport Partner</p>
            </div>
            <div>
              <div className="border-b border-slate-400 pb-8 mb-2"></div>
              <p className="font-bold text-slate-700">Receiver Stamp & Signature</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
