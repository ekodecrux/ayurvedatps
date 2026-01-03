# ✅ Domain Mapping - Ready to Deploy Checklist

**Date:** January 3, 2026 04:00 UTC  
**Status:** 🟢 SERVER READY | ⏳ DNS CONFIGURATION PENDING

---

## 📊 Pre-Deployment Verification

### ✅ Server Infrastructure (COMPLETE)

- [x] **Server Online:** 88.222.244.84
- [x] **Application Running:** ayurveda-clinic (PID: 518028)
- [x] **Port 3001:** Accessible and responding
- [x] **PM2 Process Manager:** Active with auto-restart
- [x] **Memory Usage:** Normal (~70MB)
- [x] **Database:** Operational with test data
- [x] **API Endpoints:** All functional
- [x] **Nginx:** Installed, configured, and active
- [x] **SSL Tool (Certbot):** Installed and ready
- [x] **Admin Credentials:** Set and tested

### ⏳ DNS Configuration (YOUR ACTION REQUIRED)

#### Domain: tpsdhanvantariayurveda.in
- [ ] Login to Hostinger
- [ ] Navigate to DNS settings
- [ ] Add A record: @ → 88.222.244.84
- [ ] Add A record: www → 88.222.244.84
- [ ] Save changes
- [ ] Note the time: ___________

#### Domain: tpsdhanvantariayurveda.com
- [ ] Login to Cloudflare Dashboard
- [ ] Select tpsdhanvantariayurveda.com
- [ ] Go to DNS → Records
- [ ] Edit A record: @ → 88.222.244.84
- [ ] Edit A record: www → 88.222.244.84
- [ ] Turn OFF proxy (orange cloud → gray cloud)
- [ ] Save changes
- [ ] Note the time: ___________

### ⏱️ DNS Propagation (AUTOMATIC - WAIT)

- [ ] Wait 10-60 minutes after DNS changes
- [ ] Test DNS from your computer:
  ```bash
  nslookup tpsdhanvantariayurveda.in
  nslookup tpsdhanvantariayurveda.com
  ```
- [ ] Expected result: Both show 88.222.244.84
- [ ] Online check: https://www.whatsmydns.net/
- [ ] Confirm global propagation

### 🔒 SSL Certificate Installation (AFTER DNS)

- [ ] SSH into server: `ssh root@88.222.244.84`
- [ ] Run certbot command:
  ```bash
  certbot --nginx \
    -d tpsdhanvantariayurveda.com \
    -d www.tpsdhanvantariayurveda.com \
    -d tpsdhanvantariayurveda.in \
    -d www.tpsdhanvantariayurveda.in
  ```
- [ ] Enter email: parimi.prasad@gmail.com
- [ ] Agree to terms: Y
- [ ] Redirect HTTP to HTTPS: 2
- [ ] Verify certificate installation
- [ ] Check auto-renewal: `certbot certificates`

### 🧪 Post-Deployment Testing

#### HTTP Access Test (Before SSL)
- [ ] http://tpsdhanvantariayurveda.in → Login page
- [ ] http://www.tpsdhanvantariayurveda.in → Login page
- [ ] http://tpsdhanvantariayurveda.com → Login page
- [ ] http://www.tpsdhanvantariayurveda.com → Login page

