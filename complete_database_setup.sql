-- Patients table
CREATE TABLE IF NOT EXISTS patients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  age INTEGER,
  gender TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  medical_history TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER NOT NULL,
  appointment_date DATETIME NOT NULL,
  purpose TEXT,
  status TEXT DEFAULT 'scheduled',
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- Medicines inventory table
CREATE TABLE IF NOT EXISTS medicines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT,
  quantity INTEGER DEFAULT 0,
  unit TEXT,
  price REAL,
  description TEXT,
  expiry_date DATE,
  manufacturer TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Prescriptions table
CREATE TABLE IF NOT EXISTS prescriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER NOT NULL,
  appointment_id INTEGER,
  diagnosis TEXT,
  notes TEXT,
  next_followup_date DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL
);

-- Prescription medicines (junction table)
CREATE TABLE IF NOT EXISTS prescription_medicines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  prescription_id INTEGER NOT NULL,
  medicine_id INTEGER NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT,
  duration TEXT,
  instructions TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (prescription_id) REFERENCES prescriptions(id) ON DELETE CASCADE,
  FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE
);

-- Reminders table
CREATE TABLE IF NOT EXISTS reminders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER NOT NULL,
  prescription_id INTEGER,
  reminder_type TEXT NOT NULL,
  reminder_date DATETIME NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending',
  sent_at DATETIME,
  send_whatsapp BOOLEAN DEFAULT 0,
  send_sms BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (prescription_id) REFERENCES prescriptions(id) ON DELETE CASCADE
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(phone);
CREATE INDEX IF NOT EXISTS idx_patients_name ON patients(name);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_id ON prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_followup ON prescriptions(next_followup_date);
CREATE INDEX IF NOT EXISTS idx_prescription_medicines_prescription_id ON prescription_medicines(prescription_id);
CREATE INDEX IF NOT EXISTS idx_reminders_patient_id ON reminders(patient_id);
CREATE INDEX IF NOT EXISTS idx_reminders_date ON reminders(reminder_date);
CREATE INDEX IF NOT EXISTS idx_reminders_status ON reminders(status);
CREATE INDEX IF NOT EXISTS idx_medicines_name ON medicines(name);
CREATE INDEX IF NOT EXISTS idx_medicines_expiry ON medicines(expiry_date);
-- Add patient_id column (unique identifier like PAT001, PAT002, etc.)
ALTER TABLE patients ADD COLUMN patient_id TEXT;

-- Update existing patients with auto-generated IDs
UPDATE patients SET patient_id = 'PAT' || substr('00000' || id, -5, 5) WHERE patient_id IS NULL;

-- Create unique index for patient_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_patients_patient_id ON patients(patient_id);
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
-- Add attacked_by field to patients table
ALTER TABLE patients ADD COLUMN attacked_by TEXT;
-- Add country_iso3 field to patients table
ALTER TABLE patients ADD COLUMN country_iso3 TEXT;

-- Update existing patients with default ISO3 codes based on country name
UPDATE patients SET country_iso3 = 'IND' WHERE country = 'India' OR country IS NULL;
UPDATE patients SET country_iso3 = 'USA' WHERE country = 'USA';
UPDATE patients SET country_iso3 = 'GBR' WHERE country = 'UK' OR country = 'United Kingdom';
UPDATE patients SET country_iso3 = 'AUS' WHERE country = 'Australia';
UPDATE patients SET country_iso3 = 'CAN' WHERE country = 'Canada';
UPDATE patients SET country_iso3 = 'ARE' WHERE country = 'UAE';
UPDATE patients SET country_iso3 = 'SGP' WHERE country = 'Singapore';
UPDATE patients SET country_iso3 = 'MYS' WHERE country = 'Malaysia';
UPDATE patients SET country_iso3 = 'SAU' WHERE country = 'Saudi Arabia';
-- Create users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  google_id TEXT UNIQUE,
  profile_picture TEXT,
  role TEXT DEFAULT 'user',
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME
);

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  session_token TEXT UNIQUE NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create index for faster session lookup
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

-- Insert default admin user (you can change this email)
INSERT OR IGNORE INTO users (email, name, role) 
VALUES ('admin@tpsdhanvantri.com', 'Admin User', 'admin');
-- Add diseases JSON field to store multiple diseases per patient
ALTER TABLE patients ADD COLUMN diseases TEXT;

-- The diseases field will store JSON array like:
-- [{"present_health_issue": "...", "present_medicine": "...", "mg_value": "...", "attacked_by": "..."}]
-- Create payment_collections table to track multiple payments per course
CREATE TABLE IF NOT EXISTS payment_collections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  medicine_id INTEGER NOT NULL,
  collection_date DATE NOT NULL,
  amount REAL NOT NULL,
  payment_method TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (medicine_id) REFERENCES medicines_tracking(id) ON DELETE CASCADE
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_payment_collections_medicine_id ON payment_collections(medicine_id);
CREATE INDEX IF NOT EXISTS idx_payment_collections_date ON payment_collections(collection_date);
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
-- Drop the incorrect table
DROP TABLE IF EXISTS payment_collections;

-- Recreate with correct schema (herbs_route_id and course_id)
CREATE TABLE payment_collections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  herbs_route_id INTEGER NOT NULL,
  course_id INTEGER NOT NULL,
  collection_date DATE NOT NULL,
  amount REAL NOT NULL,
  payment_method TEXT DEFAULT 'Cash',
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (herbs_route_id) REFERENCES herbs_routes(id) ON DELETE CASCADE
);

-- Create indexes for faster queries
CREATE INDEX idx_payment_collections_herbs_route ON payment_collections(herbs_route_id);
CREATE INDEX idx_payment_collections_course ON payment_collections(course_id);
CREATE INDEX idx_payment_collections_date ON payment_collections(collection_date);
-- Create admin_users table for admin authentication with password
CREATE TABLE IF NOT EXISTS admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  profile_picture TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster email lookup
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
