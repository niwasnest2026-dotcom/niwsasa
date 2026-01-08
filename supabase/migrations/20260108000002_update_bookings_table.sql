/*
  # Update Bookings Table Schema

  ## Changes

  ### Bookings Table Updates
  - Make `room_id` column nullable to support direct property bookings
  - Add `payment_id` column to store Razorpay payment ID
  - Update `booking_status` values to include 'booked' status

  ## Reasoning

  - Some properties may not have rooms defined yet
  - Need to store Razorpay payment ID for reference
  - 'booked' status used for confirmed paid bookings

  ## Notes

  - Maintains backward compatibility with existing bookings
  - Room availability triggers will only work if room_id is provided
*/

-- Make room_id nullable to support direct property bookings
ALTER TABLE bookings
  ALTER COLUMN room_id DROP NOT NULL;

-- Add payment_id column if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'payment_id') THEN
    ALTER TABLE bookings ADD COLUMN payment_id TEXT;
    CREATE INDEX IF NOT EXISTS idx_bookings_payment_id ON bookings(payment_id);
    COMMENT ON COLUMN bookings.payment_id IS 'Razorpay payment ID for tracking payments';
  END IF;
END $$;

-- Update booking_status comment to include 'booked' status
COMMENT ON COLUMN bookings.booking_status IS 'confirmed: booking active, booked: payment confirmed booking, cancelled: booking cancelled, completed: stay completed';

-- Update the room availability trigger to handle nullable room_id
CREATE OR REPLACE FUNCTION update_room_availability()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process if room_id is provided
  IF NEW.room_id IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  IF TG_OP = 'INSERT' AND (NEW.booking_status = 'confirmed' OR NEW.booking_status = 'booked') THEN
    -- Decrease available beds when new booking is confirmed
    UPDATE property_rooms
    SET available_beds = available_beds - 1,
        updated_at = NOW()
    WHERE id = NEW.room_id AND available_beds > 0;

    -- Don't raise exception if room not found (allows property-level bookings)

  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle status changes
    IF (OLD.booking_status = 'confirmed' OR OLD.booking_status = 'booked') AND NEW.booking_status = 'cancelled' THEN
      -- Increase available beds when booking is cancelled
      UPDATE property_rooms
      SET available_beds = available_beds + 1,
          updated_at = NOW()
      WHERE id = NEW.room_id;

    ELSIF OLD.booking_status = 'cancelled' AND (NEW.booking_status = 'confirmed' OR NEW.booking_status = 'booked') THEN
      -- Decrease available beds when cancelled booking is reconfirmed
      UPDATE property_rooms
      SET available_beds = available_beds - 1,
          updated_at = NOW()
      WHERE id = NEW.room_id AND available_beds > 0;
    END IF;

  ELSIF TG_OP = 'DELETE' AND (OLD.booking_status = 'confirmed' OR OLD.booking_status = 'booked') THEN
    -- Increase available beds when confirmed booking is deleted
    UPDATE property_rooms
    SET available_beds = available_beds + 1,
        updated_at = NOW()
    WHERE id = OLD.room_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

RAISE NOTICE 'Bookings table updated successfully - room_id is now nullable, payment_id added!';
