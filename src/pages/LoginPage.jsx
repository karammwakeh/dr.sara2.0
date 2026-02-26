import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await login(email, password);
      // Admin goes to admin panel, others to dashboard
      navigate(user.role === 'admin' || user.role === 'super_admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.message || 'بيانات الدخول غير صحيحة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet><title>تسجيل الدخول - د. سارة</title></Helmet>
      <div className="min-h-screen bg-gradient-to-br from-quinary to-white flex items-center justify-center p-4" dir="rtl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-quaternary/20">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-dark mb-2">مرحباً بعودتك</h1>
              <p className="text-dark/60 text-sm">سجّل دخولك لإدارة الموقع</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-5 text-sm text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">البريد الإلكتروني</label>
                <div className="relative">
                  <Mail size={16} className="absolute right-3 top-3.5 text-gray-400" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                    className="w-full pr-9 pl-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary focus:outline-none text-right"
                    placeholder="admin@drsara.com" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">كلمة المرور</label>
                <div className="relative">
                  <Lock size={16} className="absolute right-3 top-3.5 text-gray-400" />
                  <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                    className="w-full pr-9 pl-10 py-3 border rounded-xl focus:ring-2 focus:ring-primary focus:outline-none text-right"
                    placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute left-3 top-3.5 text-gray-400 hover:text-gray-600">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-primary text-white py-3 font-bold text-lg hover:bg-secondary mt-2">
                {loading ? 'جاري الدخول...' : 'تسجيل الدخول'}
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default LoginPage;
