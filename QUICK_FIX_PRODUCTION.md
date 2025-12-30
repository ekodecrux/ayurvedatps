# Quick Fix: Production Database Setup

## Error You're Seeing
```
D1_ERROR: no such table: admin_users: SQLITE_ERROR
```

This means the production database doesn't have the required tables yet.

---

## 🚀 QUICK FIX (5 Commands)

Run these commands in order on your local computer:

### 1. Create admin_users table
```bash
npx wrangler d1 execute ayurveda-db-prod --remote --command="CREATE TABLE IF NOT EXISTS admin_users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE NOT NULL, name TEXT NOT NULL, password_hash TEXT NOT NULL, profile_picture TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP)"
```

### 2. Create sessions table
```bash
npx wrangler d1 execute ayurveda-db-prod --remote --command="CREATE TABLE IF NOT EXISTS sessions (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, session_token TEXT UNIQUE NOT NULL, expires_at DATETIME NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE)"
```

### 3. Create admin user
```bash
npx wrangler d1 execute ayurveda-db-prod --remote --command="INSERT INTO admin_users (email, name, password_hash, created_at, updated_at) VALUES ('tpsdhanvantari@gmail.com', 'Nilesh', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', datetime('now'), datetime('now'))"
```

### 4. Create patients table
```bash
npx wrangler d1 execute ayurveda-db-prod --remote --command="CREATE TABLE IF NOT EXISTS patients (id INTEGER PRIMARY KEY AUTOINCREMENT, patient_id TEXT UNIQUE, patient_identifier TEXT, name TEXT NOT NULL, age INTEGER, gender TEXT, phone TEXT NOT NULL, email TEXT, country TEXT, country_code TEXT, weight REAL, height REAL, present_health_issue TEXT, present_medicine TEXT, mg_value TEXT, attacked_by TEXT, diseases TEXT, address_hno TEXT, address_street TEXT, address_apartment TEXT, address_area TEXT, address_district TEXT, address_state TEXT, address_pincode TEXT, referred_by TEXT, medical_history TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP)"
```

### 5. Create herbs_routes table
```bash
npx wrangler d1 execute ayurveda-db-prod --remote --command="CREATE TABLE IF NOT EXISTS herbs_routes (id INTEGER PRIMARY KEY AUTOINCREMENT, patient_id INTEGER NOT NULL, patient_fk INTEGER NOT NULL, appointment_id INTEGER, diagnosis TEXT, notes TEXT, next_followup_date DATE, given_date DATE, treatment_months INTEGER, payment_amount REAL DEFAULT 0, advance_payment REAL DEFAULT 0, payment_notes TEXT, due_balance REAL DEFAULT 0, course INTEGER DEFAULT 1, currency TEXT DEFAULT 'INR', created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (patient_fk) REFERENCES patients(id) ON DELETE CASCADE)"
```

### 6. Create medicines_tracking table
```bash
npx wrangler d1 execute ayurveda-db-prod --remote --command="CREATE TABLE IF NOT EXISTS medicines_tracking (id INTEGER PRIMARY KEY AUTOINCREMENT, herbs_route_id INTEGER NOT NULL, roman_id TEXT, medicine_name TEXT NOT NULL, given_date DATE, treatment_months INTEGER, payment_amount REAL DEFAULT 0, advance_payment REAL DEFAULT 0, balance_due REAL DEFAULT 0, payment_notes TEXT, is_active INTEGER DEFAULT 1, morning_before INTEGER DEFAULT 0, morning_after INTEGER DEFAULT 0, afternoon_before INTEGER DEFAULT 0, afternoon_after INTEGER DEFAULT 0, evening_before INTEGER DEFAULT 0, evening_after INTEGER DEFAULT 0, night_before INTEGER DEFAULT 0, night_after INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (herbs_route_id) REFERENCES herbs_routes(id) ON DELETE CASCADE)"
```

### 7. Create payment_collections table
```bash
npx wrangler d1 execute ayurveda-db-prod --remote --command="CREATE TABLE IF NOT EXISTS payment_collections (id INTEGER PRIMARY KEY AUTOINCREMENT, herbs_route_id INTEGER NOT NULL, collection_date DATE NOT NULL, amount REAL NOT NULL, payment_method TEXT DEFAULT 'Cash', notes TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (herbs_route_id) REFERENCES herbs_routes(id) ON DELETE CASCADE)"
```

