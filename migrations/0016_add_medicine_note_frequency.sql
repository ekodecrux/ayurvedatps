-- Migration: Add medicine note and frequency fields
-- medicine_note: Optional note/remark for each medicine
-- medicine_frequency: Daily or Alternate-day selection

-- Note: The medicines_tracking table stores individual medicine details
-- We need to add columns for note and frequency options

ALTER TABLE medicines_tracking ADD COLUMN medicine_note TEXT;
ALTER TABLE medicines_tracking ADD COLUMN is_daily INTEGER DEFAULT 1;
ALTER TABLE medicines_tracking ADD COLUMN is_alternate_day INTEGER DEFAULT 0;

-- No data migration needed as these are new optional fields
