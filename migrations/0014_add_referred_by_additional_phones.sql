-- Migration: Add additional phones field for "Referred By" section
-- This allows storing multiple phone numbers for the person who referred the patient

ALTER TABLE patients ADD COLUMN referred_by_additional_phones TEXT;
-- JSON array format: [{"label": "Home", "number": "+91 9876543210"}, ...]

-- No data migration needed as this is a new optional field
