# 🚨 EMERGENCY: SITE SHOWING WRONG APP (Chatbot instead of Ayurveda)

## IMMEDIATE ACTION REQUIRED

Your **Ayurveda clinic site** is showing the **MySchool Chatbot** instead!

---

## 🔧 QUICK FIX (Run on VPS)

### SSH into VPS:
```bash
ssh root@88.222.244.84
```

### Run these commands ONE BY ONE:

```bash
# 1. Check PM2 status
pm2 list

# 2. Check what's on port 3011
lsof -i :3011

# 3. Restart ayurveda-clinic
pm2 restart ayurveda-clinic

# 4. Wait 5 seconds
sleep 5

# 5. Test locally
curl http://localhost:3011 | grep -i "TPS DHANVANTARI"

# 6. Reload Nginx
systemctl reload nginx

# 7. Test production
curl https://tpsdhanvantariayurveda.in/ | grep -i "TPS DHANVANTARI"
```

---

## 📋 WHAT'S WRONG

**Current Status:**
- ❌ https://tpsdhanvantariayurveda.in/ → Shows "MySchool AI Assistant"
- ❌ https://tpsdhanvantariayurveda.com/ → Shows "MySchool AI Assistant"

**Should Show:**
- ✅ "TPS DHANVANTARI AYURVEDA - Management System"

---

## 🔍 ROOT CAUSE OPTIONS

### Option A: Wrong Port in Nginx
Nginx is pointing to the chatbot port instead of port 3011

**Fix:**
```bash
# Check Nginx config
cat /etc/nginx/sites-enabled/tpsdhanvantariayurveda.in

# Should show:
# proxy_pass http://localhost:3011;

# If wrong, edit:
nano /etc/nginx/sites-enabled/tpsdhanvantariayurveda.in

# Change proxy_pass to:
proxy_pass http://localhost:3011;

# Save and reload
systemctl reload nginx
```

### Option B: Ayurveda App Not Running
PM2 crashed or stopped the ayurveda-clinic app

**Fix:**
```bash
pm2 restart ayurveda-clinic
pm2 logs ayurveda-clinic --nostream
```

### Option C: Port Conflict
Another app took over port 3011

**Fix:**
```bash
# Kill anything on 3011
fuser -k 3011/tcp

# Restart ayurveda
pm2 restart ayurveda-clinic
```

---

## 🎯 STEP-BY-STEP EMERGENCY FIX

### Step 1: SSH into VPS
```bash
ssh root@88.222.244.84
```

### Step 2: Check PM2
```bash
pm2 list
```
**Look for**: ayurveda-clinic should be "online"
- If "stopped" or "errored" → **PROBLEM FOUND**

### Step 3: Check Nginx Config
```bash
grep -r "tpsdhanvantariayurveda" /etc/nginx/sites-enabled/
```
**Should show**: Port 3011

### Step 4: Restart Everything
```bash
# Kill port 3011
fuser -k 3011/tcp

# Restart ayurveda
cd /var/www/ayurveda
pm2 restart ayurveda-clinic

# Wait
sleep 5

# Check it's running
curl http://localhost:3011 | head -50

# Should see "TPS DHANVANTARI"
```

### Step 5: Reload Nginx
```bash
systemctl reload nginx
```

### Step 6: Test Both Domains
```bash
curl https://tpsdhanvantariayurveda.in/ | grep -i "dhanvantari"
curl https://tpsdhanvantariayurveda.com/ | grep -i "dhanvantari"
```

**Should output**: Lines containing "DHANVANTARI"

---

## 🚀 ALTERNATIVE: FULL RESTART

If above doesn't work:

```bash
# Stop everything
pm2 stop all

# Start only ayurveda
cd /var/www/ayurveda
pm2 start ecosystem.config.cjs

# Check
pm2 logs ayurveda-clinic --nostream --lines 50

# Reload Nginx
systemctl restart nginx

# Test
curl https://tpsdhanvantariayurveda.in/
```

---

## ✅ VERIFICATION

After fix, you should see:

```bash
curl https://tpsdhanvantariayurveda.in/ | grep -i "title"
```

**Output should be:**
```html
<title>TPS DHANVANTARI AYURVEDA - Management System</title>
```

**NOT:**
```html
<title>MySchool AI Assistant</title>
```

---

## 📞 IF STILL NOT WORKING

Send me the output of these commands:

```bash
pm2 list
pm2 logs ayurveda-clinic --nostream --lines 20
cat /etc/nginx/sites-enabled/tpsdhanvantariayurveda.in | grep proxy_pass
lsof -i :3011
curl http://localhost:3011 | head -50
```

---

## ⏱️ ESTIMATED FIX TIME: 2 minutes

**PLEASE RUN THE COMMANDS NOW AND REPORT BACK!**

---

**Created**: January 25, 2026 05:30 UTC  
**Issue**: Wrong app showing on both domains  
**Impact**: CRITICAL - Customers cannot access Ayurveda system  
**Priority**: URGENT
