# 🚨 URGENT: Production Deployment Fix

## Current Status
- ✅ App deployed to: https://ayurveda-clinic.pages.dev
- ✅ Custom domain DNS configured: tpsdhanvantariayurveda.com
- ❌ **Login not working** - Database not bound to Pages
- ❌ **Edit/View not working** - Missing tables in production

## 🎯 What You Need to Do (5 Steps)

### Step 1: Bind D1 Database to Pages (MOST CRITICAL!)

**This is the #1 reason nothing works.** The database exists but is NOT connected to your Pages deployment.

**Go to Cloudflare Dashboard:**
1. Open: https://dash.cloudflare.com
2. Click **Workers & Pages** (left sidebar)
3. Click **ayurveda-clinic**
4. Click **Settings** tab (top)
5. Scroll down to **Functions** section
6. Click **D1 database bindings**
7. Click **Add binding** button
8. Fill in:
   - **Variable name**: `DB` (EXACTLY this, case-sensitive)
   - **D1 database**: Select `ayurveda-db-prod` from dropdown
9. Click **Save**

**✅ After saving, you should see:**
```
Variable name: DB
Value: ayurveda-db-prod
```

---

### Step 2: Create Missing Tables

Open Terminal/Command Prompt in your `webapp` folder and run:

```bash
# Apply all migrations to production
npx wrangler d1 migrations apply ayurveda-db-prod --remote
```

**Expected output:**
```
🌀 Applying migrations...
✅ 0001_initial_schema.sql
✅ 0002_add_patient_id.sql
... (more migrations)
✅ 0009_complete_production_schema.sql
✅ Migrations complete!
```

---

### Step 3: Verify Admin User

```bash
# Check admin user exists
npx wrangler d1 execute ayurveda-db-prod --remote --command="SELECT email, name FROM admin_users"
```

**Expected output:**
```
email: tpsdhanvantari@gmail.com
name: Nilesh
```

**If you see "no such table: admin_users"**, run:
```bash
npx wrangler d1 execute ayurveda-db-prod --remote --file=migrations/0009_complete_production_schema.sql
```

---

### Step 4: Verify All Tables Exist

```bash
# List all tables
npx wrangler d1 execute ayurveda-db-prod --remote --command="SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
```

**Expected tables:**
- admin_users
- appointments
- herbs_routes
- medicines_tracking
- patients
- payment_collections
- reminders
- sessions

---

### Step 5: Test Login

1. **Clear browser cache**: Press `Ctrl+Shift+Delete`, select "Cached images and files", click "Clear data"
2. **Go to**: https://ayurveda-clinic.pages.dev
3. **Login with**:
   - Email: `tpsdhanvantari@gmail.com`
   - Password: `123456`

**✅ If login works:** You should see the dashboard with Patients, Herbs & Roots, etc.

**❌ If login still fails:**
- Check browser console (F12 → Console) for errors
- Check deployment logs: `npx wrangler pages deployment tail ayurveda-clinic`
- Send screenshot of errors

---

## 🔧 Quick Diagnostic Script

Run this to check everything:

```bash
chmod +x fix-production.sh
./fix-production.sh
```

This will:
- ✓ Check if database exists
- ✓ Check if tables exist
- ✓ Check if admin user exists
- ✓ Show recent deployments

---

## 🐛 Troubleshooting

### Problem: "Cannot read properties of undefined (reading 'prepare')"
**Solution:** D1 database not bound. Go back to Step 1 and bind the database in Cloudflare dashboard.

### Problem: "no such table: admin_users"
**Solution:** Tables not created. Run Step 2 again.

### Problem: "Invalid email or password"
**Solution:** Admin user not created correctly. Run:
```bash
npx wrangler d1 execute ayurveda-db-prod --remote --command="DELETE FROM admin_users WHERE email='tpsdhanvantari@gmail.com'"
npx wrangler d1 execute ayurveda-db-prod --remote --command="INSERT INTO admin_users (email, name, password_hash, created_at, updated_at) VALUES ('tpsdhanvantari@gmail.com', 'Nilesh', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', datetime('now'), datetime('now'))"
```

### Problem: Edit/View buttons don't work
**Solution:** Missing tables. Run Step 2 and Step 4 to create all tables.

---

## 📞 Need Help?

**Send me:**
1. Screenshot of Cloudflare dashboard D1 binding (Step 1)
2. Output of: `npx wrangler d1 list`
3. Output of: `npx wrangler d1 execute ayurveda-db-prod --remote --command="SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"`
4. Screenshot of browser console errors (F12 → Console)

---

## 🎯 Summary

**The #1 CRITICAL FIX is binding D1 to Pages (Step 1).** Without this, the app cannot access the database at all.

After that:
1. Create tables (Step 2)
2. Verify admin user (Step 3)
3. Test login (Step 5)

**Total time: 5-10 minutes if you follow the steps exactly.**

---

## ✅ Success Checklist

- [ ] D1 database bound to Pages (Variable name: DB, Value: ayurveda-db-prod)
- [ ] All 8 tables exist in production database
- [ ] Admin user exists (tpsdhanvantari@gmail.com)
- [ ] Login works at https://ayurveda-clinic.pages.dev
- [ ] Can view Herbs & Roots list
- [ ] Edit/View buttons work
- [ ] Custom domain working (may take 1-2 hours for DNS)

---

**Once everything works, the app will be live at:**
- https://ayurveda-clinic.pages.dev (Cloudflare Pages)
- https://tpsdhanvantariayurveda.com (Custom domain - after DNS propagates)

**Login:** tpsdhanvantari@gmail.com / 123456
