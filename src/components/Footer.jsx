import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Linkedin, Youtube, Mail, Phone, MapPin, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const Footer = () => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [email, setEmail] = useState('');

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    toast({
      title: language === 'ar' ? 'شكراً لاشتراكك!' : 'Thank you for subscribing!',
      description: language === 'ar' ? 'سنرسل لك آخر الأخبار والعروض' : 'We\'ll send you the latest news and offers',
    });
    setEmail('');
  };

  const quickLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/about', label: t('nav.about') },
    { to: '/services', label: language === 'ar' ? 'الخدمات' : 'Services' },
    { to: '/courses', label: t('nav.courses') },
    { to: '/blog', label: language === 'ar' ? 'المدونة' : 'Blog' },
    { to: '/contact', label: t('nav.contact') },
  ];

  const socialLinks = [
    { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
    { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
    { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
    { icon: Youtube, href: 'https://youtube.com', label: 'YouTube' },
  ];

  return (
    <footer className="bg-primary text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand & About */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-quinary flex items-center justify-center">
                <span className="text-primary font-bold text-xl font-playfair">DS</span>
              </div>
              <span className="text-xl font-bold font-cairo text-white">
                د.سارة عبدالله عبدالعزيز المزيعل
              </span>
            </Link>
            <p className="text-quinary/90 leading-relaxed">
              {language === 'ar' 
                ? 'تمكين الأفراد من خلال التدريب على الحياة واستراتيجيات الصحة النفسية. ابدأ رحلتك نحو حياة متوازنة اليوم.'
                : 'Empowering individuals through expert life coaching and mental wellness strategies. Start your journey to a balanced life today.'}
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-quinary hover:text-primary flex items-center justify-center transition-all duration-300 border border-white/20"
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold font-playfair text-quaternary mb-6">
              {language === 'ar' ? 'روابط سريعة' : 'Quick Links'}
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-quinary hover:text-quaternary transition-colors flex items-center gap-2 group"
                  >
                    <ArrowRight className="h-3 w-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-bold font-playfair text-quaternary mb-6">
              {language === 'ar' ? 'تواصل معنا' : 'Contact Us'}
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-quinary">
                <MapPin className="h-5 w-5 text-quaternary shrink-0 mt-1" />
                <span>
                  {language === 'ar' 
                    ? '123 شارع العافية، حي النخيل، الرياض، المملكة العربية السعودية' 
                    : '123 Wellness Street, Al Nakheel District, Riyadh, KSA'}
                </span>
              </li>
              <li className="flex items-center gap-3 text-quinary">
                <Phone className="h-5 w-5 text-quaternary shrink-0" />
                <span dir="ltr">+966 50 123 4567</span>
              </li>
              <li className="flex items-center gap-3 text-quinary">
                <Mail className="h-5 w-5 text-quaternary shrink-0" />
                <span>contact@drsarah.com</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-xl font-bold font-playfair text-quaternary mb-6">
              {language === 'ar' ? 'النشرة البريدية' : 'Newsletter'}
            </h3>
            <p className="text-quinary/90 mb-4">
              {language === 'ar' 
                ? 'اشترك للحصول على نصائح أسبوعية وعروض حصرية.'
                : 'Subscribe for weekly wellness tips and exclusive offers.'}
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={language === 'ar' ? 'بريدك الإلكتروني' : 'Your email address'}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-quinary/50 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all"
                required
              />
              <Button type="submit" className="w-full bg-secondary hover:bg-secondary/90 text-white font-bold py-6">
                {language === 'ar' ? 'اشترك الآن' : 'Subscribe Now'}
              </Button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-quinary/60 text-sm">
          <p>
            © {new Date().getFullYear()} {language === 'ar' ? 'د. سارة. جميع الحقوق محفوظة.' : 'Dr. Sarah. All rights reserved.'}
          </p>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-quaternary transition-colors">
              {language === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}
            </Link>
            <Link to="/terms" className="hover:text-quaternary transition-colors">
              {language === 'ar' ? 'الشروط والأحكام' : 'Terms & Conditions'}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;