import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Tv, Radio, Newspaper } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const MediaPage = () => {
  const { language } = useLanguage();

  return (
    <>
      <Helmet>
        <title>{language === 'ar' ? 'الإعلام - د. سارة' : 'Media - Dr. Sarah'}</title>
        <meta name="description" content={language === 'ar' ? 'ظهورات د. سارة الإعلامية' : 'Dr. Sarah\'s media appearances'} />
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
              {language === 'ar' ? 'الإعلام' : 'Media'}
            </h1>
            <p className="text-xl text-dark/70">
              {language === 'ar' 
                ? 'لقاءات تلفزيونية، بودكاست، وتغطيات إعلامية'
                : 'TV interviews, podcasts, and media coverage'}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 shadow-lg text-center hover:shadow-xl transition-shadow border border-quaternary/20"
            >
              <Tv className="h-16 w-16 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-dark mb-2">
                {language === 'ar' ? 'لقاءات تلفزيونية' : 'TV Interviews'}
              </h3>
              <p className="text-dark/70">
                {language === 'ar' ? '25+ ظهور تلفزيوني' : '25+ TV appearances'}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-8 shadow-lg text-center hover:shadow-xl transition-shadow border border-quaternary/20"
            >
              <Radio className="h-16 w-16 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-dark mb-2">
                {language === 'ar' ? 'بودكاست' : 'Podcasts'}
              </h3>
              <p className="text-dark/70">
                {language === 'ar' ? '40+ حلقة بودكاست' : '40+ podcast episodes'}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-8 shadow-lg text-center hover:shadow-xl transition-shadow border border-quaternary/20"
            >
              <Newspaper className="h-16 w-16 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-dark mb-2">
                {language === 'ar' ? 'تغطيات صحفية' : 'Press Coverage'}
              </h3>
              <p className="text-dark/70">
                {language === 'ar' ? '50+ مقال صحفي' : '50+ press articles'}
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MediaPage;