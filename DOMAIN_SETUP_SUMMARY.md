# Domain Mapping Setup Summary
## TPS Dhanvantari Ayurveda - Quick Start Guide

**Date:** January 3, 2026 03:57 UTC  
**Status:** ✅ Application Ready | ⏳ DNS Configuration Pending

---

## 🎯 Current Status

### ✅ Application Status
```
✓ Server Running: http://88.222.244.84:3001
✓ PM2 Process: ayurveda-clinic (ONLINE)
✓ Memory Usage: ~70MB
✓ API Status: Working (totalPatients: 1)
✓ Database: Working
✓ Nginx: Configured and Active
✓ SSL Tool: Certbot Installed
```

### 📋 Domain Status

| Domain | Current DNS | Target DNS | Status |
|--------|-------------|------------|---------|
| tpsdhanvantariayurveda.com | 104.21.26.186 (Cloudflare) | 88.222.244.84 | ⏳ Pending |
| www.tpsdhanvantariayurveda.com | 104.21.26.186 (Cloudflare) | 88.222.244.84 | ⏳ Pending |
| tpsdhanvantariayurveda.in | No records | 88.222.244.84 | ⏳ Pending |
| www.tpsdhanvantariayurveda.in | No records | 88.222.244.84 | ⏳ Pending |

---

## 🚀 What You Need To Do Next

### Step 1: Configure tpsdhanvantariayurveda.in DNS

**Login to Hostinger** (where you purchased the domain)

1. Go to **Domains** → Select **tpsdhanvantariayurveda.in**
2. Click **DNS / Name Servers**
3. Add these A Records:

```
Type: A
Name: @
Value: 88.222.244.84
TTL: 14400

Type: A  
Name: www
Value: 88.222.244.84
TTL: 14400
```

4. Click **Save Changes**

---

### Step 2: Configure tpsdhanvantariayurveda.com DNS

**Option A: Update DNS at Cloudflare (Recommended)**

1. Login to **Cloudflare Dashboard**
2. Select **tpsdhanvantariayurveda.com**
3. Go to **DNS** → **Records**
4. Edit/Add A Records:

```
Type: A
Name: @
Content: 88.222.244.84
Proxy: OFF (gray cloud - click to turn off)
TTL: Auto

Type: A
Name: www
Content: 88.222.244.84
Proxy: OFF (gray cloud)
TTL: Auto
```

5. Click **Save**

**Note:** Turn OFF Cloudflare proxy (orange cloud → gray cloud) to point directly to your VPS.

---

**Option B: Update at Domain Registrar (Hostinger)**

If the domain is registered at Hostinger:
1. Go to **Domains** → Select **tpsdhanvantariayurveda.com**
2. Click **Manage Nameservers**
3. Change from Cloudflare nameservers to **Hostinger nameservers**
4. Add A Records as shown in Step 1 above

---

### Step 3: Wait for DNS Propagation

**Time Required:** 5-60 minutes (usually 10-15 minutes)

**Check DNS Propagation:**
```bash
# From your local machine
nslookup tpsdhanvantariayurveda.in
nslookup tpsdhanvantariayurveda.com

# Or use online tools:
# https://www.whatsmydns.net/
# https://dnschecker.org/
```

**Expected Output:**
```
Address: 88.222.244.84
```

---

### Step 4: Install SSL Certificate (After DNS Propagates)

**SSH into your server:**
```bash
ssh root@88.222.244.84
```

**Run Certbot:**
```bash
# Install SSL for all 4 domains at once
certbot --nginx \
  -d tpsdhanvantariayurveda.com \
  -d www.tpsdhanvantariayurveda.com \
  -d tpsdhanvantariayurveda.in \
  -d www.tpsdhanvantariayurveda.in

# Follow prompts:
# Email: parimi.prasad@gmail.com
# Terms: Y (yes)
# Redirect: 2 (redirect HTTP to HTTPS)
```

**Expected Output:**
```
Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/tpsdhanvantariayurveda.com/fullchain.pem
Your key file has been saved at: /etc/letsencrypt/live/tpsdhanvantariayurveda.com/privkey.pem
```

---

### Step 5: Test Your Domains

**After DNS propagates and SSL is installed:**

Open in browser:
- ✅ https://tpsdhanvantariayurveda.com
- ✅ https://www.tpsdhanvantariayurveda.com  
- ✅ https://tpsdhanvantariayurveda.in
- ✅ https://www.tpsdhanvantariayurveda.in

**Login Credentials:**
- Email: `Shankaranherbaltreatment@gmail.com`
- Password: `123456`

---

## 📊 Technical Details

### Server Configuration

```yaml
Server IP: 88.222.244.84
Application Port: 3001
Process Manager: PM2
Web Server: Nginx (reverse proxy)
SSL Provider: Let's Encrypt (Certbot)
Auto-Renewal: Enabled
```

### Nginx Configuration

**File:** `/etc/nginx/sites-available/tpsdhanvantari`

```nginx
server {
    listen 80;
    server_name tpsdhanvantariayurveda.com 
                www.tpsdhanvantariayurveda.com
                tpsdhanvantariayurveda.in
                www.tpsdhanvantariayurveda.in;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Status:** ✅ Active

---

## 🔧 Troubleshooting

### Issue: "This site can't be reached"

**Cause:** DNS not propagated yet  
**Solution:** Wait 30-60 minutes, clear browser cache

```bash
# Clear DNS cache (local machine)
# Windows:
ipconfig /flushdns

