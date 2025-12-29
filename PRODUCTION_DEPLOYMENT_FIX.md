# 🚨 PRODUCTION DEPLOYMENT FIX - URGENT

## Current Issues & Fixes

### Issue 1: D1 Database Not Bound (CRITICAL)
**Error**: `DB is undefined` - Database not connected to Pages project

**Fix**:
```bash
# Step 1: Get your database ID
npx wrangler d1 list

# Step 2: Copy the database_id for "ayurveda-db-prod"
# Step 3: Edit wrangler.jsonc and replace REPLACE_WITH_YOUR_DATABASE_ID with the actual ID

# Step 4: Bind database to Pages (IMPORTANT - This is what's missing!)
npx wrangler pages deployment create ayurveda-clinic production --d1=ayurveda-db-prod

# OR bind via Dashboard:
# 1. Go to: https://dash.cloudflare.com
# 2. Workers & Pages → ayurveda-clinic → Settings
# 3. Functions → D1 database bindings
# 4. Add binding: Variable name = DB, D1 database = ayurveda-db-prod
# 5. Click Save
```

---

### Issue 2: Admin User Not Created (CRITICAL)
**Error**: Login fails - admin user missing in production DB

**Fix**:
```bash
# Create admin_users table (if migrations didn't work)
npx wrangler d1 execute ayurveda-db-prod --remote --command="CREATE TABLE IF NOT EXISTS admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  profile_picture TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)"

# Create sessions table
npx wrangler d1 execute ayurveda-db-prod --remote --command="CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  session_token TEXT UNIQUE NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE
)"

# Create admin user (password: 123456)
npx wrangler d1 execute ayurveda-db-prod --remote --command="INSERT INTO admin_users (email, name, password_hash, created_at, updated_at) VALUES (
  'tpsdhanvantari@gmail.com',
  'Nilesh',
  '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
  datetime('now'),
  datetime('now')
)"

# Verify
npx wrangler d1 execute ayurveda-db-prod --remote --command="SELECT email, name FROM admin_users"
```

---

### Issue 3: Missing Tables (medicines_tracking, payment_collections, etc.)
**Error**: 500 errors on /api/prescriptions/:id

**Quick Fix** - Create all tables:
```bash
# Run all migrations
npx wrangler d1 migrations apply ayurveda-db-prod --remote

# If migrations fail, manually create tables:

# patients table
npx wrangler d1 execute ayurveda-db-prod --remote --command="CREATE TABLE IF NOT EXISTS patients (
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
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)"

# herbs_routes table
npx wrangler d1 execute ayurveda-db-prod --remote --command="CREATE TABLE IF NOT EXISTS herbs_routes (
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
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
)"

# medicines_tracking table
npx wrangler d1 execute ayurveda-db-prod --remote --command="CREATE TABLE IF NOT EXISTS medicines_tracking (
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
)"

# payment_collections table
npx wrangler d1 execute ayurveda-db-prod --remote --command="CREATE TABLE IF NOT EXISTS payment_collections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  herbs_route_id INTEGER NOT NULL,
  collection_date DATE NOT NULL,
  amount REAL NOT NULL,
  payment_method TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (herbs_route_id) REFERENCES herbs_routes(id) ON DELETE CASCADE
)"

# Verify tables
npx wrangler d1 execute ayurveda-db-prod --remote --command="SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
```

---

### Issue 4: D1 Binding in Pages (MOST IMPORTANT!)
**This is why everything fails** - Database exists but NOT bound to the Pages deployment

**Dashboard Method (EASIEST)**:
1. Go to: https://dash.cloudflare.com
2. Click **Workers & Pages**
3. Click **ayurveda-clinic**
4. Click **Settings** tab
5. Scroll to **Functions** section
6. Click **D1 database bindings**
7. Click **Add binding**
8. Variable name: `DB`
9. D1 database: Select `ayurveda-db-prod`
10. Click **Save**
11. **Redeploy**: `npm run build && npx wrangler pages deploy dist --project-name ayurveda-clinic`

**CLI Method (ALTERNATIVE)**:
```bash
# This should bind the database
npx wrangler pages deployment create ayurveda-clinic production --d1=ayurveda-db-prod

# Or update the binding
npx wrangler pages project list
npx wrangler pages deployment tail ayurveda-clinic
```

