import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Search, Calendar, User, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { IMAGES } from '@/lib/theme';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const BlogPage = () => {
  const { language, isRTL } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');

  const posts = [
    {
      id: 1,
      title: language === 'ar' ? 'كيف تتغلب على القلق؟' : 'How to Overcome Anxiety?',
      excerpt: language === 'ar' 
        ? 'خطوات عملية وبسيطة للتعامل مع نوبات القلق والتوتر في الحياة اليومية.'
        : 'Practical and simple steps to deal with anxiety attacks and stress in daily life.',
      image: IMAGES.blog1,
      category: 'Mental Health',
      date: 'Oct 15, 2023',
      author: 'Dr. Sarah'
    },
    {
      id: 2,
      title: language === 'ar' ? 'قوة العادات الصغيرة' : 'The Power of Tiny Habits',
      excerpt: language === 'ar'
        ? 'كيف يمكن للتغييرات الصغيرة أن تؤدي إلى نتائج مذهلة على المدى الطويل.'
        : 'How small changes can lead to amazing results in the long run.',
      image: IMAGES.blog2,
      category: 'Self Growth',
      date: 'Oct 22, 2023',
      author: 'Dr. Sarah'
    },
    {
      id: 3,
      title: language === 'ar' ? 'التوازن بين العمل والحياة' : 'Work-Life Balance',
      excerpt: language === 'ar'
        ? 'استراتيجيات فعالة للحفاظ على صحتك النفسية أثناء تحقيق طموحاتك المهنية.'
        : 'Effective strategies to maintain your mental health while achieving your professional ambitions.',
      image: IMAGES.blog3,
      category: 'Lifestyle',
      date: 'Nov 01, 2023',
      author: 'Dr. Sarah'
    }
  ];

  return (
    <>
      <Helmet>
        <title>{language === 'ar' ? 'المدونة - د. سارة' : 'Blog - Dr. Sarah'}</title>
      </Helmet>

      <div className="min-h-screen bg-quinary/20">
        <section className="bg-primary text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl lg:text-5xl font-bold font-playfair mb-6">
              {language === 'ar' ? 'المقالات والمصادر' : 'Articles & Resources'}
            </h1>
            <div className="max-w-xl mx-auto relative">
              <input
                type="text"
                placeholder={language === 'ar' ? 'ابحث عن مقال...' : 'Search articles...'}
                className="w-full py-4 px-6 rounded-full text-dark bg-white focus:outline-none focus:ring-2 focus:ring-secondary shadow-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'left-2' : 'right-2'} p-2 bg-secondary rounded-full text-white hover:bg-secondary/90 transition-colors`}>
                <Search className="h-5 w-5" />
              </button>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post, idx) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group"
                >
                  <div className="h-48 overflow-hidden relative">
                    <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-primary">
                      {post.category}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {post.date}</span>
                      <span className="flex items-center gap-1"><User className="h-3 w-3" /> {post.author}</span>
                    </div>
                    <h3 className="text-xl font-bold text-dark mb-3 font-playfair group-hover:text-secondary transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-dark/70 mb-4 text-sm leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>
                    <Button variant="link" className="p-0 text-secondary font-bold hover:text-primary transition-colors group/btn">
                      {language === 'ar' ? 'اقرأ المزيد' : 'Read More'} 
                      <ArrowRight className={`h-4 w-4 ${isRTL ? 'mr-2 rotate-180' : 'ml-2'} transition-transform group-hover/btn:translate-x-1`} />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default BlogPage;