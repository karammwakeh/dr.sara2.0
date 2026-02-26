import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFoundPage = () => (
  <div className="min-h-screen bg-quinary/20 flex items-center justify-center" dir="rtl">
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="text-center px-4">
      <div className="text-9xl font-bold text-primary/20 mb-4">404</div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">الصفحة غير موجودة</h1>
      <p className="text-gray-600 mb-8">عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.</p>
      <Link to="/" className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-secondary transition-all">
        العودة للرئيسية
      </Link>
    </motion.div>
  </div>
);

export default NotFoundPage;
