-- Add diseases JSON field to store multiple diseases per patient
ALTER TABLE patients ADD COLUMN diseases TEXT;

-- The diseases field will store JSON array like:
-- [{"present_health_issue": "...", "present_medicine": "...", "mg_value": "...", "attacked_by": "..."}]
