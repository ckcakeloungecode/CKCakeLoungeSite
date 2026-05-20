-- ====================================================================
-- CK CAKE LOUNGE: SUPABASE SECURITY & CALENDAR SETUP
-- ====================================================================
-- Run this entire script in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query).

-- --------------------------------------------------------------------
-- 1. CREATE BLOCKED DATES TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.store_blocked_dates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blocked_date DATE UNIQUE NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on the blocked dates table
ALTER TABLE public.store_blocked_dates ENABLE ROW LEVEL SECURITY;

-- Allow public (anonymous and authenticated) users to READ blocked dates
DROP POLICY IF EXISTS "Allow public read access to blocked dates" ON public.store_blocked_dates;
CREATE POLICY "Allow public read access to blocked dates" 
ON public.store_blocked_dates 
FOR SELECT 
TO anon, authenticated 
USING (true);

-- Only allow service role (admin) to INSERT/UPDATE/DELETE blocked dates
DROP POLICY IF EXISTS "Block public modifications on blocked dates" ON public.store_blocked_dates;
CREATE POLICY "Block public modifications on blocked dates" 
ON public.store_blocked_dates 
FOR ALL 
TO service_role 
USING (true)
WITH CHECK (true);


-- --------------------------------------------------------------------
-- 2. LOCK DOWN ORDERS TABLE
-- --------------------------------------------------------------------
-- Enable RLS on store_orders
ALTER TABLE public.store_orders ENABLE ROW LEVEL SECURITY;

-- Ensure public (anon/authenticated) CANNOT select, insert, update, or delete orders.
-- Only the Service Role (the server admin client) can perform these actions.
DROP POLICY IF EXISTS "Service role access only for store_orders" ON public.store_orders;
CREATE POLICY "Service role access only for store_orders" 
ON public.store_orders 
FOR ALL 
TO service_role 
USING (true)
WITH CHECK (true);


-- --------------------------------------------------------------------
-- 3. LOCK DOWN COUPONS TABLE
-- --------------------------------------------------------------------
-- Enable RLS on store_coupons
ALTER TABLE public.store_coupons ENABLE ROW LEVEL SECURITY;

-- Ensure public (anon/authenticated) CANNOT view coupons.
-- Only the Service Role can select/edit them during checkout validation.
DROP POLICY IF EXISTS "Service role access only for store_coupons" ON public.store_coupons;
CREATE POLICY "Service role access only for store_coupons" 
ON public.store_coupons 
FOR ALL 
TO service_role 
USING (true)
WITH CHECK (true);


-- --------------------------------------------------------------------
-- 4. SECURE PRODUCTS & VARIANTS (READ-ONLY FOR PUBLIC)
-- --------------------------------------------------------------------
-- Enable RLS on products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Enable RLS on product_variants
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

-- Allow public to browse products
DROP POLICY IF EXISTS "Allow public read products" ON public.products;
CREATE POLICY "Allow public read products" 
ON public.products 
FOR SELECT 
TO anon, authenticated 
USING (true);

-- Allow public to browse variants
DROP POLICY IF EXISTS "Allow public read variants" ON public.product_variants;
CREATE POLICY "Allow public read variants" 
ON public.product_variants 
FOR SELECT 
TO anon, authenticated 
USING (true);

-- Only admin (service_role) can modify products
DROP POLICY IF EXISTS "Admin write products" ON public.products;
CREATE POLICY "Admin write products" 
ON public.products 
FOR ALL 
TO service_role 
USING (true);

DROP POLICY IF EXISTS "Admin write variants" ON public.product_variants;
CREATE POLICY "Admin write variants" 
ON public.product_variants 
FOR ALL 
TO service_role 
USING (true);


-- --------------------------------------------------------------------
-- 5. ATOMIC COUPON INCREMENT FUNCTION (CONCURRENCY-SAFE)
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.increment_coupon_usage(coupon_code_param TEXT)
RETURNS void AS $$
BEGIN
  UPDATE public.store_coupons
  SET times_used = times_used + 1
  WHERE code = UPPER(coupon_code_param);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

