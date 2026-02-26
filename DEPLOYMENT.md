# 🚀 دليل التسليم والنشر — موقع د. سارة

---

## ⚡ الطريقة الأسرع للتشغيل محلياً (للتسليم المبدئي)

### المتطلبات
- Node.js 18+ → [nodejs.org](https://nodejs.org)
- PostgreSQL → [postgresql.org/download](https://www.postgresql.org/download/)

### خطوة بخطوة

```bash
# 1. استنسخ المشروع وادخل عليه
cd Dr.sara-s-Website-master

# 2. شغّل سكريبت الإعداد التلقائي
bash setup.sh

# أو يدوياً:
# إنشاء قاعدة البيانات
psql -U postgres -c "CREATE DATABASE drsara_db;"
psql -U postgres -d drsara_db -f database/schema.sql

# تثبيت Dependencies
cd backend && npm install && cd ..
npm install

# 3. شغّل Backend (Terminal 1)
cd backend
npm start
# يجب أن ترى: ✅ Database connected | ✅ Running on http://localhost:5000

# 4. شغّل Frontend (Terminal 2)
npm run dev
# يجب أن ترى: Local: http://localhost:3000
```

### 🔑 بيانات الأدمن
| | |
|---|---|
| **الرابط** | http://localhost:3000/login |
| **Email** | dr.sara@example.com |
| **Password** | Admin@123 |

---

## ☁️ النشر المجاني على الإنترنت (Supabase + Render)

### الجزء 1: قاعدة البيانات على Supabase (مجاني)

1. روح [supabase.com](https://supabase.com) → Sign Up
2. اعمل Project جديد
3. من القائمة اليسرى → **SQL Editor**
4. انسخ كل محتوى ملف `database/schema.sql` والصقه واضغط **Run**
5. من **Settings → Database** انسخ هذه البيانات:
   - Host, Port, Database name, User, Password

### الجزء 2: Backend على Render (مجاني)

1. روح [render.com](https://render.com) → Sign Up
2. **New → Web Service**
3. اربطه بـ GitHub repo (ارفع المشروع أولاً)
4. الإعدادات:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. من **Environment Variables** أضف:
   ```
   DB_HOST=<من Supabase>
   DB_PORT=5432
   DB_NAME=<من Supabase>
   DB_USER=postgres
   DB_PASSWORD=<كلمة المرور>
   DB_SSL=true
   JWT_SECRET=dr-sara-super-secret-2024-change-this
   NODE_ENV=production
   FRONTEND_URL=https://your-site.vercel.app
   PORT=5000
   ```
6. انسخ الرابط اللي يعطيك إياه Render (مثل: `https://drsara-backend.onrender.com`)

### الجزء 3: Frontend على Vercel (مجاني)

1. روح [vercel.com](https://vercel.com) → Sign Up
2. **New Project** → ارفع الـ repository
3. **Environment Variables** أضف:
   ```
   VITE_API_URL=https://drsara-backend.onrender.com/api
   VITE_BASE_URL=https://drsara-backend.onrender.com
   ```
4. **Deploy** → انسخ الرابط النهائي

### الجزء 4: تحديث FRONTEND_URL في Render
- ارجع لـ Render → Environment Variables
- حدّث `FRONTEND_URL` بالرابط اللي أعطاك إياه Vercel

---

## 🐛 المشاكل الشائعة وحلولها

### ❌ "Database connection error"
```
الحل: تأكد PostgreSQL شغال
sudo service postgresql start   # Linux
# أو افتح pgAdmin وتأكد الـ service شغال

تأكد backend/.env صح:
DB_HOST=localhost
DB_PASSWORD=<كلمة مرورك>
```

### ❌ "Cannot GET /api/products"
```
الحل: تأكد البيكند شغال على port 5000
cd backend && npm start
```

### ❌ صفحة Login تعطي خطأ
```
الحل: تأكد الجداول تم إنشاؤها
psql -U postgres -d drsara_db -c "SELECT * FROM admins;"
إذا فاضية: شغّل schema.sql مرة ثانية
```

### ❌ الصور ما تظهر بعد الرفع
```
الحل: تأكد مجلد uploads موجود في backend/
mkdir -p backend/uploads
```

### ❌ "port already in use"
```bash
# اقتل البروسيس على port 5000
lsof -ti:5000 | xargs kill -9   # Mac/Linux
netstat -ano | findstr :5000    # Windows ثم أوقف العملية
```

---

## 📋 ملخص المشاكل اللي تم إصلاحها

| المشكلة | الملف | الإصلاح |
|---------|-------|---------|
| Port خطأ في api.js | `.env` | `VITE_API_URL=/api` (يستخدم vite proxy) |
| `bcrypt` مش `bcryptjs` | `backend/package.json` | يستخدم `bcryptjs` الصح |
| slug مش له default في categories | `schema.sql` | أضفنا slug تلقائي |
| لا يوجد `ON CONFLICT` في inserts | `schema.sql` | أضفنا لكل INSERT |
| activity_logs يفشل ويوقف العملية | `server.js` | `.catch(() => {})` |
| SSL مش configured لـ cloud DB | `server.js` | `DB_SSL=true` option |
| لا يوجد uploads folder check | `server.js` | `fs.mkdirSync` تلقائي |
| Transaction في create order | `server.js` | BEGIN/COMMIT/ROLLBACK |
| missing `GET /api/admin/me` | `server.js` | أضفناه |

---

## 🔐 قبل النشر النهائي (Production Checklist)

- [ ] غيّر `JWT_SECRET` لشيء عشوائي طويل
- [ ] غيّر باسورد الأدمن `Admin@123`
- [ ] أضف مفتاح Moyasar للدفع
- [ ] فعّل HTTPS
- [ ] ضع domain حقيقي في `FRONTEND_URL`
- [ ] راجع `cors` origin يكون domain محدد مش `*`

---

## 💡 ملاحظة للتسليم المبدئي

الموقع يعمل بشكل كامل **بدون** Moyasar (الدفع). الدكتورة تقدر:
- تدخل لوحة التحكم وتضيف المنتجات ✅
- تشوف الحجوزات ✅
- ترد على الرسائل ✅
- تنشر مقالات ✅

الدفع يضاف لاحقاً بعد التسجيل في [moyasar.com](https://moyasar.com)
