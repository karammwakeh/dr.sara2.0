import React, { useState, useEffect } from 'react';
import { Search, Eye, X } from 'lucide-react';

const API = '/api/admin';
const authH = () => ({ Authorization: `Bearer ${localStorage.getItem('admin_token')}` });

const statusOptions = [
  { value: 'pending', label: 'جديد', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'processing', label: 'قيد التجهيز', color: 'bg-blue-100 text-blue-700' },
  { value: 'shipped', label: 'تم الشحن', color: 'bg-purple-100 text-purple-700' },
  { value: 'delivered', label: 'تم التوصيل', color: 'bg-green-100 text-green-700' },
  { value: 'cancelled', label: 'ملغي', color: 'bg-red-100 text-red-700' },
];

const StatusBadge = ({ status }) => {
  const s = statusOptions.find(o => o.value === status) || { label: status, color: 'bg-gray-100 text-gray-600' };
  return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${s.color}`}>{s.label}</span>;
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selected, setSelected] = useState(null);
  const [tracking, setTracking] = useState('');

  const load = async () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: 50 });
    if (filterStatus) params.append('status', filterStatus);
    const res = await fetch(`${API}/orders?${params}`, { headers: authH() });
    const data = await res.json();
    setOrders(data.orders || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [filterStatus]);

  const updateStatus = async (id, status) => {
    await fetch(`${API}/orders/${id}/status`, {
      method: 'PATCH', headers: { ...authH(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, tracking_number: tracking || undefined }),
    });
    if (selected?.id === id) setSelected(p => ({ ...p, status }));
    load();
  };

  const filtered = orders.filter(o =>
    o.order_number?.includes(search) ||
    o.customer_name?.includes(search) ||
    o.customer_email?.includes(search)
  );

  return (
    <div className="space-y-4" dir="rtl">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search size={16} className="absolute right-3 top-3 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="pr-9 pl-4 py-2 border rounded-xl focus:ring-2 focus:ring-yellow-400 focus:outline-none text-right w-56"
            placeholder="بحث برقم الطلب أو الاسم..." />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-4 py-2 border rounded-xl focus:outline-none text-right">
          <option value="">كل الطلبات</option>
          {statusOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <div className="text-sm text-gray-500 flex items-center">{filtered.length} طلب</div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {['رقم الطلب', 'العميل', 'المبلغ', 'الشحن', 'الدفع', 'الحالة', ''].map(h => (
                <th key={h} className="px-4 py-3 text-right font-semibold text-gray-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={7} className="text-center py-12 text-gray-400">جاري التحميل...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-gray-400">لا توجد طلبات</td></tr>
            ) : filtered.map(o => (
              <tr key={o.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => { setSelected(o); setTracking(o.tracking_number || ''); }}>
                <td className="px-4 py-3 font-mono text-xs font-bold text-gray-700">{o.order_number}</td>
                <td className="px-4 py-3">
                  <p className="font-semibold">{o.customer_name}</p>
                  <p className="text-xs text-gray-400">{o.customer_email}</p>
                </td>
                <td className="px-4 py-3 font-bold">{parseFloat(o.total).toFixed(0)} ر.س</td>
                <td className="px-4 py-3 text-xs text-gray-600">{o.shipping_method || '-'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${o.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {o.payment_status === 'paid' ? 'مدفوع' : 'لم يُدفع'}
                  </span>
                </td>
                <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                <td className="px-4 py-3">
                  <button className="p-2 hover:bg-blue-50 rounded-lg text-blue-500"><Eye size={15} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Order Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto" dir="rtl">
            <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white">
              <div>
                <h2 className="text-lg font-bold">تفاصيل الطلب</h2>
                <p className="text-sm text-gray-500 font-mono">{selected.order_number}</p>
              </div>
              <button onClick={() => setSelected(null)}><X size={20} /></button>
            </div>
            <div className="p-5 space-y-5">
              {/* Customer */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                <p className="font-bold text-gray-700 mb-2">بيانات العميل</p>
                <p><span className="text-gray-500">الاسم:</span> <strong>{selected.customer_name}</strong></p>
                <p><span className="text-gray-500">الإيميل:</span> {selected.customer_email}</p>
                <p><span className="text-gray-500">الجوال:</span> {selected.customer_phone}</p>
              </div>

              {/* Amounts */}
              <div className="space-y-2 text-sm border-t pt-4">
                <div className="flex justify-between text-gray-600"><span>المجموع الفرعي</span><span>{parseFloat(selected.subtotal || 0).toFixed(2)} ر.س</span></div>
                <div className="flex justify-between text-gray-600"><span>الشحن</span><span>{parseFloat(selected.shipping_cost || 0).toFixed(2)} ر.س</span></div>
                {parseFloat(selected.discount) > 0 && <div className="flex justify-between text-green-600"><span>خصم</span><span>- {parseFloat(selected.discount).toFixed(2)} ر.س</span></div>}
                <div className="flex justify-between text-gray-600"><span>ضريبة 15%</span><span>{parseFloat(selected.tax || 0).toFixed(2)} ر.س</span></div>
                <div className="flex justify-between font-bold text-base border-t pt-2"><span>الإجمالي</span><span className="text-yellow-600">{parseFloat(selected.total).toFixed(2)} ر.س</span></div>
              </div>

              {/* Tracking */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">رقم التتبع</label>
                <div className="flex gap-2">
                  <input value={tracking} onChange={e => setTracking(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-yellow-400 focus:outline-none text-right"
                    placeholder="أدخل رقم التتبع..." />
                  <button onClick={() => updateStatus(selected.id, selected.status)}
                    className="px-3 py-2 bg-gray-800 text-white rounded-xl text-sm hover:bg-gray-700">حفظ</button>
                </div>
              </div>

              {/* Status Update */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">تحديث حالة الطلب</p>
                <div className="grid grid-cols-2 gap-2">
                  {statusOptions.map(s => (
                    <button key={s.value}
                      onClick={() => updateStatus(selected.id, s.value)}
                      className={`py-2 px-3 rounded-xl text-sm font-semibold border-2 transition-all ${selected.status === s.value ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
