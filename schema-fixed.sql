-- TPS Dhanvantari Ayurveda - Simplified Database Schema (Error-Free)

-- Drop existing tables to start fresh
DROP TABLE IF EXISTS reminders;
DROP TABLE IF EXISTS herbs_routes;
DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS patients;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS admin_users;

-- Admin Users Table
CREATE TABLE admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    profile_picture TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Sessions Table
CREATE TABLE sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    session_token TEXT UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE
);

-- Patients Table
CREATE TABLE patients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL,
    alternate_phone TEXT,
    date_of_birth DATE,
    age INTEGER,
    gender TEXT,
    blood_group TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    country TEXT DEFAULT 'India',
    pincode TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    medical_history TEXT,
    allergies TEXT,
    current_medications TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Appointments Table
CREATE TABLE appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    appointment_date DATETIME NOT NULL,
    appointment_type TEXT DEFAULT 'consultation',
    status TEXT DEFAULT 'scheduled',
    reason TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- Herbs & Routes (Prescriptions) Table
CREATE TABLE herbs_routes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    appointment_id INTEGER,
    prescription_date DATE NOT NULL,
    diagnosis TEXT,
    herbs_medicines TEXT NOT NULL,
    dosage TEXT,
    duration TEXT,
    instructions TEXT,
    follow_up_date DATE,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL
);

-- Reminders Table
CREATE TABLE reminders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    prescription_id INTEGER,
    reminder_type TEXT DEFAULT 'follow_up',
    reminder_date DATETIME NOT NULL,
    message TEXT,
    status TEXT DEFAULT 'pending',
    sent_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (prescription_id) REFERENCES herbs_routes(id) ON DELETE SET NULL
);

-- Create Indexes for Better Performance
CREATE INDEX idx_patients_email ON patients(email);
CREATE INDEX idx_patients_phone ON patients(phone);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_herbs_patient ON herbs_routes(patient_id);
CREATE INDEX idx_herbs_date ON herbs_routes(prescription_date);
CREATE INDEX idx_reminders_patient ON reminders(patient_id);
CREATE INDEX idx_reminders_date ON reminders(reminder_date);
CREATE INDEX idx_reminders_status ON reminders(status);
CREATE INDEX idx_sessions_token ON sessions(session_token);
CREATE INDEX idx_sessions_user ON sessions(user_id);

-- Insert Default Admin User
-- Email: Shankaranherbaltreatment@gmail.com
-- Password: 123456
-- Password Hash (SHA-256 of "123456"): 8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92
INSERT INTO admin_users (email, password_hash, name, role) 
VALUES ('Shankaranherbaltreatment@gmail.com', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Admin User', 'admin');

-- Insert Sample Patients
INSERT INTO patients (name, email, phone, gender, age, country, created_at) VALUES
('Rajesh Kumar', 'rajesh@example.com', '+91-9876543210', 'Male', 45, 'India', datetime('now', '-30 days')),
('Priya Sharma', 'priya@example.com', '+91-9876543211', 'Female', 32, 'India', datetime('now', '-25 days')),
('Amit Patel', 'amit@example.com', '+91-9876543212', 'Male', 28, 'India', datetime('now', '-20 days')),
('Sunita Reddy', 'sunita@example.com', '+91-9876543213', 'Female', 38, 'India', datetime('now', '-15 days')),
('Vikram Singh', 'vikram@example.com', '+91-9876543214', 'Male', 52, 'India', datetime('now', '-10 days'));

-- Insert Sample Appointments
INSERT INTO appointments (patient_id, appointment_date, appointment_type, status, reason) VALUES
(1, datetime('now', '+1 day'), 'consultation', 'scheduled', 'Regular checkup'),
(2, datetime('now', '+2 days'), 'follow_up', 'confirmed', 'Follow-up for treatment'),
(3, datetime('now'), 'consultation', 'completed', 'Joint pain consultation'),
(4, datetime('now', '+3 days'), 'consultation', 'scheduled', 'Digestive issues'),
(5, datetime('now', '-1 day'), 'consultation', 'completed', 'Skin treatment follow-up');

-- Insert Sample Prescriptions
INSERT INTO herbs_routes (patient_id, appointment_id, prescription_date, diagnosis, herbs_medicines, dosage, duration, instructions) VALUES
(1, 1, date('now'), 'Common cold', 'Tulsi, Ginger, Honey', '2 times daily', '7 days', 'Take with warm water'),
(2, 2, date('now', '-5 days'), 'Digestive issues', 'Triphala, Ajwain', '1 time daily', '15 days', 'Take before bedtime'),
(3, 3, date('now'), 'Joint pain', 'Ashwagandha, Turmeric', '2 times daily', '30 days', 'Take after meals');

-- Insert Sample Reminders
INSERT INTO reminders (patient_id, prescription_id, reminder_type, reminder_date, message, status) VALUES
(1, 1, 'follow_up', datetime('now', '+7 days'), 'Follow-up appointment scheduled', 'pending'),
(2, 2, 'medication', datetime('now', '+1 day'), 'Time to refill medication', 'pending'),
(3, 3, 'follow_up', datetime('now', '+30 days'), 'Follow-up for joint pain treatment', 'pending');
