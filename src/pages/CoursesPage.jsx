import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Clock, Users, Star, ShoppingCart, PlayCircle, BookOpen } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { IMAGES } from '@/lib/theme';
import { Link } from 'react-router-dom';
import { getProducts } from '../services/api';

const CoursesPage = () => {
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  console.log(BASE_URL);
  const [ products, setProducts ] = useState([]);
  const [ loading, setLoading ] = useState(true);
  const { language } = useLanguage();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('courses');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data.products);
      } catch (error) {
        console.error(error);
        toast({
          title: "Error",
          description: "Failed to load products",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const courses = [
    {
      id: 'c1',
      title: language === 'ar' ? 'رحلة الوعي الذاتي' : 'Journey to Self-Awareness',
      description: language === 'ar' ? 'اكتشف ذاتك الحقيقية وحرر قدراتك الكامنة في هذه الدورة المكثفة.' : 'Discover your true self and unleash your potential in this intensive course.',
      image: IMAGES.course1,
      price: 299,
      duration: '8 Weeks',
      students: 120,
      rating: 4.9,
      lessons: 24,
      category: 'Self Development'
    },
    {
      id: 'c2',
      title: language === 'ar' ? 'فن إدارة العلاقات' : 'Art of Relationship Management',
      description: language === 'ar' ? 'تعلم مهارات التواصل الفعال وبناء علاقات صحية ومثمرة.' : 'Learn effective communication skills and build healthy, fruitful relationships.',
      image: IMAGES.course2,
      price: 199,
      duration: '6 Weeks',
      students: 85,
      rating: 4.8,
      lessons: 18,
      category: 'Relationships'
    },
  ];

  // const products = [
  //   {
  //     id: 'p1',
  //     title: language === 'ar' ? 'كتاب: التغيير يبدأ الآن' : 'E-Book: Change Starts Now',
  //     description: language === 'ar' ? 'دليل عملي شامل للتحول الشخصي بخطوات بسيطة.' : 'A comprehensive practical guide for personal transformation in simple steps.',
  //     price: 29,
  //     type: 'E-Book',
  //     image: IMAGES.product1,
  //   },
  //   {
  //     id: 'p2',
  //     title: language === 'ar' ? 'مفكرة الإنجاز 2024' : 'Achievement Planner 2024',
  //     description: language === 'ar' ? 'أداة تخطيط رقمية لمساعدتك على تنظيم وقتك وتحقيق أهدافك.' : 'Digital planning tool to help you organize your time and achieve your goals.',
  //     price: 15,
  //     type: 'Digital Tool',
  //     image: IMAGES.product2,
  //   },
  // ];

  const handleEnroll = () => {
    toast({
      title: "Enrollment Started",
      description: "Redirecting to checkout...",
    });
  };

  return (
    <>
      <Helmet>
        <title>{language === 'ar' ? 'المتجر التعليمي - د. سارة' : 'Learning Store - Dr. Sarah'}</title>
      </Helmet>

      <div className="min-h-screen bg-quinary/20">
        {/* Header */}
        <section className="bg-primary text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold font-playfair mb-4">
              {language === 'ar' ? 'أكاديمية التعلم' : 'Learning Academy'}
            </h1>
            <p className="text-quinary max-w-2xl mx-auto text-lg">
              {language === 'ar' ? 'استثمر في نفسك مع دوراتنا ومنتجاتنا المتميزة' : 'Invest in yourself with our premium courses and products'}
            </p>
          </div>
        </section>

        {/* Tabs */}
        <div className="container mx-auto px-4 -mt-8">
          <div className="bg-white rounded-xl shadow-lg p-2 flex max-w-md mx-auto relative z-10">
            <button
              onClick={() => setActiveTab('courses')}
              className={`flex-1 py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'courses' ? 'bg-secondary text-white shadow-md' : 'text-gray-500 hover:bg-quinary'
                }`}
            >
              <PlayCircle className="h-5 w-5" />
              {language === 'ar' ? 'الدورات' : 'Courses'}
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`flex-1 py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'products' ? 'bg-secondary text-white shadow-md' : 'text-gray-500 hover:bg-quinary'
                }`}
            >
              <BookOpen className="h-5 w-5" />
              {language === 'ar' ? 'المنتجات' : 'Products'}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-12">
          {activeTab === 'courses' ? (
            <div className="grid md:grid-cols-2 gap-8">
              {courses.map((course) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group border border-transparent hover:border-secondary/20"
                >
                  <div className="relative h-64 overflow-hidden">
                    <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-primary shadow-sm">
                      {course.category}
                    </div>
                  </div>
                  <div className="p-8">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-dark mb-2 font-playfair">{course.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {course.duration}</span>
                          <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {course.students}</span>
                          <span className="flex items-center gap-1 text-secondary"><Star className="h-4 w-4 fill-current" /> {course.rating}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-dark/70 mb-8 leading-relaxed">{course.description}</p>
                    <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                      <span className="text-3xl font-bold text-primary">${course.price}</span>
                      <Button onClick={handleEnroll} className="bg-primary hover:bg-secondary text-white px-8">
                        {language === 'ar' ? 'سجل الآن' : 'Enroll Now'}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
                >
                  <div className="h-64 bg-gray-100 relative overflow-hidden group">
                    <img src={`${BASE_URL}${product.images[0]}`} alt={product.name_ar} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        onClick={() => addToCart(product)}
                        className="bg-secondary text-white font-bold hover:bg-white hover:text-primary"
                      >
                        {language === 'ar' ? 'أضف للسلة' : 'Quick Add'}
                      </Button>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="text-xs font-bold text-secondary mb-2 uppercase tracking-wide">{product.type}</div>
                    <h3 className="text-xl font-bold text-dark mb-3 font-playfair">{product.name_ar}</h3>
                    <p className="text-dark/70 text-sm mb-4">{product.description}</p>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-2xl font-bold text-primary">${product.price}</span>
                      <Button
                        onClick={() => addToCart(product)}
                        variant="outline"
                        size="sm"
                        className="border-primary text-primary hover:bg-primary hover:text-white"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        {language === 'ar' ? 'شراء' : 'Add'}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CoursesPage;