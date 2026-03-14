import { useState, useEffect } from 'react';

const API_URL = 'https://drsara20-production.up.railway.app/api';

export default function AdminSettings() {
    const [settings, setSettings] = useState({
        hero_title: '',
        hero_subtitle: '',
        hero_bg_color: '#7C3AED',
        primary_color: '#7C3AED',
        site_name: '',
        about_text: '',
        contact_phone: '',
        contact_email: '',
        contact_whatsapp: '',
    });
    const [heroImage, setHeroImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetch(`${API_URL}/settings`)
            .then(r => r.json())
            .then(data => { setSettings(prev => ({ ...prev, ...data })); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const save = async () => {
        setSaving(true);
        const token = localStorage.getItem('admin_token');
        try {
            await fetch(`${API_URL}/admin/settings`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(settings),
            });
            if (heroImage) {
                const formData = new FormData();
                formData.append('image', heroImage);
                formData.append('key', 'hero_image');
                await fetch(`${API_URL}/admin/settings/upload`, {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` },
                    body: formData,
                });
            }
            setMessage('✅ تم الحفظ بنجاح!');
        } catch {
            setMessage('❌ حدث خطأ');
        }
        setSaving(false);
        setTimeout(() => setMessage(''), 3000);
    };

    if (loading) return <div className="p-8 text-center">جاري التحميل...</div>;

    return (
        <div className="p-6 max-w-3xl mx-auto" dir="rtl">
            <h1 className="text-2xl font-bold mb-6">⚙️ إعدادات الموقع</h1>

            {message && <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-lg">{message}</div>}

            {/* الصفحة الرئيسية */}
            <div className="bg-white rounded-xl shadow p-6 mb-6">
                <h2 className="text-lg font-bold mb-4 text-purple-700">🏠 الصفحة الرئيسية</h2>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">العنوان الرئيسي</label>
                    <input
                        className="w-full border rounded-lg p-2"
                        value={settings.hero_title}
                        onChange={e => setSettings({ ...settings, hero_title: e.target.value })}
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">العنوان الثانوي</label>
                    <input
                        className="w-full border rounded-lg p-2"
                        value={settings.hero_subtitle}
                        onChange={e => setSettings({ ...settings, hero_subtitle: e.target.value })}
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">صورة الخلفية</label>
                    <input
                        type="file"
                        accept="image/*"
                        className="w-full border rounded-lg p-2"
                        onChange={e => setHeroImage(e.target.files[0])}
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">لون الخلفية</label>
                    <div className="flex items-center gap-3">
                        <input
                            type="color"
                            value={settings.hero_bg_color}
                            onChange={e => setSettings({ ...settings, hero_bg_color: e.target.value })}
                            className="w-12 h-10 rounded cursor-pointer"
                        />
                        <span className="text-sm text-gray-500">{settings.hero_bg_color}</span>
                    </div>
                </div>
            </div>

            {/* الألوان */}
            <div className="bg-white rounded-xl shadow p-6 mb-6">
                <h2 className="text-lg font-bold mb-4 text-purple-700">🎨 الألوان</h2>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">اللون الرئيسي للموقع</label>
                    <div className="flex items-center gap-3">
                        <input
                            type="color"
                            value={settings.primary_color}
                            onChange={e => setSettings({ ...settings, primary_color: e.target.value })}
                            className="w-12 h-10 rounded cursor-pointer"
                        />
                        <span className="text-sm text-gray-500">{settings.primary_color}</span>
                    </div>
                </div>
            </div>

            {/* معلومات الموقع */}
            <div className="bg-white rounded-xl shadow p-6 mb-6">
                <h2 className="text-lg font-bold mb-4 text-purple-700">📝 معلومات الموقع</h2>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">اسم الموقع</label>
                    <input
                        className="w-full border rounded-lg p-2"
                        value={settings.site_name}
                        onChange={e => setSettings({ ...settings, site_name: e.target.value })}
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">نبذة عن الدكتورة</label>
                    <textarea
                        className="w-full border rounded-lg p-2"
                        rows={4}
                        value={settings.about_text}
                        onChange={e => setSettings({ ...settings, about_text: e.target.value })}
                    />
                </div>
            </div>

            {/* معلومات التواصل */}
            <div className="bg-white rounded-xl shadow p-6 mb-6">
                <h2 className="text-lg font-bold mb-4 text-purple-700">📞 معلومات التواصل</h2>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">رقم الهاتف</label>
                    <input
                        className="w-full border rounded-lg p-2"
                        value={settings.contact_phone}
                        onChange={e => setSettings({ ...settings, contact_phone: e.target.value })}
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">البريد الإلكتروني</label>
                    <input
                        className="w-full border rounded-lg p-2"
                        value={settings.contact_email}
                        onChange={e => setSettings({ ...settings, contact_email: e.target.value })}
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">واتساب</label>
                    <input
                        className="w-full border rounded-lg p-2"
                        value={settings.contact_whatsapp}
                        onChange={e => setSettings({ ...settings, contact_whatsapp: e.target.value })}
                    />
                </div>
            </div>

            <button
                onClick={save}
                disabled={saving}
                className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-purple-700 disabled:opacity-50"
            >
                {saving ? 'جاري الحفظ...' : '💾 حفظ التغييرات'}
            </button>
        </div>
    );
}
