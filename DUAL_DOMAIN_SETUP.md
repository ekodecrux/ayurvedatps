# 🌐 DUAL DOMAIN SETUP - COMPLETE GUIDE

**Date:** January 24, 2026  
**Status:** ✅ Server Configured, ⏳ Waiting for DNS

---

## ✅ WHAT'S BEEN DONE

### **1. Server Configuration**
- ✅ Nginx configured for both domains
- ✅ Application running on port 3011
- ✅ Backup API running on port 5000
- ✅ Both domains pointing to same application

### **2. Domain Configuration**

**Primary Domain (.in):**
- ✅ Domain: tpsdhanvantariayurveda.in
- ✅ SSL: Active (Let's Encrypt)
- ✅ Status: **WORKING**
- ✅ URL: https://tpsdhanvantariayurveda.in/

**Secondary Domain (.com):**
- ✅ Nginx: Configured
- ⏳ DNS: Needs to point to server
- ⏳ SSL: Waiting for DNS propagation
- ⏳ Status: **PENDING DNS SETUP**
- 🔄 URL: https://tpsdhanvantariayurveda.com/ (after DNS)

---

## 📋 DNS CONFIGURATION REQUIRED

### **YOU NEED TO UPDATE DNS FOR .com DOMAIN:**

Go to your domain registrar (GoDaddy, Namecheap, etc.) and add these DNS records:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| **A** | @ | `88.222.244.84` | 3600 |
| **A** | www | `88.222.244.84` | 3600 |

**Or if using CNAME:**

| Type | Name | Value | TTL |
|------|------|-------|-----|
| **A** | @ | `88.222.244.84` | 3600 |
| **CNAME** | www | `tpsdhanvantariayurveda.com` | 3600 |

---

## ⏰ AFTER DNS IS CONFIGURED

### **Step 1: Wait for DNS Propagation (5-60 minutes)**

Check DNS propagation:
- **Tool:** https://www.whatsmydns.net/
- **Enter:** tpsdhanvantariayurveda.com
- **Should show:** 88.222.244.84

### **Step 2: Get SSL Certificate**

Once DNS is propagated, run this command:

```bash
ssh root@88.222.244.84
sudo certbot --nginx -d tpsdhanvantariayurveda.com -d www.tpsdhanvantariayurveda.com
```

Or use the automated script from sandbox:
```bash
cd /home/user/webapp
./get-ssl-certificate.sh
```

### **Step 3: Verify Both Domains Work**

Test both URLs:
- ✅ https://tpsdhanvantariayurveda.in/ (already working)
- 🔄 https://tpsdhanvantariayurveda.com/ (after DNS + SSL)

---

## 🔧 NGINX CONFIGURATION

Both domains are configured to serve the same application:

**File:** `/etc/nginx/sites-available/tpsdhanvantari` (for .in)  
**File:** `/etc/nginx/sites-available/tpsdhanvantari.com` (for .com)

Both proxy to: `http://127.0.0.1:3011`

---

## 🎯 CURRENT STATUS

### **✅ WORKING NOW:**
- https://tpsdhanvantariayurveda.in/
- Login: admin@tpsdhanvantari.com / 123456
- All features working:
  - Patient management
  - Herbs & Roots prescriptions
  - Backup & Restore
  - Settings
  - Reports

### **⏳ WILL WORK AFTER DNS:**
- https://tpsdhanvantariayurveda.com/
- Same login credentials
- Same application
- Same database
- Same features

---

## 📊 ARCHITECTURE

```
Internet
    ↓
DNS (.in domain) ← WORKING
DNS (.com domain) ← NEEDS SETUP
    ↓
88.222.244.84:443 (Nginx)
    ↓
    ├── tpsdhanvantariayurveda.in ✅
    │   └── → localhost:3011 (Hono App)
    │
    └── tpsdhanvantariayurveda.com ⏳
        └── → localhost:3011 (Same Hono App)
```

**Both domains → Same Application → Same Database**

---

## 🧪 TESTING

### **Test .in domain (works now):**
```bash
curl -I https://tpsdhanvantariayurveda.in/
# Should return: HTTP/2 200
```

### **Test .com domain (after DNS):**
```bash
curl -I https://tpsdhanvantariayurveda.com/
# Should return: HTTP/2 200
```

---

## 📞 TROUBLESHOOTING

### **If .com domain shows error after DNS:**

1. **Check DNS propagation:**
   ```bash
   dig tpsdhanvantariayurveda.com
   # Should show: 88.222.244.84
   ```

2. **Test without SSL first:**
   ```bash
   curl -I http://tpsdhanvantariayurveda.com/
   ```

3. **Get SSL certificate manually:**
   ```bash
   ssh root@88.222.244.84
   sudo certbot --nginx -d tpsdhanvantariayurveda.com -d www.tpsdhanvantariayurveda.com
   ```

4. **Check Nginx logs:**
   ```bash
   ssh root@88.222.244.84
   sudo tail -f /var/log/nginx/error.log
   ```

5. **Restart Nginx:**
   ```bash
   ssh root@88.222.244.84
   sudo systemctl restart nginx
   pm2 restart ayurveda-clinic
   ```

---

## ✅ VERIFICATION CHECKLIST

After DNS is set up:

- [ ] DNS propagated (check whatsmydns.net)
- [ ] HTTP works (http://tpsdhanvantariayurveda.com/)
- [ ] SSL certificate obtained
- [ ] HTTPS works (https://tpsdhanvantariayurveda.com/)
- [ ] Login page loads
- [ ] Can login successfully
- [ ] All features working
- [ ] Backup system working
- [ ] Both domains work simultaneously

---

## 🎉 FINAL RESULT

**After DNS setup, you'll have:**

1. ✅ **tpsdhanvantariayurveda.in** (primary domain)
2. ✅ **tpsdhanvantariayurveda.com** (secondary domain)
3. ✅ Both domains → same application
4. ✅ Both domains → same database
5. ✅ Both domains → SSL secured
6. ✅ Both domains → full features

---

## 📋 NEXT STEPS

### **Immediate:**
1. **Configure DNS** for tpsdhanvantariayurveda.com
   - Point to: 88.222.244.84
   - Wait for propagation (5-60 min)

### **After DNS:**
2. **Get SSL certificate** (run script or manual command)
3. **Test .com domain** in browser
4. **Verify all features** working on both domains

### **Optional:**
5. **Choose primary domain** for marketing
6. **Set up redirect** if needed (one domain → other)
7. **Update business cards/website** with preferred domain

---

## 🌐 PRODUCTION URLS

**Current (Working):**
- https://tpsdhanvantariayurveda.in/

**Coming Soon (After DNS):**
- https://tpsdhanvantariayurveda.com/

**Login (Same for Both):**
- Email: admin@tpsdhanvantari.com
- Password: 123456

---

## 📞 SUPPORT

**Server:** 88.222.244.84  
**SSH:** root@88.222.244.84  
**Password:** Yourkpo@202526  

**PM2 Services:**
- ayurveda-clinic (main app) - Port 3011
- backup-api (backup system) - Port 5000

---

**Last Updated:** January 24, 2026  
**Status:** Server configured, waiting for DNS setup  
**Next:** Configure DNS for .com domain
