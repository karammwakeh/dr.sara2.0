import React, { useState, useEffect } from 'react';
import { Mail, MailOpen, X } from 'lucide-react';

const API = '/api/admin';
const authH = () => ({ Authorization: `Bearer ${localStorage.getItem('admin_token')}` });

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const load = async () => {
    setLoading(true);
    const res = await fetch(`${API}/messages`, { headers: authH() });
    const data = await res.json();
    setMessages(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const markRead = async (id) => {
    await fetch(`${API}/messages/${id}/read`, { method: 'PATCH', headers: authH() });
    setMessages(prev => prev.map(m => m.id === id ? { ...m, is_read: true } : m));
  };

  const openMessage = (msg) => {
    setSelected(msg);
    if (!msg.is_read) markRead(msg.id);
  };

  const unread = messages.filter(m => !m.is_read).length;

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-bold text-gray-800">رسائل التواصل</h2>
        {unread > 0 && (
          <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">{unread} جديد</span>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-gray-400">جاري التحميل...</div>
        ) : messages.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Mail size={40} className="mx-auto mb-3 opacity-30" />
            <p>لا توجد رسائل بعد</p>
          </div>
        ) : (
          <div className="divide-y">
            {messages.map(msg => (
              <div key={msg.id}
                onClick={() => openMessage(msg)}
                className={`flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-all ${!msg.is_read ? 'bg-blue-50' : ''}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${!msg.is_read ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {!msg.is_read ? <Mail size={18} /> : <MailOpen size={18} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`font-semibold ${!msg.is_read ? 'text-gray-900' : 'text-gray-600'}`}>{msg.name}</p>
                    {!msg.is_read && <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>}
                  </div>
                  <p className="text-sm text-gray-500 font-medium truncate">{msg.subject}</p>
                  <p className="text-xs text-gray-400 truncate">{msg.message}</p>
                </div>
                <div className="text-xs text-gray-400 flex-shrink-0 text-left">
                  {new Date(msg.created_at).toLocaleDateString('ar-SA')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col" dir="rtl">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="text-lg font-bold">{selected.subject}</h2>
              <button onClick={() => setSelected(null)}><X size={20} /></button>
            </div>
            <div className="p-5 space-y-4 overflow-y-auto text-sm">
              <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 gap-2">
                <div><span className="text-gray-500">من:</span> <strong>{selected.name}</strong></div>
                <div><span className="text-gray-500">الإيميل:</span> <a href={`mailto:${selected.email}`} className="text-blue-600 hover:underline">{selected.email}</a></div>
                {selected.phone && <div><span className="text-gray-500">الجوال:</span> <a href={`tel:${selected.phone}`} className="text-blue-600">{selected.phone}</a></div>}
                <div><span className="text-gray-500">التاريخ:</span> {new Date(selected.created_at).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
              </div>
              <div>
                <p className="font-semibold text-gray-700 mb-2">الرسالة:</p>
                <div className="bg-white border rounded-xl p-4 text-gray-700 leading-relaxed whitespace-pre-wrap">{selected.message}</div>
              </div>
              <div className="flex gap-3 pt-2">
                <a href={`mailto:${selected.email}?subject=رداً على: ${selected.subject}`}
                  className="flex-1 bg-yellow-500 text-gray-900 py-3 rounded-xl font-bold text-center hover:bg-yellow-400 transition-all">
                  ✉ رد عبر البريد
                </a>
                {selected.phone && (
                  <a href={`https://wa.me/${selected.phone.replace(/\D/g, '')}?text=مرحباً ${selected.name}،`}
                    target="_blank" rel="noreferrer"
                    className="flex-1 bg-green-500 text-white py-3 rounded-xl font-bold text-center hover:bg-green-400 transition-all">
                    واتساب
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMessages;
