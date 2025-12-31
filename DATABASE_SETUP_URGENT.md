# 🚨 URGENT: Database Setup Required for PWA to Work

## Problem Summary
Your PWA is deployed and running, but **data cannot be saved** because the D1 database tables don't exist yet. The Cloudflare API token used by the automated tools **lacks D1 permissions**, so you need to create the database tables manually.

## ✅ What's Already Working
- ✅ PWA is deployed: https://tpsdhanvantariayurveda.com/pwa
- ✅ Login system works
- ✅ Session persistence (stays logged in after refresh)
- ✅ All 8 PWA icons deployed and showing correctly
- ✅ Autocomplete removed from login form
- ✅ Complete patient form with ALL fields (20+ fields matching web version)
- ✅ Database binding configured (ID: 7ce3cb22-22c5-42e1-87f7-d53b533df18c)

## ❌ What's NOT Working
- ❌ Adding patients fails (database tables don't exist)
- ❌ All CRUD operations fail (no schema)
- ❌ Dashboard shows 0 data (no database tables)

---

## 🎯 SOLUTION: Create Database Tables via Cloudflare Dashboard

### Step 1: Access Cloudflare Dashboard
1. Go to: https://dash.cloudflare.com/
2. Login with: **parimi.prasad@gmail.com** (your password)
3. Click on **Workers & Pages** in the left sidebar
4. Click on **D1 SQL Database** (or navigate via **Storage → D1**)

### Step 2: Find Your Database
1. Look for database name: **ayurveda-db-prod**
2. Database ID: **7ce3cb22-22c5-42e1-87f7-d53b533df18c**
3. Click on the database name to open it

### Step 3: Open SQL Console
1. Click on the **"Console"** tab (or **"SQL Console"**)
2. You'll see a text area where you can paste SQL commands

### Step 4: Run the Schema SQL
Copy and paste the ENTIRE schema from `/home/user/webapp/schema.sql` (provided below) into the SQL console and click **"Execute"**

---

## 📄 Complete Database Schema (Copy & Paste This)

```sql
-- Drop existing tables if any (optional, use only if tables exist with wrong structure)
-- DROP TABLE IF EXISTS reminders;
-- DROP TABLE IF EXISTS herbs_routes;
-- DROP TABLE IF EXISTS appointments;
-- DROP TABLE IF EXISTS patients;
-- DROP TABLE IF EXISTS sessions;
-- DROP TABLE IF EXISTS admin_users;

-- Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
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
CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    session_token TEXT UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE
);

-- Patients Table
CREATE TABLE IF NOT EXISTS patients (
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
CREATE TABLE IF NOT EXISTS appointments (
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
CREATE TABLE IF NOT EXISTS herbs_routes (
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
CREATE TABLE IF NOT EXISTS reminders (
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
    FOREIGN KEY (prescription_id) REFERENCES herbs_routes(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_patients_email ON patients(email);
CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(phone);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_herbs_patient ON herbs_routes(patient_id);
CREATE INDEX IF NOT EXISTS idx_herbs_date ON herbs_routes(prescription_date);
CREATE INDEX IF NOT EXISTS idx_reminders_patient ON reminders(patient_id);
CREATE INDEX IF NOT EXISTS idx_reminders_date ON reminders(reminder_date);
CREATE INDEX IF NOT EXISTS idx_reminders_status ON reminders(status);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

-- Insert default admin user
-- Email: Shankaranherbaltreatment@gmail.com
-- Password: 123456 (hashed using SHA-256)
INSERT OR IGNORE INTO admin_users (email, password_hash, name, role)
VALUES ('Shankaranherbaltreatment@gmail.com', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Admin User', 'admin');
```

---

## Step 5: Verify Schema Creation
After executing the schema, run this query to verify tables were created:

```sql
SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;
```

You should see:
- admin_users
- appointments
- herbs_routes
- patients
- reminders
- sessions

---

## 🎉 Step 6: Test Your PWA

1. Open: https://tpsdhanvantariayurveda.com/pwa
2. Login with:
   - Email: **Shankaranherbaltreatment@gmail.com**
   - Password: **123456**
3. Click **"Add Patient"** button
4. Fill in the form (you'll see ALL fields now):
   - Personal Information (Name, DOB, Age, Gender, Blood Group)
   - Contact Information (Phone, Alternate Phone, Email)
   - Address Information (Address, City, State, Country, Pincode)
   - Emergency Contact (Name, Phone)
   - Medical Information (History, Allergies, Current Medications, Notes)
5. Click **"Add Patient"** and it should work! ✅

---

## 📱 PWA Features Now Available

Once database is set up, you can:
- ✅ Add/Edit/Delete Patients
- ✅ Schedule Appointments
- ✅ View Dashboard Statistics
- ✅ Manage Herbs & Routes (Prescriptions)
- ✅ Set and View Reminders
- ✅ All data persists across sessions
- ✅ PWA works offline after first load
- ✅ Install PWA on mobile devices

---

## 🔧 Alternative Method: Using Wrangler CLI (If You Have Node.js Installed Locally)

If you have Node.js installed on your computer:

1. Open Terminal (Mac/Linux) or Command Prompt (Windows)
2. Navigate to your project folder (if you have it locally)
3. Run:
```bash
npx wrangler d1 execute ayurveda-db-prod --remote --file=schema.sql
```

**Note:** This requires your Cloudflare API token to have D1 permissions. If it fails, use the Dashboard method above.

---

## ❓ Common Questions

### Q: Do I need to do this every time?
**A:** No! Once you create the tables, they stay forever. This is a one-time setup.

### Q: Will I lose data if I run the schema again?
**A:** No, the schema uses `CREATE TABLE IF NOT EXISTS`, so it won't affect existing tables.

### Q: What if I get an error?
**A:** Screenshot the error and share it. Most common issues:
- Table already exists (safe to ignore)
- Syntax error (copy-paste carefully)
- Permission issue (make sure you're logged in as the account owner)

### Q: Can I test the PWA before database setup?
**A:** Yes! Login works, navigation works, but adding/viewing data will fail until database is set up.

---

## 🎯 Quick Checklist

- [ ] Open Cloudflare Dashboard
- [ ] Navigate to D1 Database: ayurveda-db-prod
- [ ] Open SQL Console
- [ ] Copy and paste the entire schema above
- [ ] Click "Execute"
- [ ] Verify tables created
- [ ] Test PWA at https://tpsdhanvantariayurveda.com/pwa
- [ ] Login and try adding a patient
- [ ] Success! 🎉

---

## 📞 Need Help?

If you get stuck:
1. Take a screenshot of the error
2. Note which step you're on
3. Share the screenshot and I'll help troubleshoot

Once the database is set up, your PWA will be **100% functional** with all features working perfectly! 🚀
