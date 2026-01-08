/*
  # Add Location Coordinates to Properties

  ## Changes

  ### Properties Table Updates
  - Add `latitude` (numeric) - Latitude coordinate for property location
  - Add `longitude` (numeric) - Longitude coordinate for property location

  These fields will enable:
  1. Distance-based sorting of properties
  2. Map-based search functionality
  3. "Near me" features

  ## Notes

  - Coordinates are optional (nullable) to allow gradual data entry
  - Admin can add coordinates when creating/editing properties
  - Existing properties will have NULL coordinates until updated
*/

-- Add latitude and longitude columns to properties table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'latitude') THEN
    ALTER TABLE properties ADD COLUMN latitude numeric;
    COMMENT ON COLUMN properties.latitude IS 'Latitude coordinate for property location';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'longitude') THEN
    ALTER TABLE properties ADD COLUMN longitude numeric;
    COMMENT ON COLUMN properties.longitude IS 'Longitude coordinate for property location';
  END IF;
END $$;

-- Create an index for faster geospatial queries
CREATE INDEX IF NOT EXISTS idx_properties_coordinates ON properties(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Optional: Add a check constraint to ensure valid coordinate ranges
ALTER TABLE properties DROP CONSTRAINT IF EXISTS check_latitude_range;
ALTER TABLE properties ADD CONSTRAINT check_latitude_range CHECK (latitude IS NULL OR (latitude >= -90 AND latitude <= 90));

ALTER TABLE properties DROP CONSTRAINT IF EXISTS check_longitude_range;
ALTER TABLE properties ADD CONSTRAINT check_longitude_range CHECK (longitude IS NULL OR (longitude >= -180 AND longitude <= 180));
