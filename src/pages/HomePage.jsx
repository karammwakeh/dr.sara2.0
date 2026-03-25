import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Users, BookOpen } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { IMAGES } from '@/lib/theme';

const API_URL = 'https://drsara20-production.up.railway.app/api';

const HomePage = () => {
  const { t, language, isRTL } = useLanguage();
  const [settings, setSettings] = useState({});

  useEffect(() => {
    fetch(`${API_URL}/settings`)
      .then(r => r.json())
      .then(data => setSettings(data))
      .catch(() => {});
  }, []);

  const s = (key, fallback) => settings[key] || fallback;

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  const services = [
    { title: s('service_1_title', 'التدريب الشخصي'), desc: s('service_1_desc', 'جلسات فردية لاستكشاف الذات وتحقيق الأهداف.'), icon: Users },
    { title: s('service_2_title', 'دورات متخصصة'), desc: s('service_2_desc', 'مسارات تعليمية منظمة لتطوير مهاراتك.'), icon: BookOpen },
    { title: s('service_3_title', 'الاستشارات الزوجية'), desc: s('service_3_desc', 'تحسين التواصل وبناء علاقات صحية.'), icon: Star },
  ];

  return (
    <>
      <Helmet>
        <title>{s('site_name', 'د. سارة')} - الرئيسية</title>
      </Helmet>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          {settings.hero_image ? (
            <img src={settings.hero_image} alt="Hero" className="w-full h-full object-cover" />
          ) : (
            <img src={IMAGES.hero} alt="Hero Background" className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0" style={{ background: `linear-gradient(to right, ${s('hero_bg_color', '#7C3AED')}ee, ${s('hero_bg_color', '#7C3AED')}99, transparent)` }} />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, x: isRTL ? 50 : -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl text-white"
          >
            <h1 className="text-5xl lg:text-7xl font-bold mb-6 font-playfair leading-tight">
              {s('hero_title', 'حوّل عقلك. حوّل حياتك.')}
            </h1>
            <p className="text-xl lg:text-2xl mb-8 text-quinary font-light leading-relaxed">
              {s('hero_subtitle', 'خبيرة في التدريب على الحياة والصحة النفسية')}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/booking">
                <Button size="lg" className="bg-white text-primary ho
  );
};

export default HomePage;
