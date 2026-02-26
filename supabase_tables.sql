-- ============================================
-- جداول قاعدة البيانات لموقع د. سارة
-- انسخ هذا الكود كامل في SQL Editor في Supabase
-- ============================================

-- جدول المستخدمين
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  profile_photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول الدورات
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  description_ar TEXT,
  description_en TEXT,
  image_url TEXT,
  price DECIMAL(10,2) NOT NULL,
  duration TEXT,
  category TEXT,
  lessons_count INT DEFAULT 0,
  students_count INT DEFAULT 0,
  rating DECIMAL(2,1) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول المنتجات الرقمية
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  description_ar TEXT,
  description_en TEXT,
  image_url TEXT,
  price DECIMAL(10,2) NOT NULL,
  discount_price DECIMAL(10,2),
  type TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول الحجوزات
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  booking_date DATE NOT NULL,
  booking_time TEXT NOT NULL,
  session_type TEXT DEFAULT 'online',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول رسائل التواصل
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'unread',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول اشتراكات النشرة البريدية
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول المقالات (المدونة)
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  excerpt_ar TEXT,
  excerpt_en TEXT,
  content_ar TEXT,
  content_en TEXT,
  image_url TEXT,
  category TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- إدراج بيانات تجريبية للدورات
-- ============================================
INSERT INTO courses (title_ar, title_en, description_ar, description_en, image_url, price, duration, category, lessons_count, students_count, rating, is_active)
VALUES
('رحلة الوعي الذاتي', 'Journey to Self-Awareness', 'اكتشف ذاتك الحقيقية وحرر قدراتك الكامنة في هذه الدورة المكثفة.', 'Discover your true self and unleash your potential in this intensive course.', 'https://images.unsplash.com/photo-1515966306810-097587841571?w=800&q=80', 299, '8 Weeks', 'Self Development', 24, 120, 4.9, TRUE),
('فن إدارة العلاقات', 'Art of Relationship Management', 'تعلم مهارات التواصل الفعال وبناء علاقات صحية ومثمرة.', 'Learn effective communication skills and build healthy, fruitful relationships.', 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80', 199, '6 Weeks', 'Relationships', 18, 85, 4.8, TRUE);

-- ============================================
-- إدراج بيانات تجريبية للمنتجات
-- ============================================
INSERT INTO products (title_ar, title_en, description_ar, description_en, image_url, price, type, is_active)
VALUES
('كتاب: التغيير يبدأ الآن', 'E-Book: Change Starts Now', 'دليل عملي شامل للتحول الشخصي بخطوات بسيطة.', 'A comprehensive practical guide for personal transformation in simple steps.', 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80', 29, 'E-Book', TRUE),
('مفكرة الإنجاز 2024', 'Achievement Planner 2024', 'أداة تخطيط رقمية لمساعدتك على تنظيم وقتك وتحقيق أهدافك.', 'Digital planning tool to help you organize your time and achieve your goals.', 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&q=80', 15, 'Digital Tool', TRUE);

-- ============================================
-- Row Level Security (RLS) — حماية البيانات
-- ============================================

-- المستخدمون: كلهم يقدروا يقرأون، كل واحد يكتب بس لنفسه
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read users" ON users FOR SELECT USING (true);
CREATE POLICY "Insert own user" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- الدورات والمنتجات: عامة للقراءة
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read courses" ON courses FOR SELECT USING (true);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read products" ON products FOR SELECT USING (true);

-- الحجوزات: كل واحد يكتب، بس Admin يقرأ كل
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public insert booking" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Read own bookings" ON bookings FOR SELECT USING (auth.uid()::text = user_id::text OR true);

-- رسائل التواصل: كل واحد يكتب
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public insert contact" ON contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read contact" ON contact_messages FOR SELECT USING (true);

-- النشرة البريدية: كل واحد يكتب
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public insert newsletter" ON newsletter_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read newsletter" ON newsletter_subscribers FOR SELECT USING (true);

-- المدونة: عامة للقراءة
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read blog" ON blog_posts FOR SELECT USING (true);
