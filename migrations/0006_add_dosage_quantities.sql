-- Migration 0006: Add dosage quantity fields to medicines_tracking table
-- These fields store the quantity (1-5) for each dosage time slot

ALTER TABLE medicines_tracking ADD COLUMN morning_before_qty INTEGER DEFAULT 1;
ALTER TABLE medicines_tracking ADD COLUMN morning_after_qty INTEGER DEFAULT 1;
ALTER TABLE medicines_tracking ADD COLUMN afternoon_before_qty INTEGER DEFAULT 1;
ALTER TABLE medicines_tracking ADD COLUMN afternoon_after_qty INTEGER DEFAULT 1;
ALTER TABLE medicines_tracking ADD COLUMN evening_before_qty INTEGER DEFAULT 1;
ALTER TABLE medicines_tracking ADD COLUMN evening_after_qty INTEGER DEFAULT 1;
ALTER TABLE medicines_tracking ADD COLUMN night_before_qty INTEGER DEFAULT 1;
ALTER TABLE medicines_tracking ADD COLUMN night_after_qty INTEGER DEFAULT 1;
