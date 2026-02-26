"""
server.py - Backend API for Dr. Sara Website
Flask + SQLite (no external database needed)
"""
import os
import json
import sqlite3
import hashlib
import hmac
import base64
import time
import re
from datetime import datetime, timedelta
from flask import Flask, request, jsonify, send_from_directory, g
from werkzeug.utils import secure_filename
from functools import wraps

# ───────────────────────────────────────────
# Config
# ───────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH  = os.path.join(BASE_DIR, "drsara.db")
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
JWT_SECRET = os.environ.get("JWT_SECRET", "dr-sara-secret-2024-change-me")
PORT = int(os.environ.get("PORT", 5000))

os.makedirs(UPLOAD_DIR, exist_ok=True)
ALLOWED_EXT = {"png", "jpg", "jpeg", "gif", "webp"}

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024  # 10 MB

# ───────────────────────────────────────────
# CORS middleware (manual, no flask-cors needed)
# ───────────────────────────────────────────
@app.after_request
def add_cors(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    return response

@app.before_request
def handle_options():
    if request.method == "OPTIONS":
        from flask import Response
        r = Response()
        r.headers["Access-Control-Allow-Origin"] = "*"
        r.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        r.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
        return r, 204

# ───────────────────────────────────────────
# Database helpers
# ───────────────────────────────────────────
def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(DB_PATH)
        g.db.row_factory = sqlite3.Row
        g.db.execute("PRAGMA foreign_keys = ON")
    return g.db

@app.teardown_appcontext
def close_db(e=None):
    db = g.pop("db", None)
    if db:
        db.close()

def query(sql, params=(), one=False, commit=False):
    db = get_db()
    cur = db.execute(sql, params)
    if commit:
        db.commit()
        return cur.lastrowid
    rows = cur.fetchone() if one else cur.fetchall()
    return dict(rows) if (one and rows) else ([dict(r) for r in rows] if rows else (None if one else []))

# ───────────────────────────────────────────
# JWT helpers (pure python, no extra lib)
# ───────────────────────────────────────────
def _b64url(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()

def create_token(payload: dict, expires_hours=24) -> str:
    header = _b64url(json.dumps({"alg": "HS256", "typ": "JWT"}).encode())
    payload = dict(payload)
    payload["exp"] = int(time.time()) + expires_hours * 3600
    body = _b64url(json.dumps(payload).encode())
    sig_input = f"{header}.{body}".encode()
    sig = _b64url(hmac.new(JWT_SECRET.encode(), sig_input, hashlib.sha256).digest())
    return f"{header}.{body}.{sig}"

def verify_token(token: str):
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        header, body, sig = parts
        sig_input = f"{header}.{body}".encode()
        expected = _b64url(hmac.new(JWT_SECRET.encode(), sig_input, hashlib.sha256).digest())
        if not hmac.compare_digest(sig, expected):
            return None
        pad = 4 - len(body) % 4
        payload = json.loads(base64.urlsafe_b64decode(body + "=" * pad))
        if payload.get("exp", 0) < time.time():
            return None
        return payload
    except Exception:
        return None

def auth_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth = request.headers.get("Authorization", "")
        token = auth.replace("Bearer ", "") if auth.startswith("Bearer ") else None
        if not token:
            return jsonify({"error": "Access denied. No token provided."}), 401
        payload = verify_token(token)
        if not payload:
            return jsonify({"error": "Invalid or expired token"}), 403
        request.admin = payload
        return f(*args, **kwargs)
    return decorated

# ───────────────────────────────────────────
# Password helpers
# ───────────────────────────────────────────
def hash_password(password: str) -> str:
    salt = os.urandom(16)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 200_000)
    return salt.hex() + ":" + dk.hex()

def check_password(password: str, stored: str) -> bool:
    # Support both our format and bcrypt hashes from schema
    if ":" in stored and len(stored) == 96:  # our format: 32hex:64hex
        try:
            salt_hex, dk_hex = stored.split(":", 1)
            salt = bytes.fromhex(salt_hex)
            dk = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 200_000)
            return dk.hex() == dk_hex
        except Exception:
            pass
    # fallback: plain compare (for dev/test)
    return False

# ───────────────────────────────────────────
# File upload helper
# ───────────────────────────────────────────
def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXT

def save_files(files):
    saved = []
    for f in files:
        if f and allowed_file(f.filename):
            name = f"{int(time.time()*1000)}_{secure_filename(f.filename)}"
            f.save(os.path.join(UPLOAD_DIR, name))
            saved.append(f"/uploads/{name}")
    return saved

