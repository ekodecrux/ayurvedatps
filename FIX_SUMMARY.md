# 🚨 PORT CONFLICT FIX - EXECUTIVE SUMMARY

## Problem Statement
Your website **https://tpsdhanvantariayurveda.in** is displaying the **MySchool AI Assistant chatbot** instead of the **TPS Dhanvantari Ayurveda clinic management system**.

---

## Root Cause Analysis
Based on the documentation and code review, the issue is caused by:

1. **Port Conflict**: Both applications may be trying to use the same port
2. **Nginx Misconfiguration**: Nginx might be proxying to the wrong backend port
3. **Wrong PM2 Process**: PM2 might be running the wrong application or on the wrong port

---

## Solution Overview

### The Ayurveda application should run on **PORT 3001**
### Nginx should proxy **tpsdhanvantariayurveda.in** → **http://127.0.0.1:3001**

---

## 🎯 RECOMMENDED FIX METHOD

### Method 1: Automated Script (RECOMMENDED)

I've created an automated script that will:
1. Stop all conflicting processes
2. Start Ayurveda clinic on correct port (3001)
3. Update Nginx configuration
4. Verify everything works

**To use:**
```bash
ssh root@88.222.244.84 'bash -s' < fix_port_conflict_automated.sh
```

Password when prompted: `Yourkpo@202425`

---

### Method 2: Manual Step-by-Step (If automated script fails)

SSH into your server:
```bash
ssh root@88.222.244.84
```

Then run these commands:

```bash
# Stop all processes
pm2 stop all
fuser -k 3000/tcp 3001/tcp 2>/dev/null || true

# Navigate to project
cd /var/www/ayurveda

# Rebuild if needed
npm run build

# Start on port 3001
PORT=3001 pm2 start server.js --name ayurveda-clinic --update-env

# Update Nginx
sed -i.backup 's|proxy_pass http://127.0.0.1:[0-9]*;|proxy_pass http://127.0.0.1:3001;|g' /etc/nginx/sites-available/tpsdhanvantariayurveda

# Reload Nginx
nginx -t && systemctl reload nginx

# Verify
pm2 list
curl http://localhost:3001/ | head -20
```

---

### Method 3: One-Line Quick Fix

```bash
ssh root@88.222.244.84 'cd /var/www/ayurveda && pm2 stop all && fuser -k 3001/tcp 2>/dev/null; PORT=3001 pm2 start server.js --name ayurveda-clinic --update-env && sed -i.bak "s|proxy_pass http://127.0.0.1:[0-9]*|proxy_pass http://127.0.0.1:3001|g" /etc/nginx/sites-available/tpsdhanvantariayurveda && nginx -t && systemctl reload nginx && echo "✅ Fix applied! Clear browser cache and visit https://tpsdhanvantariayurveda.in"'
```

---

## 📋 Verification Checklist

After applying the fix, verify:

### On the Server:
```bash
# Check PM2 is running
pm2 list
# Should show: ayurveda-clinic | online

# Test local endpoint
curl http://localhost:3001/ | grep -i "dhanvantari\|ayurveda"
# Should show TPS Dhanvantari content

# Check Nginx config
cat /etc/nginx/sites-available/tpsdhanvantariayurveda | grep proxy_pass
# Should show: proxy_pass http://127.0.0.1:3001;

# Test public endpoint
curl https://tpsdhanvantariayurveda.in/ | grep -i "dhanvantari"
# Should show TPS Dhanvantari content
```

