-- Create diseases table for managing health issues/diseases
CREATE TABLE IF NOT EXISTS diseases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_diseases_name ON diseases(name);

-- Insert some common diseases as initial data
INSERT OR IGNORE INTO diseases (name, description) VALUES 
  ('Diabetes', 'Blood sugar management'),
  ('Hypertension', 'High blood pressure'),
  ('Heart Disease', 'Cardiovascular conditions'),
  ('Asthma', 'Respiratory condition'),
  ('Arthritis', 'Joint inflammation'),
  ('Migraine', 'Chronic headaches'),
  ('Thyroid Disorder', 'Thyroid gland issues'),
  ('Digestive Issues', 'Stomach and digestive problems'),
  ('Skin Conditions', 'Dermatological issues'),
  ('Anxiety', 'Mental health condition'),
  ('Depression', 'Mental health condition'),
  ('Obesity', 'Weight management'),
  ('Cholesterol', 'High cholesterol levels'),
  ('Kidney Disease', 'Renal conditions'),
  ('Liver Disease', 'Hepatic conditions');