# ───────────────────────────────────────────
# Static: serve uploaded files
# ───────────────────────────────────────────
@app.route("/uploads/<path:filename>")
def serve_upload(filename):
    return send_from_directory(UPLOAD_DIR, filename)

# ───────────────────────────────────────────
# INIT DATABASE
# ───────────────────────────────────────────
def init_db():
    db = sqlite3.connect(DB_PATH)
    db.execute("PRAGMA foreign_keys = ON")

    db.executescript("""
    CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name TEXT NOT NULL,
        role TEXT DEFAULT 'admin',
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name_ar TEXT NOT NULL,
        name_en TEXT,
        slug TEXT UNIQUE,
        description TEXT,
        image_url TEXT,
        is_active INTEGER DEFAULT 1,
        display_order INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
        name_ar TEXT NOT NULL,
        name_en TEXT,
        price REAL NOT NULL,
        sale_price REAL,
        cost_price REAL,
        short_description TEXT,
        description TEXT,
        stock_quantity INTEGER DEFAULT 0,
        sku TEXT UNIQUE,
        track_inventory INTEGER DEFAULT 1,
        allow_backorder INTEGER DEFAULT 0,
        low_stock_threshold INTEGER DEFAULT 5,
        status TEXT DEFAULT 'draft',
        is_featured INTEGER DEFAULT 0,
        is_digital INTEGER DEFAULT 0,
        meta_title TEXT,
        meta_description TEXT,
        images TEXT DEFAULT '[]',
        weight REAL,
        dimensions TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        published_at TEXT
    );

    CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        default_address TEXT,
        total_orders INTEGER DEFAULT 0,
        total_spent REAL DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        last_order_at TEXT
    );

    CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_number TEXT UNIQUE NOT NULL,
        customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
        customer_email TEXT NOT NULL,
        customer_phone TEXT,
        customer_name TEXT NOT NULL,
        shipping_address TEXT NOT NULL,
        billing_address TEXT,
        subtotal REAL NOT NULL,
        shipping_cost REAL DEFAULT 0,
        tax REAL DEFAULT 0,
        discount REAL DEFAULT 0,
        total REAL NOT NULL,
        coupon_code TEXT,
        status TEXT DEFAULT 'pending',
        payment_status TEXT DEFAULT 'pending',
        payment_method TEXT,
        payment_gateway TEXT,
        payment_transaction_id TEXT,
        paid_at TEXT,
        shipping_method TEXT,
        shipping_company TEXT,
        tracking_number TEXT,
        shipped_at TEXT,
        delivered_at TEXT,
        customer_notes TEXT,
        admin_notes TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
        product_name TEXT NOT NULL,
        product_sku TEXT,
        product_image TEXT,
        price REAL NOT NULL,
        quantity INTEGER NOT NULL,
        subtotal REAL NOT NULL,
        created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS coupons (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        discount_type TEXT NOT NULL,
        discount_value REAL NOT NULL,
        minimum_order_amount REAL DEFAULT 0,
        usage_limit INTEGER,
        times_used INTEGER DEFAULT 0,
        starts_at TEXT,
        expires_at TEXT,
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS shipping_methods (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name_ar TEXT NOT NULL,
        name_en TEXT,
        company TEXT NOT NULL,
        price REAL DEFAULT 0,
        free_shipping_threshold REAL,
        estimated_days_min INTEGER,
        estimated_days_max INTEGER,
        is_active INTEGER DEFAULT 1,
        display_order INTEGER DEFAULT 0,
        api_config TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        booking_ref TEXT UNIQUE NOT NULL,
        customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
        customer_name TEXT NOT NULL,
        customer_email TEXT NOT NULL,
        customer_phone TEXT,
        session_type TEXT NOT NULL,
        booking_date TEXT NOT NULL,
        time_slot TEXT NOT NULL,
        consultation_topic TEXT,
        notes TEXT,
        status TEXT DEFAULT 'pending',
        price REAL,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS contact_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        is_read INTEGER DEFAULT 0,
        reply TEXT,
        replied_at TEXT,
        created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS blog_posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title_ar TEXT NOT NULL,
        excerpt_ar TEXT,
        content_ar TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        image_url TEXT,
        category TEXT,
        status TEXT DEFAULT 'draft',
        author_id INTEGER REFERENCES admins(id) ON DELETE SET NULL,
        views INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        published_at TEXT
    );

    CREATE TABLE IF NOT EXISTS activity_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        admin_id INTEGER REFERENCES admins(id) ON DELETE SET NULL,
        action TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id INTEGER,
        description TEXT,
        ip_address TEXT,
        created_at TEXT DEFAULT (datetime('now'))
    );
    """)

    # Seed admin if not exists
    existing = db.execute("SELECT id FROM admins WHERE email=?", ("dr.sara@example.com",)).fetchone()
    if not existing:
        pw = hash_password("Admin@123")
        db.execute(
            "INSERT INTO admins (email, password_hash, full_name, role) VALUES (?,?,?,?)",
            ("dr.sara@example.com", pw, "د. سارة", "super_admin")
        )

    # Seed categories if empty
    if not db.execute("SELECT id FROM categories LIMIT 1").fetchone():
        for row in [
            ("كتب", "Books", "books", 1),
            ("كورسات", "Courses", "courses", 2),
            ("استشارات", "Consultations", "consultations", 3),
            ("باقات مجمعة", "Bundles", "bundles", 4),
        ]:
            db.execute("INSERT INTO categories (name_ar, name_en, slug, display_order) VALUES (?,?,?,?)", row)

    # Seed shipping methods if empty
    if not db.execute("SELECT id FROM shipping_methods LIMIT 1").fetchone():
        for row in [
            ("شحن سمسا", "SMSA Express", "smsa", 25.0, 300.0, 2, 4, 1),
            ("شحن أرامكس", "Aramex", "aramex", 30.0, 350.0, 2, 5, 2),
            ("استلام من الفرع", "Branch Pickup", "pickup", 0.0, None, 0, 0, 3),
        ]:
            db.execute(
                "INSERT INTO shipping_methods (name_ar,name_en,company,price,free_shipping_threshold,estimated_days_min,estimated_days_max,display_order) VALUES (?,?,?,?,?,?,?,?)",
                row
            )

    db.commit()
    db.close()
    print("✅ Database initialized at", DB_PATH)

