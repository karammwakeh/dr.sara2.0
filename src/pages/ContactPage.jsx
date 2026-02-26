import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const ContactPage = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });

  const handleInput = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSent(true);
        setForm({ name: '', email: '', phone: '', subject: '', message: '' });
      } else {
        throw new Error('فشل الإرسال');
      }
    } catch {
      toast({ title: 'حدث خطأ', description: 'يرجى المحاولة مرة أخرى', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none text-right transition-all";

  return (
    <>
      <Helmet><title>تواصل معنا - د. سارة</title></Helmet>
      <div className="min-h-screen bg-quinary/20 py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row" dir="rtl">

            {/* Info Side */}
            <div className="md:w-5/12 bg-primary text-white p-12">
              <h1 className="text-4xl font-bold mb-6">تواصل معنا</h1>
              <p className="text-white/80 mb-10 text-lg leading-relaxed">نحن هنا للإجابة على استفساراتك ومساعدتك في بدء رحلتك.</p>
              <div className="space-y-6">
                {[
                  { icon: Mail, label: 'البريد الإلكتروني', value: 'info@drsara.com' },
                  { icon: Phone, label: 'رقم الهاتف', value: '+966 50 000 0000' },
                  { icon: MapPin, label: 'الموقع', value: 'الرياض، المملكة العربية السعودية' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <item.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-white/60 text-sm">{item.label}</p>
                      <p className="font-semibold">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form */}
            <div className="md:w-7/12 p-12">
              {sent ? (
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">تم إرسال رسالتك! ✅</h3>
                  <p className="text-gray-600 mb-6">سنرد عليك خلال 24 ساعة.</p>
                  <button onClick={() => setSent(false)} className="text-primary underline">إرسال رسالة أخرى</button>
                </motion.div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">أرسل رسالتك</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="text-sm font-semibold text-gray-700">الاسم *</label>
                        <input name="name" value={form.name} onChange={handleInput} required className={inputCls} placeholder="اسمك الكريم" /></div>
                      <div><label className="text-sm font-semibold text-gray-700">البريد الإلكتروني *</label>
                        <input name="email" type="email" value={form.email} onChange={handleInput} required className={inputCls} placeholder="email@example.com" /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="text-sm font-semibold text-gray-700">الجوال</label>
                        <input name="phone" value={form.phone} onChange={handleInput} className={inputCls} placeholder="05xxxxxxxx" /></div>
                      <div><label className="text-sm font-semibold text-gray-700">الموضوع *</label>
                        <input name="subject" value={form.subject} onChange={handleInput} required className={inputCls} placeholder="كيف يمكننا مساعدتك؟" /></div>
                    </div>
                    <div><label className="text-sm font-semibold text-gray-700">الرسالة *</label>
                      <textarea name="message" value={form.message} onChange={handleInput} required rows={5}
                        className={`${inputCls} resize-none`} placeholder="اكتب رسالتك هنا..." /></div>
                    <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-secondary text-white py-4 font-bold text-lg">
                      {loading ? 'جاري الإرسال...' : <><Send className="h-5 w-5 ml-2 inline" /> إرسال الرسالة</>}
                    </Button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactPage;
