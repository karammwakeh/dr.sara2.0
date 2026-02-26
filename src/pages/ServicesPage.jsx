import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Users, BookOpen, Star, Heart, Target, Sparkles, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const ServicesPage = () => {
  const { language, isRTL } = useLanguage();

  const services = [
    {
      id: 1,
      icon: Users,
      title: language === 'ar' ? 'التدريب الشخصي 1:1' : '1:1 Life Coaching',
      description: language === 'ar' 
        ? 'جلسات خاصة تركز على احتياجاتك الفردية لمساعدتك على تجاوز التحديات وتحقيق أهدافك الشخصية.' 
        : 'Private sessions focused on your individual needs to help you overcome challenges and achieve your personal goals.',
      price: '$150',
    },
    {
      id: 2,
      icon: Heart,
      title: language === 'ar' ? 'استشارات العلاقات' : 'Relationship Counseling',
      description: language === 'ar'
        ? 'تحسين التواصل، حل النزاعات، وبناء علاقات صحية ومستدامة مع شريك حياتك أو أسرتك.'
        : 'Improve communication, resolve conflicts, and build healthy, sustainable relationships with your partner or family.',
      price: '$180',
    },
    {
      id: 3,
      icon: Target,
      title: language === 'ar' ? 'التدريب المهني' : 'Career Coaching',
      description: language === 'ar'
        ? 'اكتشف شغفك، حدد مسارك المهني، وطور المهارات اللازمة للنجاح في بيئة العمل التنافسية.'
        : 'Discover your passion, define your career path, and develop the skills needed to succeed in a competitive work environment.',
      price: '$160',
    },
    {
      id: 4,
      icon: Sparkles,
      title: language === 'ar' ? 'برامج العافية' : 'Wellness Programs',
      description: language === 'ar'
        ? 'برامج شاملة تجمع بين الصحة النفسية والجسدية لتعزيز جودة حياتك ورفاهيتك العامة.'
        : 'Comprehensive programs combining mental and physical health to enhance your quality of life and general well-being.',
      price: language === 'ar' ? 'يبدأ من $200' : 'Starts at $200',
    },
    {
      id: 5,
      icon: BookOpen,
      title: language === 'ar' ? 'ورش عمل جماعية' : 'Group Workshops',
      description: language === 'ar'
        ? 'تجارب تعليمية تفاعلية في مجموعات صغيرة لتبادل الخبرات والتعلم المشترك.'
        : 'Interactive learning experiences in small groups to share experiences and collaborative learning.',
      price: language === 'ar' ? '$50 / للجلسة' : '$50 / session',
    },
    {
      id: 6,
      icon: Star,
      title: language === 'ar' ? 'التدريب التنفيذي' : 'Executive Coaching',
      description: language === 'ar'
        ? 'تدريب متخصص للقادة والمديرين لتعزيز مهارات القيادة واتخاذ القرار.'
        : 'Specialized coaching for leaders and managers to enhance leadership and decision-making skills.',
      price: language === 'ar' ? 'حسب الطلب' : 'Custom Quote',
    }
  ];

  return (
    <>
      <Helmet>
        <title>{language === 'ar' ? 'خدماتنا - د. سارة' : 'Our Services - Dr. Sarah'}</title>
      </Helmet>

      <div className="bg-quinary/20 min-h-screen">
        {/* Header */}
        <section className="bg-primary text-white py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-90"></div>
          <div className="container mx-auto px-4 relative z-10 text-center">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl lg:text-6xl font-bold font-playfair mb-6"
            >
              {language === 'ar' ? 'خدماتنا' : 'Our Services'}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-quinary max-w-2xl mx-auto"
            >
              {language === 'ar' 
                ? 'رحلة مصممة خصيصاً لك نحو النمو والتشافي والنجاح' 
                : 'A journey tailored specifically for your growth, healing, and success'}
            </motion.p>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border border-quaternary/20 group flex flex-col"
                >
                  <div className="w-16 h-16 rounded-2xl bg-quinary flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white group-hover:scale-110 transition-all duration-300">
                    <service.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-dark mb-3 font-playfair">{service.title}</h3>
                  <p className="text-dark/70 mb-6 leading-relaxed flex-grow">{service.description}</p>
                  
                  <div className="mt-auto pt-6 border-t border-gray-100 flex items-center justify-between">
                    <span className="font-bold text-secondary text-lg">{service.price}</span>
                    <Link to="/booking">
                      <Button variant="ghost" className="text-primary hover:text-secondary p-0 font-bold group-hover:translate-x-1 transition-transform hover:bg-transparent">
                        {language === 'ar' ? 'احجز الآن' : 'Book Now'} 
                        <ArrowRight className={`h-4 w-4 ${isRTL ? 'mr-2 rotate-180' : 'ml-2'}`} />
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="bg-gradient-to-r from-primary to-secondary rounded-3xl p-10 lg:p-16 text-center text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/20 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-white/20 rounded-full blur-3xl"></div>
              
              <h2 className="text-3xl lg:text-4xl font-bold mb-6 font-playfair relative z-10">
                {language === 'ar' ? 'لست متأكداً ما الذي يناسبك؟' : 'Not Sure What You Need?'}
              </h2>
              <p className="text-lg text-quinary mb-8 max-w-2xl mx-auto relative z-10">
                {language === 'ar' 
                  ? 'احجز استشارة مجانية لمدة 15 دقيقة لمناقشة احتياجاتك وتحديد المسار الأفضل لك.' 
                  : 'Book a free 15-minute consultation to discuss your needs and determine the best path for you.'}
              </p>
              <Link to="/contact">
                <Button size="lg" className="bg-white hover:bg-quinary text-primary font-bold px-8 py-6 relative z-10">
                  {language === 'ar' ? 'تواصل معنا' : 'Contact Us'}
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default ServicesPage;