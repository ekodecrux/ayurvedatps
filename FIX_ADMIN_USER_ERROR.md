# ✅ CORRECTED - Admin User Creation Commands

## Issue You Encountered:
❌ ERROR: no such table: admin_users: SQLITE_ERROR

## Solution:

The migrations need to be run again with the new admin_users table migration.

---

## ✅ CORRECT Commands (Run these):

### Step 1: Apply ALL Migrations (including the new one)
```bash
npx wrangler d1 migrations apply ayurveda-db-prod
```

You should see:
✅ `0008_create_admin_users.sql` applied successfully

### Step 2: Create Admin User (CORRECT TABLE NAME)
```bash
npx wrangler d1 execute ayurveda-db-prod --command="INSERT INTO admin_users (email, name, password_hash, created_at, updated_at) VALUES ('tpsdhanvantari@gmail.com', 'Nilesh', 'e38ad214943daad1d64c102faec29de4afe9da3d', datetime('now'), datetime('now'))"
```

✅ This will work now!

### Step 3: Verify Admin User Created
```bash
npx wrangler d1 execute ayurveda-db-prod --command="SELECT email, name FROM admin_users"
```

You should see:
```
email: tpsdhanvantari@gmail.com
name: Nilesh
```

---

## 🔐 Login Credentials:
- **Email**: tpsdhanvantari@gmail.com  
- **Password**: 123456

---

## Continue with Deployment:

After running these commands, continue with:

```bash
# Build
npm run build

# Deploy
npx wrangler pages deploy dist --project-name ayurveda-clinic
```

Then proceed to Step 13 (Bind Database) in the main deployment guide.
