-- ====================================================================
-- CK CAKE LOUNGE: SUPABASE STORAGE RLS FIX
-- ====================================================================
-- Run this entire script in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query).
-- This script will clear out duplicate or corrupt storage policies and establish clean ones.

-- --------------------------------------------------------------------
-- 1. DROP POTENTIAL CONFLICTING STORAGE POLICIES
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Allow public read access to cake_photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow public uploads to cake_photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow public select" ON storage.objects;
DROP POLICY IF EXISTS "Allow public insert" ON storage.objects;
DROP POLICY IF EXISTS "Allow public update" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated select" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated insert" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated update" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated delete" ON storage.objects;

-- --------------------------------------------------------------------
-- 2. ENABLE ROW LEVEL SECURITY ON STORAGE.OBJECTS
-- --------------------------------------------------------------------
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------------------
-- 3. CREATE CLEAN STANDARD POLICIES ON THE cake_photos BUCKET
-- --------------------------------------------------------------------
-- Allow anyone (anonymous and logged-in) to read/download cake photos
CREATE POLICY "Allow public read access to cake_photos"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'cake_photos');

-- Allow anyone (anonymous and logged-in) to upload cake photos
CREATE POLICY "Allow public uploads to cake_photos"
ON storage.objects FOR INSERT TO public
WITH CHECK (bucket_id = 'cake_photos');
