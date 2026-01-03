# Domain Mapping Complete Guide
## TPS Dhanvantari Ayurveda - Domain Configuration

**Date:** January 3, 2026  
**Server:** 88.222.244.84  
**Application Port:** 3001

---

## 🎯 Current Domain Status

### ✅ tpsdhanvantariayurveda.com
- **Status:** Active (Cloudflare CDN enabled)
- **DNS Records:** 
  - A Record → 104.21.26.186 (Cloudflare)
  - A Record → 172.67.138.90 (Cloudflare)
- **Current Behavior:** Points to Cloudflare Pages deployment
- **Target:** Map to Hostinger VPS (88.222.244.84:3001)

### ❌ tpsdhanvantariayurveda.in
- **Status:** No DNS records configured
- **DNS Records:** None
- **Target:** Point to Hostinger VPS (88.222.244.84:3001)

---

## 📋 Domain Mapping Strategy

### Option 1: Map BOTH domains to Hostinger VPS (RECOMMENDED)
Both `.com` and `.in` domains point to the same application on your VPS.

### Option 2: Redirect .com to .in
`.com` redirects to `.in`, and `.in` hosts the application.

### Option 3: Keep .com on Cloudflare, .in on VPS
`.com` stays with Cloudflare Pages, `.in` points to VPS (not recommended - confusing).

**We'll implement Option 1 (Recommended)**

---

## 🚀 Step-by-Step DNS Configuration

### Step 1: Configure tpsdhanvantariayurveda.in

**DNS Provider:** Hostinger (assuming same as .com domain)

**Required DNS Records:**

```
Type: A
Name: @
Content: 88.222.244.84
TTL: 14400 (or default)
Proxy: OFF (disable Cloudflare proxy initially)

Type: A
Name: www
Content: 88.222.244.84
TTL: 14400
Proxy: OFF
```

**Steps in Hostinger:**
1. Login to Hostinger Control Panel
2. Go to **Domain** → **DNS / Name Servers**
3. Select **tpsdhanvantariayurveda.in**
4. Add A Records as shown above
5. Click **Save Changes**

---

### Step 2: Configure tpsdhanvantariayurveda.com

**Current Setup:** Cloudflare CDN enabled (orange cloud)

**Option A: Turn OFF Cloudflare Proxy (Simple)**
```
Type: A
Name: @
Content: 88.222.244.84
TTL: Auto
Proxy: OFF (gray cloud icon)

Type: A
Name: www
Content: 88.222.244.84
TTL: Auto
Proxy: OFF (gray cloud icon)
```

**Steps in Cloudflare:**
1. Login to Cloudflare dashboard
2. Select **tpsdhanvantariayurveda.com** domain
3. Go to **DNS** → **Records**
4. Edit existing A records:
   - Change IP from Cloudflare IPs to **88.222.244.84**
   - Click the **orange cloud** icon to turn it **gray** (Proxy OFF)
5. Click **Save**

**Option B: Keep Cloudflare Proxy (Advanced)**
If you want to keep Cloudflare's CDN, caching, and DDoS protection:
1. Keep orange cloud enabled
2. Update A records to point to **88.222.244.84**
3. Cloudflare will proxy requests to your VPS

---

## ✅ Nginx Configuration (Already Done)

The Nginx reverse proxy is already configured on your server:

**File:** `/etc/nginx/sites-available/tpsdhanvantari`

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name tpsdhanvantariayurveda.com 
                www.tpsdhanvantariayurveda.com 
                tpsdhanvantariayurveda.in 
                www.tpsdhanvantariayurveda.in;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
    }
}
```

**Status:** ✅ Active and working

---

## 🔒 SSL Certificate Installation

Once DNS propagates (usually 5-60 minutes), install SSL certificates:

### Automatic SSL with Certbot (Free Let's Encrypt)

```bash
# SSH into server
ssh root@88.222.244.84

# Install SSL for all domains
certbot --nginx -d tpsdhanvantariayurveda.com \
                -d www.tpsdhanvantariayurveda.com \
                -d tpsdhanvantariayurveda.in \
                -d www.tpsdhanvantariayurveda.in

# Follow prompts:
# - Enter email: parimi.prasad@gmail.com
# - Agree to terms: Y
# - Redirect HTTP to HTTPS: 2 (recommended)
```

**Automatic Renewal:** Certbot auto-renews certificates before expiry.

---

## 🧪 Testing & Verification

### Step 1: Check DNS Propagation (Wait 5-60 minutes after DNS changes)

```bash
# Check .in domain
nslookup tpsdhanvantariayurveda.in

