// server.js - Backend API Server (Fixed & Complete)
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
const PORT = process.env.PORT || 5000;

// ===================================
// Database Connection
// ===================================
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Database connection error:', err.message);
    } else {
        console.log('✅ Database connected successfully');
        release();
    }
});

// ===================================
// Middleware
// ===================================
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// File Upload
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'dr-sara-products',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    },
});
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        /jpeg|jpg|png|gif|webp/.test(file.mimetype) ? cb(null, true) : cb(new Error('Images only'));
    }
});

// ===================================
// Auth Middleware
// ===================================
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });
    jwt.verify(token, process.env.JWT_SECRET || 'dr-sara-secret-key-2024', (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Invalid or expired token' });
        req.admin = decoded;
        next();
    });
};

// ===================================
// AUTH ROUTES
// ===================================
app.post('/api/admin/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

        const result = await pool.query('SELECT * FROM admins WHERE email=$1 AND is_active=true', [email]);
        if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

        const admin = result.rows[0];
        if (!await bcrypt.compare(password, admin.password_hash)) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign(
            { id: admin.id, email: admin.email, role: admin.role, full_name: admin.full_name },
            process.env.JWT_SECRET || 'dr-sara-secret-key-2024',
            { expiresIn: '24h' }
        );
        res.json({ token, admin: { id: admin.id, email: admin.email, full_name: admin.full_name, role: admin.role } });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/admin/me', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT id, email, full_name, role FROM admins WHERE id=$1', [req.admin.id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Admin not found' });
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// ===================================
// CATEGORIES ROUTES
// ===================================
app.get('/api/categories', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM categories WHERE is_active=true ORDER BY display_order, name_ar');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/admin/categories', authenticateToken, async (req, res) => {
    try {
        const { name_ar, name_en, description } = req.body;
        const slug = (name_en || name_ar).toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') + '-' + Date.now();
        const result = await pool.query(
            'INSERT INTO categories (name_ar, name_en, slug, description) VALUES ($1,$2,$3,$4) RETURNING *',
            [name_ar, name_en || null, slug, description || null]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

app.put('/api/admin/categories/:id', authenticateToken, async (req, res) => {
    try {
        const { name_ar, name_en, description, is_active } = req.body;
        const result = await pool.query(
            'UPDATE categories SET name_ar=$1, name_en=$2, description=$3, is_active=$4, updated_at=NOW() WHERE id=$5 RETURNING *',
            [name_ar, name_en || null, description || null, is_active !== false, req.params.id]
        );
        if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.delete('/api/admin/categories/:id', authenticateToken, async (req, res) => {
    try {
        await pool.query('UPDATE categories SET is_active=false WHERE id=$1', [req.params.id]);
        res.json({ message: 'Category deactivated' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// ===================================
// PRODUCTS ROUTES
// ===================================
app.get('/api/products', async (req, res) => {
    try {
        const { category, status, search, featured, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;
        let conditions = ['1=1'];
        const params = [];
        let pc = 1;

        if (category) { conditions.push(`p.category_id=$${pc++}`); params.push(category); }
        if (status) { conditions.push(`p.status=$${pc++}`); params.push(status); }
        if (featured === 'true') conditions.push('p.is_featured=true');
        if (search) { conditions.push(`(p.name_ar ILIKE $${pc} OR p.short_description ILIKE $${pc})`); params.push(`%${search}%`); pc++; }

        const where = 'WHERE ' + conditions.join(' AND ');
        const result = await pool.query(
            `SELECT p.*, c.name_ar as category_name FROM products p LEFT JOIN categories c ON p.category_id=c.id ${where} ORDER BY p.is_featured DESC, p.created_at DESC LIMIT $${pc} OFFSET $${pc + 1}`,
            [...params, limit, offset]
        );
        const countResult = await pool.query(`SELECT COUNT(*) FROM products p ${where}`, params);

        res.json({ products: result.rows, total: parseInt(countResult.rows[0].count), page: parseInt(page), totalPages: Math.ceil(countResult.rows[0].count / limit) });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

app.get('/api/products/:id', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT p.*, c.name_ar as category_name FROM products p LEFT JOIN categories c ON p.category_id=c.id WHERE p.id=$1',
            [req.params.id]
        );
        if (!result.rows.length) return res.status(404).json({ error: 'Product not found' });
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/admin/products', authenticateToken, upload.array('images', 5), async (req, res) => {
    try {
        const { category_id, name_ar, name_en, price, sale_price, short_description, description, stock_quantity, sku, track_inventory, is_featured, is_digital, status } = req.body;
        if (!name_ar || !price) return res.status(400).json({ error: 'Name and price are required' });

        const images = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];
        const finalSku = sku || 'SKU-' + Date.now();

        const result = await pool.query(
            `INSERT INTO products (category_id,name_ar,name_en,price,sale_price,short_description,description,stock_quantity,sku,track_inventory,is_featured,is_digital,status,images)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`,
            [
                category_id || null, name_ar, name_en || null,
                parseFloat(price), sale_price ? parseFloat(sale_price) : null,
                short_description || null, description || null,
                parseInt(stock_quantity) || 0, finalSku,
                track_inventory !== 'false',
                is_featured === 'true' || is_featured === true,
                is_digital === 'true' || is_digital === true,
                status || 'published', JSON.stringify(images)
            ]
        );
        await pool.query('INSERT INTO activity_logs (admin_id,action,entity_type,entity_id,description) VALUES ($1,$2,$3,$4,$5)', [req.admin.id, 'created', 'product', result.rows[0].id, `Created: ${name_ar}`]).catch(() => { });
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

app.put('/api/admin/products/:id', authenticateToken, upload.array('images', 5), async (req, res) => {
    try {
        const { category_id, name_ar, name_en, price, sale_price, short_description, description, stock_quantity, sku, track_inventory, is_featured, is_digital, status, existing_images } = req.body;
        let images = [];
        try { images = existing_images ? JSON.parse(existing_images) : []; } catch { images = []; }
        if (req.files?.length) images = [...images, ...req.files.map(f => `/uploads/${f.filename}`)];

        const result = await pool.query(
            `UPDATE products SET category_id=$1,name_ar=$2,name_en=$3,price=$4,sale_price=$5,short_description=$6,description=$7,stock_quantity=$8,sku=$9,track_inventory=$10,is_featured=$11,is_digital=$12,status=$13,images=$14,updated_at=NOW() WHERE id=$15 RETURNING *`,
            [category_id || null, name_ar, name_en || null, parseFloat(price), sale_price ? parseFloat(sale_price) : null, short_description || null, description || null, parseInt(stock_quantity) || 0, sku, track_inventory !== 'false', is_featured === 'true' || is_featured === true, is_digital === 'true' || is_digital === true, status || 'published', JSON.stringify(images), req.params.id]
        );
        if (!result.rows.length) return res.status(404).json({ error: 'Product not found' });
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

app.delete('/api/admin/products/:id', authenticateToken, async (req, res) => {
    try {
        const product = await pool.query('SELECT name_ar FROM products WHERE id=$1', [req.params.id]);
        if (!product.rows.length) return res.status(404).json({ error: 'Product not found' });
        await pool.query('DELETE FROM products WHERE id=$1', [req.params.id]);
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// ===================================
// ORDERS ROUTES
// ===================================
app.get('/api/admin/orders', authenticateToken, async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;
        let conditions = ['1=1'];
        const params = [];
        let pc = 1;
        if (status) { conditions.push(`status=$${pc++}`); params.push(status); }
        const where = 'WHERE ' + conditions.join(' AND ');
        const result = await pool.query(`SELECT * FROM orders ${where} ORDER BY created_at DESC LIMIT $${pc} OFFSET $${pc + 1}`, [...params, limit, offset]);
        const count = await pool.query(`SELECT COUNT(*) FROM orders ${where}`, params);
        res.json({ orders: result.rows, total: parseInt(count.rows[0].count), page: parseInt(page), totalPages: Math.ceil(count.rows[0].count / limit) });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/admin/orders/:id', authenticateToken, async (req, res) => {
    try {
        const order = await pool.query('SELECT * FROM orders WHERE id=$1', [req.params.id]);
        if (!order.rows.length) return res.status(404).json({ error: 'Order not found' });
        const items = await pool.query('SELECT * FROM order_items WHERE order_id=$1', [req.params.id]);
        res.json({ ...order.rows[0], items: items.rows });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.patch('/api/admin/orders/:id/status', authenticateToken, async (req, res) => {
    try {
        const { status, tracking_number } = req.body;
        let set = 'status=$1, updated_at=NOW()';
        const params = [status];
        if (status === 'shipped' && tracking_number) { set += ', tracking_number=$2, shipped_at=NOW()'; params.push(tracking_number); }
        else if (status === 'delivered') set += ', delivered_at=NOW()';
        params.push(req.params.id);
        const result = await pool.query(`UPDATE orders SET ${set} WHERE id=$${params.length} RETURNING *`, params);
        if (!result.rows.length) return res.status(404).json({ error: 'Order not found' });
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/orders', async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { customer, items, shipping, payment_method, coupon_code } = req.body;
        if (!customer || !items?.length) return res.status(400).json({ error: 'Customer info and items required' });

        const products = await client.query('SELECT * FROM products WHERE id = ANY($1)', [items.map(i => i.product_id)]);
        const productMap = {};
        products.rows.forEach(p => productMap[p.id] = p);

        let subtotal = 0;
        for (const item of items) {
            const product = productMap[item.product_id];
            if (!product) throw new Error(`Product not found: ${item.product_id}`);
            subtotal += (product.sale_price || product.price) * item.quantity;
        }

        const shippingMethod = shipping?.method_id ? await client.query('SELECT * FROM shipping_methods WHERE id=$1', [shipping.method_id]) : { rows: [] };
        const sm = shippingMethod.rows[0];
        let shippingCost = sm?.price || 0;
        if (sm?.free_shipping_threshold && subtotal >= sm.free_shipping_threshold) shippingCost = 0;

        let discount = 0;
        if (coupon_code) {
            const coupon = await client.query(`SELECT * FROM coupons WHERE UPPER(code)=UPPER($1) AND is_active=true AND (expires_at IS NULL OR expires_at > NOW()) AND (usage_limit IS NULL OR times_used < usage_limit)`, [coupon_code]);
            if (coupon.rows.length && subtotal >= (coupon.rows[0].minimum_order_amount || 0)) {
                discount = coupon.rows[0].discount_type === 'percentage' ? subtotal * coupon.rows[0].discount_value / 100 : coupon.rows[0].discount_value;
                await client.query('UPDATE coupons SET times_used=times_used+1 WHERE id=$1', [coupon.rows[0].id]);
            }
        }

        const tax = (subtotal - discount) * 0.15;
        const total = subtotal + shippingCost - discount + tax;
        const orderNumber = 'ORD-' + Date.now();

        let customerId;
        const existing = await client.query('SELECT id FROM customers WHERE email=$1', [customer.email]);
        if (existing.rows.length) { customerId = existing.rows[0].id; }
        else { const nc = await client.query('INSERT INTO customers (email,phone,first_name,last_name) VALUES ($1,$2,$3,$4) RETURNING id', [customer.email, customer.phone, customer.first_name, customer.last_name]); customerId = nc.rows[0].id; }

        const order = await client.query(
            `INSERT INTO orders (order_number,customer_id,customer_email,customer_phone,customer_name,shipping_address,subtotal,shipping_cost,tax,discount,total,coupon_code,status,payment_method,shipping_method,payment_status)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'pending',$13,$14,'pending') RETURNING *`,
            [orderNumber, customerId, customer.email, customer.phone, `${customer.first_name} ${customer.last_name}`, JSON.stringify(shipping?.address || {}), subtotal, shippingCost, tax, discount, total, coupon_code || null, payment_method, sm?.name_ar || 'standard']
        );

        for (const item of items) {
            const p = productMap[item.product_id];
            const price = p.sale_price || p.price;
            await client.query(`INSERT INTO order_items (order_id,product_id,product_name,product_sku,product_image,price,quantity,subtotal) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
                [order.rows[0].id, item.product_id, p.name_ar, p.sku, p.images?.[0] || null, price, item.quantity, price * item.quantity]);
        }

        await client.query('COMMIT');
        res.status(201).json({ order_id: order.rows[0].id, order_number: orderNumber, total, subtotal, shipping_cost: shippingCost, tax, discount, status: 'pending' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Create order error:', error);
        res.status(500).json({ error: 'فشل إنشاء الطلب', details: error.message });
    } finally { client.release(); }
});

app.get('/api/orders/public/:id', async (req, res) => {
    try {
        const result = await pool.query('SELECT id,order_number,total,payment_status,status,shipping_method,created_at FROM orders WHERE id=$1', [req.params.id]);
        if (!result.rows.length) return res.status(404).json({ error: 'Order not found' });
        res.json(result.rows[0]);
    } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/coupons/validate', async (req, res) => {
    try {
        const { code, amount } = req.body;
        const result = await pool.query(`SELECT * FROM coupons WHERE UPPER(code)=UPPER($1) AND is_active=true AND (expires_at IS NULL OR expires_at > NOW()) AND (usage_limit IS NULL OR times_used < usage_limit)`, [code]);
        if (!result.rows.length) return res.json({ valid: false, error: 'الكوبون غير صالح' });
        const coupon = result.rows[0];
        if (amount < (coupon.minimum_order_amount || 0)) return res.json({ valid: false, error: `الحد الأدنى ${coupon.minimum_order_amount} ر.س` });
        const discount = coupon.discount_type === 'percentage' ? amount * coupon.discount_value / 100 : coupon.discount_value;
        res.json({ valid: true, discount: Math.min(discount, amount), code: coupon.code });
    } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

// ===================================
// SHIPPING ROUTES
// ===================================
app.get('/api/shipping/methods', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM shipping_methods WHERE is_active=true ORDER BY display_order');
        res.json(result.rows);
    } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/shipping/calculate', async (req, res) => {
    try {
        const { shipping_method_id } = req.body;
        const method = await pool.query('SELECT * FROM shipping_methods WHERE id=$1 AND is_active=true', [shipping_method_id]);
        if (!method.rows.length) return res.status(404).json({ error: 'طريقة الشحن غير موجودة' });
        const m = method.rows[0];
        res.json({ method: m.name_ar, cost: m.price, estimated_days: `${m.estimated_days_min}-${m.estimated_days_max} أيام عمل`, free_shipping_threshold: m.free_shipping_threshold, currency: 'SAR' });
    } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

app.get('/api/shipping/track/:tracking_number', async (req, res) => {
    try {
        const order = await pool.query('SELECT order_number,shipping_company,tracking_number,status,shipped_at FROM orders WHERE tracking_number=$1', [req.params.tracking_number]);
        if (!order.rows.length) return res.status(404).json({ error: 'رقم التتبع غير موجود' });
        res.json(order.rows[0]);
    } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

// ===================================
// BOOKINGS ROUTES
// ===================================
app.post('/api/bookings', async (req, res) => {
    try {
        const { first_name, last_name, email, phone, session_type, date, time_slot, consultation_topic, notes } = req.body;
        if (!first_name || !email || !session_type || !date || !time_slot) return res.status(400).json({ error: 'Required fields missing' });

        const bookingRef = 'BK-' + Date.now();
        let customerId;
        const existing = await pool.query('SELECT id FROM customers WHERE email=$1', [email]);
        if (existing.rows.length) { customerId = existing.rows[0].id; }
        else { const nc = await pool.query('INSERT INTO customers (email,phone,first_name,last_name) VALUES ($1,$2,$3,$4) RETURNING id', [email, phone, first_name, last_name]); customerId = nc.rows[0].id; }

        await pool.query(`INSERT INTO bookings (booking_ref,customer_id,customer_name,customer_email,customer_phone,session_type,booking_date,time_slot,consultation_topic,notes,status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'pending')`,
            [bookingRef, customerId, `${first_name} ${last_name}`, email, phone, session_type, date, time_slot, consultation_topic || null, notes || null]);
        res.status(201).json({ booking_ref: bookingRef, status: 'confirmed' });
    } catch (error) {
        console.error('Booking error:', error);
        res.status(500).json({ error: 'فشل حفظ الحجز', details: error.message });
    }
});

app.get('/api/admin/bookings', authenticateToken, async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;
        let conditions = ['1=1'];
        const params = [];
        let pc = 1;
        if (status) { conditions.push(`status=$${pc++}`); params.push(status); }
        const where = 'WHERE ' + conditions.join(' AND ');
        const result = await pool.query(`SELECT * FROM bookings ${where} ORDER BY created_at DESC LIMIT $${pc} OFFSET $${pc + 1}`, [...params, limit, offset]);
        const count = await pool.query(`SELECT COUNT(*) FROM bookings ${where}`, params);
        res.json({ bookings: result.rows, total: parseInt(count.rows[0].count) });
    } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

app.patch('/api/admin/bookings/:id/status', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query('UPDATE bookings SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *', [req.body.status, req.params.id]);
        if (!result.rows.length) return res.status(404).json({ error: 'Booking not found' });
        res.json(result.rows[0]);
    } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

// ===================================
// CONTACT MESSAGES
// ===================================
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;
        if (!name || !email || !subject || !message) return res.status(400).json({ error: 'Required fields missing' });
        await pool.query('INSERT INTO contact_messages (name,email,phone,subject,message) VALUES ($1,$2,$3,$4,$5)', [name, email, phone || null, subject, message]);
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

app.get('/api/admin/messages', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 100');
        res.json(result.rows);
    } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

app.patch('/api/admin/messages/:id/read', authenticateToken, async (req, res) => {
    try {
        await pool.query('UPDATE contact_messages SET is_read=true WHERE id=$1', [req.params.id]);
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

// ===================================
// BLOG ROUTES
// ===================================
app.get('/api/blog', async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM blog_posts WHERE status='published' ORDER BY created_at DESC LIMIT 50");
        res.json(result.rows);
    } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/admin/blog', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        const { title_ar, excerpt_ar, content_ar, category, status } = req.body;
        if (!title_ar) return res.status(400).json({ error: 'Title required' });
        const slug = title_ar.replace(/\s+/g, '-').replace(/[^\w\u0621-\u064A-]/g, '') + '-' + Date.now();
        const image = req.file ? `/uploads/${req.file.filename}` : null;
        const result = await pool.query(
            `INSERT INTO blog_posts (title_ar,excerpt_ar,content_ar,slug,category,status,image_url,author_id,published_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
            [title_ar, excerpt_ar || null, content_ar || null, slug, category || null, status || 'draft', image, req.admin.id, status === 'published' ? new Date() : null]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) { res.status(500).json({ error: 'Server error', details: error.message }); }
});

app.put('/api/admin/blog/:id', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        const { title_ar, excerpt_ar, content_ar, category, status } = req.body;
        const image = req.file ? `/uploads/${req.file.filename}` : req.body.existing_image;
        const result = await pool.query(
            `UPDATE blog_posts SET
        title_ar=$1,
        excerpt_ar=$2,
        content_ar=$3,
        category=$4,
        status=$5::varchar,
        image_url=$6,
        updated_at=NOW(),
        published_at=
        CASE
            WHEN $5::varchar='published' AND published_at IS NULL
            THEN NOW()
            ELSE published_at
        END
        WHERE id=$7
        RETURNING *`,
            [title_ar, excerpt_ar, content_ar, category, status, image, req.params.id]
        );
        if (!result.rows.length) return res.status(404).json({ error: 'Post not found' });
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
        console.error(error);
    }
});

app.delete('/api/admin/blog/:id', authenticateToken, async (req, res) => {
    try {
        await pool.query('DELETE FROM blog_posts WHERE id=$1', [req.params.id]);
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

// ===================================
// DASHBOARD STATS
// ===================================
app.get('/api/admin/stats', authenticateToken, async (req, res) => {
    try {
        const [revenue, orders, products, customers, bookings, messages, lowStock, recentOrders, recentBookings] = await Promise.all([
            pool.query("SELECT COALESCE(SUM(total),0) as total FROM orders WHERE payment_status='paid'"),
            pool.query("SELECT COUNT(*) as total, COUNT(CASE WHEN status='pending' THEN 1 END) as pending FROM orders"),
            pool.query("SELECT COUNT(*) as total FROM products WHERE status='published'"),
            pool.query("SELECT COUNT(*) as total FROM customers"),
            pool.query("SELECT COUNT(*) as total, COUNT(CASE WHEN status='pending' THEN 1 END) as pending FROM bookings"),
            pool.query("SELECT COUNT(*) as total FROM contact_messages WHERE is_read=false"),
            pool.query("SELECT COUNT(*) as total FROM products WHERE stock_quantity <= low_stock_threshold AND track_inventory=true"),
            pool.query("SELECT id,order_number,customer_name,total,status,created_at FROM orders ORDER BY created_at DESC LIMIT 5"),
            pool.query("SELECT id,booking_ref,customer_name,session_type,booking_date,time_slot,status FROM bookings ORDER BY created_at DESC LIMIT 5"),
        ]);
        res.json({
            revenue: parseFloat(revenue.rows[0].total),
            orders: { total: parseInt(orders.rows[0].total), pending: parseInt(orders.rows[0].pending) },
            products: parseInt(products.rows[0].total),
            customers: parseInt(customers.rows[0].total),
            bookings: { total: parseInt(bookings.rows[0].total), pending: parseInt(bookings.rows[0].pending) },
            unread_messages: parseInt(messages.rows[0].total),
            low_stock: parseInt(lowStock.rows[0].total),
            recent_orders: recentOrders.rows,
            recent_bookings: recentBookings.rows,
        });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Support old dashboard route
app.get('/api/admin/dashboard/stats', authenticateToken, async (req, res) => {
    try {
        const [revenue, monthRevenue, ordersCount, pendingOrders, productsCount, lowStock, customersCount] = await Promise.all([
            pool.query("SELECT COALESCE(SUM(total),0) as total_revenue FROM orders WHERE payment_status='paid'"),
            pool.query("SELECT COALESCE(SUM(total),0) as month_revenue FROM orders WHERE payment_status='paid' AND created_at >= NOW()-INTERVAL '30 days'"),
            pool.query("SELECT COUNT(*) as total_orders FROM orders"),
            pool.query("SELECT COUNT(*) as pending_orders FROM orders WHERE status='pending'"),
            pool.query("SELECT COUNT(*) as total_products FROM products"),
            pool.query("SELECT COUNT(*) as low_stock FROM products WHERE stock_quantity <= low_stock_threshold AND track_inventory=true"),
            pool.query("SELECT COUNT(*) as total_customers FROM customers"),
        ]);
        res.json({ total_revenue: parseFloat(revenue.rows[0].total_revenue), month_revenue: parseFloat(monthRevenue.rows[0].month_revenue), total_orders: parseInt(ordersCount.rows[0].total_orders), pending_orders: parseInt(pendingOrders.rows[0].pending_orders), total_products: parseInt(productsCount.rows[0].total_products), low_stock_count: parseInt(lowStock.rows[0].low_stock), total_customers: parseInt(customersCount.rows[0].total_customers) });
    } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

app.get('/api/admin/customers', authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;
        const result = await pool.query('SELECT * FROM customers ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset]);
        const count = await pool.query('SELECT COUNT(*) FROM customers');
        res.json({ customers: result.rows, total: parseInt(count.rows[0].count) });
    } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

// ===================================
// PAYMENT ROUTES (Moyasar - optional)
// ===================================
app.post('/api/payments/create', async (req, res) => {
    try {
        if (!process.env.MOYASAR_API_KEY || process.env.MOYASAR_API_KEY.includes('YOUR_KEY')) {
            return res.status(503).json({ error: 'Payment gateway not configured. Contact admin.' });
        }
        const { amount, currency = 'SAR', description, callback_url, metadata } = req.body;
        const axios = require('axios');
        const response = await axios.post('https://api.moyasar.com/v1/payments', { amount: Math.round(amount * 100), currency, description, callback_url: callback_url || `${process.env.FRONTEND_URL}/order-success`, source: { type: 'creditcard' }, metadata }, { auth: { username: process.env.MOYASAR_API_KEY, password: '' } });
        res.json({ payment_id: response.data.id, payment_url: response.data.source?.transaction_url, status: response.data.status });
    } catch (error) {
        res.status(500).json({ error: 'فشل إنشاء جلسة الدفع' });
    }
});

app.get('/api/payments/verify/:payment_id', async (req, res) => {
    try {
        if (!process.env.MOYASAR_API_KEY || process.env.MOYASAR_API_KEY.includes('YOUR_KEY')) return res.status(503).json({ error: 'Payment gateway not configured' });
        const axios = require('axios');
        const response = await axios.get(`https://api.moyasar.com/v1/payments/${req.params.payment_id}`, { auth: { username: process.env.MOYASAR_API_KEY, password: '' } });
        const payment = response.data;
        if (payment.status === 'paid' && payment.metadata?.order_id) {
            await pool.query(`UPDATE orders SET payment_status='paid', payment_transaction_id=$1, paid_at=NOW(), updated_at=NOW() WHERE id=$2`, [req.params.payment_id, payment.metadata.order_id]);
        }
        res.json({ status: payment.status, amount: payment.amount / 100, currency: payment.currency, order_id: payment.metadata?.order_id });
    } catch (error) { res.status(500).json({ error: 'فشل التحقق من الدفع' }); }
});

app.post('/api/payments/webhook', async (req, res) => {
    try {
        const { type, data } = req.body;
        if (type === 'payment.paid' && data?.metadata?.order_id) {
            await pool.query(`UPDATE orders SET payment_status='paid', payment_transaction_id=$1, paid_at=NOW(), status='processing', updated_at=NOW() WHERE id=$2`, [data.id, data.metadata.order_id]);
        }
        res.json({ received: true });
    } catch (error) { res.status(500).json({ error: 'Webhook failed' }); }
});

// ===================================
// Error Handlers
// ===================================
app.use((err, req, res, next) => {
    console.error('Error:', err);
    if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ error: 'File too large. Max 5MB.' });
    res.status(500).json({ error: 'Internal server error', details: err.message });
});

app.use((req, res) => res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` }));
// Site Settings
app.get('/api/settings', async (req, res) => {
    try {
        const result = await pool.query('SELECT key, value FROM site_settings');
        const settings = {};
        result.rows.forEach(row => settings[row.key] = row.value);
        res.json(settings);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.put('/api/admin/settings', authenticateToken, async (req, res) => {
    try {
        const settings = req.body;
        for (const [key, value] of Object.entries(settings)) {
            await pool.query(
                'INSERT INTO site_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value=$2, updated_at=NOW()',
                [key, value]
            );
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/admin/settings/upload', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        const { key } = req.body;
        if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
        const imageUrl = req.file.path;
        await pool.query(
            'INSERT INTO site_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value=$2, updated_at=NOW()',
            [key, imageUrl]
        );
        res.json({ success: true, url: imageUrl });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
// ===================================
// Start Server
// ===================================

app.listen(PORT, async () => {
    // Auto-run schema
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS admins (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                full_name VARCHAR(255),
                role VARCHAR(50) DEFAULT 'admin',
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT NOW()
            );
            CREATE TABLE IF NOT EXISTS categories (
                id SERIAL PRIMARY KEY,
                name_ar VARCHAR(255) NOT NULL,
                name_en VARCHAR(255),
                slug VARCHAR(255) UNIQUE,
                description TEXT,
                is_active BOOLEAN DEFAULT true,
                display_order INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
            CREATE TABLE IF NOT EXISTS products (
                id SERIAL PRIMARY KEY,
                category_id INT REFERENCES categories(id),
                name_ar VARCHAR(255) NOT NULL,
                name_en VARCHAR(255),
                sku VARCHAR(100) UNIQUE,
                price DECIMAL(10,2) NOT NULL,
                sale_price DECIMAL(10,2),
                short_description TEXT,
                description TEXT,
                images JSONB DEFAULT '[]',
                stock_quantity INT DEFAULT 0,
                low_stock_threshold INT DEFAULT 5,
                track_inventory BOOLEAN DEFAULT true,
                is_featured BOOLEAN DEFAULT false,
                is_digital BOOLEAN DEFAULT false,
                status VARCHAR(50) DEFAULT 'published',
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
            CREATE TABLE IF NOT EXISTS customers (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                phone VARCHAR(50),
                first_name VARCHAR(100),
                last_name VARCHAR(100),
                created_at TIMESTAMP DEFAULT NOW()
            );
            CREATE TABLE IF NOT EXISTS orders (
                id SERIAL PRIMARY KEY,
                order_number VARCHAR(100) UNIQUE,
                customer_id INT REFERENCES customers(id),
                customer_email VARCHAR(255),
                customer_phone VARCHAR(50),
                customer_name VARCHAR(255),
                shipping_address JSONB,
                subtotal DECIMAL(10,2),
                shipping_cost DECIMAL(10,2) DEFAULT 0,
                tax DECIMAL(10,2) DEFAULT 0,
                discount DECIMAL(10,2) DEFAULT 0,
                total DECIMAL(10,2),
                coupon_code VARCHAR(100),
                status VARCHAR(50) DEFAULT 'pending',
                payment_status VARCHAR(50) DEFAULT 'pending',
                payment_method VARCHAR(100),
                payment_transaction_id VARCHAR(255),
                shipping_method VARCHAR(100),
                tracking_number VARCHAR(255),
                shipping_company VARCHAR(100),
                notes TEXT,
                shipped_at TIMESTAMP,
                delivered_at TIMESTAMP,
                paid_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
            CREATE TABLE IF NOT EXISTS order_items (
                id SERIAL PRIMARY KEY,
                order_id INT REFERENCES orders(id),
                product_id INT REFERENCES products(id),
                product_name VARCHAR(255),
                product_sku VARCHAR(100),
                product_image TEXT,
                price DECIMAL(10,2),
                quantity INT,
                subtotal DECIMAL(10,2)
            );
            CREATE TABLE IF NOT EXISTS bookings (
                id SERIAL PRIMARY KEY,
                booking_ref VARCHAR(100) UNIQUE,
                customer_id INT REFERENCES customers(id),
                customer_name VARCHAR(255),
                customer_email VARCHAR(255),
                customer_phone VARCHAR(50),
                session_type VARCHAR(100),
                booking_date DATE,
                time_slot VARCHAR(50),
                consultation_topic TEXT,
                notes TEXT,
                status VARCHAR(50) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
            CREATE TABLE IF NOT EXISTS contact_messages (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255),
                email VARCHAR(255),
                phone VARCHAR(50),
                subject VARCHAR(255),
                message TEXT,
                is_read BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT NOW()
            );
            CREATE TABLE IF NOT EXISTS blog_posts (
                id SERIAL PRIMARY KEY,
                title_ar VARCHAR(255),
                excerpt_ar TEXT,
                content_ar TEXT,
                slug VARCHAR(255) UNIQUE,
                category VARCHAR(100),
                status VARCHAR(50) DEFAULT 'draft',
                image_url TEXT,
                author_id INT,
                published_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
            CREATE TABLE IF NOT EXISTS shipping_methods (
                id SERIAL PRIMARY KEY,
                name_ar VARCHAR(255),
                price DECIMAL(10,2),
                estimated_days_min INT,
                estimated_days_max INT,
                free_shipping_threshold DECIMAL(10,2),
                is_active BOOLEAN DEFAULT true,
                display_order INT DEFAULT 0
            );
            CREATE TABLE IF NOT EXISTS coupons (
                id SERIAL PRIMARY KEY,
                code VARCHAR(100) UNIQUE,
                discount_type VARCHAR(50),
                discount_value DECIMAL(10,2),
                minimum_order_amount DECIMAL(10,2),
                usage_limit INT,
                times_used INT DEFAULT 0,
                is_active BOOLEAN DEFAULT true,
                expires_at TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS activity_logs (
                id SERIAL PRIMARY KEY,
                CREATE TABLE IF NOT EXISTS site_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    value TEXT,
    updated_at TIMESTAMP DEFAULT NOW()
);
INSERT INTO site_settings (key, value) VALUES
('hero_title', 'حوّل عقلك. حوّل حياتك.'),
('hero_subtitle', 'خبيرة في التدريب على الحياة والصحة النفسية'),
('hero_bg_color', '#7C3AED'),
('primary_color', '#7C3AED'),
('site_name', 'د. سارة عبدالله المزيعل'),
('about_text', 'نبذة عن الدكتورة سارة'),
('contact_phone', ''),
('contact_email', ''),
('contact_whatsapp', '')
ON CONFLICT (key) DO NOTHING;
                admin_id INT,
                action VARCHAR(100),
                entity_type VARCHAR(100),
                entity_id INT,
                description TEXT,
                created_at TIMESTAMP DEFAULT NOW()
            );
            INSERT INTO admins (email, password_hash, full_name, role)
            VALUES ('dr.sara@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Dr. Sara', 'super_admin')
            ON CONFLICT (email) DO NOTHING;
        `);
        console.log('✅ Schema applied');
    } catch (err) {
        console.log('Schema note:', err.message);
    }
    console.log(`\n🚀 Dr. Sara Backend`);
    console.log(`✅ http://localhost:${PORT}`);
    console.log(`✅ Health: http://localhost:${PORT}/health\n`);
});