# ───────────────────────────────────────────
# ROUTES: Auth
# ───────────────────────────────────────────
@app.route("/api/admin/login", methods=["POST"])
def admin_login():
    data = request.get_json() or {}
    email = data.get("email", "").strip()
    password = data.get("password", "")
    if not email or not password:
        return jsonify({"error": "البريد الإلكتروني وكلمة المرور مطلوبان"}), 400

    admin = query("SELECT * FROM admins WHERE email=? AND is_active=1", (email,), one=True)
    if not admin:
        return jsonify({"error": "بيانات الدخول غير صحيحة"}), 401

    if not check_password(password, admin["password_hash"]):
        return jsonify({"error": "بيانات الدخول غير صحيحة"}), 401

    token = create_token({"id": admin["id"], "email": admin["email"], "role": admin["role"]})
    return jsonify({
        "token": token,
        "admin": {"id": admin["id"], "email": admin["email"], "full_name": admin["full_name"], "role": admin["role"]}
    })

@app.route("/api/admin/change-password", methods=["POST"])
@auth_required
def change_password():
    data = request.get_json() or {}
    new_pw = data.get("new_password", "")
    if len(new_pw) < 6:
        return jsonify({"error": "كلمة المرور يجب أن تكون 6 أحرف على الأقل"}), 400
    hashed = hash_password(new_pw)
    query("UPDATE admins SET password_hash=? WHERE id=?", (hashed, request.admin["id"]), commit=True)
    return jsonify({"success": True})

# ───────────────────────────────────────────
# ROUTES: Categories
# ───────────────────────────────────────────
@app.route("/api/categories")
def get_categories():
    cats = query("SELECT * FROM categories WHERE is_active=1 ORDER BY display_order, name_ar")
    return jsonify(cats)

@app.route("/api/admin/categories", methods=["POST"])
@auth_required
def create_category():
    data = request.get_json() or {}
    name_ar = data.get("name_ar", "").strip()
    if not name_ar:
        return jsonify({"error": "اسم التصنيف مطلوب"}), 400
    slug = re.sub(r"[^\w-]", "", data.get("name_en", name_ar).lower().replace(" ", "-")) or f"cat-{int(time.time())}"
    lid = query(
        "INSERT INTO categories (name_ar, name_en, slug, description) VALUES (?,?,?,?)",
        (name_ar, data.get("name_en",""), slug, data.get("description","")),
        commit=True
    )
    cat = query("SELECT * FROM categories WHERE id=?", (lid,), one=True)
    return jsonify(cat), 201

