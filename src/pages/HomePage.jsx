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
                <Button size="lg" className="bg-white text-primary hover:bg-quinary font-bold px-8 py-6 text-lg">
                  {t('hero.cta1')}
                </Button>
              </Link>
              <Link to="/courses">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary px-8 py-6 text-lg bg-transparent">
                  {t('hero.cta2')}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
 
      {/* About Preview */}
      <section className="py-24 bg-quinary/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute inset-0 bg-secondary/20 transform translate-x-4 translate-y-4 rounded-2xl" />
              <img src={IMAGES.doctor} alt="Dr. Sarah" className="relative rounded-2xl shadow-xl w-full object-cover aspect-[4/5]" />
            </motion.div>
 
            <motion.div {...fadeIn}>
              <h2 className="text-sm font-bold text-secondary uppercase tracking-widest mb-2">
                {s('about_title', 'عن د. سارة')}
              </h2>
              <h3 className="text-4xl lg:text-5xl font-bold mb-6 text-dark">
                {language === 'ar' ? 'شريكتك في رحلة التغيير' : 'Your Partner in Transformation'}
              </h3>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                {s('about_bio', 'مع أكثر من 15 عامًا من الخبرة في علم النفس والتدريب، أساعدك على اكتشاف إمكاناتك الحقيقية.')}
              </p>
              <Link to="/about">
                <Button variant="link" className="text-primary hover:text-secondary p-0 text-lg font-bold group">
                  {t('common.readMore')}
                  <ArrowRight className={`h-5 w-5 ${isRTL ? 'mr-2 rotate-180' : 'ml-2'} transition-transform group-hover:translate-x-1`} />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
 
      {/* Services Preview */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <motion.div className="text-center max-w-3xl mx-auto mb-16" {...fadeIn}>
            <h2 className="text-4xl font-bold mb-4 text-dark">
              {s('services_title', 'خدماتنا المميزة')}
            </h2>
            <p className="text-gray-500 text-lg">
              {s('services_subtitle', 'حلول مخصصة لاحتياجاتك النفسية والمهنية')}
            </p>
          </motion.div>
 
          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group p-8 rounded-2xl bg-quinary/20 hover:bg-primary hover:text-white transition-all duration-300 border border-transparent hover:shadow-2xl hover:scale-105"
              >
                <div className="w-14 h-14 rounded-full bg-quinary text-primary group-hover:bg-white/20 group-hover:text-white flex items-center justify-center mb-6 transition-colors">
                  <service.icon className="h-7 w-7" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{service.title}</h3>
                <p className="text-gray-600 group-hover:text-quinary/90 mb-6 leading-relaxed">{service.desc}</p>
                <Link to="/services">
                  <span className="text-secondary font-bold flex items-center gap-2 group-hover:text-white">
                    {t('common.learnMore')} <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
 
      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { num: s('stats_years', '15+'), label: 'سنة خبرة' },
              { num: s('stats_clients', '5k+'), label: 'عميل سعيد' },
              { num: s('stats_courses', '50+'), label: 'دورة تدريبية' },
              { num: '100%', label: 'التزام' },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="p-4 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10"
              >
                <div className="text-4xl lg:text-5xl font-bold text-quinary mb-2 font-playfair">{stat.num}</div>
                <div className="text-white/80 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
 
      {/* CTA Section */}
      <section className="py-24 bg-quinary/30">
        <div className="container mx-auto px-4 text-center">
          <motion.div className="max-w-4xl mx-auto bg-white rounded-3xl p-12 shadow-xl border border-tertiary/20" {...fadeIn}>
            <h2 className="text-4xl font-bold mb-6 text-dark">
              {s('cta_title', 'جاهز لبدء رحلتك؟')}
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              {s('cta_subtitle', 'لا تؤجل سعادتك ونجاحك. احجز جلستك الأولى اليوم واكتشف الفرق.')}
            </p>
            <Link to="/booking">
              <Button size="lg" className="bg-primary hover:bg-secondary text-white font-bold px-10 py-6 text-lg shadow-lg hover:shadow-xl transition-all">
                {t('common.bookNow')}
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
};
 
export default HomePage;
