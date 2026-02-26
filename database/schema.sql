-- ============================================
-- قاعدة بيانات موقع د. سارة - النسخة الكاملة المصلحة
-- ============================================
-- طريقة التشغيل:
--   psql -U postgres -c "CREATE DATABASE drsara_db;"
--   psql -U postgres -d drsara_db -f schema.sql
-- ============================================

CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin: dr.sara@example.com | Password: Admin@123
INSERT INTO admins (email, password_hash, full_name, role)
VALUES ('dr.sara@example.com', '$2b$10$NPJPKA16HjmuhWSanXyjZ.kpr4GYAYZ4HuOCfa6FnaGK2CxVJokfi', 'د. سارة', 'super_admin')
ON CONFLICT (email) DO NOTHING;

CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name_ar VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO categories (name_ar, name_en, slug, display_order) VALUES
('كتب', 'Books', 'books', 1),
('كورسات', 'Courses', 'courses', 2),
('استشارات', 'Consultations', 'consultations', 3),
('باقات مجمعة', 'Bundles', 'bundles', 4)
ON CONFLICT (slug) DO NOTHING;

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    category_id INT REFERENCES categories(id) ON DELETE SET NULL,
    name_ar VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    price DECIMAL(10,2) NOT NULL,
    sale_price DECIMAL(10,2),
    cost_price DECIMAL(10,2),
    short_description TEXT,
    description TEXT,
    stock_quantity INT DEFAULT 0,
    sku VARCHAR(100) UNIQUE,
    track_inventory BOOLEAN DEFAULT true,
    allow_backorder BOOLEAN DEFAULT false,
    low_stock_threshold INT DEFAULT 5,
    status VARCHAR(50) DEFAULT 'published',
    is_featured BOOLEAN DEFAULT false,
    is_digital BOOLEAN DEFAULT false,
    meta_title VARCHAR(255),
    meta_description TEXT,
    images JSONB DEFAULT '[]',
    weight DECIMAL(8,2),
    dimensions JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);

CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    default_address JSONB,
    total_orders INT DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_order_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id INT REFERENCES customers(id) ON DELETE SET NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20),
    customer_name VARCHAR(255) NOT NULL,
    shipping_address JSONB NOT NULL DEFAULT '{}',
    billing_address JSONB,
    subtotal DECIMAL(10,2) NOT NULL,
    shipping_cost DECIMAL(10,2) DEFAULT 0,
    tax DECIMAL(10,2) DEFAULT 0,
    discount DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    coupon_code VARCHAR(50),
    status VARCHAR(50) DEFAULT 'pending',
    payment_status VARCHAR(50) DEFAULT 'pending',
    payment_method VARCHAR(50),
    payment_gateway VARCHAR(50),
    payment_transaction_id VARCHAR(255),
    paid_at TIMESTAMP,
    shipping_method VARCHAR(100),
    shipping_company VARCHAR(100),
    tracking_number VARCHAR(255),
    shipped_at TIMESTAMP,
    delivered_at TIMESTAMP,
    customer_notes TEXT,
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    product_sku VARCHAR(100),
    product_image VARCHAR(500),
    price DECIMAL(10,2) NOT NULL,
    quantity INT NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS coupons (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_type VARCHAR(20) NOT NULL DEFAULT 'percentage',
    discount_value DECIMAL(10,2) NOT NULL,
    minimum_order_amount DECIMAL(10,2) DEFAULT 0,
    usage_limit INT,
    times_used INT DEFAULT 0,
    starts_at TIMESTAMP,
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO coupons (code, discount_type, discount_value, minimum_order_amount)
VALUES ('WELCOME10', 'percentage', 10, 50) ON CONFLICT (code) DO NOTHING;

CREATE TABLE IF NOT EXISTS shipping_methods (
    id SERIAL PRIMARY KEY,
    name_ar VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    company VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) DEFAULT 0,
    free_shipping_threshold DECIMAL(10,2),
    estimated_days_min INT,
    estimated_days_max INT,
    is_active BOOLEAN DEFAULT true,
    display_order INT DEFAULT 0,
    api_config JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO shipping_methods (name_ar, name_en, company, price, free_shipping_threshold, estimated_days_min, estimated_days_max, display_order) VALUES
('شحن سمسا', 'SMSA Express', 'smsa', 25.00, 300.00, 2, 4, 1),
('شحن أرامكس', 'Aramex', 'aramex', 30.00, 350.00, 2, 5, 2),
('استلام من الفرع', 'Branch Pickup', 'pickup', 0.00, NULL, 0, 0, 3);

CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    booking_ref VARCHAR(50) UNIQUE NOT NULL,
    customer_id INT REFERENCES customers(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20),
    session_type VARCHAR(50) NOT NULL,
    booking_date DATE NOT NULL,
    time_slot VARCHAR(20) NOT NULL,
    consultation_topic TEXT,
    notes TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    price DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

CREATE TABLE IF NOT EXISTS contact_messages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    subject VARCHAR(500) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    reply TEXT,
    replied_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS blog_posts (
    id SERIAL PRIMARY KEY,
    title_ar VARCHAR(500) NOT NULL,
    excerpt_ar TEXT,
    content_ar TEXT,
    slug VARCHAR(500) UNIQUE NOT NULL,
    image_url VARCHAR(500),
    category VARCHAR(100),
    status VARCHAR(50) DEFAULT 'draft',
    author_id INT REFERENCES admins(id) ON DELETE SET NULL,
    views INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    published_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_blog_status ON blog_posts(status);

CREATE TABLE IF NOT EXISTS settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    value_type VARCHAR(20) DEFAULT 'string',
    description TEXT,
    group_name VARCHAR(50),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO settings (key, value, value_type, group_name) VALUES
('site_name', 'موقع د. سارة', 'string', 'general'),
('currency', 'SAR', 'string', 'general'),
('tax_rate', '0.15', 'number', 'general')
ON CONFLICT (key) DO NOTHING;

CREATE TABLE IF NOT EXISTS activity_logs (
    id SERIAL PRIMARY KEY,
    admin_id INT REFERENCES admins(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INT,
    description TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = CURRENT_TIMESTAMP; RETURN NEW; END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE triggers TEXT[] := ARRAY['admins', 'categories', 'products', 'orders', 'coupons', 'shipping_methods'];
    t TEXT;
BEGIN
    FOREACH t IN ARRAY triggers LOOP
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_' || t || '_updated_at') THEN
            EXECUTE format('CREATE TRIGGER update_%s_updated_at BEFORE UPDATE ON %s FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', t, t);
        END IF;
    END LOOP;
END $$;

-- ============================================
-- تم! 🎉
-- Admin: dr.sara@example.com | Password: Admin@123
-- ============================================