# ───────────────────────────────────────────
# ROUTES: Products
# ───────────────────────────────────────────
@app.route("/api/products")
def get_products():
    category = request.args.get("category")
    status   = request.args.get("status")
    search   = request.args.get("search")
    page     = int(request.args.get("page", 1))
    limit    = int(request.args.get("limit", 20))
    offset   = (page - 1) * limit

    where = ["1=1"]
    params = []
    if category:
        where.append("p.category_id=?"); params.append(category)
    if status:
        where.append("p.status=?"); params.append(status)
    if search:
        where.append("(p.name_ar LIKE ? OR p.name_en LIKE ?)"); params += [f"%{search}%", f"%{search}%"]

    w = " AND ".join(where)
    rows = query(
        f"SELECT p.*, c.name_ar as category_name FROM products p LEFT JOIN categories c ON p.category_id=c.id WHERE {w} ORDER BY p.created_at DESC LIMIT ? OFFSET ?",
        params + [limit, offset]
    )
    total = query(f"SELECT COUNT(*) as cnt FROM products p WHERE {w}", params, one=True)["cnt"]

    for r in rows:
        if isinstance(r.get("images"), str):
            try: r["images"] = json.loads(r["images"])
            except: r["images"] = []

    return jsonify({"products": rows, "total": total, "page": page, "totalPages": -(-total // limit)})

@app.route("/api/products/<int:pid>")
def get_product(pid):
    p = query("SELECT p.*, c.name_ar as category_name FROM products p LEFT JOIN categories c ON p.category_id=c.id WHERE p.id=?", (pid,), one=True)
    if not p:
        return jsonify({"error": "المنتج غير موجود"}), 404
    if isinstance(p.get("images"), str):
        try: p["images"] = json.loads(p["images"])
        except: p["images"] = []
    return jsonify(p)

@app.route("/api/admin/products", methods=["POST"])
@auth_required
def create_product():
    f = request.form
    name_ar = f.get("name_ar","").strip()
    if not name_ar:
        return jsonify({"error": "اسم المنتج مطلوب"}), 400

    images = save_files(request.files.getlist("images"))

    lid = query(
        """INSERT INTO products
           (category_id,name_ar,name_en,price,sale_price,short_description,description,
            stock_quantity,sku,track_inventory,is_featured,is_digital,status,images)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
        (
            f.get("category_id") or None,
            name_ar, f.get("name_en",""),
            float(f.get("price",0)), float(f.get("sale_price")) if f.get("sale_price") else None,
            f.get("short_description",""), f.get("description",""),
            int(f.get("stock_quantity",0)),
            f.get("sku") or None,
            0 if f.get("track_inventory") == "false" else 1,
            1 if f.get("is_featured") == "true" else 0,
            1 if f.get("is_digital") == "true" else 0,
            f.get("status","draft"),
            json.dumps(images)
        ), commit=True
    )
    query("INSERT INTO activity_logs (admin_id,action,entity_type,entity_id,description) VALUES (?,?,?,?,?)",
          (request.admin["id"],"created","product",lid,f"Created product: {name_ar}"), commit=True)
    p = query("SELECT * FROM products WHERE id=?", (lid,), one=True)
    if isinstance(p.get("images"), str):
        try: p["images"] = json.loads(p["images"])
        except: p["images"] = []
    return jsonify(p), 201

@app.route("/api/admin/products/<int:pid>", methods=["PUT"])
@auth_required
def update_product(pid):
    f = request.form
    existing = query("SELECT * FROM products WHERE id=?", (pid,), one=True)
    if not existing:
        return jsonify({"error": "المنتج غير موجود"}), 404

    old_images = []
    try:
        old_images = json.loads(f.get("existing_images","[]") or "[]")
    except: pass
    new_images = save_files(request.files.getlist("images"))
    all_images = json.dumps(old_images + new_images)

    name_ar = f.get("name_ar","").strip() or existing["name_ar"]
    query(
        """UPDATE products SET
           category_id=?,name_ar=?,name_en=?,price=?,sale_price=?,short_description=?,
           description=?,stock_quantity=?,sku=?,track_inventory=?,is_featured=?,is_digital=?,
           status=?,images=?,updated_at=datetime('now')
           WHERE id=?""",
        (
            f.get("category_id") or None,
            name_ar, f.get("name_en",""),
            float(f.get("price",0) or existing["price"]),
            float(f.get("sale_price")) if f.get("sale_price") else None,
            f.get("short_description",""),
            f.get("description",""),
            int(f.get("stock_quantity",0)),
            f.get("sku") or None,
            0 if f.get("track_inventory")=="false" else 1,
            1 if f.get("is_featured")=="true" else 0,
            1 if f.get("is_digital")=="true" else 0,
            f.get("status","draft"),
            all_images, pid
        ), commit=True
    )
    query("INSERT INTO activity_logs (admin_id,action,entity_type,entity_id,description) VALUES (?,?,?,?,?)",
          (request.admin["id"],"updated","product",pid,f"Updated product: {name_ar}"), commit=True)
    p = query("SELECT * FROM products WHERE id=?", (pid,), one=True)
    if isinstance(p.get("images"), str):
        try: p["images"] = json.loads(p["images"])
        except: p["images"] = []
    return jsonify(p)

@app.route("/api/admin/products/<int:pid>", methods=["DELETE"])
@auth_required
def delete_product(pid):
    p = query("SELECT name_ar FROM products WHERE id=?", (pid,), one=True)
    if not p:
        return jsonify({"error": "المنتج غير موجود"}), 404
    query("DELETE FROM products WHERE id=?", (pid,), commit=True)
    query("INSERT INTO activity_logs (admin_id,action,entity_type,entity_id,description) VALUES (?,?,?,?,?)",
          (request.admin["id"],"deleted","product",pid,f"Deleted product: {p['name_ar']}"), commit=True)
    return jsonify({"message": "تم حذف المنتج بنجاح"})

# ───────────────────────────────────────────
# ROUTES: Orders
# ───────────────────────────────────────────
@app.route("/api/orders", methods=["POST"])
def create_order():
    data = request.get_json() or {}
    customer = data.get("customer", {})
    items    = data.get("items", [])
    shipping = data.get("shipping", {})
    payment_method = data.get("payment_method","")
    coupon_code    = data.get("coupon_code","")

    if not customer.get("email") or not items:
        return jsonify({"error": "بيانات الطلب غير مكتملة"}), 400

    # get products
    ids = [str(i["product_id"]) for i in items]
    products_rows = query(f"SELECT * FROM products WHERE id IN ({','.join(['?']*len(ids))})", ids)
    prod_map = {p["id"]: p for p in products_rows}

    subtotal = 0
    for item in items:
        p = prod_map.get(item["product_id"])
        if not p:
            return jsonify({"error": f"منتج غير موجود"}), 400
        if p["track_inventory"] and p["stock_quantity"] < item["quantity"]:
            return jsonify({"error": f"الكمية غير متوفرة: {p['name_ar']}"}), 400
        price = p["sale_price"] or p["price"]
        subtotal += price * item["quantity"]

    # shipping cost
    sm = query("SELECT * FROM shipping_methods WHERE id=?", (shipping.get("method_id"),), one=True)
    ship_cost = sm["price"] if sm else 0
    if sm and sm["free_shipping_threshold"] and subtotal >= sm["free_shipping_threshold"]:
        ship_cost = 0

    # coupon
    discount = 0
    coupon = None
    if coupon_code:
        coupon = query(
            "SELECT * FROM coupons WHERE UPPER(code)=UPPER(?) AND is_active=1 AND (expires_at IS NULL OR expires_at > datetime('now')) AND (usage_limit IS NULL OR times_used < usage_limit)",
            (coupon_code,), one=True
        )
        if coupon and subtotal >= (coupon["minimum_order_amount"] or 0):
            discount = subtotal * (coupon["discount_value"]/100) if coupon["discount_type"]=="percentage" else coupon["discount_value"]

    tax   = (subtotal - discount) * 0.15
    total = subtotal + ship_cost - discount + tax
    order_number = f"ORD-{int(time.time()*1000)}"

    # find or create customer
    cust = query("SELECT id FROM customers WHERE email=?", (customer["email"],), one=True)
    if cust:
        cust_id = cust["id"]
    else:
        cust_id = query(
            "INSERT INTO customers (email,phone,first_name,last_name) VALUES (?,?,?,?)",
            (customer["email"], customer.get("phone",""), customer.get("first_name",""), customer.get("last_name","")),
            commit=True
        )

    order_id = query(
        """INSERT INTO orders
           (order_number,customer_id,customer_email,customer_phone,customer_name,
            shipping_address,subtotal,shipping_cost,tax,discount,total,
            coupon_code,status,payment_method,shipping_method,payment_status)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
        (
            order_number, cust_id, customer["email"], customer.get("phone",""),
            f"{customer.get('first_name','')} {customer.get('last_name','')}".strip(),
            json.dumps(shipping.get("address", {})),
            subtotal, ship_cost, tax, discount, total,
            coupon_code or None, "pending", payment_method,
            sm["name_ar"] if sm else "", "pending"
        ), commit=True
    )

    for item in items:
        p = prod_map[item["product_id"]]
        price = p["sale_price"] or p["price"]
        images = json.loads(p["images"] or "[]") if isinstance(p["images"], str) else (p["images"] or [])
        query(
            "INSERT INTO order_items (order_id,product_id,product_name,product_sku,product_image,price,quantity,subtotal) VALUES (?,?,?,?,?,?,?,?)",
            (order_id, item["product_id"], p["name_ar"], p["sku"], images[0] if images else None, price, item["quantity"], price*item["quantity"]),
            commit=True
        )
        if p["track_inventory"]:
            query("UPDATE products SET stock_quantity=stock_quantity-? WHERE id=?", (item["quantity"], item["product_id"]), commit=True)

    if coupon:
        query("UPDATE coupons SET times_used=times_used+1 WHERE id=?", (coupon["id"],), commit=True)

    return jsonify({"order_id": order_id, "order_number": order_number, "total": total,
                    "subtotal": subtotal, "shipping_cost": ship_cost, "tax": tax, "discount": discount, "status":"pending"}), 201

@app.route("/api/orders/public/<int:oid>")
def get_order_public(oid):
    o = query("SELECT id,order_number,total,payment_status,status,shipping_method,created_at FROM orders WHERE id=?", (oid,), one=True)
    if not o:
        return jsonify({"error": "الطلب غير موجود"}), 404
    return jsonify(o)

@app.route("/api/admin/orders")
@auth_required
def get_orders():
    status = request.args.get("status")
    page   = int(request.args.get("page",1))
    limit  = int(request.args.get("limit",20))
    offset = (page-1)*limit

    where, params = ["1=1"], []
    if status:
        where.append("status=?"); params.append(status)
    w = " AND ".join(where)
    rows  = query(f"SELECT * FROM orders WHERE {w} ORDER BY created_at DESC LIMIT ? OFFSET ?", params+[limit,offset])
    total = query(f"SELECT COUNT(*) as cnt FROM orders WHERE {w}", params, one=True)["cnt"]
    return jsonify({"orders": rows, "total": total, "page": page, "totalPages": -(-total//limit)})

@app.route("/api/admin/orders/<int:oid>")
@auth_required
def get_order(oid):
    o = query("SELECT * FROM orders WHERE id=?", (oid,), one=True)
    if not o:
        return jsonify({"error": "الطلب غير موجود"}), 404
    items = query("SELECT * FROM order_items WHERE order_id=?", (oid,))
    return jsonify({**o, "items": items})

@app.route("/api/admin/orders/<int:oid>/status", methods=["PATCH"])
@auth_required
def update_order_status(oid):
    data = request.get_json() or {}
    status = data.get("status")
    tracking = data.get("tracking_number")
    if not status:
        return jsonify({"error":"الحالة مطلوبة"}),400
    extra = ""
    params = [status]
    if status == "shipped" and tracking:
        extra = ", tracking_number=?, shipped_at=datetime('now')"
        params.insert(1, tracking)
    elif status == "delivered":
        extra = ", delivered_at=datetime('now')"
    params.append(oid)
    query(f"UPDATE orders SET status=?{extra}, updated_at=datetime('now') WHERE id=?", params, commit=True)
    return jsonify(query("SELECT * FROM orders WHERE id=?", (oid,), one=True))

# ───────────────────────────────────────────
# ROUTES: Coupons
# ───────────────────────────────────────────
@app.route("/api/coupons/validate", methods=["POST"])
def validate_coupon():
    data = request.get_json() or {}
    code = data.get("code","")
    amount = float(data.get("amount",0))
    coupon = query(
        "SELECT * FROM coupons WHERE UPPER(code)=UPPER(?) AND is_active=1 AND (expires_at IS NULL OR expires_at>datetime('now')) AND (usage_limit IS NULL OR times_used<usage_limit)",
        (code,), one=True
    )
    if not coupon:
        return jsonify({"valid": False, "error":"الكود غير صالح"})
    if amount < (coupon["minimum_order_amount"] or 0):
        return jsonify({"valid": False, "error":f"الحد الأدنى للطلب {coupon['minimum_order_amount']} ر.س"})
    discount = amount*(coupon["discount_value"]/100) if coupon["discount_type"]=="percentage" else coupon["discount_value"]
    return jsonify({"valid":True, "discount": min(discount, amount), "code": coupon["code"]})

# ───────────────────────────────────────────
# ROUTES: Shipping
# ───────────────────────────────────────────
@app.route("/api/shipping/methods")
def get_shipping_methods():
    return jsonify(query("SELECT * FROM shipping_methods WHERE is_active=1 ORDER BY display_order"))

@app.route("/api/shipping/calculate", methods=["POST"])
def calc_shipping():
    data = request.get_json() or {}
    sm = query("SELECT * FROM shipping_methods WHERE id=? AND is_active=1", (data.get("shipping_method_id"),), one=True)
    if not sm:
        return jsonify({"error":"طريقة الشحن غير موجودة"}),404
    return jsonify({"method":sm["name_ar"],"cost":sm["price"],"currency":"SAR",
                    "estimated_days":f"{sm['estimated_days_min']}-{sm['estimated_days_max']} أيام عمل"})

@app.route("/api/shipping/track/<tracking>")
def track_shipment(tracking):
    o = query("SELECT id,order_number,shipping_company,tracking_number,status,shipped_at FROM orders WHERE tracking_number=?", (tracking,), one=True)
    if not o:
        return jsonify({"error":"رقم التتبع غير موجود"}),404
    return jsonify(o)

# ───────────────────────────────────────────
# ROUTES: Bookings
# ───────────────────────────────────────────
@app.route("/api/bookings", methods=["POST"])
def create_booking():
    data = request.get_json() or {}
    required = ["first_name","last_name","email","session_type","date","time_slot"]
    for field in required:
        if not data.get(field):
            return jsonify({"error":f"حقل {field} مطلوب"}),400

    ref = f"BK-{int(time.time()*1000)}"
    email = data["email"]
    cust = query("SELECT id FROM customers WHERE email=?", (email,), one=True)
    if cust:
        cust_id = cust["id"]
    else:
        cust_id = query("INSERT INTO customers (email,phone,first_name,last_name) VALUES (?,?,?,?)",
                        (email, data.get("phone",""), data["first_name"], data["last_name"]), commit=True)
    query(
        "INSERT INTO bookings (booking_ref,customer_id,customer_name,customer_email,customer_phone,session_type,booking_date,time_slot,consultation_topic,notes) VALUES (?,?,?,?,?,?,?,?,?,?)",
        (ref, cust_id, f"{data['first_name']} {data['last_name']}", email, data.get("phone",""),
         data["session_type"], data["date"], data["time_slot"],
         data.get("consultation_topic",""), data.get("notes","")), commit=True
    )
    return jsonify({"booking_ref": ref, "status": "confirmed"}), 201

@app.route("/api/admin/bookings")
@auth_required
def get_bookings():
    status = request.args.get("status")
    page   = int(request.args.get("page",1))
    limit  = int(request.args.get("limit",20))
    offset = (page-1)*limit
    where, params = ["1=1"], []
    if status: where.append("status=?"); params.append(status)
    w = " AND ".join(where)
    rows  = query(f"SELECT * FROM bookings WHERE {w} ORDER BY created_at DESC LIMIT ? OFFSET ?", params+[limit,offset])
    total = query(f"SELECT COUNT(*) as cnt FROM bookings WHERE {w}", params, one=True)["cnt"]
    return jsonify({"bookings":rows, "total":total})

@app.route("/api/admin/bookings/<int:bid>/status", methods=["PATCH"])
@auth_required
def update_booking_status(bid):
    data = request.get_json() or {}
    query("UPDATE bookings SET status=?,updated_at=datetime('now') WHERE id=?", (data.get("status"), bid), commit=True)
    return jsonify(query("SELECT * FROM bookings WHERE id=?", (bid,), one=True))

# ───────────────────────────────────────────
# ROUTES: Contact Messages
# ───────────────────────────────────────────
@app.route("/api/contact", methods=["POST"])
def create_message():
    data = request.get_json() or {}
    for f in ["name","email","subject","message"]:
        if not data.get(f):
            return jsonify({"error":f"حقل {f} مطلوب"}),400
    query("INSERT INTO contact_messages (name,email,phone,subject,message) VALUES (?,?,?,?,?)",
          (data["name"],data["email"],data.get("phone",""),data["subject"],data["message"]), commit=True)
    return jsonify({"success":True})

@app.route("/api/admin/messages")
@auth_required
def get_messages():
    rows = query("SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 100")
    return jsonify(rows)

@app.route("/api/admin/messages/<int:mid>/read", methods=["PATCH"])
@auth_required
def mark_read(mid):
    query("UPDATE contact_messages SET is_read=1 WHERE id=?", (mid,), commit=True)
    return jsonify({"success":True})

# ───────────────────────────────────────────
# ROUTES: Blog
# ───────────────────────────────────────────
@app.route("/api/blog")
def get_blog():
    return jsonify(query("SELECT * FROM blog_posts WHERE status='published' ORDER BY created_at DESC"))

@app.route("/api/admin/blog", methods=["POST"])
@auth_required
def create_post():
    title_ar = request.form.get("title_ar","").strip()
    if not title_ar:
        return jsonify({"error":"العنوان مطلوب"}),400
    slug = re.sub(r"[^\w-]","", title_ar.replace(" ","-")) + f"-{int(time.time())}"
    image = save_files([request.files.get("image")] if request.files.get("image") else [])
    lid = query(
        "INSERT INTO blog_posts (title_ar,excerpt_ar,content_ar,slug,category,status,image_url,author_id) VALUES (?,?,?,?,?,?,?,?)",
        (title_ar, request.form.get("excerpt_ar",""), request.form.get("content_ar",""),
         slug, request.form.get("category",""), request.form.get("status","draft"),
         image[0] if image else None, request.admin["id"]), commit=True
    )
    return jsonify(query("SELECT * FROM blog_posts WHERE id=?", (lid,), one=True)), 201

@app.route("/api/admin/blog/<int:bid>", methods=["PUT"])
@auth_required
def update_post(bid):
    f = request.form
    image_files = request.files.getlist("image")
    image = save_files(image_files)
    img_url = image[0] if image else f.get("existing_image")
    query(
        "UPDATE blog_posts SET title_ar=?,excerpt_ar=?,content_ar=?,category=?,status=?,image_url=?,updated_at=datetime('now') WHERE id=?",
        (f.get("title_ar",""), f.get("excerpt_ar",""), f.get("content_ar",""),
         f.get("category",""), f.get("status","draft"), img_url, bid), commit=True
    )
    return jsonify(query("SELECT * FROM blog_posts WHERE id=?", (bid,), one=True))

@app.route("/api/admin/blog/<int:bid>", methods=["DELETE"])
@auth_required
def delete_post(bid):
    query("DELETE FROM blog_posts WHERE id=?", (bid,), commit=True)
    return jsonify({"success":True})

# ───────────────────────────────────────────
# ROUTES: Dashboard Stats
# ───────────────────────────────────────────
@app.route("/api/admin/stats")
@auth_required
def get_stats():
    revenue   = query("SELECT COALESCE(SUM(total),0) as v FROM orders WHERE payment_status='paid'", one=True)["v"]
    orders    = query("SELECT COUNT(*) as t, SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) as p FROM orders", one=True)
    products  = query("SELECT COUNT(*) as v FROM products WHERE status='published'", one=True)["v"]
    customers = query("SELECT COUNT(*) as v FROM customers", one=True)["v"]
    bookings  = query("SELECT COUNT(*) as t, SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) as p FROM bookings", one=True)
    messages  = query("SELECT COUNT(*) as v FROM contact_messages WHERE is_read=0", one=True)["v"]
    low_stock = query("SELECT COUNT(*) as v FROM products WHERE stock_quantity<=low_stock_threshold AND track_inventory=1", one=True)["v"]
    recent_orders   = query("SELECT id,order_number,customer_name,total,status,created_at FROM orders ORDER BY created_at DESC LIMIT 5")
    recent_bookings = query("SELECT id,booking_ref,customer_name,session_type,booking_date,time_slot,status FROM bookings ORDER BY created_at DESC LIMIT 5")
    return jsonify({
        "revenue": revenue,
        "orders":  {"total": orders["t"] or 0, "pending": orders["p"] or 0},
        "products": products,
        "customers": customers,
        "bookings": {"total": bookings["t"] or 0, "pending": bookings["p"] or 0},
        "unread_messages": messages,
        "low_stock": low_stock,
        "recent_orders": recent_orders,
        "recent_bookings": recent_bookings,
    })

@app.route("/api/admin/dashboard/stats")
@auth_required
def get_dashboard_stats():
    return get_stats()

# ───────────────────────────────────────────
# Health check
# ───────────────────────────────────────────
@app.route("/api/health")
def health():
    return jsonify({"status":"ok","db": os.path.exists(DB_PATH),"time": datetime.now().isoformat()})

# ───────────────────────────────────────────
# Main
# ───────────────────────────────────────────
if __name__ == "__main__":
    init_db()
    print(f"🚀 Dr. Sara Backend running on port {PORT}")
    print(f"📦 Database: {DB_PATH}")
    print(f"🔑 Admin login: dr.sara@example.com / Admin@123")
    app.run(host="0.0.0.0", port=PORT, debug=True)
