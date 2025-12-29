# Clear All Data from Production Database

## ⚠️ WARNING
This will **permanently delete ALL data** from your production database including:
- All patients
- All herbs & roots records
- All medicines
- All payment collections
- All appointments
- All reminders
- **Admin users will be preserved** (so you can still login)

## ✅ Safe Data Clearing Commands

### Option 1: Clear All Tables (Keep Admin User)

Run these commands **one by one** in your terminal:

```bash
# 1. Clear payment collections
npx wrangler d1 execute ayurveda-db-prod --remote --command="DELETE FROM payment_collections"

# 2. Clear medicines tracking
npx wrangler d1 execute ayurveda-db-prod --remote --command="DELETE FROM medicines_tracking"

# 3. Clear herbs & roots records
npx wrangler d1 execute ayurveda-db-prod --remote --command="DELETE FROM herbs_routes"

# 4. Clear patient diseases
npx wrangler d1 execute ayurveda-db-prod --remote --command="DELETE FROM patient_diseases"

# 5. Clear appointments
npx wrangler d1 execute ayurveda-db-prod --remote --command="DELETE FROM appointments"

# 6. Clear reminders
npx wrangler d1 execute ayurveda-db-prod --remote --command="DELETE FROM reminders"

# 7. Clear patients (do this LAST as it has foreign key relationships)
npx wrangler d1 execute ayurveda-db-prod --remote --command="DELETE FROM patients"

# 8. Reset auto-increment counters (optional)
npx wrangler d1 execute ayurveda-db-prod --remote --command="DELETE FROM sqlite_sequence"
```

Expected output for each: `✔ Success!`

### Option 2: Single Command to Clear All Data

⚠️ **Advanced**: Clear everything except admin_users in one command:

```bash
npx wrangler d1 execute ayurveda-db-prod --remote --command="
DELETE FROM payment_collections;
DELETE FROM medicines_tracking;
DELETE FROM herbs_routes;
DELETE FROM patient_diseases;
DELETE FROM appointments;
DELETE FROM reminders;
DELETE FROM patients;
DELETE FROM sqlite_sequence;
"
```

---

## 🔍 Verify Data is Cleared

### Check each table is empty:

```bash
# Check patients
npx wrangler d1 execute ayurveda-db-prod --remote --command="SELECT COUNT(*) as count FROM patients"
# Expected: count: 0

# Check herbs_routes
npx wrangler d1 execute ayurveda-db-prod --remote --command="SELECT COUNT(*) as count FROM herbs_routes"
# Expected: count: 0

# Check medicines_tracking
npx wrangler d1 execute ayurveda-db-prod --remote --command="SELECT COUNT(*) as count FROM medicines_tracking"
# Expected: count: 0

# Check payment_collections
npx wrangler d1 execute ayurveda-db-prod --remote --command="SELECT COUNT(*) as count FROM payment_collections"
# Expected: count: 0

# Check admin user still exists
npx wrangler d1 execute ayurveda-db-prod --remote --command="SELECT email, name FROM admin_users"
# Expected: tpsdhanvantari@gmail.com
```

---

## ✅ After Clearing Data

### 1. Refresh Your Application
- Go to: https://ayurveda-clinic.pages.dev (or your custom domain)
- Login with:
  - Email: tpsdhanvantari@gmail.com
  - Password: 123456

### 2. Verify Empty State
- Dashboard → Should show 0 patients, 0 appointments
- Patients → Should show "No patients found"
- Herbs & Roots → Should show "No records found"
- Appointments → Should show "No appointments"

### 3. Start Adding New Data
You can now add fresh patients, appointments, and herbs & roots records!

---

## 🆘 If You Need to Recreate Admin User

If you accidentally deleted admin user or need to recreate it:

```bash
# Create admin user
npx wrangler d1 execute ayurveda-db-prod --remote --command="INSERT INTO admin_users (email, name, password_hash, created_at, updated_at) VALUES ('tpsdhanvantari@gmail.com', 'Nilesh', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', datetime('now'), datetime('now'))"
```

Login credentials:
- Email: tpsdhanvantari@gmail.com
- Password: 123456

---

## 🔄 Alternative: Drop and Recreate Tables (Nuclear Option)

⚠️ **ONLY if you want to completely reset the database structure:**

This will delete **everything** including tables and requires running all migrations again.

```bash
# Drop all tables
npx wrangler d1 execute ayurveda-db-prod --remote --command="
DROP TABLE IF EXISTS payment_collections;
DROP TABLE IF EXISTS medicines_tracking;
DROP TABLE IF EXISTS herbs_routes;
DROP TABLE IF EXISTS patient_diseases;
DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS reminders;
DROP TABLE IF EXISTS patients;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS admin_users;
DROP TABLE IF EXISTS settings;
DROP TABLE IF EXISTS sqlite_sequence;
"

# Then re-run all migrations
npx wrangler d1 migrations apply ayurveda-db-prod --remote

# Recreate admin user
npx wrangler d1 execute ayurveda-db-prod --remote --command="INSERT INTO admin_users (email, name, password_hash, created_at, updated_at) VALUES ('tpsdhanvantari@gmail.com', 'Nilesh', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', datetime('now'), datetime('now'))"

# Add currency column (if migration didn't include it)
npx wrangler d1 execute ayurveda-db-prod --remote --command="ALTER TABLE herbs_routes ADD COLUMN currency TEXT DEFAULT 'INR'"
```

---

## 📋 Quick Clear Script

Copy and paste this entire block into your terminal:

```bash
echo "Clearing production database..."
npx wrangler d1 execute ayurveda-db-prod --remote --command="DELETE FROM payment_collections"
npx wrangler d1 execute ayurveda-db-prod --remote --command="DELETE FROM medicines_tracking"
npx wrangler d1 execute ayurveda-db-prod --remote --command="DELETE FROM herbs_routes"
npx wrangler d1 execute ayurveda-db-prod --remote --command="DELETE FROM patient_diseases"
npx wrangler d1 execute ayurveda-db-prod --remote --command="DELETE FROM appointments"
npx wrangler d1 execute ayurveda-db-prod --remote --command="DELETE FROM reminders"
npx wrangler d1 execute ayurveda-db-prod --remote --command="DELETE FROM patients"
npx wrangler d1 execute ayurveda-db-prod --remote --command="DELETE FROM sqlite_sequence"
echo "Database cleared! Verifying..."
npx wrangler d1 execute ayurveda-db-prod --remote --command="SELECT COUNT(*) as count FROM patients"
npx wrangler d1 execute ayurveda-db-prod --remote --command="SELECT COUNT(*) as count FROM herbs_routes"
echo "Done! Admin user preserved."
```

---

## ✅ Summary

**Recommended Approach**: Use Option 1 (clear data, keep structure)
- Run the DELETE commands one by one
- Verify data is cleared
- Admin user is preserved
- Start entering fresh data

**After clearing**:
- ✅ All patient data deleted
- ✅ All herbs & roots records deleted
- ✅ All medicines deleted
- ✅ All payments deleted
- ✅ Admin login still works
- ✅ Database structure intact
- ✅ Ready for fresh data entry

**Start with the Quick Clear Script above - it does everything in the correct order!**
