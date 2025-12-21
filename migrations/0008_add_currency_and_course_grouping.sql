-- Add currency field to herbs_routes table
ALTER TABLE herbs_routes ADD COLUMN currency TEXT DEFAULT 'INR';

-- Add course_number to medicines_tracking to group medicines by course
ALTER TABLE medicines_tracking ADD COLUMN course_number INTEGER DEFAULT 1;

-- Update payment fields to support course-level payments
-- Payment fields already exist in medicines_tracking from migration 0007
-- Just need to update the structure to support course grouping
