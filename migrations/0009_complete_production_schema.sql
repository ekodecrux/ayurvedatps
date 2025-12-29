-- Migration: Create all required tables for production
-- Run this if migrations are not working

-- 1. Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  profile_picture TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Sessions Table
CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  session_token TEXT UNIQUE NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE
);

-- Create indexes for sessions
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

-- 3. Patients Table
CREATE TABLE IF NOT EXISTS patients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  age INTEGER,
  gender TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  country_iso3 TEXT,
  pincode TEXT,
  attacked_by TEXT,
  diseases_json TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create index for patient_id
CREATE INDEX IF NOT EXISTS idx_patients_patient_id ON patients(patient_id);

-- 4. Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TEXT,
  status TEXT DEFAULT 'scheduled',
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- 5. Herbs Routes Table
CREATE TABLE IF NOT EXISTS herbs_routes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER NOT NULL,
  appointment_id INTEGER,
  diagnosis TEXT,
  notes TEXT,
  next_followup_date DATE,
  given_date DATE,
  course INTEGER DEFAULT 0,
  currency TEXT DEFAULT 'INR',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL
);

-- Create index for herbs_routes
CREATE INDEX IF NOT EXISTS idx_herbs_routes_patient ON herbs_routes(patient_id);

-- 6. Medicines Tracking Table
CREATE TABLE IF NOT EXISTS medicines_tracking (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  herbs_route_id INTEGER NOT NULL,
  roman_id TEXT,
  medicine_name TEXT NOT NULL,
  given_date DATE,
  treatment_months INTEGER DEFAULT 1,
  payment_amount REAL DEFAULT 0,
  advance_payment REAL DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (herbs_route_id) REFERENCES herbs_routes(id) ON DELETE CASCADE
);

-- Create index for medicines_tracking
CREATE INDEX IF NOT EXISTS idx_medicines_herbs_route ON medicines_tracking(herbs_route_id);

-- 7. Payment Collections Table
CREATE TABLE IF NOT EXISTS payment_collections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  herbs_route_id INTEGER NOT NULL,
  collection_date DATE NOT NULL,
  amount REAL NOT NULL,
  payment_method TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (herbs_route_id) REFERENCES herbs_routes(id) ON DELETE CASCADE
);

-- Create index for payment_collections
CREATE INDEX IF NOT EXISTS idx_payment_herbs_route ON payment_collections(herbs_route_id);

-- 8. Reminders Table
CREATE TABLE IF NOT EXISTS reminders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER NOT NULL,
  herbs_route_id INTEGER,
  reminder_date DATE NOT NULL,
  reminder_type TEXT DEFAULT 'followup',
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (herbs_route_id) REFERENCES herbs_routes(id) ON DELETE SET NULL
);

-- Create index for reminders
CREATE INDEX IF NOT EXISTS idx_reminders_date ON reminders(reminder_date);
CREATE INDEX IF NOT EXISTS idx_reminders_patient ON reminders(patient_id);

-- Insert default admin user (password: 123456)
INSERT OR IGNORE INTO admin_users (email, name, password_hash, created_at, updated_at)
VALUES (
  'tpsdhanvantari@gmail.com',
  'Nilesh',
  '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
  datetime('now'),
  datetime('now')
);
