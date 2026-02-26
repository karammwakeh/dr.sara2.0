import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

const API = '/api/admin';
const authH = () => ({ Authorization: `Bearer ${localStorage.getItem('admin_token')}` });

const statusConfig = {
  pending:   { label: 'بانتظار التأكيد', color: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: 'مؤكد ✓',          color: 'bg-green-100 text-green-700' },
  completed: { label: 'مكتمل',           color: 'bg-blue-100 text-blue-700' },
  cancelled: { label: 'ملغي',            color: 'bg-red-100 text-red-700' },
};

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selected, setSelected] = useState(null);

  const load = async () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: 50 });
    if (filterStatus) params.append('status', filterStatus);
    const res = await fetch(`${API}/bookings?${params}`, { headers: authH() });
    const data = await res.json();
    setBookings(data.bookings || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [filterStatus]);

  const updateStatus = async (id, status) => {
    await fetch(`${API}/bookings/${id}/status`, {
      method: 'PATCH', headers: { ...authH(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (selected?.id === id) setSelected(p => ({ ...p, status }));
    load();
  };

  const filtered = bookings.filter(b =>
    b.customer_name?.includes(search) || b.customer_email?.includes(search) || b.booking_ref?.includes(search)
  );

  return (
    <div className="space-y-4" dir="rtl">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search size={16} className="absolute right-3 top-3 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="pr-9 pl-4 py-2 border rounded-xl focus:ring-2 focus:ring-yellow-400 focus:outline-none text-right w-56"
            placeholder="بحث بالاسم أو الرقم..." />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-4 py-2 border rounded-xl focus:outline-none text-right">
          <option value="">كل الحجوزات</option>
          {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <span className="text-sm text-gray-500 flex items-center">{filtered.length} حجز</span>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 text-center py-12 text-gray-400">جاري التحميل...</div>
        ) : filtered.length === 0 ? (
          <div className="col-span-3 text-center py-12 text-gray-400">لا توجد حجوزات</div>
        ) : filtered.map(b => {
          const s = statusConfig[b.status] || { label: b.status, color: 'bg-gray-100 text-gray-600' };
          return (
            <div key={b.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all cursor-pointer"
              onClick={() => setSelected(b)}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold text-gray-900">{b.customer_name}</p>
                  <p className="text-xs text-gray-400 font-mono">{b.booking_ref}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-semibold ${s.color}`}>{s.label}</span>
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <p>📅 <strong>{b.booking_date}</strong> — {b.time_slot}</p>
                <p>{b.session_type === 'online' ? '🖥 أونلاين' : '📍 حضوري'}</p>
                <p className="text-gray-400 text-xs truncate">✉ {b.customer_email}</p>
              </div>
              {b.consultation_topic && (
                <p className="mt-2 text-xs text-gray-500 bg-gray-50 rounded-lg p-2 line-clamp-2">{b.consultation_topic}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" dir="rtl">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="text-lg font-bold">تفاصيل الحجز</h2>
              <button onClick={() => setSelected(null)}><X size={20} /></button>
            </div>
            <div className="p-5 space-y-4 text-sm">
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <p><span className="text-gray-500">الاسم:</span> <strong>{selected.customer_name}</strong></p>
                <p><span className="text-gray-500">الإيميل:</span> {selected.customer_email}</p>
                <p><span className="text-gray-500">الجوال:</span> {selected.customer_phone || '-'}</p>
                <p><span className="text-gray-500">نوع الجلسة:</span> {selected.session_type === 'online' ? 'أونلاين' : 'حضوري'}</p>
                <p><span className="text-gray-500">التاريخ:</span> <strong>{selected.booking_date}</strong> — {selected.time_slot}</p>
              </div>
              {selected.consultation_topic && (
                <div><p className="font-semibold text-gray-700 mb-1">موضوع الجلسة:</p>
                  <p className="bg-yellow-50 rounded-xl p-3 text-gray-700">{selected.consultation_topic}</p></div>
              )}
              <div>
                <p className="font-semibold text-gray-700 mb-2">تحديث الحالة:</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(statusConfig).map(([k, v]) => (
                    <button key={k} onClick={() => updateStatus(selected.id, k)}
                      className={`py-2 px-3 rounded-xl text-sm font-semibold border-2 transition-all ${selected.status === k ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      {v.label}
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

export default AdminBookings;
