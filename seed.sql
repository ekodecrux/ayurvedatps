-- Insert default settings
INSERT OR IGNORE INTO settings (key, value) VALUES 
  ('clinic_name', 'Ayurveda Wellness Clinic'),
  ('doctor_name', 'Dr. Ayurveda Specialist'),
  ('reminder_days_before', '3'),
  ('whatsapp_enabled', 'true'),
  ('sms_enabled', 'true'),
  ('whatsapp_api_key', ''),
  ('sms_api_key', '');

-- Insert sample medicines
INSERT OR IGNORE INTO medicines (name, category, quantity, unit, price, description, expiry_date, manufacturer) VALUES 
  ('Triphala Churna', 'Digestive', 100, 'grams', 150.00, 'Digestive and detoxification formula', '2026-12-31', 'Himalaya'),
  ('Ashwagandha Capsules', 'Immunity', 50, 'capsules', 350.00, 'Stress relief and immunity booster', '2026-06-30', 'Patanjali'),
  ('Brahmi Syrup', 'Brain Tonic', 30, 'bottles', 180.00, 'Memory enhancer and brain tonic', '2025-12-31', 'Dabur'),
  ('Chyawanprash', 'Immunity', 25, 'jars', 280.00, 'General health and immunity', '2026-03-31', 'Baidyanath'),
  ('Arjuna Capsules', 'Cardiac', 40, 'capsules', 320.00, 'Heart health support', '2026-09-30', 'Himalaya'),
  ('Neem Tablets', 'Blood Purifier', 60, 'tablets', 120.00, 'Blood purification and skin health', '2026-08-31', 'Patanjali'),
  ('Giloy Juice', 'Immunity', 20, 'bottles', 200.00, 'Immunity booster and fever management', '2025-11-30', 'Dabur'),
  ('Trikatu Powder', 'Digestive', 80, 'grams', 90.00, 'Digestive fire enhancer', '2026-10-31', 'Baidyanath');

-- Insert sample patients
INSERT OR IGNORE INTO patients (name, age, gender, phone, email, address, medical_history) VALUES 
  ('Rajesh Kumar', 45, 'Male', '+91-9876543210', 'rajesh@email.com', '123 MG Road, Bangalore', 'Hypertension, Diabetes'),
  ('Priya Sharma', 32, 'Female', '+91-9876543211', 'priya@email.com', '456 Park Street, Mumbai', 'Migraine, Anxiety'),
  ('Anil Verma', 58, 'Male', '+91-9876543212', 'anil@email.com', '789 Lake View, Delhi', 'Arthritis, High Cholesterol');