### In Browser:
1. **Clear cache**: Press `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
2. Visit: https://tpsdhanvantariayurveda.in
3. Should see: **TPS DHANVANTARI AYURVEDA** header
4. Should NOT see: MySchool AI Assistant
5. Login test:
   - Email: `Shankaranherbaltreatment@gmail.com`
   - Password: `123456`

---

## 🔍 Troubleshooting

### If you still see MySchool after fix:

#### 1. Check if MySchool is running on the same port
```bash
pm2 list
# If you see "myschool" process, delete it:
pm2 delete myschool
```

#### 2. Check if MySchool Nginx config exists
```bash
ls /etc/nginx/sites-enabled/ | grep myschool
# If exists, disable it:
rm /etc/nginx/sites-enabled/demo.myschoolchatbot.in
systemctl reload nginx
```

#### 3. Verify correct files are deployed
```bash
cd /var/www/ayurveda
grep -i "dhanvantari" dist/_worker.js | head -5
# Should show Ayurveda-related content
```

#### 4. Check server.js is using correct port
```bash
cat /var/www/ayurveda/server.js | grep "PORT"
# Should show: const PORT = process.env.PORT || 3001;
```

---

## 🆘 Emergency Rollback

If something goes wrong:
```bash
# Restore Nginx backup
cp /etc/nginx/sites-available/tpsdhanvantariayurveda.backup /etc/nginx/sites-available/tpsdhanvantariayurveda
systemctl reload nginx

# Restart PM2
pm2 restart ayurveda-clinic
```

---

## 📊 Technical Details

### Current Setup (from code review):
- **Project Location**: `/var/www/ayurveda/`
- **Entry Point**: `server.js` (Node.js server with SQLite adapter)
- **Default Port**: 3001 (defined in server.js)
- **PM2 Process Name**: `ayurveda-clinic`
- **Database**: SQLite (`ayurveda.db`)
- **Frontend**: Hono framework with static files

### Nginx Configuration:
```nginx
server {
    server_name tpsdhanvantariayurveda.in www.tpsdhanvantariayurveda.in;
    
    location / {
        proxy_pass http://127.0.0.1:3001;  # Must be 3001
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### PM2 Configuration:
```bash
# Start command
PORT=3001 pm2 start server.js --name ayurveda-clinic --update-env

# Verify
pm2 describe ayurveda-clinic
# Should show: script_path: /var/www/ayurveda/server.js
# Should show: status: online
```

---

## 📁 Files Created for You

1. **PORT_CONFLICT_FIX_GUIDE.md** - Detailed step-by-step guide
2. **fix_port_conflict_automated.sh** - Automated fix script
3. **fix_port_conflict.py** - Python version (requires paramiko)
4. **FIX_SUMMARY.md** - This file

---

## 🎯 Quick Reference Commands

```bash
# SSH into server
ssh root@88.222.244.84

# Check status
pm2 list
pm2 logs ayurveda-clinic --nostream --lines 20

# Restart service
pm2 restart ayurveda-clinic

# Test endpoints
curl http://localhost:3001/
curl https://tpsdhanvantariayurveda.in/

# Check Nginx
nginx -t
systemctl status nginx
cat /etc/nginx/sites-available/tpsdhanvantariayurveda | grep proxy_pass

# View logs
pm2 logs ayurveda-clinic --nostream
tail -f /var/log/nginx/error.log
```

---

## ⏱️ Estimated Time to Fix
- **Automated Method**: 2-3 minutes
- **Manual Method**: 5-10 minutes
- **Troubleshooting**: Additional 5-10 minutes if needed

---

## 🎉 Success Criteria

✅ PM2 shows `ayurveda-clinic` running and online  
✅ `curl http://localhost:3001/` shows TPS Dhanvantari content  
✅ Nginx proxies to port 3001  
✅ `curl https://tpsdhanvantariayurveda.in/` shows correct content  
✅ Browser shows TPS DHANVANTARI AYURVEDA (after cache clear)  
✅ Login works with test credentials  

---

## 📞 Need Help?

If the fix doesn't work, gather this information:

```bash
# Run these commands and share output:
pm2 list
pm2 logs ayurveda-clinic --nostream --lines 50
netstat -tulpn | grep 300
cat /etc/nginx/sites-available/tpsdhanvantariayurveda
curl http://localhost:3001/ | head -50
curl https://tpsdhanvantariayurveda.in/ | head -50
```

---

## 🚀 Next Steps After Fix

1. ✅ Verify the site loads correctly
2. ✅ Test all functionality (login, patient management, appointments)
3. ✅ Set up PM2 to auto-restart on server reboot:
   ```bash
   pm2 startup
   pm2 save
   ```
4. ✅ Set up automated backups of the database
5. ✅ Monitor logs for any errors

---

**Last Updated**: 2026-01-15  
**Version**: 1.0  
**Status**: Ready to deploy
