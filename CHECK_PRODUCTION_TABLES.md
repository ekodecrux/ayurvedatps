# Check Production Database Tables

The View/Edit/Print buttons are failing because the production database is missing required tables.

## Steps to Fix:

### 1. Check Existing Tables in Production
```bash
npx wrangler d1 execute ayurveda-db-prod --remote --command="SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
```

### 2. If Tables Are Missing, Create Them Manually

#### Create medicines_tracking table:
```bash
npx wrangler d1 execute ayurveda-db-prod --remote --command="CREATE TABLE IF NOT EXISTS medicines_tracking (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  herbs_route_id INTEGER NOT NULL,
  roman_id TEXT,
  medicine_name TEXT NOT NULL,
  given_date DATE,
  treatment_months INTEGER,
  payment_amount REAL DEFAULT 0,
  advance_payment REAL DEFAULT 0,
  balance_due REAL DEFAULT 0,
  payment_notes TEXT,
  is_active INTEGER DEFAULT 1,
  morning_before INTEGER DEFAULT 0,
  morning_after INTEGER DEFAULT 0,
  afternoon_before INTEGER DEFAULT 0,
  afternoon_after INTEGER DEFAULT 0,
  evening_before INTEGER DEFAULT 0,
  evening_after INTEGER DEFAULT 0,
  night_before INTEGER DEFAULT 0,
  night_after INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (herbs_route_id) REFERENCES herbs_routes(id) ON DELETE CASCADE
)"
```

#### Create payment_collections table:
```bash
npx wrangler d1 execute ayurveda-db-prod --remote --command="CREATE TABLE IF NOT EXISTS payment_collections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  herbs_route_id INTEGER NOT NULL,
  collection_date DATE NOT NULL,
  amount REAL NOT NULL,
  payment_method TEXT DEFAULT 'Cash',
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (herbs_route_id) REFERENCES herbs_routes(id) ON DELETE CASCADE
)"
```

#### Create herbs_routes table (if missing):
```bash
npx wrangler d1 execute ayurveda-db-prod --remote --command="CREATE TABLE IF NOT EXISTS herbs_routes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER NOT NULL,
  patient_fk INTEGER NOT NULL,
  appointment_id INTEGER,
  diagnosis TEXT,
  notes TEXT,
  next_followup_date DATE,
  given_date DATE,
  treatment_months INTEGER,
  payment_amount REAL DEFAULT 0,
  advance_payment REAL DEFAULT 0,
  payment_notes TEXT,
  due_balance REAL DEFAULT 0,
  course INTEGER DEFAULT 1,
  currency TEXT DEFAULT 'INR',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_fk) REFERENCES patients(id) ON DELETE CASCADE
)"
```

#### Create patients table (if missing):
```bash
npx wrangler d1 execute ayurveda-db-prod --remote --command="CREATE TABLE IF NOT EXISTS patients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id TEXT UNIQUE,
  patient_identifier TEXT,
  name TEXT NOT NULL,
  age INTEGER,
  gender TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  country TEXT,
  country_code TEXT,
  weight REAL,
  height REAL,
  present_health_issue TEXT,
  present_medicine TEXT,
  mg_value TEXT,
  attacked_by TEXT,
  diseases TEXT,
  address_hno TEXT,
  address_street TEXT,
  address_apartment TEXT,
  address_area TEXT,
  address_district TEXT,
  address_state TEXT,
  address_pincode TEXT,
  referred_by TEXT,
  medical_history TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)"
```

### 3. Verify Tables Were Created
```bash
npx wrangler d1 execute ayurveda-db-prod --remote --command="SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
```

You should see:
- admin_users
- herbs_routes
- medicines_tracking
- patients
- payment_collections
- sessions

### 4. Test the API Endpoint
```bash
# Get the ID from your table (looks like you have IND00001 which is probably id=1 or similar)
# Try to fetch it
curl https://herbs-routes-working.ayurveda-clinic.pages.dev/api/prescriptions/1
```

If this returns data successfully, the View/Edit/Print buttons will work!

## Quick Fix Script

Run all commands in sequence:

```bash
# Check tables
npx wrangler d1 execute ayurveda-db-prod --remote --command="SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"

# If missing, create all tables (run each CREATE TABLE command above)
# Then verify again
```

After creating the tables, refresh your browser and try clicking View/Edit/Print again!
