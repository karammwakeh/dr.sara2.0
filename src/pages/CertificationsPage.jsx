import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Award, GraduationCap, Medal } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const CertificationsPage = () => {
  const { language } = useLanguage();

  const certifications = [
    {
      title: language === 'ar' ? 'دكتوراه في علم النفس' : 'PhD in Psychology',
      institution: language === 'ar' ? 'جامعة ستانفورد' : 'Stanford University',
      year: '2010',
      description: language === 'ar' ? 'تخصص في علم النفس الإيجابي والسلوك البشري' : 'Specialization in Positive Psychology and Human Behavior',
      icon: GraduationCap,
    },
    {
      title: language === 'ar' ? 'مدرب حياة معتمد' : 'Certified Life Coach',
      institution: 'International Coach Federation (ICF)',
      year: '2012',
      description: language === 'ar' ? 'أعلى مستوى من الاعتماد المهني' : 'Highest level of professional accreditation',
      icon: Award,
    },
    {
      title: language === 'ar' ? 'خبير الصحة النفسية' : 'Mental Wellness Expert',
      institution: language === 'ar' ? 'الأكاديمية الأمريكية للصحة النفسية' : 'American Academy of Mental Wellness',
      year: '2015',
      description: language === 'ar' ? 'تدريب متخصص في اليقظة الذهنية وإدارة التوتر' : 'Specialized training in mindfulness and stress management',
      icon: Medal,
    },
  ];

  return (
    <>
      <Helmet>
        <title>{language === 'ar' ? 'الشهادات والإنجازات - د. سارة' : 'Certifications & Achievements - Dr. Sarah'}</title>
        <meta name="description" content={language === 'ar' ? 'تعرف على شهادات وإنجازات د. سارة' : 'Explore Dr. Sarah\'s certifications and achievements'} />
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
              {language === 'ar' ? 'الشهادات والإنجازات' : 'Certifications & Achievements'}
            </h1>
            <p className="text-xl text-dark/70 max-w-2xl mx-auto">
              {language === 'ar'
                ? 'رحلة من التعليم المستمر والتميز المهني'
                : 'A journey of continuous learning and professional excellence'}
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto space-y-8">
            {certifications.map((cert, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-shadow border border-quaternary/20"
              >
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0 text-white">
                    <cert.icon className="h-8 w-8" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-2xl font-bold text-dark">{cert.title}</h3>
                      <span className="text-secondary font-semibold">{cert.year}</span>
                    </div>
                    <p className="text-lg text-dark/70 mb-2">{cert.institution}</p>
                    <p className="text-dark/60">{cert.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default CertificationsPage;