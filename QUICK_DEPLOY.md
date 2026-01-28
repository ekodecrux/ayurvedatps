# 🚀 DEPLOYMENT READY - TPS DHANVANTARI AYURVEDA

## 📦 Quick Deployment

### Automated Deployment (Recommended)
```bash
cd /home/user/webapp
./deploy_to_production_both_sites.sh
```

### Or Copy-Paste One-Liner
```bash
ssh root@88.222.244.84 'cd /var/www/ayurveda && git pull origin main && npm install && npm run build && npx wrangler d1 migrations apply ayurveda-db --local && pm2 stop ayurveda-clinic && fuser -k 3001/tcp 2>/dev/null; sleep 2 && pm2 start ecosystem.config.cjs && pm2 save && nginx -t && systemctl reload nginx && echo "✅ Deployment Complete!"'
```

### Verify Deployment
```bash
# Test both sites
curl -I https://tpsdhanvantariayurveda.in
curl -I https://tpsdhanvantariayurveda.com

# Test API
curl https://tpsdhanvantariayurveda.in/api/medicines | jq 'length'  # Should return 15
```

## 🎯 What's Being Deployed

| Feature | Commit | Status |
|---------|--------|--------|
| Medicine Management System | 89c8468 | ✅ Ready |
| Patient Disease Numbering | 6d52627 | ✅ Ready |
| Patient Edit - Disease Dropdown Fix | 32a7bd4 | ✅ Ready |
| Backup Error Handling | 841c4fa | ✅ Ready |
| Backup Filter Dropdown Fix | ceab4f4 | ✅ Ready |
| Backup List Loading Fix | 13d8000 | ✅ Ready |

**Latest Commit**: `b9123ef` - Add comprehensive deployment script  
**Total Changes**: 6 features + deployment tools

## 🌐 Production URLs
- **Primary**: https://tpsdhanvantariayurveda.in
- **Secondary**: https://tpsdhanvantariayurveda.com

## 🔐 Admin Login
- **Email**: Shankaranherbaltreatment@gmail.com
- **Password**: 123456

## ✅ Post-Deployment Testing

### 1. Medicine Management
- Login → Herbs & Roots → Click "Medicines" button
- Should see Medicine Management modal
- Test: Add, Edit, Delete medicines
- Verify: Medicine dropdown in New/Edit Herbs & Roots

### 2. Patient Disease Numbering
- Login → Patients → Add/Edit Patient
- Click "Add Disease" multiple times
- Should see: "Disease 1", "Disease 2", "Disease 3", etc.
- Verify: Visual styling with gradient background

### 3. Backup & Restore
- Login → Admin → Settings → Backup & Restore
- Should load immediately (no infinite spinner)
- Test: Filter dropdown (Today, Last 7 Days, All)
- Verify: Selected filter displays correctly

## 📊 Expected Results

### API Endpoints
```bash
# Medicines (should return 15)
curl https://tpsdhanvantariayurveda.in/api/medicines | jq 'length'

# Diseases (should return 21)
curl https://tpsdhanvantariayurveda.in/api/diseases | jq '.data | length'

# Health check
curl https://tpsdhanvantariayurveda.in/api/health
```

### Database
```bash
# Check medicines master table
ssh root@88.222.244.84 'cd /var/www/ayurveda && npx wrangler d1 execute ayurveda-db --local --command="SELECT COUNT(*) FROM medicines_master"'
# Should return: 15

# Check diseases table
ssh root@88.222.244.84 'cd /var/www/ayurveda && npx wrangler d1 execute ayurveda-db --local --command="SELECT COUNT(*) FROM diseases"'
# Should return: 21
```

## 🔧 Quick Troubleshooting

### Sites Not Loading
```bash
ssh root@88.222.244.84 'pm2 logs ayurveda-clinic --lines 30'
```

### Port Conflict
```bash
ssh root@88.222.244.84 'fuser -k 3001/tcp && pm2 restart ayurveda-clinic'
```

### Clear Browser Cache
Press: **Ctrl + Shift + R** (hard reload)

## 📝 Files Included

1. **deploy_to_production_both_sites.sh** - Automated deployment script
2. **DEPLOYMENT_GUIDE.md** - Comprehensive deployment documentation
3. **QUICK_DEPLOY.md** - This quick reference (you are here)

## 🎉 Success Indicators

- ✅ Both .in and .com sites respond with HTTP 200
- ✅ Page title: "TPS DHANVANTARI AYURVEDA"
- ✅ PM2 status: ayurveda-clinic (online)
- ✅ 15 medicines in API response
- ✅ 21 diseases in API response
- ✅ No errors in PM2 logs

## ⏱️ Estimated Deployment Time

**Total**: ~3-5 minutes

- Git pull: 10 seconds
- npm install: 30 seconds
- npm build: 20 seconds
- Migrations: 10 seconds
- PM2 restart: 10 seconds
- Nginx reload: 5 seconds
- Verification: 30 seconds

## 📞 Support Commands

```bash
# Check PM2 status
ssh root@88.222.244.84 'pm2 list'

# View logs
ssh root@88.222.244.84 'pm2 logs ayurveda-clinic --nostream --lines 50'

# Restart app
ssh root@88.222.244.84 'pm2 restart ayurveda-clinic'

# Check Nginx
ssh root@88.222.244.84 'nginx -t && systemctl status nginx'

# Database console
ssh root@88.222.244.84 'cd /var/www/ayurveda && npx wrangler d1 execute ayurveda-db --local'
```

---

**Ready to Deploy?** Run: `./deploy_to_production_both_sites.sh`

**Deployed Successfully?** Test both sites and verify all features!

**Issues?** Check PM2 logs: `ssh root@88.222.244.84 'pm2 logs ayurveda-clinic'`
