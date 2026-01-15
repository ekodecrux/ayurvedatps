# 🚨 PORT CONFLICT FIX GUIDE
## TPS Dhanvantari Ayurveda vs MySchool Chatbot Issue

---

## 🎯 PROBLEM
Your domain `https://tpsdhanvantariayurveda.in` is displaying the **MySchool AI Assistant chatbot** instead of the **TPS Dhanvantari Ayurveda** clinic management system.

This is caused by a **port conflict** - both applications are trying to use the same port, or Nginx is proxying to the wrong port.

---

## ✅ SOLUTION - Copy and Paste These Commands

### Step 1: Connect to Your VPS
```bash
ssh root@88.222.244.84
```
Password: `Yourkpo@202425`

---

### Step 2: Run Complete Fix (Copy ALL of this)

```bash
# ============================================================
# AUTOMATED FIX SCRIPT
# ============================================================

echo "🔍 DIAGNOSING PORT CONFLICT..."
echo "=================================================="

# Check current PM2 processes
echo ""
echo "📊 Current PM2 Processes:"
pm2 list

# Check which ports are in use
echo ""
echo "📊 Ports Currently in Use:"
netstat -tulpn | grep -E ':(3000|3001|8080|8081)'

# Test current endpoints
echo ""
echo "📊 Testing Port 3000:"
curl -s http://localhost:3000/ | head -20 | grep -i "title\|MySchool\|Dhanvantari"

echo ""
echo "📊 Testing Port 3001:"
curl -s http://localhost:3001/ | head -20 | grep -i "title\|MySchool\|Dhanvantari"

# Check Nginx configuration
echo ""
echo "📊 Current Nginx Configuration:"
cat /etc/nginx/sites-available/tpsdhanvantariayurveda | grep -A5 "server_name\|proxy_pass"

echo ""
echo "=================================================="
echo "🔧 APPLYING FIX..."
echo "=================================================="

# Stop all PM2 processes to avoid conflicts
echo ""
echo "🛑 Step 1: Stopping all PM2 processes..."
pm2 stop all
sleep 2

# Kill any processes on ports 3000 and 3001
echo ""
echo "🔪 Step 2: Killing processes on ports 3000 and 3001..."
fuser -k 3000/tcp 2>/dev/null || true
fuser -k 3001/tcp 2>/dev/null || true
sleep 2

# Navigate to Ayurveda project
echo ""
echo "📁 Step 3: Navigating to Ayurveda project..."
cd /var/www/ayurveda || { echo "❌ ERROR: /var/www/ayurveda not found!"; exit 1; }
pwd

# Check if server.js exists
echo ""
echo "📋 Step 4: Checking project files..."
ls -la server.js dist/_worker.js 2>/dev/null || { echo "❌ ERROR: Required files not found!"; exit 1; }

# Build the project (optional, if source files changed)
echo ""
echo "🔨 Step 5: Building project..."
npm run build

# Start the server on port 3001 using server.js
echo ""
echo "🚀 Step 6: Starting Ayurveda server on PORT 3001..."
PORT=3001 pm2 start server.js --name ayurveda-clinic --update-env
sleep 3

# Verify PM2 started correctly
echo ""
echo "📊 Step 7: Verifying PM2 status..."
pm2 list

# Test the local server
echo ""
echo "🧪 Step 8: Testing local server on port 3001..."
curl -s http://localhost:3001/ | head -30

# Check if correct app is running
if curl -s http://localhost:3001/ | grep -q "Dhanvantari\|Ayurveda"; then
    echo ""
    echo "✅ CORRECT APP DETECTED on port 3001!"
else
    echo ""
    echo "⚠️  WARNING: Could not confirm correct app. Check output above."
fi

# Update Nginx to proxy to port 3001
echo ""
echo "📝 Step 9: Updating Nginx configuration to proxy to PORT 3001..."
cp /etc/nginx/sites-available/tpsdhanvantariayurveda /etc/nginx/sites-available/tpsdhanvantariayurveda.backup
sed -i 's|proxy_pass http://127.0.0.1:[0-9]*;|proxy_pass http://127.0.0.1:3001;|g' /etc/nginx/sites-available/tpsdhanvantariayurveda

# Show updated Nginx config
echo ""
echo "📋 Updated Nginx Configuration:"
cat /etc/nginx/sites-available/tpsdhanvantariayurveda | grep -A5 "server_name\|proxy_pass"

# Test Nginx configuration
echo ""
echo "🧪 Step 10: Testing Nginx configuration..."
nginx -t

# Reload Nginx
if [ $? -eq 0 ]; then
    echo ""
    echo "🔄 Step 11: Reloading Nginx..."
    systemctl reload nginx
    echo "✅ Nginx reloaded successfully!"
else
    echo ""
    echo "❌ Nginx config test failed! Restoring backup..."
    cp /etc/nginx/sites-available/tpsdhanvantariayurveda.backup /etc/nginx/sites-available/tpsdhanvantariayurveda
    exit 1
fi

# Final verification
echo ""
echo "=================================================="
echo "✅ FIX APPLIED SUCCESSFULLY!"
echo "=================================================="

echo ""
echo "📊 Final PM2 Status:"
pm2 status

echo ""
echo "🧪 Testing Public Endpoint (wait 3 seconds)..."
sleep 3
curl -s https://tpsdhanvantariayurveda.in/ | head -30

# Check if public endpoint shows correct app
echo ""
if curl -s https://tpsdhanvantariayurveda.in/ | grep -q "Dhanvantari\|Ayurveda"; then
    echo "✅ PUBLIC SITE IS CORRECT!"
else
    echo "⚠️  WARNING: Public site might still show wrong app. Clear browser cache!"
fi

echo ""
echo "=================================================="
echo "🎯 NEXT STEPS:"
echo "=================================================="
echo "1. Clear your browser cache: Press Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)"
echo "2. Visit: https://tpsdhanvantariayurveda.in"
echo "3. You should see: TPS DHANVANTARI AYURVEDA (NOT MySchool)"
echo "4. Login with:"
echo "   Email: Shankaranherbaltreatment@gmail.com"
echo "   Password: 123456"
echo ""
echo "✅ FIX COMPLETE!"
echo "=================================================="
```