#### HTTPS Access Test (After SSL)
- [ ] https://tpsdhanvantariayurveda.in → Secure login page
- [ ] https://www.tpsdhanvantariayurveda.in → Secure login page
- [ ] https://tpsdhanvantariayurveda.com → Secure login page
- [ ] https://www.tpsdhanvantariayurveda.com → Secure login page
- [ ] Verify SSL padlock icon in browser
- [ ] Check certificate details (issued by Let's Encrypt)

#### Application Functionality Test
- [ ] Login with: Shankaranherbaltreatment@gmail.com / 123456
- [ ] Dashboard loads correctly
- [ ] View patient: Rajesh Kumar (IND00001)
- [ ] Check all sections: Patients, Herbs & Routes, Appointments, Reminders
- [ ] Test adding new patient
- [ ] Test creating prescription
- [ ] Verify all APIs working

---

## 📋 Quick Reference

### Current Working URL (Use Now)
```
🔗 http://88.222.244.84:3001
```

### Future Production URLs (After Setup)
```
✨ https://tpsdhanvantariayurveda.com (Primary)
✨ https://www.tpsdhanvantariayurveda.com
✨ https://tpsdhanvantariayurveda.in (Secondary)
✨ https://www.tpsdhanvantariayurveda.in
```

### Admin Login Credentials
```
📧 Email:    Shankaranherbaltreatment@gmail.com
🔑 Password: 123456
```

### Server Access
```
🖥️  SSH: ssh root@88.222.244.84
🔑 Password: [Your SSH password]
```

### DNS Settings Required

#### tpsdhanvantariayurveda.in (at Hostinger)
```
Type: A    Name: @      Value: 88.222.244.84    TTL: 14400
Type: A    Name: www    Value: 88.222.244.84    TTL: 14400
```

#### tpsdhanvantariayurveda.com (at Cloudflare)
```
Type: A    Name: @      Value: 88.222.244.84    Proxy: OFF
Type: A    Name: www    Value: 88.222.244.84    Proxy: OFF
```

### SSL Certificate Command
```bash
certbot --nginx \
  -d tpsdhanvantariayurveda.com \
  -d www.tpsdhanvantariayurveda.com \
  -d tpsdhanvantariayurveda.in \
  -d www.tpsdhanvantariayurveda.in
```

---

## 🚀 Deployment Steps in Order

1. **Configure DNS for .in domain** (5 minutes)
   - Login to Hostinger
   - Add A records as specified above
   - Save changes

2. **Configure DNS for .com domain** (5 minutes)
   - Login to Cloudflare
   - Update A records
   - Turn OFF proxy (gray cloud)
   - Save changes

3. **Wait for DNS Propagation** (10-60 minutes)
   - Check with nslookup
   - Use whatsmydns.net
   - Confirm both domains resolve to 88.222.244.84

4. **Install SSL Certificate** (2 minutes)
   - SSH into server
   - Run certbot command
   - Follow prompts
   - Verify installation

5. **Test All URLs** (5 minutes)
   - Test all 4 HTTPS URLs
   - Login to application
   - Verify functionality
   - Confirm SSL working

**Total Time:** 27-77 minutes (mostly DNS propagation wait)

---

## 🔧 Troubleshooting Guide

### Issue: DNS not resolving
**Check:**
- Did you wait at least 10 minutes?
- Are DNS records correct (88.222.244.84)?
- Is Cloudflare proxy turned OFF (gray cloud)?

**Solution:**
- Clear local DNS cache
- Wait longer (up to 60 minutes)
- Verify DNS records in control panel

### Issue: Certbot fails
**Error:** "Failed authorization procedure"  
**Cause:** DNS not propagated yet

**Solution:**
```bash
# Check DNS first
nslookup tpsdhanvantariayurveda.com

# If shows 88.222.244.84, retry certbot
certbot --nginx -d tpsdhanvantariayurveda.com ...
```

### Issue: 502 Bad Gateway
**Cause:** Application not running

**Solution:**
```bash
ssh root@88.222.244.84
pm2 status
pm2 restart ayurveda-clinic
```

### Issue: SSL certificate not working
**Check:**
```bash
certbot certificates
systemctl status nginx
```

**Renew manually:**
```bash
certbot renew
systemctl reload nginx
```

---

## 📞 Support Commands

```bash
# Check PM2 status
pm2 status

# View application logs
pm2 logs ayurveda-clinic --lines 50

# Restart application
pm2 restart ayurveda-clinic

# Check Nginx
systemctl status nginx
nginx -t

# Reload Nginx
systemctl reload nginx

# Check SSL certificates
certbot certificates

# Renew SSL
certbot renew

# Test DNS
nslookup tpsdhanvantariayurveda.com
nslookup tpsdhanvantariayurveda.in

# Test HTTP
curl -I http://88.222.244.84:3001/

# Test API
curl http://88.222.244.84:3001/api/stats
```

---

## ✅ Final Verification Checklist

### After DNS Configuration
- [ ] Both domains resolve to 88.222.244.84
- [ ] HTTP access works for all 4 URLs
- [ ] Application loads on domain names

### After SSL Installation
- [ ] HTTPS works for all 4 URLs
- [ ] No certificate errors in browser
- [ ] HTTP automatically redirects to HTTPS
- [ ] SSL padlock shows in browser
- [ ] Certificate valid for all domains

### Application Testing
- [ ] Login page loads correctly
- [ ] Can login with admin credentials
- [ ] Dashboard shows correct stats
- [ ] All sections accessible
- [ ] APIs working
- [ ] Database operations functional

---

## 📚 Documentation Files

All guides available in `/home/user/webapp/`:

1. **DOMAIN_SETUP_SUMMARY.md** - Quick start guide (you are here)
2. **DOMAIN_MAPPING_COMPLETE_GUIDE.md** - Detailed technical guide
3. **DEPLOYMENT_CONFIRMED.md** - Application deployment details
4. **BACKEND_FIXED.md** - Backend integration details

---

## 🎉 Success Criteria

✅ **Domain Mapping Successful When:**

1. All 4 URLs accessible via HTTPS
2. Login page loads on all domains
3. SSL certificate valid (Let's Encrypt)
4. Application fully functional
5. No console errors
6. Database operations working
7. All APIs responding correctly

---

## 📊 Current Status Summary

```
✅ Server Ready:        100%
✅ Application Ready:   100%
✅ Nginx Configured:    100%
✅ SSL Tool Ready:      100%
⏳ DNS Configuration:     0%  ← YOUR ACTION NEEDED
⏳ SSL Installation:      0%  ← AFTER DNS
⏳ Testing Complete:      0%  ← AFTER SSL
```

**Next Step:** Configure DNS records (Steps 1 & 2)

---

**Last Updated:** January 3, 2026 04:00 UTC  
**Status:** ⏳ Awaiting DNS Configuration  
**ETA to Complete:** 18-68 minutes after DNS configured
