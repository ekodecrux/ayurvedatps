# Admin Credentials

## ✅ CORRECT ADMIN CREDENTIALS

**Email**: `Shankaranherbaltreatment@gmail.com`  
**Password**: `123456`

## Database Configuration

The admin user is created in `seed.sql` with the following details:

```sql
INSERT OR IGNORE INTO admin_users (email, password_hash, name, profile_picture) VALUES 
  ('Shankaranherbaltreatment@gmail.com', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Admin', NULL);
```

### Password Hash
- **Plain Password**: `123456`
- **SHA-256 Hash**: `8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92`

## How to Login

1. Visit either domain:
   - **Primary**: https://tpsdhanvantariayurveda.in/
   - **Secondary**: https://tpsdhanvantariayurveda.com/

2. Enter credentials:
   ```
   Email: Shankaranherbaltreatment@gmail.com
   Password: 123456
   ```

3. Click "Sign In"

## Verification

To verify the admin user exists in the database:

```bash
# On the server
cd /var/www/ayurveda
npx wrangler d1 execute ayurveda-db --local --command='SELECT email, name FROM admin_users'
```

## Seed Database (If Needed)

If the admin user doesn't exist, run:

```bash
cd /var/www/ayurveda
npx wrangler d1 execute ayurveda-db --local --file=./seed.sql
```

## Password Change (Future)

If you need to change the password in the future, generate a new SHA-256 hash:

```bash
echo -n "new_password" | sha256sum
```

Then update in database:

```sql
UPDATE admin_users 
SET password_hash = 'new_hash_here' 
WHERE email = 'Shankaranherbaltreatment@gmail.com';
```

---

**Note**: This is the ONLY admin account. Do not create additional admin accounts unless explicitly requested.

**Created**: 2026-01-25  
**Status**: ✅ Active and Working
