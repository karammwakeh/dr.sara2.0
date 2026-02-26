import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, X, Upload } from 'lucide-react';

const API = '/api';
const authH = () => ({ Authorization: `Bearer ${localStorage.getItem('admin_token')}` });

const emptyPost = { title_ar: '', excerpt_ar: '', content_ar: '', category: '', status: 'draft', existing_image: '' };

const AdminBlog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyPost);
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    // Admin sees all posts including drafts
    const res = await fetch(`${API}/blog`, { headers: authH() });
    // Fallback to empty if no posts yet
    const data = await res.json().catch(() => []);
    setPosts(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm(emptyPost); setImageFile(null); setModal(true); };
  const openEdit = (p) => {
    setEditing(p);
    setForm({ title_ar: p.title_ar, excerpt_ar: p.excerpt_ar || '', content_ar: p.content_ar, category: p.category || '', status: p.status, existing_image: p.image_url || '' });
    setImageFile(null);
    setModal(true);
  };

  const handleInput = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    if (!form.title_ar.trim() || !form.content_ar.trim()) {
      alert('يرجى إدخال العنوان والمحتوى');
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (imageFile) fd.append('image', imageFile);

      const url = editing ? `${API}/admin/blog/${editing.id}` : `${API}/admin/blog`;
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: authH(), body: fd });
      if (res.ok) { setModal(false); load(); }
      else { const err = await res.json(); alert(err.error || 'خطأ في الحفظ'); }
    } catch { alert('خطأ في الاتصال'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`هل تريد حذف "${title}"؟`)) return;
    await fetch(`${API}/admin/blog/${id}`, { method: 'DELETE', headers: authH() });
    load();
  };

  const toggleStatus = async (post) => {
    const fd = new FormData();
    Object.entries({ title_ar: post.title_ar, excerpt_ar: post.excerpt_ar || '', content_ar: post.content_ar, category: post.category || '', status: post.status === 'published' ? 'draft' : 'published', existing_image: post.image_url || '' })
      .forEach(([k, v]) => fd.append(k, v));
    await fetch(`${API}/admin/blog/${post.id}`, { method: 'PUT', headers: authH(), body: fd });
    load();
  };

  const categories = ['التربية', 'التطوير الذاتي', 'الصحة النفسية', 'العلاقات', 'الأسرة', 'أخرى'];

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{posts.length} مقال</p>
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-yellow-500 text-gray-900 px-4 py-2 rounded-xl font-bold hover:bg-yellow-400 transition-all">
          <Plus size={18} /> إضافة مقال
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 text-center py-12 text-gray-400">جاري التحميل...</div>
        ) : posts.length === 0 ? (
          <div className="col-span-3 text-center py-16 text-gray-400">
            <p className="text-lg font-semibold mb-2">لا توجد مقالات بعد</p>
            <p className="text-sm">اضغط "إضافة مقال" للبدء</p>
          </div>
        ) : posts.map(post => (
          <div key={post.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all">
            {post.image_url ? (
              <img src={`http://localhost:5000${post.image_url}`} alt={post.title_ar}
                className="w-full h-40 object-cover" />
            ) : (
              <div className="w-full h-40 bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center text-4xl">📝</div>
            )}
            <div className="p-4">
              {post.category && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">{post.category}</span>}
              <h3 className="font-bold text-gray-900 mt-2 line-clamp-2">{post.title_ar}</h3>
              <p className="text-xs text-gray-400 line-clamp-2 mt-1">{post.excerpt_ar}</p>
              <div className="flex items-center justify-between mt-4">
                <span className={`text-xs px-2 py-0.5 rounded-full ${post.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {post.status === 'published' ? '🟢 منشور' : '⚪ مسودة'}
                </span>
                <div className="flex gap-1">
                  <button onClick={() => toggleStatus(post)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-all" title={post.status === 'published' ? 'إخفاء' : 'نشر'}>
                    {post.status === 'published' ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                  <button onClick={() => openEdit(post)} className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-all"><Edit2 size={15} /></button>
                  <button onClick={() => handleDelete(post.id, post.title_ar)} className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-all"><Trash2 size={15} /></button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col" dir="rtl">
            <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white">
              <h2 className="text-xl font-bold">{editing ? 'تعديل المقال' : 'مقال جديد'}</h2>
              <button onClick={() => setModal(false)}><X size={20} /></button>
            </div>
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">عنوان المقال *</label>
                <input name="title_ar" value={form.title_ar} onChange={handleInput}
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-yellow-400 focus:outline-none text-right"
                  placeholder="عنوان المقال..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">التصنيف</label>
                  <select name="category" value={form.category} onChange={handleInput}
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-yellow-400 focus:outline-none text-right">
                    <option value="">-- اختر --</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">الحالة</label>
                  <select name="status" value={form.status} onChange={handleInput}
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-yellow-400 focus:outline-none text-right">
                    <option value="draft">مسودة</option>
                    <option value="published">نشر الآن</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">المقتطف (ملخص قصير)</label>
                <textarea name="excerpt_ar" value={form.excerpt_ar} onChange={handleInput} rows={2}
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-yellow-400 focus:outline-none text-right resize-none"
                  placeholder="ملخص قصير يظهر في القائمة..." />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">محتوى المقال *</label>
                <textarea name="content_ar" value={form.content_ar} onChange={handleInput} rows={10}
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-yellow-400 focus:outline-none text-right resize-none font-mono text-sm"
                  placeholder="اكتب محتوى المقال هنا..." />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">صورة المقال</label>
                {(form.existing_image || imageFile) && (
                  <img src={imageFile ? URL.createObjectURL(imageFile) : `http://localhost:5000${form.existing_image}`}
                    alt="" className="w-full h-32 object-cover rounded-xl mb-2" />
                )}
                <label className="flex items-center gap-2 cursor-pointer border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-yellow-400 transition-all">
                  <Upload size={18} className="text-gray-400" />
                  <span className="text-sm text-gray-500">{imageFile ? imageFile.name : 'اضغط لرفع صورة'}</span>
                  <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} className="hidden" />
                </label>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t bg-gray-50 sticky bottom-0">
              <button onClick={handleSave} disabled={saving}
                className="flex-1 bg-yellow-500 text-gray-900 py-3 rounded-xl font-bold hover:bg-yellow-400 disabled:opacity-60 transition-all">
                {saving ? 'جاري الحفظ...' : editing ? 'حفظ التعديلات' : 'نشر المقال'}
              </button>
              <button onClick={() => setModal(false)} className="px-6 py-3 border rounded-xl text-gray-600 hover:bg-gray-100">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBlog;