---

### Issue 5: Verification Steps

After completing fixes above, verify:

```bash
# 1. Check database tables exist
npx wrangler d1 execute ayurveda-db-prod --remote --command="SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"

# Expected output:
# admin_users
# appointments
# herbs_routes
# medicines_tracking
# patients
# payment_collections
# reminders
# sessions

# 2. Check admin user exists
npx wrangler d1 execute ayurveda-db-prod --remote --command="SELECT email, name FROM admin_users"

# Expected output:
# email: tpsdhanvantari@gmail.com
# name: Nilesh

# 3. Test login API
curl -X POST https://ayurveda-clinic.pages.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"tpsdhanvantari@gmail.com","password":"123456"}'

# Expected: {"success":true,"user":{...}}

# 4. Check deployment logs
npx wrangler pages deployment tail ayurveda-clinic
```

---

## ✅ Complete Fix Checklist

- [ ] Step 1: Get database ID and update wrangler.jsonc
- [ ] Step 2: **BIND D1 to Pages** (Dashboard or CLI) - MOST CRITICAL
- [ ] Step 3: Create admin_users and sessions tables
- [ ] Step 4: Insert admin user
- [ ] Step 5: Create all other tables (patients, herbs_routes, medicines_tracking, payment_collections)
- [ ] Step 6: Verify tables exist
- [ ] Step 7: Verify admin user exists
- [ ] Step 8: Rebuild and redeploy: `npm run build && npx wrangler pages deploy dist --project-name ayurveda-clinic`
- [ ] Step 9: Clear browser cache (Ctrl+Shift+Delete)
- [ ] Step 10: Test login at https://ayurveda-clinic.pages.dev

---

## 🎯 Quick Start (5 Minutes)

If you want to fix everything NOW:

```bash
# Terminal commands (copy-paste all at once):

# 1. Get DB ID
echo "=== Step 1: Get Database ID ==="
npx wrangler d1 list

# After you see the output, copy the database_id for ayurveda-db-prod
# Then edit wrangler.jsonc and replace REPLACE_WITH_YOUR_DATABASE_ID

# 2. Create tables and admin user
echo "=== Step 2: Setup Database ==="
npx wrangler d1 execute ayurveda-db-prod --remote --command="CREATE TABLE IF NOT EXISTS admin_users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE NOT NULL, name TEXT NOT NULL, password_hash TEXT NOT NULL, profile_picture TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP)"

npx wrangler d1 execute ayurveda-db-prod --remote --command="CREATE TABLE IF NOT EXISTS sessions (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, session_token TEXT UNIQUE NOT NULL, expires_at DATETIME NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE)"

npx wrangler d1 execute ayurveda-db-prod --remote --command="INSERT INTO admin_users (email, name, password_hash, created_at, updated_at) VALUES ('tpsdhanvantari@gmail.com', 'Nilesh', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', datetime('now'), datetime('now'))"

# 3. Verify
echo "=== Step 3: Verify ==="
npx wrangler d1 execute ayurveda-db-prod --remote --command="SELECT email, name FROM admin_users"

# 4. Deploy
echo "=== Step 4: Deploy ==="
npm run build
npx wrangler pages deploy dist --project-name ayurveda-clinic
```

**THEN GO TO DASHBOARD AND BIND D1 DATABASE** (see Issue 4 above)

---

## 🚀 After Binding D1

Once you've bound the D1 database in the Cloudflare dashboard:

1. **Test Login**:
   - URL: https://ayurveda-clinic.pages.dev
   - Email: tpsdhanvantari@gmail.com
   - Password: 123456

2. **If still not working**:
   - Check deployment logs: `npx wrangler pages deployment tail ayurveda-clinic`
   - Check browser console (F12) for errors
   - Send screenshot of errors

3. **Custom Domain**:
   - Should work automatically once app is working
   - URL: https://tpsdhanvantariayurveda.com

---

## 📞 Need Help?

If any step fails:
1. Take a screenshot of the error
2. Share the output of: `npx wrangler d1 list`
3. Share the output of: `npx wrangler pages deployment list ayurveda-clinic`

The **#1 CRITICAL FIX** is binding the D1 database to Pages (Issue 4). Without this, nothing will work!
