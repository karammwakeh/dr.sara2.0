import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

const translations = {
  en: {
    nav: {
      home: 'Home',
      about: 'About',
      certifications: 'Certifications',
      media: 'Media',
      courses: 'Courses',
      booking: 'Book Session',
      products: 'Products',
      contact: 'Contact',
      login: 'Login',
      signup: 'Sign Up',
      logout: 'Logout',
      dashboard: 'Dashboard',
      cart: 'Cart',
    },
    hero: {
      title: 'Transform Your Mind. Transform Your Life.',
      subtitle: 'Expert Life Coaching & Mental Wellness',
      cta1: 'Book a Session',
      cta2: 'Browse Courses',
    },
    common: {
      learnMore: 'Learn More',
      getStarted: 'Get Started',
      viewAll: 'View All',
      readMore: 'Read More',
      addToCart: 'Add to Cart',
      buyNow: 'Buy Now',
      bookNow: 'Book Now',
      enroll: 'Enroll Now',
      price: 'Price',
      discount: 'Discount',
      from: 'From',
      to: 'To',
    },
  },
  ar: {
    nav: {
      home: 'الرئيسية',
      about: 'عن د. سارة',
      certifications: 'الشهادات',
      media: 'الإعلام',
      courses: 'الدورات',
      booking: 'احجز جلسة',
      products: 'المنتجات',
      contact: 'تواصل',
      login: 'تسجيل الدخول',
      signup: 'إنشاء حساب',
      logout: 'تسجيل الخروج',
      dashboard: 'لوحة التحكم',
      cart: 'السلة',
    },
    hero: {
      title: 'حوّل عقلك. حوّل حياتك.',
      subtitle: 'خبيرة في التدريب على الحياة والصحة النفسية',
      cta1: 'احجز جلسة',
      cta2: 'تصفح الدورات',
    },
    common: {
      learnMore: 'اعرف المزيد',
      getStarted: 'ابدأ الآن',
      viewAll: 'عرض الكل',
      readMore: 'اقرأ المزيد',
      addToCart: 'أضف للسلة',
      buyNow: 'اشتر الآن',
      bookNow: 'احجز الآن',
      enroll: 'سجل الآن',
      price: 'السعر',
      discount: 'خصم',
      from: 'من',
      to: 'إلى',
    },
  },
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('ar');

  useEffect(() => {
    const storedLang = localStorage.getItem('language') || 'ar';
    setLanguage(storedLang);
    document.documentElement.lang = storedLang;
    document.documentElement.dir = storedLang === 'ar' ? 'rtl' : 'ltr';
  }, []);

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'ar' : 'en';
    setLanguage(newLang);
    localStorage.setItem('language', newLang);
    document.documentElement.lang = newLang;
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  };

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  const value = {
    language,
    toggleLanguage,
    t,
    isRTL: language === 'ar',
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};