import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { IMAGES } from '@/lib/theme';

const TestimonialsPage = () => {
  const { language } = useLanguage();

  const testimonials = [
    {
      name: language === 'ar' ? 'نورة أحمد' : 'Nora Ahmed',
      photo: IMAGES.testimonial1,
      text: language === 'ar'
        ? 'د. سارة ساعدتني في تحويل حياتي بالكامل. التدريب معها كان تجربة تحويلية حقيقية. أنصح الجميع بالعمل معها!'
        : 'Dr. Sarah helped me transform my life completely. Coaching with her was a truly transformative experience. I recommend everyone to work with her!',
      rating: 5,
    },
    {
      name: language === 'ar' ? 'ريم خالد' : 'Reem Khaled',
      photo: IMAGES.testimonial2,
      text: language === 'ar'
        ? 'الدورات المسجلة كانت مذهلة! استطعت التعلم بالسرعة التي تناسبني وحققت نتائج رائعة.'
        : 'The recorded courses were amazing! I could learn at my own pace and achieved wonderful results.',
      rating: 5,
    },
    {
      name: language === 'ar' ? 'مها سعيد' : 'Maha Said',
      photo: IMAGES.testimonial3,
      text: language === 'ar'
        ? 'المنتجات الرقمية عملية جداً وسهلة التطبيق. أنصح الجميع بها!'
        : 'The digital products are very practical and easy to apply. I recommend them to everyone!',
      rating: 5,
    },
    {
      name: language === 'ar' ? 'سارة محمد' : 'Sarah Mohammed',
      photo: IMAGES.testimonial4,
      text: language === 'ar'
        ? 'أفضل استثمار قمت به في نفسي. د. سارة محترفة ومتعاطفة وتساعدك حقاً على تحقيق أهدافك.'
        : 'Best investment I made in myself. Dr. Sarah is professional, empathetic, and truly helps you achieve your goals.',
      rating: 5,
    },
  ];

  return (
    <>
      <Helmet>
        <title>{language === 'ar' ? 'آراء العملاء - د. سارة' : 'Testimonials - Dr. Sarah'}</title>
        <meta name="description" content={language === 'ar' ? 'اقرأ آراء عملائنا' : 'Read our clients\' testimonials'} />
      </Helmet>

      <div className="min-h-screen bg-quinary/20 py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 
              className="text-4xl lg:text-5xl font-bold text-dark mb-4"
              style={{ fontFamily: language === 'ar' ? 'Cairo, sans-serif' : 'serif' }}
            >
              {language === 'ar' ? 'آراء العملاء' : 'Client Testimonials'}
            </h1>
            <p className="text-xl text-dark/70">
              {language === 'ar' ? 'قصص نجاح حقيقية من عملائنا' : 'Real success stories from our clients'}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-lg border border-quaternary/20"
              >
                <div className="flex items-center gap-4 mb-6">
                  <img
                    src={testimonial.photo}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover ring-2 ring-secondary"
                  />
                  <div>
                    <div className="font-bold text-dark text-lg">{testimonial.name}</div>
                    <div className="flex gap-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-secondary text-secondary" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-dark/80 italic">"{testimonial.text}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default TestimonialsPage;