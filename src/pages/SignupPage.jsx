import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const SignupPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signup(email, password, fullName);
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{language === 'ar' ? 'إنشاء حساب - د. سارة' : 'Sign Up - Dr. Sarah'}</title>
        <meta name="description" content={language === 'ar' ? 'إنشاء حساب جديد' : 'Create a new account'} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-quinary to-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-quaternary/20">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-dark mb-2" style={{ fontFamily: language === 'ar' ? 'Cairo, sans-serif' : 'serif' }}>
                {language === 'ar' ? 'انضم إلينا' : 'Join Us'}
              </h1>
              <p className="text-dark/60">
                {language === 'ar' ? 'أنشئ حسابك لتبدأ رحلتك' : 'Create your account to start your journey'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="fullName" className="text-dark">
                  {language === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                </Label>
                <div className="relative mt-2">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-dark/40" />
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary bg-white text-gray-900"
                    placeholder={language === 'ar' ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="text-dark">
                  {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                </Label>
                <div className="relative mt-2">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-dark/40" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary bg-white text-gray-900"
                    placeholder={language === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password" className="text-dark">
                  {language === 'ar' ? 'كلمة المرور' : 'Password'}
                </Label>
                <div className="relative mt-2">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-dark/40" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary bg-white text-gray-900"
                    placeholder={language === 'ar' ? 'أدخل كلمة المرور' : 'Enter your password'}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-secondary text-white py-3 text-lg font-bold"
              >
                {loading ? (language === 'ar' ? 'جاري الإنشاء...' : 'Creating...') : (language === 'ar' ? 'إنشاء حساب' : 'Sign Up')}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-dark/60">
                {language === 'ar' ? 'لديك حساب بالفعل؟' : 'Already have an account?'}{' '}
                <Link to="/login" className="text-primary hover:text-secondary hover:underline font-semibold">
                  {language === 'ar' ? 'تسجيل الدخول' : 'Login'}
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default SignupPage;