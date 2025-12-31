# Complete D1 Database Setup Guide

## 🎯 WHAT YOU NEED TO DO

Follow these steps **on your local machine** (Windows):

---

## STEP 1: Create D1 Database (2 minutes)

Open Command Prompt or PowerShell in your project folder:

```bash
cd C:\Users\DELL\ayurvedatps
npx wrangler d1 create ayurveda-db-prod
```

**Expected Output:**
```
✅ Successfully created DB 'ayurveda-db-prod'

[[d1_databases]]
binding = "DB"
database_name = "ayurveda-db-prod"
database_id = "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
```

**📋 COPY the `database_id` line!**

---

## STEP 2: Update wrangler.jsonc (1 minute)

Open `C:\Users\DELL\ayurvedatps\wrangler.jsonc` in Notepad or VS Code.

**Replace the entire content with:**

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "ayurveda-clinic",
  "compatibility_date": "2025-12-17",
  "pages_build_output_dir": "./dist",
  "compatibility_flags": ["nodejs_compat"],
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "ayurveda-db-prod",
      "database_id": "PASTE_YOUR_DATABASE_ID_HERE"
    }
  ]
}
```

**⚠️ IMPORTANT:** Replace `PASTE_YOUR_DATABASE_ID_HERE` with the actual ID from Step 1!

**Save the file!**

---

## STEP 3: Run Database Migrations (2 minutes)

Copy the `schema.sql` file from the downloaded package to your local project folder.

**Then run:**

```bash
cd C:\Users\DELL\ayurvedatps
npx wrangler d1 execute ayurveda-db-prod --remote --file=schema.sql
```

**Expected Output:**
```
🌀 Executing on remote database ayurveda-db-prod:
🌀 To execute on your local development database, pass the --local flag
🚣 Executed 15 commands in 0.5s
```

**This creates all tables and adds the admin user!**

---

## STEP 4: Verify Database Setup (30 seconds)

Check if the admin user was created:

```bash
npx wrangler d1 execute ayurveda-db-prod --remote --command="SELECT * FROM admin_users"
```

**Expected Output:**
```
┌────┬────────────────────────────┬──────────────────────────┬────────────┬───────┐
│ id │ email                      │ name                     │ role       │ ...   │
├────┼────────────────────────────┼──────────────────────────┼────────────┼───────┤
│ 1  │ tpsdhanvantari@gmail.com   │ Admin User               │ admin      │ ...   │
└────┴────────────────────────────┴──────────────────────────┴────────────┴───────┘
```

**✅ If you see this, database is ready!**

---

## STEP 5: Bind Database to Cloudflare Pages (2 minutes)

### Option A: Via Cloudflare Dashboard (Easier)

1. **Go to:** https://dash.cloudflare.com/
2. **Login:** Parimi.prasad@gmail.com / Yourkpo@202425
3. **Navigate to:** Workers & Pages → ayurveda-clinic → Settings
4. **Scroll to:** "Functions" section
5. **Click:** "Add binding" under "D1 database bindings"
6. **Fill in:**
   - Variable name: `DB`
   - D1 database: Select `ayurveda-db-prod`
7. **Click:** "Save"

**Done! Database is now connected to production!**

### Option B: Via CLI (Alternative)

In `wrangler.jsonc`, the binding is already configured, so just redeploy:

```bash
npm run build
npx wrangler pages deploy dist --project-name ayurveda-clinic --branch main --commit-dirty=true
```

---

## STEP 6: Test Login (1 minute)

1. **Open:** https://tpsdhanvantariayurveda.com/pwa
2. **Login with:**
   - Email: `tpsdhanvantari@gmail.com`
   - Password: `123456`
3. **It should work now!** ✅

---

## 🎯 VERIFICATION CHECKLIST

After completing the steps:

- ✅ Database created (`ayurveda-db-prod`)
- ✅ `wrangler.jsonc` updated with correct database_id
- ✅ Schema.sql executed successfully
- ✅ Admin user exists in database
- ✅ Database bound to Cloudflare Pages project
- ✅ Login works at production URL

---

## 📊 SAMPLE DATA INCLUDED

The schema includes sample data for testing:
- ✅ 5 sample patients
- ✅ 5 sample appointments
- ✅ 3 sample prescriptions
- ✅ 3 sample reminders

**You can view them after logging in!**

---

## 🔧 USEFUL DATABASE COMMANDS

### View All Tables
```bash
npx wrangler d1 execute ayurveda-db-prod --remote --command="SELECT name FROM sqlite_master WHERE type='table'"
```

### View All Patients
```bash
npx wrangler d1 execute ayurveda-db-prod --remote --command="SELECT * FROM patients"
```

### View All Appointments
```bash
npx wrangler d1 execute ayurveda-db-prod --remote --command="SELECT * FROM appointments"
```

### Count Records
```bash
npx wrangler d1 execute ayurveda-db-prod --remote --command="SELECT COUNT(*) FROM patients"
```

### Add New Admin User
```bash
npx wrangler d1 execute ayurveda-db-prod --remote --command="INSERT INTO admin_users (email, password_hash, name, role) VALUES ('newemail@example.com', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'New Admin', 'admin')"
```

**Note:** The password_hash shown is for password "123456"

---

## 🚨 TROUBLESHOOTING

### Issue 1: "database_id not found"

**Solution:** Make sure you copied the exact database_id from Step 1 into wrangler.jsonc

### Issue 2: "Cannot execute on remote database"

**Solution:** Run `npx wrangler whoami` to verify you're logged in. If not, run `npx wrangler login`

### Issue 3: "Login still fails"

**Solution:** 
1. Check database binding in Cloudflare Dashboard (Step 5)
2. Verify admin user exists: `npx wrangler d1 execute ayurveda-db-prod --remote --command="SELECT * FROM admin_users"`
3. Clear browser cache and try again

### Issue 4: "Schema.sql not found"

**Solution:** Download the project package again or copy the schema.sql content from the repository:
https://github.com/ekodecrux/ayurvedatps/blob/pwa-mobile-app-exact-design/schema.sql

---

## 📱 NEXT STEPS AFTER DATABASE SETUP

Once database is working:

1. ✅ **Test all features** (Patients, Appointments, Herbs, Reminders)
2. ✅ **Add real patient data**
3. ✅ **Share URL with users:** https://tpsdhanvantariayurveda.com/pwa
4. ✅ **Test PWA install on mobile**
5. ✅ **Monitor analytics** in Cloudflare Dashboard

---

## 🔐 CHANGING ADMIN PASSWORD

To change the admin password to something more secure:

### Step 1: Generate Password Hash

Run this in your browser console or use an online SHA-256 tool:

```javascript
// In browser console:
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hash));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

hashPassword('YourNewPassword123').then(hash => console.log(hash));
```

### Step 2: Update Database

```bash
npx wrangler d1 execute ayurveda-db-prod --remote --command="UPDATE admin_users SET password_hash = 'YOUR_GENERATED_HASH' WHERE email = 'tpsdhanvantari@gmail.com'"
```

---

## ✅ SUCCESS!

After completing all steps:
- Your database is live in production
- All data is persisted permanently
- Login works with real authentication
- All CRUD operations save to database
- Your PWA is production-ready!

---

**Start with STEP 1 and let me know if you need help with any step!** 🚀
