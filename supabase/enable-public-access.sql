-- Enable Public Read Access for Deployment
-- Run this in Supabase SQL Editor to fix deployment search issues

-- ========================================
-- Enable RLS and Public Read Access
-- ========================================

-- Properties Table
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Allow public read access to properties" ON properties;

-- Create policy for public read access
CREATE POLICY "Allow public read access to properties"
ON properties
FOR SELECT
TO public
USING (is_available = true);


-- Property Rooms Table
ALTER TABLE property_rooms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to property_rooms" ON property_rooms;

CREATE POLICY "Allow public read access to property_rooms"
ON property_rooms
FOR SELECT
TO public
USING (is_available = true);


-- Property Amenities Table
ALTER TABLE property_amenities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to property_amenities" ON property_amenities;

CREATE POLICY "Allow public read access to property_amenities"
ON property_amenities
FOR SELECT
TO public
USING (true);


-- Property Images Table (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'property_images') THEN
        ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Allow public read access to property_images" ON property_images;

        CREATE POLICY "Allow public read access to property_images"
        ON property_images
        FOR SELECT
        TO public
        USING (true);
    END IF;
END $$;


-- ========================================
-- Bookings - Authenticated Users Only
-- ========================================

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Users can read their own bookings
DROP POLICY IF EXISTS "Users can read own bookings" ON bookings;

CREATE POLICY "Users can read own bookings"
ON bookings
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own bookings
DROP POLICY IF EXISTS "Users can insert own bookings" ON bookings;

CREATE POLICY "Users can insert own bookings"
ON bookings
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own bookings
DROP POLICY IF EXISTS "Users can update own bookings" ON bookings;

CREATE POLICY "Users can update own bookings"
ON bookings
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);


-- ========================================
-- Profiles - Authenticated Users
-- ========================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;

CREATE POLICY "Users can read own profile"
ON profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Users can insert their own profile
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Users can insert own profile"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);


-- ========================================
-- Admin Access
-- ========================================

-- Admins can do everything on properties
DROP POLICY IF EXISTS "Admins can do all on properties" ON properties;

CREATE POLICY "Admins can do all on properties"
ON properties
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- Admins can do everything on property_rooms
DROP POLICY IF EXISTS "Admins can do all on property_rooms" ON property_rooms;

CREATE POLICY "Admins can do all on property_rooms"
ON property_rooms
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- Admins can do everything on property_amenities
DROP POLICY IF EXISTS "Admins can do all on property_amenities" ON property_amenities;

CREATE POLICY "Admins can do all on property_amenities"
ON property_amenities
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- Admins can view all bookings
DROP POLICY IF EXISTS "Admins can view all bookings" ON bookings;

CREATE POLICY "Admins can view all bookings"
ON bookings
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);


-- ========================================
-- Verify Policies
-- ========================================

-- Check that RLS is enabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('properties', 'property_rooms', 'property_amenities', 'bookings', 'profiles');

-- List all policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Test query (should return properties)
SELECT COUNT(*) as total_properties FROM properties WHERE is_available = true;
