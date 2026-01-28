# ⚡ QUICK PRODUCTION DEPLOYMENT

## Copy and paste this ONE command:

```bash
ssh root@88.222.244.84 'cd /var/www/ayurveda && git pull origin main && npm run build && npx wrangler d1 migrations apply ayurveda-db --local && pm2 stop ayurveda-clinic; fuser -k 3001/tcp 2>/dev/null; sleep 2 && pm2 start ecosystem.config.cjs && pm2 save && nginx -t && systemctl reload nginx && echo "✅ DEPLOYED!"'
```

## Then verify:

```bash
curl https://tpsdhanvantariayurveda.in
curl https://tpsdhanvantariayurveda.com
```

---

## 📋 What this does:

1. SSH to production server
2. Navigate to /var/www/ayurveda
3. Pull latest code from GitHub (commit: 7175a0a)
4. Build the project
5. Apply database migrations (medicines_master table)
6. Stop PM2 app
7. Clean port 3001
8. Start PM2 app
9. Save PM2 config
10. Reload Nginx
11. Done!

---

## ✅ After deployment:

1. **Clear browser cache**: Ctrl+Shift+R
2. **Login**: https://tpsdhanvantariayurveda.in
   - Email: Shankaranherbaltreatment@gmail.com
   - Password: 123456
3. **Test features**:
   - Herbs & Roots → Medicines button
   - Patients → Disease numbering
   - Admin → Backup & Restore

---

## 🔧 If issues occur:

Check logs:
```bash
ssh root@88.222.244.84 'pm2 logs ayurveda-clinic --lines 30'
```

Restart:
```bash
ssh root@88.222.244.84 'pm2 restart ayurveda-clinic'
```

---

**Time required**: ~2-3 minutes  
**Latest commit**: 7175a0a  
**Status**: ✅ Ready
