-- Sample Data for Testing Niwas Nest Application
-- Run this in your Supabase SQL Editor

-- Insert sample properties
INSERT INTO properties (
  name,
  description,
  address,
  area,
  city,
  price,
  security_deposit,
  property_type,
  gender_preference,
  featured_image,
  is_available,
  latitude,
  longitude
) VALUES
(
  'Green Valley PG',
  'Modern co-living space with all amenities. Perfect for students and young professionals. Fully furnished rooms with WiFi, housekeeping, and meals included.',
  '123 MG Road, Koramangala',
  'Koramangala',
  'Bangalore',
  8000,
  16000,
  'PG',
  'any',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
  true,
  12.9352,
  77.6245
),
(
  'Sunshine Residency',
  'Premium PG accommodation near IT parks. Modern amenities, 24/7 security, and daily housekeeping. Close to metro station.',
  '456 HSR Layout, Sector 1',
  'HSR Layout',
  'Bangalore',
  10000,
  20000,
  'PG',
  'boys',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
  true,
  12.9116,
  77.6382
),
(
  'Ocean View PG',
  'Comfortable living space for girls. Safe and secure environment with CCTV surveillance. Home-cooked meals available.',
  '789 Indiranagar, 100 Feet Road',
  'Indiranagar',
  'Bangalore',
  9000,
  18000,
  'PG',
  'girls',
  'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800',
  true,
  12.9716,
  77.6412
),
(
  'City Center Hostel',
  'Budget-friendly accommodation in the heart of the city. Perfect for students. Common kitchen and study room available.',
  '321 Brigade Road',
  'MG Road',
  'Bangalore',
  6500,
  13000,
  'Hostel',
  'any',
  'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
  true,
  12.9759,
  77.6088
),
(
  'Tech Park Residency',
  'Premium co-living near tech parks. Gym, lounge, and workspace included. High-speed WiFi and modern amenities.',
  '567 Whitefield Main Road',
  'Whitefield',
  'Bangalore',
  11000,
  22000,
  'PG',
  'any',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
  true,
  12.9698,
  77.7499
),
(
  'Lake View PG',
  'Peaceful accommodation with lake view. Spacious rooms, balcony access, and all modern facilities.',
  '890 Bellandur',
  'Bellandur',
  'Bangalore',
  9500,
  19000,
  'PG',
  'boys',
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
  true,
  12.9256,
  77.6700
);

-- Insert sample rooms for properties
-- Rooms for Green Valley PG
INSERT INTO property_rooms (
  property_id,
  room_number,
  room_type,
  sharing_type,
  price_per_person,
  security_deposit_per_person,
  total_beds,
  available_beds,
  floor_number,
  has_attached_bathroom,
  has_balcony,
  has_ac,
  room_size_sqft,
  is_available
)
SELECT
  p.id,
  '101',
  'Standard',
  'Single',
  8000,
  16000,
  1,
  1,
  1,
  true,
  false,
  true,
  150,
  true
FROM properties p WHERE p.name = 'Green Valley PG';

INSERT INTO property_rooms (
  property_id,
  room_number,
  room_type,
  sharing_type,
  price_per_person,
  security_deposit_per_person,
  total_beds,
  available_beds,
  floor_number,
  has_attached_bathroom,
  has_balcony,
  has_ac,
  room_size_sqft,
  is_available
)
SELECT
  p.id,
  '102',
  'Standard',
  '2 Sharing',
  5000,
  10000,
  2,
  2,
  1,
  true,
  false,
  true,
  200,
  true
FROM properties p WHERE p.name = 'Green Valley PG';

INSERT INTO property_rooms (
  property_id,
  room_number,
  room_type,
  sharing_type,
  price_per_person,
  security_deposit_per_person,
  total_beds,
  available_beds,
  floor_number,
  has_attached_bathroom,
  has_balcony,
  has_ac,
  room_size_sqft,
  is_available
)
SELECT
  p.id,
  '201',
  'Deluxe',
  '3 Sharing',
  4000,
  8000,
  3,
  3,
  2,
  true,
  true,
  true,
  250,
  true
FROM properties p WHERE p.name = 'Green Valley PG';

-- Rooms for Sunshine Residency
INSERT INTO property_rooms (
  property_id,
  room_number,
  room_type,
  sharing_type,
  price_per_person,
  security_deposit_per_person,
  total_beds,
  available_beds,
  floor_number,
  has_attached_bathroom,
  has_balcony,
  has_ac,
  room_size_sqft,
  is_available
)
SELECT
  p.id,
  '301',
  'Premium',
  'Single',
  10000,
  20000,
  1,
  1,
  3,
  true,
  true,
  true,
  180,
  true
FROM properties p WHERE p.name = 'Sunshine Residency';

INSERT INTO property_rooms (
  property_id,
  room_number,
  room_type,
  sharing_type,
  price_per_person,
  security_deposit_per_person,
  total_beds,
  available_beds,
  floor_number,
  has_attached_bathroom,
  has_balcony,
  has_ac,
  room_size_sqft,
  is_available
)
SELECT
  p.id,
  '302',
  'Standard',
  '2 Sharing',
  6000,
  12000,
  2,
  2,
  3,
  true,
  false,
  true,
  220,
  true
FROM properties p WHERE p.name = 'Sunshine Residency';

-- Insert sample amenities
INSERT INTO property_amenities (property_id, amenity_name, amenity_icon)
SELECT p.id, 'WiFi', 'wifi' FROM properties p WHERE p.name = 'Green Valley PG';

INSERT INTO property_amenities (property_id, amenity_name, amenity_icon)
SELECT p.id, 'AC', 'snowflake' FROM properties p WHERE p.name = 'Green Valley PG';

INSERT INTO property_amenities (property_id, amenity_name, amenity_icon)
SELECT p.id, 'Gym', 'dumbbell' FROM properties p WHERE p.name = 'Green Valley PG';

INSERT INTO property_amenities (property_id, amenity_name, amenity_icon)
SELECT p.id, 'Parking', 'car' FROM properties p WHERE p.name = 'Green Valley PG';

INSERT INTO property_amenities (property_id, amenity_name, amenity_icon)
SELECT p.id, 'Laundry', 'tshirt' FROM properties p WHERE p.name = 'Green Valley PG';

-- Add amenities to other properties
INSERT INTO property_amenities (property_id, amenity_name, amenity_icon)
SELECT p.id, 'WiFi', 'wifi' FROM properties p WHERE p.name IN ('Sunshine Residency', 'Ocean View PG', 'City Center Hostel', 'Tech Park Residency', 'Lake View PG');

INSERT INTO property_amenities (property_id, amenity_name, amenity_icon)
SELECT p.id, 'AC', 'snowflake' FROM properties p WHERE p.name IN ('Sunshine Residency', 'Ocean View PG', 'Tech Park Residency', 'Lake View PG');

INSERT INTO property_amenities (property_id, amenity_name, amenity_icon)
SELECT p.id, 'Gym', 'dumbbell' FROM properties p WHERE p.name IN ('Sunshine Residency', 'Tech Park Residency');

INSERT INTO property_amenities (property_id, amenity_name, amenity_icon)
SELECT p.id, 'Parking', 'car' FROM properties p WHERE p.name IN ('Sunshine Residency', 'Ocean View PG', 'Tech Park Residency', 'Lake View PG');

-- Verify the data
SELECT 'Properties Created:' as info, COUNT(*) as count FROM properties;
SELECT 'Rooms Created:' as info, COUNT(*) as count FROM property_rooms;
SELECT 'Amenities Created:' as info, COUNT(*) as count FROM property_amenities;
