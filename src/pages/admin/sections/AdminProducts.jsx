import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, X, Upload } from 'lucide-react';

const API = '/api';
const authH = () => ({ Authorization: `Bearer ${localStorage.getItem('admin_token')}` });

const initialForm = { name_ar: '', short_description: '', price: '', sale_price: '', stock_quantity: '', category_id: '', status: 'published', is_featured: false, images: [] };

const AdminProducts = () => {
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [newImages, setNewImages] = useState([]);

  const load = async () => {
    setLoading(true);
    const [p, c] = await Promise.all([
      fetch(`${API}/products?limit=100`, { headers: authH() }).then(r => r.json()),
      fetch(`${API}/categories`, { headers: authH() }).then(r => r.json()),
    ]);
    setProducts(p.products || []);
    setCategories(c);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm(initialForm); setNewImages([]); setModal(true); };
  const openEdit = (p) => {
    setEditing(p);
    setForm({ name_ar: p.name_ar, short_description: p.short_description || '', price: p.price, sale_price: p.sale_price || '', stock_quantity: p.stock_quantity, category_id: p.category_id || '', status: p.status, is_featured: p.is_featured, images: p.images || [] });
    setNewImages([]);
    setModal(true);
  };

  const handleInput = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'images') return;
        fd.append(k, v);
      });
      fd.append('existing_images', JSON.stringify(form.images));
      newImages.forEach(f => fd.append('images', f));

      const url = editing ? `${API}/admin/products/${editing.id}` : `${API}/admin/products`;
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: authH(), body: fd });
      if (res.ok) { setModal(false); load(); }
    } catch (e) { alert('خطأ في الحفظ') }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`هل تريد حذف "${name}"؟`)) return;
    await fetch(`${API}/admin/products/${id}`, { method: 'DELETE', headers: authH() });
    load();
  };

  const filtered = products.filter(p =>
    p.name_ar?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="relative">
          <Search size={16} className="absolute right-3 top-3 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="pr-9 pl-4 py-2 border rounded-xl focus:ring-2 focus:ring-yellow-400 focus:outline-none text-right"
            placeholder="بحث عن منتج..." />
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-yellow-500 text-gray-900 px-4 py-2 rounded-xl font-bold hover:bg-yellow-400 transition-all">
          <Plus size={18} /> إضافة منتج
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {['المنتج', 'السعر', 'المخزون', 'التصنيف', 'الحالة', ''].map(h => (
                <th key={h} className="px-4 py-3 text-right font-semibold text-gray-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-12 text-gray-400">جاري التحميل...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-gray-400">لا توجد منتجات</td></tr>
            ) : filtered.map(p => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img src={p.images?.[0] ? `${BASE_URL}${p.images[0]}` : 'https://via.placeholder.com/40'} alt=""
                      className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900">{p.name_ar}</p>
                      {p.is_featured && <span className="text-xs bg-yellow-100 text-yellow-700 px-1 rounded">⭐ مميز</span>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="font-bold">{p.sale_price || p.price} ر.س</p>
                  {p.sale_price && <p className="text-xs text-gray-400 line-through">{p.price} ر.س</p>}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${p.stock_quantity > 5 ? 'bg-green-100 text-green-700' : p.stock_quantity > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                    {p.stock_quantity} قطعة
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">{p.category_name || '-'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${p.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {p.status === 'published' ? 'منشور' : 'مسودة'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => openEdit(p)} className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-all"><Edit2 size={15} /></button>
                    <button onClick={() => handleDelete(p.id, p.name_ar)} className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-all"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
              <h2 className="text-xl font-bold">{editing ? 'تعديل المنتج' : 'إضافة منتج جديد'}</h2>
              <button onClick={() => setModal(false)}><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">اسم المنتج (عربي) *</label>
                <input name="name_ar" value={form.name_ar} onChange={handleInput}
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-yellow-400 focus:outline-none text-right"
                  placeholder="مثال: كتاب التربية الإيجابية" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">الوصف المختصر</label>
                <textarea name="short_description" value={form.short_description} onChange={handleInput} rows={3}
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-yellow-400 focus:outline-none text-right resize-none"
                  placeholder="وصف مختصر للمنتج..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">السعر (ر.س) *</label>
                  <input name="price" type="number" value={form.price} onChange={handleInput}
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-yellow-400 focus:outline-none text-right" placeholder="99" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">سعر الخصم (اختياري)</label>
                  <input name="sale_price" type="number" value={form.sale_price} onChange={handleInput}
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-yellow-400 focus:outline-none text-right" placeholder="79" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">الكمية</label>
                  <input name="stock_quantity" type="number" value={form.stock_quantity} onChange={handleInput}
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-yellow-400 focus:outline-none text-right" placeholder="50" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">التصنيف</label>
                  <select name="category_id" value={form.category_id} onChange={handleInput}
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-yellow-400 focus:outline-none text-right">
                    <option value="">-- اختر --</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name_ar}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">الحالة</label>
                  <select name="status" value={form.status} onChange={handleInput}
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-yellow-400 focus:outline-none text-right">
                    <option value="published">منشور</option>
                    <option value="draft">مسودة</option>
                  </select>
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="is_featured" checked={form.is_featured} onChange={handleInput} className="w-4 h-4 accent-yellow-500" />
                    <span className="text-sm font-semibold text-gray-700">⭐ منتج مميز</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">صور المنتج</label>
                <div className="flex gap-2 flex-wrap mb-2">
                  {form.images?.map((img, i) => (
                    <div key={i} className="relative">
                      <img src={`http://localhost:5000${img}`} alt="" className="w-16 h-16 object-cover rounded-lg border" />
                      <button onClick={() => setForm(p => ({ ...p, images: p.images.filter((_, j) => j !== i) }))}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">×</button>
                    </div>
                  ))}
                  {newImages.map((f, i) => (
                    <div key={i} className="relative">
                      <img src={URL.createObjectURL(f)} alt="" className="w-16 h-16 object-cover rounded-lg border" />
                      <button onClick={() => setNewImages(p => p.filter((_, j) => j !== i))}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">×</button>
                    </div>
                  ))}
                </div>
                <label className="flex items-center gap-2 cursor-pointer border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-yellow-400 transition-all">
                  <Upload size={18} className="text-gray-400" />
                  <span className="text-sm text-gray-500">اضغط لرفع صور (حتى 5 صور)</span>
                  <input type="file" accept="image/*" multiple onChange={e => setNewImages(p => [...p, ...Array.from(e.target.files)].slice(0, 5))} className="hidden" />
                </label>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t bg-gray-50 sticky bottom-0">
              <button onClick={handleSave} disabled={saving}
                className="flex-1 bg-yellow-500 text-gray-900 py-3 rounded-xl font-bold hover:bg-yellow-400 disabled:opacity-60 transition-all">
                {saving ? 'جاري الحفظ...' : editing ? 'حفظ التعديلات' : 'إضافة المنتج'}
              </button>
              <button onClick={() => setModal(false)} className="px-6 py-3 border rounded-xl text-gray-600 hover:bg-gray-100 transition-all">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
