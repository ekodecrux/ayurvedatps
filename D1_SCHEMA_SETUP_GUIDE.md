# D1 Database Setup - Complete Guide

**Database ID:** `7ce3cb22-22c5-42e1-87f7-d53b533df18c`  
**Status:** ✅ Binding configured in wrangler.toml  
**Next Step:** Apply database schema

---

## ✅ What's Already Done

1. ✅ D1 database exists: `ayurveda-db-prod`
2. ✅ Database ID added to `wrangler.toml`: `7ce3cb22-22c5-42e1-87f7-d53b533df18c`
3. ✅ Binding configured: Variable name `DB`
4. ✅ Application deployed with D1 binding

---

## 🔴 What You Need to Do Now

### Apply Database Schema (3 methods)

The database exists but is **EMPTY** - it has no tables. You need to apply the schema.

---

## Method 1: Cloudflare Dashboard Console (Recommended - 2 minutes)

### Step 1: Go to D1 Database
1. Open: https://dash.cloudflare.com
2. Login with: `parimi.prasad@gmail.com`
3. Click: **Workers & Pages** (left sidebar)
4. Click: **D1 SQL Database**
5. Find and click: **ayurveda-db-prod**

### Step 2: Open Console
1. Click the **Console** tab
2. You'll see a SQL query box

### Step 3: Copy & Run Schema

**Option A: Use the schema.sql file**
1. Open the file at: `/home/user/webapp/schema.sql`
2. Copy ALL contents (196 lines)
3. Paste into the Console query box
4. Click **Execute**

**Option B: Run Essential Tables Only (Quick Start)**

Paste this into the Console and click Execute:

```sql
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
    patient_id TEXT UNIQUE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL,
    age INTEGER,
    gender TEXT,
    address TEXT,
    country TEXT DEFAULT 'India',
    country_code TEXT DEFAULT '+91',
    country_iso3 TEXT DEFAULT 'IND',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Appointments Table
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

-- Herbs Routes Table
CREATE TABLE IF NOT EXISTS herbs_routes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    next_followup_date DATE,
    diagnosis TEXT,
    notes TEXT,
    course TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
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

-- Insert default admin user
INSERT OR IGNORE INTO admin_users (id, email, password_hash, name, role) 
VALUES (1, 'Shankaranherbaltreatment@gmail.com', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Admin User', 'admin');

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_patients_email ON patients(email);
CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(phone);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
```

### Step 4: Verify
After executing, run this query to verify:
```sql
SELECT COUNT(*) as table_count FROM sqlite_master WHERE type='table';
```

You should see at least 6 tables created.

---

## Method 2: Wrangler CLI (Alternative - if you have API permissions)

If your API token gets D1 permissions, you can run:

```bash
cd /home/user/webapp
npx wrangler d1 execute ayurveda-db-prod --remote --file=schema.sql
```

**Note:** This currently fails because your API token doesn't have D1 edit permissions.

---

## Method 3: Migrations Folder (For Future Updates)

After initial setup, you can create migrations:

```bash
cd /home/user/webapp

# Create a migration
npx wrangler d1 migrations create ayurveda-db-prod "initial_schema"

# Apply migrations locally (for testing)
npx wrangler d1 migrations apply ayurveda-db-prod --local

# Apply to production (requires API permissions)
npx wrangler d1 migrations apply ayurveda-db-prod --remote
```

---

## 🧪 Test After Setup

After applying the schema, test the application:

### Test 1: Login
1. Go to: https://tpsdhanvantariayurveda.com/login
2. Email: `Shankaranherbaltreatment@gmail.com`
3. Password: `123456`
4. Should login successfully ✅

### Test 2: Add Patient
1. Go to Patients section
2. Click "Add Patient"
3. Fill details and save
4. Patient should appear in list ✅

### Test 3: Refresh Page
1. Refresh the page (F5)
2. Patient should still be visible ✅
3. Dashboard counts should show real numbers ✅

---

## 🔍 Verify Database Tables

Run these queries in the D1 Console to verify:

```sql
-- List all tables
SELECT name FROM sqlite_master WHERE type='table';

-- Check admin users
SELECT * FROM admin_users;

-- Check patient count
SELECT COUNT(*) FROM patients;

-- Check appointment count  
SELECT COUNT(*) FROM appointments;
```

---

## 📋 Database Schema Summary

Your database will have these tables:

1. **admin_users** - Admin login accounts
2. **sessions** - User login sessions
3. **patients** - Patient records
4. **appointments** - Appointment bookings
5. **herbs_routes** - Prescriptions (herbs & roots)
6. **reminders** - Follow-up reminders
7. **medicines_tracking** - Medicine details (optional, in full schema)
8. **payment_collections** - Payment records (optional, in full schema)

---

## ⚠️ Important Notes

### Default Admin Account
- **Email:** Shankaranherbaltreatment@gmail.com
- **Password:** 123456
- **Password Hash:** 8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92 (SHA-256)

### Security
- Password is hashed with SHA-256
- Sessions expire after 7 days
- Session tokens are UUID-based

### Data Persistence
- After schema is applied, all data persists permanently
- Survives deployments and updates
- Backed up by Cloudflare

---

## 🆘 Troubleshooting

### Issue: "Cannot read properties of undefined (reading 'prepare')"
**Cause:** Database tables don't exist yet  
**Solution:** Apply schema using Method 1 (Dashboard Console)

### Issue: Login fails after schema applied
**Check:**
1. Admin user was inserted: `SELECT * FROM admin_users;`
2. Email is exactly: `Shankaranherbaltreatment@gmail.com`
3. Password hash is correct

### Issue: "Table already exists"
**Solution:** Tables are created with `CREATE TABLE IF NOT EXISTS`, so this is safe to ignore

### Issue: Schema paste fails in Console
**Solution:** 
- Paste in smaller chunks (one table at a time)
- Or use the "Quick Start" version above

---

## ✅ Next Steps After Schema is Applied

1. ✅ Login to: https://tpsdhanvantariayurveda.com
2. ✅ Test all features:
   - Add patients
   - Create appointments
   - Add prescriptions (herbs & roots)
   - Set reminders
3. ✅ Verify data persists after refresh
4. ✅ Check dashboard stats show real counts

---

## 📞 Need Help?

If you encounter any issues:
1. Take a screenshot of any error messages
2. Share what step you're stuck on
3. Check the D1 Console for table creation status

---

**Current Status:**
- ✅ Database created and bound
- ⏳ **Schema needs to be applied** (Method 1 recommended)
- ⏳ After schema: All features will work with data persistence!

---

*Last Updated: December 31, 2025*
