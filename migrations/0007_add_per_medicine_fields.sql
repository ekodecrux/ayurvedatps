-- Add per-medicine fields to medicines_tracking table
-- roman_id, given_date, treatment_months already exist
-- Adding: is_active, payment fields

ALTER TABLE medicines_tracking ADD COLUMN is_active BOOLEAN DEFAULT 1;
ALTER TABLE medicines_tracking ADD COLUMN payment_amount REAL DEFAULT 0;
ALTER TABLE medicines_tracking ADD COLUMN advance_payment REAL DEFAULT 0;
ALTER TABLE medicines_tracking ADD COLUMN balance_due REAL DEFAULT 0;
ALTER TABLE medicines_tracking ADD COLUMN payment_notes TEXT;

-- Update existing records to be active by default
UPDATE medicines_tracking SET is_active = 1 WHERE is_active IS NULL;
