# Manual Deployment Required

## Changes Made
✅ **Admin credentials updated** to `Shankaranherbaltreatment@gmail.com` / `123456`
✅ **Backup list optimized** - Shows 2 recent backups + date filter (no delay)
✅ **Code committed** to GitHub (commit 8a25693)

## Why Manual Deployment Needed
SSH password authentication failed from sandbox. You need to deploy manually from your local machine or VPS.

## Deployment Steps (On VPS at 88.222.244.84)

### Option 1: Pull from GitHub (Recommended)
```bash
# SSH into VPS
ssh root@88.222.244.84

# Navigate to project
cd /var/www/ayurveda

# Pull latest changes
git pull origin main

# Rebuild
npm run build

# Update database with new admin user
npx wrangler d1 execute ayurveda-db --local < seed.sql

# Restart PM2
pm2 restart ayurveda-clinic

# Verify
curl http://localhost:3011
```

### Option 2: Manual File Transfer
If GitHub is not accessible, manually copy these files to VPS:

1. **dist/_worker.js** → `/var/www/ayurveda/dist/_worker.js`
2. **public/static/app.js** → `/var/www/ayurveda/public/static/app.js`
3. **seed.sql** → `/var/www/ayurveda/seed.sql`

Then on VPS:
```bash
cd /var/www/ayurveda
npx wrangler d1 execute ayurveda-db --local < seed.sql
pm2 restart ayurveda-clinic
```

## Updated Admin Credentials
- **Email**: `Shankaranherbaltreatment@gmail.com`
- **Password**: `123456`
- **Hash**: `8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92` (SHA256)

## Verify After Deployment
1. Visit https://tpsdhanvantariayurveda.in/
2. Try logging in with new credentials
3. Go to Settings → Backup & Restore
4. Should see 2 recent backups instantly (no delay)
5. Use date filter to see older backups

## What's Fixed
✅ **No more delay** - Loads only 2 backups by default
✅ **Date filter** - "Recent 2 Backups", "Today", "Yesterday", "Last 7 Days", "Last 30 Days"
✅ **Admin login** - Updated to your requested credentials

## Files Changed
- `seed.sql` - New admin user credentials
- `migrations/0005_add_users_table.sql` - Updated email
- Code already pushed to GitHub: https://github.com/ekodecrux/ayurvedatps

---
**Note**: After deployment, clear browser cache (Ctrl+Shift+R) before testing!
