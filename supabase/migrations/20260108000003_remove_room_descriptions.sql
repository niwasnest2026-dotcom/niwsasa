/*
  # Remove Individual Room Descriptions

  ## Changes

  ### Property Rooms Table Updates
  - Remove `description` column from property_rooms table
  - Properties will have a single common description instead of per-room descriptions

  ## Reasoning

  - Simplifies property management
  - Reduces redundancy - description applies to entire property, not individual rooms
  - Room details (type, size, amenities) are already captured in other columns

  ## Notes

  - Existing room descriptions will be lost (backup if needed)
  - Property-level description in properties table remains unchanged
  - Room-specific features are still captured in other columns:
    - room_type, room_size_sqft, has_attached_bathroom, has_balcony, has_ac
*/

-- Drop description column from property_rooms table
ALTER TABLE property_rooms DROP COLUMN IF EXISTS description;

-- Update comment for property_rooms table
COMMENT ON TABLE property_rooms IS 'Stores individual rooms within properties with sharing options. Room descriptions are not stored per-room, use property-level description instead.';

RAISE NOTICE 'Room descriptions removed - use property-level description instead!';