---

## 🔍 IF ISSUE PERSISTS

If you still see MySchool chatbot after running the above script, try these additional steps:

### Option 1: Check if MySchool is on a different port
```bash
# Check all PM2 processes
pm2 list

# If you see a "myschool" process, delete it
pm2 delete myschool

# Restart only ayurveda-clinic
pm2 restart ayurveda-clinic
```

### Option 2: Check Nginx sites
```bash
# List all nginx site configurations
ls -la /etc/nginx/sites-available/
ls -la /etc/nginx/sites-enabled/

# Check if myschool site exists
cat /etc/nginx/sites-available/demo.myschoolchatbot.in 2>/dev/null

# If it's proxying to port 3001, change it to a different port (e.g., 3002)
# Or disable the myschool site if not needed
rm /etc/nginx/sites-enabled/demo.myschoolchatbot.in 2>/dev/null
systemctl reload nginx
```

### Option 3: Check application directories
```bash
# List all web applications
ls -la /var/www/

# Make sure you're in the correct directory
cd /var/www/ayurveda
ls -la

# Verify the files contain Ayurveda content
grep -i "dhanvantari\|ayurveda" dist/_worker.js | head -5
```

---

## 📞 VERIFICATION CHECKLIST

After running the fix, verify:

- [ ] PM2 shows `ayurveda-clinic` running on port 3001
- [ ] `curl http://localhost:3001/` shows TPS Dhanvantari content
- [ ] Nginx config proxies `tpsdhanvantariayurveda.in` to `http://127.0.0.1:3001`
- [ ] `curl https://tpsdhanvantariayurveda.in/` shows TPS Dhanvantari content
- [ ] Browser (with cache cleared) shows TPS Dhanvantari Ayurveda

---

## 🆘 EMERGENCY ROLLBACK

If something goes wrong, you can rollback:

```bash
# Restore Nginx backup
cp /etc/nginx/sites-available/tpsdhanvantariayurveda.backup /etc/nginx/sites-available/tpsdhanvantariayurveda
systemctl reload nginx

# Restart PM2
pm2 restart ayurveda-clinic
```

---

## 📝 SUMMARY

**Root Cause**: Port conflict or Nginx misconfiguration
**Solution**: 
1. Ensure Ayurveda app runs on port 3001
2. Configure Nginx to proxy to port 3001
3. Kill conflicting processes
4. Clear browser cache

**Time Required**: 5-10 minutes

---

## 🎯 QUICK ONE-LINER (Alternative)

If you want a super quick fix, try this single command:

```bash
ssh root@88.222.244.84 'cd /var/www/ayurveda && pm2 stop all && fuser -k 3001/tcp 2>/dev/null; PORT=3001 pm2 start server.js --name ayurveda-clinic --update-env && sed -i.bak "s|proxy_pass http://127.0.0.1:[0-9]*|proxy_pass http://127.0.0.1:3001|g" /etc/nginx/sites-available/tpsdhanvantariayurveda && nginx -t && systemctl reload nginx && pm2 status'
```

(Enter password when prompted: `Yourkpo@202425`)

---

**Need help?** Contact with these details:
- Current PM2 output: `pm2 list`
- Current ports: `netstat -tulpn | grep 300`
- Nginx config: `cat /etc/nginx/sites-available/tpsdhanvantariayurveda`
