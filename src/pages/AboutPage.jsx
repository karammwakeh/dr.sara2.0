import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Award, Heart, Target, Users } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { IMAGES } from '@/lib/theme';

const AboutPage = () => {
  const { language } = useLanguage();

  const values = [
    {
      icon: Heart,
      title: language === 'ar' ? 'التعاطف والرعاية' : 'Empathy & Care',
      description: language === 'ar' 
        ? 'نؤمن بقوة التعاطف في خلق بيئة آمنة للنمو الشخصي'
        : 'We believe in the power of empathy to create a safe space for personal growth',
    },
    {
      icon: Target,
      title: language === 'ar' ? 'التركيز على النتائج' : 'Results-Focused',
      description: language === 'ar'
        ? 'نعمل معك لتحقيق أهداف ملموسة وقابلة للقياس'
        : 'We work with you to achieve tangible, measurable goals',
    },
    {
      icon: Users,
      title: language === 'ar' ? 'نهج شمولي' : 'Holistic Approach',
      description: language === 'ar'
        ? 'ننظر إلى الشخص بأكمله: العقل والجسد والروح'
        : 'We look at the whole person: mind, body, and spirit',
    },
    {
      icon: Award,
      title: language === 'ar' ? 'التميز المهني' : 'Professional Excellence',
      description: language === 'ar'
        ? 'نلتزم بأعلى معايير الممارسة المهنية'
        : 'We maintain the highest standards of professional practice',
    },
  ];

  return (
    <>
      <Helmet>
        <title>{language === 'ar' ? 'عن د. سارة - خبيرة التدريب على الحياة' : 'About Dr. Sarah - Life Coaching Expert'}</title>
        <meta 
          name="description" 
          content={language === 'ar' 
            ? 'تعرف على د. سارة، خبيرة التدريب على الحياة والصحة النفسية'
            : 'Learn about Dr. Sarah, Life Coaching and Mental Wellness Expert'
          } 
        />
      </Helmet>

      <div className="min-h-screen bg-quinary/20">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-br from-primary to-secondary">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-3xl mx-auto"
            >
              <h1 
                className="text-4xl lg:text-5xl font-bold text-white mb-6"
                style={{ fontFamily: language === 'ar' ? 'Cairo, sans-serif' : 'serif' }}
              >
                {language === 'ar' ? 'عن د. سارة' : 'About Dr. Sarah'}
              </h1>
              <p className="text-xl text-white/90">
                {language === 'ar'
                  ? 'رحلة من الشغف إلى التأثير الإيجابي في حياة الآخرين'
                  : 'A journey from passion to positive impact in others\' lives'}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Biography Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <img
                  src={IMAGES.doctorAbout}
                  alt="Dr. Sarah"
                  className="rounded-2xl shadow-2xl w-full"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 
                  className="text-3xl font-bold text-dark mb-6"
                  style={{ fontFamily: language === 'ar' ? 'Cairo, sans-serif' : 'serif' }}
                >
                  {language === 'ar' ? 'قصتي' : 'My Story'}
                </h2>
                <div className="space-y-4 text-dark/80">
                  <p>
                    {language === 'ar'
                      ? 'د. سارة هي خبيرة معتمدة في التدريب على الحياة والصحة النفسية مع أكثر من 15 عاماً من الخبرة في مساعدة الأفراد على تحقيق إمكاناتهم الكاملة. بدأت رحلتها من شغف عميق لفهم السلوك البشري والرغبة في إحداث تأثير إيجابي في حياة الناس.'
                      : 'Dr. Sarah is a certified Life Coach and Mental Wellness Expert with over 15 years of experience helping individuals achieve their full potential. Her journey began with a deep passion for understanding human behavior and a desire to make a positive impact in people\'s lives.'}
                  </p>
                  <p>
                    {language === 'ar'
                      ? 'حصلت د. سارة على شهادات متعددة في علم النفس، التدريب على الحياة، والصحة النفسية من أرقى المؤسسات العالمية. تجمع منهجيتها الفريدة بين علم النفس الإيجابي، اليقظة الذهنية، والممارسات القائمة على الأدلة لمساعدة عملائها على التغلب على التحديات وتحقيق أهدافهم.'
                      : 'Dr. Sarah holds multiple certifications in psychology, life coaching, and mental wellness from prestigious international institutions. Her unique methodology combines positive psychology, mindfulness, and evidence-based practices to help her clients overcome challenges and achieve their goals.'}
                  </p>
                  <p>
                    {language === 'ar'
                      ? 'على مدار مسيرتها المهنية، ساعدت د. سارة أكثر من 5000 عميل على تحويل حياتهم، من رواد الأعمال والمديرين التنفيذيين إلى الأمهات والطلاب. تؤمن بأن لدى كل شخص القدرة على النمو والتطور، وأن التدريب المناسب يمكن أن يطلق العنان لهذه القدرات.'
                      : 'Throughout her career, Dr. Sarah has helped over 5,000 clients transform their lives, from entrepreneurs and executives to mothers and students. She believes that everyone has the capacity for growth and development, and that the right coaching can unlock these abilities.'}
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 
                className="text-3xl lg:text-4xl font-bold text-dark mb-4"
                style={{ fontFamily: language === 'ar' ? 'Cairo, sans-serif' : 'serif' }}
              >
                {language === 'ar' ? 'قيمنا' : 'Our Values'}
              </h2>
              <p className="text-dark/70 max-w-2xl mx-auto">
                {language === 'ar'
                  ? 'المبادئ التي توجه عملنا وتشكل نهجنا في التدريب'
                  : 'The principles that guide our work and shape our coaching approach'}
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center p-6 rounded-2xl bg-quinary/10 hover:bg-quinary/30 transition-colors"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white">
                    <value.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-dark mb-3">{value.title}</h3>
                  <p className="text-dark/70">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-quaternary to-quinary rounded-2xl p-8 shadow-lg"
              >
                <h3 
                  className="text-2xl font-bold text-primary mb-4"
                  style={{ fontFamily: language === 'ar' ? 'Cairo, sans-serif' : 'serif' }}
                >
                  {language === 'ar' ? 'رؤيتنا' : 'Our Vision'}
                </h3>
                <p className="text-dark/80">
                  {language === 'ar'
                    ? 'نسعى لخلق عالم يشعر فيه كل فرد بالتمكين لتحقيق إمكاناته الكاملة والعيش بحياة متوازنة ومُرضية. نؤمن بأن التدريب الفعال يمكن أن يحول الحياة ويخلق تأثيراً إيجابياً يمتد إلى العائلات والمجتمعات.'
                    : 'We strive to create a world where every individual feels empowered to achieve their full potential and live a balanced, fulfilling life. We believe that effective coaching can transform lives and create positive impact that extends to families and communities.'}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-primary to-secondary rounded-2xl p-8 shadow-lg text-white"
              >
                <h3 
                  className="text-2xl font-bold mb-4"
                  style={{ fontFamily: language === 'ar' ? 'Cairo, sans-serif' : 'serif' }}
                >
                  {language === 'ar' ? 'مهمتنا' : 'Our Mission'}
                </h3>
                <p className="text-white/90">
                  {language === 'ar'
                    ? 'مهمتنا هي توفير تدريب عالي الجودة يجمع بين الخبرة المهنية والتعاطف الإنساني. نلتزم بمساعدة عملائنا على اكتشاف قوتهم الداخلية، التغلب على التحديات، وبناء حياة تتماشى مع قيمهم وأهدافهم.'
                    : 'Our mission is to provide high-quality coaching that combines professional expertise with human empathy. We are committed to helping our clients discover their inner strength, overcome challenges, and build lives aligned with their values and goals.'}
                </p>
              </motion.div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default AboutPage;