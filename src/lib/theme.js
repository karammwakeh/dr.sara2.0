// ============================================================
// ⚙️  ملف الإعداد المركزي — كل الألوان والصور في مكان واحد
// لتغيير لون أو صورة فقط عدّل القيمة هنا وخلاص
// ============================================================

// ─── الألوان ───────────────────────────────────────────────
// هذه نفس القيم الموجودة في tailwind.config.js
// لو غيّرت هنا تذكر تغيّر في tailwind.config.js أيضاً
export const COLORS = {
  primary:     '#7F00FF',   // البنفسجي العميق  — الهيدر، الأزرار الرئيسية، الشعار
  secondary:   '#993AFE',   // البنفسجي المتوسط — الأزرار الثانوية، الروابط
  tertiary:    '#B373FD',   // البنفسجي الخفيف  — الحدود، الظلال
  quaternary:  '#CDADFC',   // البنفسجي الناعم  — عناوين الفوتر
  quinary:     '#E6E6FA',   // البنفسجي الفاتح  — خلفيات الصفحات والكارد
  dark:        '#1A1A2E',   // الداكن            — النصوص والعناوين
};

// ─── الصور ─────────────────────────────────────────────────
// كل صورة سميتها بالاسم الوضوح — غيّر القيمة لرابط صورة جديد
export const IMAGES = {
  // صورة الخلفية الكبيرة في الهيرو (صفحة الرئيسية)
  hero:          'https://images.unsplash.com/photo-1649215636705-1084bd6df97a?q=80&w=2070&auto=format&fit=crop',

  // صورة الدكتورة (تظهر في الرئيسية + صفحة عن)
  doctor:        'https://images.unsplash.com/photo-1613186267015-46dc938f2b8f?w=800&q=80',
  doctorAbout:   'https://images.unsplash.com/photo-1613186267015-46dc938f2b8f?w=800&h=1000&fit=crop',

  // صور الدورات
  course1:       'https://images.unsplash.com/photo-1515966306810-097587841571?w=800&q=80',
  course2:       'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80',

  // صور المنتجات
  product1:      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80',
  product2:      'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&q=80',

  // صور المدونة
  blog1:         'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&q=80',
  blog2:         'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&q=80',
  blog3:         'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80',

  // صور الشهادات (آراء العملاء)
  testimonial1:  'https://images.unsplash.com/photo-1573496130141-209d200cebd8?w=150&h=150&fit=crop',
  testimonial2:  'https://images.unsplash.com/photo-1631821657340-b07983bfc5f9?w=150&h=150&fit=crop',
  testimonial3:  'https://images.unsplash.com/photo-1608915812295-417351ccf39b?w=150&h=150&fit=crop',
  testimonial4:  'https://images.unsplash.com/photo-1493655161922-ef98929de9d8?w=150&h=150&fit=crop',
};
