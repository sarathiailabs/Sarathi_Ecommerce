-- Enable UUID extensions if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE NOT NULL,
    role VARCHAR(50) DEFAULT 'customer' NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Index for user lookup
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. Shops Table
CREATE TABLE IF NOT EXISTS shops (
    id VARCHAR(36) PRIMARY KEY,
    owner_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    logo_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 3. Products Table
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(36) PRIMARY KEY,
    shop_id VARCHAR(36) REFERENCES shops(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    original_price NUMERIC(10, 2),
    stock INTEGER NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    images TEXT, -- JSON string
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    brand VARCHAR(100),
    sku VARCHAR(100) UNIQUE,
    weight NUMERIC(10, 2),
    dimensions VARCHAR(255),
    rating FLOAT DEFAULT 0.0,
    review_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);

-- 4. Carts Table
CREATE TABLE IF NOT EXISTS carts (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id VARCHAR(36) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    UNIQUE(user_id, product_id)
);

-- 5. Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
    id VARCHAR(36) PRIMARY KEY,
    product_id VARCHAR(36) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    comment TEXT,
    helpful_count INTEGER DEFAULT 0,
    verified_purchase BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(product_id, user_id)
);

-- 6. Wishlists Table
CREATE TABLE IF NOT EXISTS wishlists (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id VARCHAR(36) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, product_id)
);

-- 7. Product Variants Table
CREATE TABLE IF NOT EXISTS product_variants (
    id VARCHAR(36) PRIMARY KEY,
    product_id VARCHAR(36) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    value VARCHAR(255) NOT NULL,
    price_modifier NUMERIC(10, 2) DEFAULT 0.00,
    stock INTEGER DEFAULT 0 NOT NULL,
    sku VARCHAR(100)
);

-- 8. Product Inventory Table
CREATE TABLE IF NOT EXISTS product_inventory (
    id VARCHAR(36) PRIMARY KEY,
    product_id VARCHAR(36) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    warehouse_location VARCHAR(255),
    stock_quantity INTEGER DEFAULT 0,
    reorder_level INTEGER DEFAULT 10,
    reorder_quantity INTEGER DEFAULT 50,
    last_restocked TIMESTAMP WITH TIME ZONE
);

-- 9. Coupons Table
CREATE TABLE IF NOT EXISTS coupons (
    id VARCHAR(36) PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL,
    discount_value NUMERIC(10, 2) NOT NULL,
    min_purchase_amount NUMERIC(10, 2) DEFAULT 0.00,
    max_discount_amount NUMERIC(10, 2),
    usage_limit INTEGER,
    usage_per_user INTEGER DEFAULT 1,
    times_used INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
    valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);

-- 10. Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total_amount NUMERIC(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending' NOT NULL,
    shipping_address TEXT,
    customer_phone VARCHAR(20),
    customer_name VARCHAR(255),
    payment_method VARCHAR(50) DEFAULT 'card',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- 11. Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id VARCHAR(36) NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL,
    price NUMERIC(10, 2) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- 12. Deliveries Table
CREATE TABLE IF NOT EXISTS deliveries (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
    partner_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'assigned' NOT NULL,
    tracking_number VARCHAR(100) UNIQUE,
    estimated_delivery TIMESTAMP WITH TIME ZONE,
    actual_delivery TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_deliveries_order_id ON deliveries(order_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_partner_id ON deliveries(partner_id);

-- 13. Returns Table
CREATE TABLE IF NOT EXISTS returns (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL REFERENCES orders(id),
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id VARCHAR(36) NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL,
    reason VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'Pending' NOT NULL,
    refund_amount NUMERIC(10, 2) NOT NULL,
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE
);

-- Transactional RPC Function for atomic checkout
CREATE OR REPLACE FUNCTION place_order(
    p_order_id VARCHAR(36),
    p_delivery_id VARCHAR(36),
    p_user_id VARCHAR(36),
    p_shipping_address TEXT,
    p_phone VARCHAR(20),
    p_full_name VARCHAR(255),
    p_payment_method VARCHAR(50),
    p_tracking_number VARCHAR(100)
) RETURNS JSONB AS $$
DECLARE
    v_cart_record RECORD;
    v_prod_record RECORD;
    v_total_amount NUMERIC(10, 2) := 0.00;
    v_order_item_id VARCHAR(36);
    v_final_order JSONB;
BEGIN
    -- Check if user has items in cart
    IF NOT EXISTS (SELECT 1 FROM carts WHERE user_id = p_user_id) THEN
        RAISE EXCEPTION 'Your cart is empty.';
    END IF;

    -- Calculate total amount and verify + lock product stock
    FOR v_cart_record IN 
        SELECT product_id, quantity FROM carts WHERE user_id = p_user_id
    LOOP
        SELECT price, stock, name INTO v_prod_record 
        FROM products 
        WHERE id = v_cart_record.product_id 
        FOR UPDATE;
        
        IF NOT FOUND THEN
            RAISE EXCEPTION 'Product with id % no longer exists.', v_cart_record.product_id;
        END IF;
        
        IF v_prod_record.stock < v_cart_record.quantity THEN
            RAISE EXCEPTION 'Insufficient stock for product % . Available: %, Requested: %', 
                v_prod_record.name, v_prod_record.stock, v_cart_record.quantity;
        END IF;
        
        -- Deduct stock
        UPDATE products 
        SET stock = stock - v_cart_record.quantity 
        WHERE id = v_cart_record.product_id;
        
        -- Add to total
        v_total_amount := v_total_amount + (v_prod_record.price * v_cart_record.quantity);
    END LOOP;

    -- Create parent Order record
    INSERT INTO orders (id, user_id, total_amount, status, shipping_address, customer_phone, customer_name, payment_method, created_at)
    VALUES (p_order_id, p_user_id, v_total_amount, 'Pending', p_shipping_address, p_phone, p_full_name, p_payment_method, NOW());

    -- Create OrderItem records and populate details
    FOR v_cart_record IN 
        SELECT product_id, quantity FROM carts WHERE user_id = p_user_id
    LOOP
        -- Generate random ID for order_items
        v_order_item_id := substr(md5(random()::text || clock_timestamp()::text), 1, 36);
        
        SELECT price INTO v_prod_record FROM products WHERE id = v_cart_record.product_id;
        
        INSERT INTO order_items (id, order_id, product_id, quantity, price)
        VALUES (v_order_item_id, p_order_id, v_cart_record.product_id, v_cart_record.quantity, v_prod_record.price);
    END LOOP;

    -- Clear shopping cart
    DELETE FROM carts WHERE user_id = p_user_id;

    -- Pre-generate Delivery tracking record
    INSERT INTO deliveries (id, order_id, partner_id, status, tracking_number, created_at, updated_at)
    VALUES (p_delivery_id, p_order_id, NULL, 'assigned', p_tracking_number, NOW(), NOW());

    -- Retrieve the created order with details as JSON
    SELECT jsonb_build_object(
        'id', o.id,
        'user_id', o.user_id,
        'total_amount', o.total_amount,
        'status', o.status,
        'created_at', o.created_at,
        'shipping_address', o.shipping_address,
        'customer_phone', o.customer_phone,
        'customer_name', o.customer_name,
        'payment_method', o.payment_method
    ) INTO v_final_order
    FROM orders o
    WHERE o.id = p_order_id;

    RETURN v_final_order;
END;
$$ LANGUAGE plpgsql;
