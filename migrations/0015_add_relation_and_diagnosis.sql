-- Migration: Add referred_by_relation and problem_diagnosis fields
-- referred_by_relation: Relationship to patient (e.g., Friend, Relative, Doctor, etc.)
-- problem_diagnosis: Current health problem/diagnosis for patient

ALTER TABLE patients ADD COLUMN referred_by_relation TEXT;
ALTER TABLE patients ADD COLUMN problem_diagnosis TEXT;

-- No data migration needed as these are new optional fields
