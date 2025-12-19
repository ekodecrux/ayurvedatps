-- Migration for TPS DHANVANTRI AYURVEDA enhancements
-- Add new fields to patients table

-- Add country-related fields
ALTER TABLE patients ADD COLUMN country TEXT;
ALTER TABLE patients ADD COLUMN country_code TEXT DEFAULT '+91';

-- Add physical measurements
ALTER TABLE patients ADD COLUMN weight REAL;
ALTER TABLE patients ADD COLUMN height REAL;

-- Add referred by information
ALTER TABLE patients ADD COLUMN referred_by_name TEXT;
ALTER TABLE patients ADD COLUMN referred_by_phone TEXT;
ALTER TABLE patients ADD COLUMN referred_by_address TEXT;

-- Add detailed address fields
ALTER TABLE patients ADD COLUMN address_hno TEXT;
ALTER TABLE patients ADD COLUMN address_street TEXT;
ALTER TABLE patients ADD COLUMN address_apartment TEXT;
ALTER TABLE patients ADD COLUMN address_area TEXT;
ALTER TABLE patients ADD COLUMN address_district TEXT;
ALTER TABLE patients ADD COLUMN address_state TEXT;
ALTER TABLE patients ADD COLUMN address_pincode TEXT;
ALTER TABLE patients ADD COLUMN address_latitude REAL;
ALTER TABLE patients ADD COLUMN address_longitude REAL;

-- Add patient photo
ALTER TABLE patients ADD COLUMN photo_url TEXT;

-- Add enhanced medical history fields
ALTER TABLE patients ADD COLUMN present_health_issue TEXT;
ALTER TABLE patients ADD COLUMN present_medicine TEXT;
ALTER TABLE patients ADD COLUMN mg_value TEXT;

-- Add additional phone numbers (stored as JSON)
ALTER TABLE patients ADD COLUMN additional_phones TEXT; -- JSON array of {label, number}

-- Drop the old medicines and prescription_medicines tables (no longer needed)
DROP TABLE IF EXISTS medicines;
DROP TABLE IF EXISTS prescription_medicines;

-- Rename prescriptions table to herbs_routes
ALTER TABLE prescriptions RENAME TO herbs_routes;

-- Add new fields to herbs_routes (prescriptions)
ALTER TABLE herbs_routes ADD COLUMN given_date DATE;
ALTER TABLE herbs_routes ADD COLUMN treatment_months INTEGER;
ALTER TABLE herbs_routes ADD COLUMN payment_amount REAL DEFAULT 0;
ALTER TABLE herbs_routes ADD COLUMN advance_payment REAL DEFAULT 0;
ALTER TABLE herbs_routes ADD COLUMN payment_notes TEXT;
ALTER TABLE herbs_routes ADD COLUMN due_balance REAL DEFAULT 0;
ALTER TABLE herbs_routes ADD COLUMN course INTEGER;

-- Create new medicines_tracking table for the new medicine format
CREATE TABLE IF NOT EXISTS medicines_tracking (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  herbs_route_id INTEGER NOT NULL,
  roman_id TEXT NOT NULL, -- I, II, III, IV, V, VI, VII, VIII, IX, X, XI, XII
  medicine_name TEXT NOT NULL,
  given_date DATE NOT NULL,
  treatment_months INTEGER NOT NULL,
  
  -- Dosage schedule (stored as JSON or separate boolean fields)
  morning_before BOOLEAN DEFAULT 0,
  morning_after BOOLEAN DEFAULT 0,
  afternoon_before BOOLEAN DEFAULT 0,
  afternoon_after BOOLEAN DEFAULT 0,
  evening_before BOOLEAN DEFAULT 0,
  evening_after BOOLEAN DEFAULT 0,
  night_before BOOLEAN DEFAULT 0,
  night_after BOOLEAN DEFAULT 0,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (herbs_route_id) REFERENCES herbs_routes(id) ON DELETE CASCADE
);

-- Create diseases table for multiple disease tracking
CREATE TABLE IF NOT EXISTS patient_diseases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER NOT NULL,
  disease_name TEXT NOT NULL,
  attacked_by TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- Create index for faster patient lookup by country
CREATE INDEX IF NOT EXISTS idx_patients_country ON patients(country);
CREATE INDEX IF NOT EXISTS idx_patients_patient_id ON patients(patient_id);
