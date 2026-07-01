-- ====================================================================
-- CK CAKE LOUNGE: NEW SUPABASE DATABASE SCHEMA & SECURITY SETUP
-- ====================================================================
-- INSTRUCTIONS:
-- 1. Open your new Supabase Project Dashboard.
-- 2. Go to "SQL Editor" in the left menu.
-- 3. Click "New Query" (or "New Blank Query").
-- 4. Paste this entire script and click "Run".

-- --------------------------------------------------------------------
-- 1. CREATE CORE TABLES
-- --------------------------------------------------------------------

-- Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT,
    last_name TEXT,
    email TEXT UNIQUE NOT NULL,
    phone_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    category TEXT NOT NULL,
    image_url TEXT,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    min_quantity INTEGER DEFAULT 1,
    is_special_cake BOOLEAN DEFAULT false,
    allows_photo BOOLEAN DEFAULT false
);

-- Product Variants Table
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    size TEXT NOT NULL,
    flavor TEXT NOT NULL,
    price NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    image_url TEXT
);

-- Blocked Dates Table
CREATE TABLE IF NOT EXISTS public.store_blocked_dates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blocked_date DATE UNIQUE NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Coupons Table
CREATE TABLE IF NOT EXISTS public.store_coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT NOT NULL,
    discount_value NUMERIC NOT NULL,
    min_spend NUMERIC DEFAULT 0,
    usage_limit INTEGER,
    times_used INTEGER DEFAULT 0,
    valid_until DATE,
    is_one_time_use BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Orders Table
CREATE TABLE IF NOT EXISTS public.store_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    payment_id TEXT,
    customer_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    order_type TEXT NOT NULL,
    delivery_address TEXT,
    delivery_date DATE NOT NULL,
    delivery_time TEXT NOT NULL,
    notes TEXT,
    cart_items JSONB NOT NULL,
    total_amount NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    coupon_code TEXT,
    discount_amount NUMERIC DEFAULT 0
);


-- --------------------------------------------------------------------
-- 2. ENABLE ROW LEVEL SECURITY (RLS) & ACCESS POLICIES
-- --------------------------------------------------------------------

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

-- Users Table Policies
DROP POLICY IF EXISTS "Allow individual read own profile" ON public.users;
CREATE POLICY "Allow individual read own profile"
ON public.users FOR SELECT TO authenticated
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Allow individual update own profile" ON public.users;
CREATE POLICY "Allow individual update own profile"
ON public.users FOR UPDATE TO authenticated
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Service role admin full access to users" ON public.users;
CREATE POLICY "Service role admin full access to users"
ON public.users FOR ALL TO service_role
USING (true);

-- Blocked Dates Table Policies
DROP POLICY IF EXISTS "Allow public read access to blocked dates" ON public.store_blocked_dates;
CREATE POLICY "Allow public read access to blocked dates" 
ON public.store_blocked_dates FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Block public modifications on blocked dates" ON public.store_blocked_dates;
CREATE POLICY "Block public modifications on blocked dates" 
ON public.store_blocked_dates FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Orders Table Policies
DROP POLICY IF EXISTS "Service role access only for store_orders" ON public.store_orders;
CREATE POLICY "Service role access only for store_orders" 
ON public.store_orders FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Coupons Table Policies
DROP POLICY IF EXISTS "Service role access only for store_coupons" ON public.store_coupons;
CREATE POLICY "Service role access only for store_coupons" 
ON public.store_coupons FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Products & Variants Policies (Public Read, Admin Write)
DROP POLICY IF EXISTS "Allow public read products" ON public.products;
CREATE POLICY "Allow public read products" 
ON public.products FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow public read variants" ON public.product_variants;
CREATE POLICY "Allow public read variants" 
ON public.product_variants FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Admin write products" ON public.products;
CREATE POLICY "Admin write products" 
ON public.products FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS "Admin write variants" ON public.product_variants;
CREATE POLICY "Admin write variants" 
ON public.product_variants FOR ALL TO service_role USING (true);


-- --------------------------------------------------------------------
-- 3. CUSTOM FUNCTIONS
-- --------------------------------------------------------------------

-- Atomic Coupon usage counter increment function
CREATE OR REPLACE FUNCTION public.increment_coupon_usage(coupon_code_param TEXT)
RETURNS void AS $$
BEGIN
  UPDATE public.store_coupons
  SET times_used = times_used + 1
  WHERE code = UPPER(coupon_code_param);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for automatic user profile creation on sign up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, first_name, last_name, phone_number)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'phone_number'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    phone_number = EXCLUDED.phone_number;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- --------------------------------------------------------------------
-- 4. STORAGE SETUP (cake_photos Bucket & Policies)
-- --------------------------------------------------------------------

-- Insert the cake_photos bucket into the storage.buckets table if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('cake_photos', 'cake_photos', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow public read access to objects in cake_photos
DROP POLICY IF EXISTS "Allow public read access to cake_photos" ON storage.objects;
CREATE POLICY "Allow public read access to cake_photos"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'cake_photos');

-- Policy to allow anonymous/public uploads to cake_photos
DROP POLICY IF EXISTS "Allow public uploads to cake_photos" ON storage.objects;
CREATE POLICY "Allow public uploads to cake_photos"
ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (bucket_id = 'cake_photos');

