-- Add patient_id column (unique identifier like PAT001, PAT002, etc.)
ALTER TABLE patients ADD COLUMN patient_id TEXT;

-- Update existing patients with auto-generated IDs
UPDATE patients SET patient_id = 'PAT' || substr('00000' || id, -5, 5) WHERE patient_id IS NULL;

-- Create unique index for patient_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_patients_patient_id ON patients(patient_id);