# Mac:
sudo dscacheutil -flushcache

# Linux:
sudo systemd-resolve --flush-caches
```

---

### Issue: Certbot fails with "Failed authorization procedure"

**Cause:** DNS not pointing to server yet  
**Solution:** 
1. Check DNS: `nslookup yourdomain.com`
2. Confirm it shows 88.222.244.84
3. Wait 10 more minutes
4. Retry certbot command

---

### Issue: 502 Bad Gateway

**Cause:** Application not running  
**Solution:**
```bash
ssh root@88.222.244.84
pm2 restart ayurveda-clinic
pm2 logs ayurveda-clinic --lines 30
```

---

### Issue: Cloudflare Error 522 (if using Cloudflare proxy)

**Cause:** Origin server unreachable  
**Solution:** Turn OFF Cloudflare proxy (orange → gray cloud)

---

## 📝 Quick Commands

```bash
# SSH into server
ssh root@88.222.244.84

# Check application status
pm2 status

# Restart application
pm2 restart ayurveda-clinic

# View application logs
pm2 logs ayurveda-clinic

# Check Nginx status
systemctl status nginx

# Test Nginx configuration
nginx -t

# Reload Nginx (after config changes)
systemctl reload nginx

# Check SSL certificates
certbot certificates

# Renew SSL manually (auto-renews every 60 days)
certbot renew

# Check DNS from server
nslookup tpsdhanvantariayurveda.com
nslookup tpsdhanvantariayurveda.in
```

---

## 🎯 Timeline

| Step | Action | Time | Status |
|------|--------|------|---------|
| 1 | Configure DNS for .in domain | 5 min | ⏳ Your Action |
| 2 | Configure DNS for .com domain | 5 min | ⏳ Your Action |
| 3 | DNS Propagation | 10-60 min | ⏳ Automatic |
| 4 | Install SSL Certificate | 2 min | ⏳ After DNS |
| 5 | Test HTTPS Access | 1 min | ⏳ After SSL |
| **Total** | **End-to-End** | **23-73 min** | **⏳ In Progress** |

---

## ✅ Pre-Deployment Checklist

- [x] Application running on port 3001
- [x] PM2 process manager configured
- [x] Nginx reverse proxy configured
- [x] Certbot installed for SSL
- [x] Database operational
- [x] Test data verified
- [x] Admin credentials set
- [ ] DNS configured for .in domain → **YOUR ACTION**
- [ ] DNS configured for .com domain → **YOUR ACTION**
- [ ] DNS propagation verified
- [ ] SSL certificate installed
- [ ] HTTPS access tested
- [ ] All 4 URLs verified

---

## 📞 Support & Access Information

**Application Access (Direct IP):**
- http://88.222.244.84:3001

**Server Access:**
- SSH: `root@88.222.244.84`
- Password: [Provided separately]

**Admin Login:**
- Email: `Shankaranherbaltreatment@gmail.com`
- Password: `123456`

**Email for SSL:**
- `parimi.prasad@gmail.com`

**Domain Registrar:**
- Hostinger (parimi.prasad@gmail.com)

**DNS Provider:**
- Cloudflare (for .com) + Hostinger (for .in)

---

## 📚 Documentation Files

All guides saved in `/home/user/webapp/`:

1. **DOMAIN_MAPPING_COMPLETE_GUIDE.md** - Detailed technical guide
2. **DOMAIN_SETUP_SUMMARY.md** - This quick start guide
3. **DEPLOYMENT_CONFIRMED.md** - Application deployment details
4. **BACKEND_FIXED.md** - Backend integration fixes

---

## 🎉 What's Next?

1. **Immediate (Now):**
   - Configure DNS records for both domains (see Step 1 & 2)
   - Note the time you made DNS changes

2. **After 15-30 minutes:**
   - Test DNS: `nslookup tpsdhanvantariayurveda.com`
   - Test DNS: `nslookup tpsdhanvantariayurveda.in`
   - Both should show: 88.222.244.84

3. **After DNS confirms:**
   - SSH into server
   - Run certbot command (Step 4)
   - Test HTTPS access

4. **After SSL installed:**
   - Access https://tpsdhanvantariayurveda.com
   - Access https://tpsdhanvantariayurveda.in
   - Login and test application
   - ✅ Domain mapping complete!

---

## ✨ Final Notes

- **Application is ready** and running perfectly on port 3001
- **Only DNS configuration** is pending (your action)
- **SSL will be installed** automatically once DNS propagates
- **All domains** will point to the same application
- **HTTPS redirect** will be enabled automatically

**Current Working URL (use this while DNS propagates):**
- http://88.222.244.84:3001

**Future Production URLs (after DNS + SSL):**
- https://tpsdhanvantariayurveda.com ✨ Primary
- https://tpsdhanvantariayurveda.in ✨ Secondary

---

**Status:** ✅ Backend Ready | ⏳ Awaiting Your DNS Configuration  
**Last Updated:** January 3, 2026 03:57 UTC  
**Next Action:** Configure DNS records (Steps 1 & 2)
