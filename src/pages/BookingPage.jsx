import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, CheckCircle, Video, MapPin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

const timeSlots = ['09:00 ص', '10:00 ص', '11:00 ص', '12:00 م', '02:00 م', '03:00 م', '04:00 م', '05:00 م'];

const sessionTypes = [
  { id: 'online', label: 'أونلاين (زووم)', icon: Video, price: 200 },
  { id: 'inperson', label: 'حضوري', icon: MapPin, price: 300 },
];

const BookingPage = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingRef, setBookingRef] = useState('');
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', phone: '',
    session_type: 'online', date: '', time_slot: '',
    notes: '', consultation_topic: '',
  });

  const handleInput = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.date || !form.time_slot) {
      toast({ title: 'يرجى اختيار التاريخ والوقت', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setBookingRef(data.booking_ref);
        setBookingSuccess(true);
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      toast({ title: 'حدث خطأ', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (bookingSuccess) {
    return (
      <div className="min-h-screen bg-quinary/20 flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-12 rounded-3xl shadow-2xl text-center max-w-md w-full">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold mb-4 text-primary">تم تأكيد الحجز! 🎉</h2>
          <p className="text-gray-600 mb-2">رقم الحجز: <strong className="text-primary">{bookingRef}</strong></p>
          <p className="text-gray-600 mb-8">سيصلك تأكيد على بريدك الإلكتروني قريباً.</p>
          <Button onClick={() => window.location.href = '/'} className="w-full bg-primary text-white">العودة للرئيسية</Button>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <Helmet><title>حجز موعد - د. سارة</title></Helmet>
      <div className="min-h-screen bg-quinary/20 py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row" dir="rtl">

            {/* Sidebar */}
            <div className="md:w-1/3 bg-primary text-white p-8">
              <h2 className="text-3xl font-bold mb-4">احجز جلستك</h2>
              <p className="text-white/80 mb-8 leading-relaxed">اختر الوقت والنوع المناسب لبدء رحلة التغيير مع د. سارة</p>
              <div className="space-y-4 text-sm text-white/80">
                <div className="flex items-center gap-3"><Clock className="h-5 w-5 text-yellow-300" /><span>مدة الجلسة: 60 دقيقة</span></div>
                <div className="flex items-center gap-3"><Video className="h-5 w-5 text-yellow-300" /><span>أونلاين: 200 ر.س</span></div>
                <div className="flex items-center gap-3"><MapPin className="h-5 w-5 text-yellow-300" /><span>حضوري: 300 ر.س</span></div>
              </div>
            </div>

            {/* Form */}
            <div className="md:w-2/3 p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Info */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">المعلومات الشخصية</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>الاسم الأول *</Label>
                      <input name="first_name" value={form.first_name} onChange={handleInput} required
                        className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none text-right" placeholder="أميرة" /></div>
                    <div><Label>اسم العائلة *</Label>
                      <input name="last_name" value={form.last_name} onChange={handleInput} required
                        className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none text-right" placeholder="العمري" /></div>
                    <div><Label>البريد الإلكتروني *</Label>
                      <input name="email" type="email" value={form.email} onChange={handleInput} required
                        className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none text-right" placeholder="example@email.com" /></div>
                    <div><Label>رقم الجوال *</Label>
                      <input name="phone" value={form.phone} onChange={handleInput} required
                        className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none text-right" placeholder="05xxxxxxxx" /></div>
                  </div>
                </div>

                {/* Session Type */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">نوع الجلسة</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {sessionTypes.map(s => (
                      <label key={s.id} className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${form.session_type === s.id ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}>
                        <input type="radio" name="session_type" value={s.id} checked={form.session_type === s.id} onChange={handleInput} className="hidden" />
                        <s.icon className="h-5 w-5 text-primary" />
                        <div><p className="font-bold">{s.label}</p><p className="text-sm text-gray-500">{s.price} ر.س</p></div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>التاريخ *</Label>
                    <input type="date" name="date" value={form.date} onChange={handleInput} required
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" />
                  </div>
                  <div>
                    <Label>الوقت *</Label>
                    <select name="time_slot" value={form.time_slot} onChange={handleInput} required
                      className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none text-right">
                      <option value="">اختر الوقت</option>
                      {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                {/* Topic */}
                <div>
                  <Label>موضوع الجلسة (اختياري)</Label>
                  <textarea name="consultation_topic" value={form.consultation_topic} onChange={handleInput} rows={3}
                    className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none text-right resize-none"
                    placeholder="ما الذي تريد مناقشته في الجلسة؟" />
                </div>

                <Button type="submit" disabled={loading} className="w-full bg-primary text-white py-4 text-lg font-bold hover:bg-secondary">
                  {loading ? 'جاري التأكيد...' : 'تأكيد الحجز ✓'}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BookingPage;
