import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { BookOpen, Calendar, ShoppingBag, User } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

const DashboardPage = () => {
  const { language } = useLanguage();
  const { user } = useAuth();

  const stats = [
    {
      icon: BookOpen,
      title: language === 'ar' ? 'الدورات المسجلة' : 'Enrolled Courses',
      value: '3',
      color: 'from-primary to-secondary',
    },
    {
      icon: Calendar,
      title: language === 'ar' ? 'الجلسات القادمة' : 'Upcoming Sessions',
      value: '2',
      color: 'from-secondary to-tertiary',
    },
    {
      icon: ShoppingBag,
      title: language === 'ar' ? 'المنتجات المشتراة' : 'Purchased Products',
      value: '5',
      color: 'from-primary to-tertiary',
    },
  ];

  return (
    <>
      <Helmet>
        <title>{language === 'ar' ? 'لوحة التحكم - د. سارة' : 'Dashboard - Dr. Sarah'}</title>
      </Helmet>

      <div className="min-h-screen bg-quinary/20 py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h1 
              className="text-4xl font-bold text-dark mb-2"
              style={{ fontFamily: language === 'ar' ? 'Cairo, sans-serif' : 'serif' }}
            >
              {language === 'ar' ? 'مرحباً، ' : 'Welcome, '}{user?.full_name}
            </h1>
            <p className="text-dark/70">
              {language === 'ar' ? 'إليك ملخص حسابك' : 'Here\'s your account summary'}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-lg border border-quaternary/20"
              >
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-dark mb-1">{stat.value}</div>
                <div className="text-dark/70">{stat.title}</div>
              </motion.div>
            ))}
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-quaternary/20">
            <h2 className="text-2xl font-bold text-dark mb-6">
              {language === 'ar' ? 'الدورات الخاصة بك' : 'Your Courses'}
            </h2>
            <p className="text-dark/70">
              {language === 'ar' 
                ? 'ستظهر دوراتك المسجلة هنا'
                : 'Your enrolled courses will appear here'}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;