# 🚀 TPS DHANVANTARI AYURVEDA - Production Deployment Guide

## ✅ Current Status

✅ **Application Code Deployed to Cloudflare Pages**
- URL: https://ayurveda-clinic.pages.dev
- Custom Domain: https://tpsdhanvantariayurveda.com
- Latest Build: December 29, 2025 (All fixes included)

⏳ **Database Setup Required** - Follow steps below

---

## 📋 Step-by-Step Database Setup

### Step 1: Create D1 Database via Dashboard

1. **Go to Cloudflare Dashboard**: https://dash.cloudflare.com/
2. Navigate to **Workers & Pages** → **D1 SQL Database**
3. Click **"Create database"**
4. Enter database name: `ayurveda-db`
5. Click **"Create"**
6. **IMPORTANT**: Copy the Database ID (format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

### Step 2: Bind Database to Pages Project

1. In Cloudflare Dashboard, go to **Workers & Pages**
2. Click on project: **ayurveda-clinic**
3. Go to **Settings** tab
4. Scroll down to **Functions** section
5. Find **D1 database bindings**
6. Click **"Add binding"**:
   - **Variable name**: `DB`
   - **D1 database**: Select `ayurveda-db`
7. Click **"Save"**

### Step 3: Run Database Migrations

1. Go to your D1 database: **ayurveda-db**
2. Click on **Console** tab
3. Copy and paste the content from `complete_database_setup.sql` (provided below)
4. Click **"Execute"**
5. Verify tables are created

### Step 4: Seed Initial Data

1. In the same D1 Console
2. Copy and paste the content from `seed.sql` (provided below)
3. Click **"Execute"**
4. Verify sample data is inserted

### Step 5: Verify Deployment

1. Visit: https://tpsdhanvantariayurveda.com
2. Login with:
   - **Email**: admin@tpsdhanvantari.com
   - **Password**: admin123
3. Test all features:
   - View patients
   - View herbs & routes
   - Test edit function
   - Test export functions

---

## 📄 SQL Scripts to Execute

### complete_database_setup.sql

See file: `/home/user/webapp/complete_database_setup.sql`

This contains all database migrations in the correct order.

### seed.sql

See file: `/home/user/webapp/seed.sql`

This contains:
- Default admin user (email: admin@tpsdhanvantari.com, password: admin123)
- Sample patients (3 patients with complete data)
- Sample herbs & routes record
- Sample medicines

---

## 🔧 Alternative: CLI Method (If API Token Gets D1 Permissions)

If you update your API token to include D1 permissions:

```bash
# 1. List existing databases
npx wrangler d1 list

# 2. If ayurveda-db exists, get its ID
# If not, create it:
npx wrangler d1 create ayurveda-db

# 3. Update wrangler.jsonc with the database ID

# 4. Apply migrations
npx wrangler d1 migrations apply ayurveda-db --remote

# 5. Seed data
npx wrangler d1 execute ayurveda-db --remote --file=./seed.sql

# 6. Deploy with database binding
npm run build
npx wrangler pages deploy dist --project-name ayurveda-clinic
```

---

## 🎯 API Token Permissions Needed

Your current token is missing D1 permissions. To create a new token with correct permissions:

1. Go to: https://dash.cloudflare.com/profile/api-tokens
2. Click **"Create Token"** → **"Create Custom Token"**
3. Set permissions:
   - **Account Permissions**:
     - D1: Edit ✅
     - Account Settings: Read ✅
   - **Zone Permissions**:
     - Workers Scripts: Edit ✅
     - Workers Routes: Edit ✅
4. Include: All accounts
5. Create and copy the token

---

## ✨ What's Deployed

Your production deployment includes:

✅ **All Bug Fixes**:
- Edit Herbs & Routes working
- Export CSV/Excel/PDF working
- Address display fixed
- Additional phones display fixed
- Given date extraction fixed
- Follow-up date display fixed

✅ **Complete Features**:
- Patient management with comprehensive fields
- Herbs & Routes (prescriptions) with medicine tracking
- Appointment scheduling
- Reminder system
- Dashboard with statistics
- PWA support (installable)

✅ **Security**:
- Admin authentication
- Session management
- Password hashing (SHA-256)

---

## 📞 Support

If you encounter any issues:

1. **Database connection errors**: Ensure D1 database is created and bound
2. **Login not working**: Check if seed.sql was executed (creates admin user)
3. **Blank pages**: Check browser console for errors

---

## 🎉 Post-Deployment Checklist

- [ ] D1 database created
- [ ] Database bound to Pages project
- [ ] Migrations executed
- [ ] Seed data inserted
- [ ] Can login at tpsdhanvantariayurveda.com
- [ ] Can view patients
- [ ] Can view herbs & routes
- [ ] Can edit records
- [ ] Can export data
- [ ] Custom domain working

---

**Last Updated**: January 2, 2026  
**Version**: 2.1.0 - Production Ready
