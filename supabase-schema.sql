-- ============================================
-- VIDHI'S NURSERY - Supabase Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- Products table
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  image TEXT,
  description TEXT,
  rating DECIMAL(3,1) DEFAULT 4.5,
  reviews INTEGER DEFAULT 0,
  in_stock BOOLEAN DEFAULT true,
  badge TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  shipping_address JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order items table
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wishlist table
CREATE TABLE wishlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

-- Products: public read
CREATE POLICY "products_public_read" ON products FOR SELECT USING (true);

-- Orders: users can only see their own
CREATE POLICY "orders_user_own" ON orders FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "order_items_user_own" ON order_items FOR ALL 
  USING (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()));

-- Wishlist: users can only see/manage their own
CREATE POLICY "wishlist_user_own" ON wishlist FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- SAMPLE PRODUCT DATA (optional seed)
-- ============================================
INSERT INTO products (name, price, category, image, description, rating, reviews, badge) VALUES
('Monstera Deliciosa', 649, 'Indoor Plants', 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=500', 'The iconic Swiss cheese plant.', 4.8, 234, 'Bestseller'),
('Peace Lily', 349, 'Indoor Plants', 'https://images.unsplash.com/photo-1593691509543-c55fb32d8de5?w=500', 'Elegant white blooms.', 4.7, 189, 'Air Purifier'),
('Echeveria Set of 3', 299, 'Succulents', 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=500', 'Beautiful rosette succulents.', 4.9, 312, 'Low Maintenance'),
('Snake Plant', 399, 'Indoor Plants', 'https://images.unsplash.com/photo-1597305877032-0668b3c6413a?w=500', 'Nearly indestructible.', 4.9, 567, 'Beginner Friendly'),
('Marigold Seeds Pack', 49, 'Seeds', 'https://images.unsplash.com/photo-1490750967868-88df5691cc9a?w=500', '200+ seeds per pack.', 4.8, 445, 'Value Pack');