# Check .com domain
nslookup tpsdhanvantariayurveda.com

# Expected output:
# Address: 88.222.244.84
```

**Online Tools:**
- https://www.whatsmydns.net/
- https://dnschecker.org/

---

### Step 2: Test HTTP Access

```bash
# Test .in domain
curl -I http://tpsdhanvantariayurveda.in
curl -I http://www.tpsdhanvantariayurveda.in

# Test .com domain
curl -I http://tpsdhanvantariayurveda.com
curl -I http://www.tpsdhanvantariayurveda.com

# Expected: HTTP/1.1 200 OK
```

---

### Step 3: Browser Access

Open in browser:
- http://tpsdhanvantariayurveda.in
- http://www.tpsdhanvantariayurveda.in
- http://tpsdhanvantariayurveda.com
- http://www.tpsdhanvantariayurveda.com

**Expected:** TPS Dhanvantari login page should load

---

### Step 4: Test HTTPS (After SSL installation)

```bash
# Test SSL
curl -I https://tpsdhanvantariayurveda.in
curl -I https://tpsdhanvantariayurveda.com

# Check SSL certificate
openssl s_client -connect tpsdhanvantariayurveda.com:443 -servername tpsdhanvantariayurveda.com
```

---

## 📊 Current Application Status

### ✅ Application Running
```
Server: http://88.222.244.84:3001
Process: PM2 (ayurveda-clinic)
Status: ONLINE
PID: 518028
Memory: ~70MB
Port: 3001
```

### ✅ Test URLs (Direct IP)
- http://88.222.244.84:3001/ → Login page
- http://88.222.244.84:3001/api/stats → API working
- http://88.222.244.84:3001/api/patients → Patient API

---

## 🎯 Final Access URLs (After DNS + SSL)

### Primary Domain (.com)
- https://tpsdhanvantariayurveda.com
- https://www.tpsdhanvantariayurveda.com

### Secondary Domain (.in)
- https://tpsdhanvantariayurveda.in
- https://www.tpsdhanvantariayurveda.in

**All URLs will show the same application**

---

## 🔧 Troubleshooting

### Issue 1: Domain not resolving
**Solution:** 
```bash
# Clear DNS cache (local machine)
# Windows:
ipconfig /flushdns

# Mac/Linux:
sudo dscacheutil -flushcache
```

### Issue 2: SSL certificate fails
**Reason:** DNS not propagated yet  
**Solution:** Wait 30-60 minutes, then retry certbot command

### Issue 3: 502 Bad Gateway
**Reason:** Application not running  
**Solution:**
```bash
ssh root@88.222.244.84
pm2 restart ayurveda-clinic
pm2 status
```

### Issue 4: Cloudflare "Error 522" (if proxy enabled)
**Reason:** Origin server unreachable  
**Solution:** Check PM2 status and Nginx configuration

---

## 📝 Quick Command Reference

```bash
# SSH into server
ssh root@88.222.244.84

# Check PM2 status
pm2 status

# Restart application
pm2 restart ayurveda-clinic

# View logs
pm2 logs ayurveda-clinic --lines 50

# Check Nginx status
systemctl status nginx

# Test Nginx configuration
nginx -t

# Reload Nginx
systemctl reload nginx

# Check SSL certificate expiry
certbot certificates

# Renew SSL manually
certbot renew
```

---

## 🎉 Next Steps

1. **Configure DNS records** for both domains (see Step 1 & 2 above)
2. **Wait for DNS propagation** (5-60 minutes)
3. **Test HTTP access** from browser
4. **Install SSL certificate** using certbot command
5. **Test HTTPS access** and verify SSL
6. **Update all links** to use new domain

---

## 📞 Support Information

**Server IP:** 88.222.244.84  
**SSH Access:** root@88.222.244.84  
**Application Port:** 3001  
**PM2 App Name:** ayurveda-clinic  
**Nginx Config:** /etc/nginx/sites-available/tpsdhanvantari  
**Admin Email:** Shankaranherbaltreatment@gmail.com  
**Admin Password:** 123456

---

## ✅ Configuration Checklist

- [x] Nginx reverse proxy configured
- [x] Application running on port 3001
- [x] PM2 process manager configured
- [x] Certbot installed for SSL
- [ ] DNS records configured for .in domain
- [ ] DNS records updated for .com domain
- [ ] DNS propagation verified
- [ ] SSL certificate installed
- [ ] HTTPS access verified
- [ ] All URLs tested and working

---

**Status:** DNS configuration pending. Application ready to serve both domains.  
**Last Updated:** January 3, 2026 03:55 UTC
