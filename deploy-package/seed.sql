-- Insert default settings
INSERT OR IGNORE INTO settings (key, value) VALUES 
  ('clinic_name', 'TPS DHANVANTARI AYURVEDA'),
  ('doctor_name', 'Dr. TPS Ayurveda Specialist'),
  ('reminder_days_before', '3'),
  ('whatsapp_enabled', 'true'),
  ('sms_enabled', 'true'),
  ('whatsapp_api_key', ''),
  ('sms_api_key', '');

-- Insert default admin user (email: admin@tpsdhanvantari.com, password: admin123)
INSERT OR IGNORE INTO admin_users (email, password_hash, name, profile_picture) VALUES 
  ('admin@tpsdhanvantari.com', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'TPS Admin', NULL);

-- Insert sample patients with correct schema
INSERT OR IGNORE INTO patients (patient_id, name, age, gender, phone, email, address, medical_history, country, country_code, country_iso3) VALUES 
  ('IND00001', 'Ravikumar Pendyala', 29, 'Male', '9192811907', 'ravikumar@email.com', '123 MG Road, Bangalore', 'Hypertension, Diabetes', 'India', '+91', 'IND'),
  ('IND00002', 'Priya Sharma', 32, 'Female', '9876543211', 'priya@email.com', '456 Park Street, Mumbai', 'Migraine, Anxiety', 'India', '+91', 'IND'),
  ('IND00003', 'Anil Verma', 58, 'Male', '9876543212', 'anil@email.com', '789 Lake View, Delhi', 'Arthritis, High Cholesterol', 'India', '+91', 'IND');

-- Insert sample herbs & routes record
INSERT OR IGNORE INTO herbs_routes (id, patient_id, appointment_id, diagnosis, notes, next_followup_date, course, created_at) VALUES 
  (1, 1, NULL, 'Digestive Issues', 'Patient complaints of bloating and indigestion', '2026-01-29', 6, datetime('now'));

-- Insert sample medicines for the herbs & routes record
INSERT OR IGNORE INTO medicines_tracking (
  herbs_route_id, roman_id, medicine_name, given_date, treatment_months, is_active,
  payment_amount, advance_payment, balance_due, payment_notes,
  morning_before, morning_after, afternoon_before, afternoon_after,
  evening_before, evening_after, night_before, night_after
) VALUES 
  (1, 'I', 'Triphala Churna 100g', '2025-12-29', 6, 1, 3000.00, 1500.00, 1500.00, 'Initial payment received',
   1, 0, 0, 1, 1, 0, 0, 0),
  (1, 'II', 'Ashwagandha Capsules', '2025-12-29', 6, 1, 3000.00, 1500.00, 1500.00, 'Initial payment received',
   0, 1, 0, 1, 0, 0, 0, 1);

-- Insert sample reminder for follow-up
INSERT OR IGNORE INTO reminders (id, patient_id, prescription_id, reminder_type, reminder_date, message, status, send_whatsapp, send_sms) VALUES 
  (1, 1, 1, 'Follow-up', '2026-01-29', 'Time for your follow-up consultation', 'pending', 1, 0);
