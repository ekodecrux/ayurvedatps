# Admin Credentials Updated ✅

## Status: CODE READY - DEPLOYMENT NEEDED

### What I Fixed

#### 1. ✅ Admin Credentials Updated
- **OLD**: `admin@tpsdhanvantari.com` / `admin123`
- **NEW**: `Shankaranherbaltreatment@gmail.com` / `123456`

#### 2. ✅ Backup Loading Delay Fixed
- **Before**: Loaded all backups (caused delay)
- **After**: Shows only 2 recent backups (instant loading)
- **Added**: Date filter dropdown for older backups

#### 3. ✅ Code Committed to GitHub
- Commit: 186235b
- Repository: https://github.com/ekodecrux/ayurvedatps

---

## 🚨 DEPLOYMENT REQUIRED

I cannot deploy automatically due to SSH authentication issues. You have **2 options**:

### Option 1: Pull from GitHub (Easiest)
```bash
# SSH into your VPS
ssh root@88.222.244.84

# Navigate to project
cd /var/www/ayurveda

# Pull latest code
git pull origin main

# Install dependencies (if needed)
npm install

# Rebuild
npm run build

# Update database with new admin credentials
npx wrangler d1 execute ayurveda-db --local < seed.sql

# Restart application
pm2 restart ayurveda-clinic

# Test
curl http://localhost:3011
```

### Option 2: Manual File Copy
If GitHub access is unavailable, download these files and upload to VPS:

**From GitHub**: https://github.com/ekodecrux/ayurvedatps
- `dist/_worker.js` → Upload to `/var/www/ayurveda/dist/`
- `public/static/app.js` → Upload to `/var/www/ayurveda/public/static/`
- `seed.sql` → Upload to `/var/www/ayurveda/`

Then run:
```bash
cd /var/www/ayurveda
npx wrangler d1 execute ayurveda-db --local < seed.sql
pm2 restart ayurveda-clinic
```

---

## After Deployment

### 1. Clear Browser Cache
- **Windows/Linux**: Ctrl + Shift + R
- **Mac**: Cmd + Shift + R
- **Or**: Open in Incognito/Private mode

### 2. Test Login
- Visit: https://tpsdhanvantariayurveda.in/
- **Email**: `Shankaranherbaltreatment@gmail.com`
- **Password**: `123456`

### 3. Test Backup List
- Go to: Settings → Backup & Restore
- Should see 2 recent backups instantly
- Use dropdown to filter by date:
  - Recent 2 Backups (default)
  - Today
  - Yesterday
  - Last 7 Days
  - Last 30 Days

---

## Technical Details

### Admin User in Database
```sql
-- Email: Shankaranherbaltreatment@gmail.com
-- Password: 123456
-- Password Hash: 8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92

INSERT OR IGNORE INTO admin_users (email, password_hash, name) VALUES 
  ('Shankaranherbaltreatment@gmail.com', 
   '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 
   'Admin');
```

### Backup List Optimization
```javascript
// Shows only 2 recent by default
if (dateFilter === 'recent') {
    displayBackups = allBackupsData.slice(0, 2);
}

// Date filters available:
- Recent 2 Backups
- Today (backups from today)
- Yesterday (backups from yesterday)
- Last 7 Days
- Last 30 Days
```

---

## Production URLs
- **Primary**: https://tpsdhanvantariayurveda.in/
- **Backup**: https://tpsdhanvantariayurveda.com/

## Files Updated
1. `seed.sql` - New admin credentials
2. `migrations/0005_add_users_table.sql` - Updated email
3. `public/static/app.js` - Backup list optimization

## GitHub
- **Repository**: https://github.com/ekodecrux/ayurvedatps
- **Latest Commit**: 186235b
- **Branch**: main

---

## Next Steps

1. **Deploy code** using Option 1 or Option 2 above
2. **Test login** with new credentials
3. **Verify backup list** loads quickly (2 backups)
4. **Report back** if everything works!

---

**Date**: January 25, 2026  
**Status**: Ready for deployment  
**Estimated deployment time**: 5 minutes