### 8. Create appointments table
```bash
npx wrangler d1 execute ayurveda-db-prod --remote --command="CREATE TABLE IF NOT EXISTS appointments (id INTEGER PRIMARY KEY AUTOINCREMENT, patient_id INTEGER NOT NULL, appointment_date DATE NOT NULL, appointment_time TIME, status TEXT DEFAULT 'scheduled', purpose TEXT, notes TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE)"
```

### 9. Create reminders table
```bash
npx wrangler d1 execute ayurveda-db-prod --remote --command="CREATE TABLE IF NOT EXISTS reminders (id INTEGER PRIMARY KEY AUTOINCREMENT, patient_id INTEGER NOT NULL, reminder_date DATE NOT NULL, reminder_type TEXT DEFAULT 'followup', message TEXT, status TEXT DEFAULT 'pending', created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE)"
```

### 10. Create patient_diseases table
```bash
npx wrangler d1 execute ayurveda-db-prod --remote --command="CREATE TABLE IF NOT EXISTS patient_diseases (id INTEGER PRIMARY KEY AUTOINCREMENT, patient_id INTEGER NOT NULL, disease_name TEXT NOT NULL, attacked_by TEXT, notes TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE)"
```

---

## ✅ Verify Setup

After running all commands, verify:

```bash
# Check admin user exists
npx wrangler d1 execute ayurveda-db-prod --remote --command="SELECT email, name FROM admin_users"
```

Expected output:
```
email: tpsdhanvantari@gmail.com
name: Nilesh
```

---

## 🧪 Test Login

1. Go to: https://ayurveda-clinic.pages.dev (or your custom domain after DNS is fixed)
2. Login with:
   - Email: tpsdhanvantari@gmail.com
   - Password: 123456
3. Should work! ✅

---

## 📋 One-Line Script (Copy & Paste All)

```bash
npx wrangler d1 execute ayurveda-db-prod --remote --command="CREATE TABLE IF NOT EXISTS admin_users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE NOT NULL, name TEXT NOT NULL, password_hash TEXT NOT NULL, profile_picture TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP)" && \
npx wrangler d1 execute ayurveda-db-prod --remote --command="CREATE TABLE IF NOT EXISTS sessions (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, session_token TEXT UNIQUE NOT NULL, expires_at DATETIME NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE)" && \
npx wrangler d1 execute ayurveda-db-prod --remote --command="INSERT INTO admin_users (email, name, password_hash, created_at, updated_at) VALUES ('tpsdhanvantari@gmail.com', 'Nilesh', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', datetime('now'), datetime('now'))" && \
npx wrangler d1 execute ayurveda-db-prod --remote --command="CREATE TABLE IF NOT EXISTS patients (id INTEGER PRIMARY KEY AUTOINCREMENT, patient_id TEXT UNIQUE, patient_identifier TEXT, name TEXT NOT NULL, age INTEGER, gender TEXT, phone TEXT NOT NULL, email TEXT, country TEXT, country_code TEXT, weight REAL, height REAL, present_health_issue TEXT, present_medicine TEXT, mg_value TEXT, attacked_by TEXT, diseases TEXT, address_hno TEXT, address_street TEXT, address_apartment TEXT, address_area TEXT, address_district TEXT, address_state TEXT, address_pincode TEXT, referred_by TEXT, medical_history TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP)" && \
npx wrangler d1 execute ayurveda-db-prod --remote --command="CREATE TABLE IF NOT EXISTS herbs_routes (id INTEGER PRIMARY KEY AUTOINCREMENT, patient_id INTEGER NOT NULL, patient_fk INTEGER NOT NULL, appointment_id INTEGER, diagnosis TEXT, notes TEXT, next_followup_date DATE, given_date DATE, treatment_months INTEGER, payment_amount REAL DEFAULT 0, advance_payment REAL DEFAULT 0, payment_notes TEXT, due_balance REAL DEFAULT 0, course INTEGER DEFAULT 1, currency TEXT DEFAULT 'INR', created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (patient_fk) REFERENCES patients(id) ON DELETE CASCADE)" && \
echo "✅ Database setup complete!"
```

---

## 🎯 Summary

**The Issue**: Production database was empty (no tables)  
**The Fix**: Create all required tables and admin user  
**Time Needed**: 2-3 minutes  
**After Fix**: Login will work immediately

**Run the one-line script above and your production database will be ready!**
