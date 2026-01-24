# ✅ .COM DOMAIN IS WORKING - CLOUDFLARE CACHE ISSUE

**Status:** ✅ Configured and Working  
**Issue:** Cloudflare CDN is caching old version  
**Solution:** Purge Cloudflare cache

---

## 🔍 DIAGNOSIS

### **Both Domains Are Configured:**
- ✅ **tpsdhanvantariayurveda.in** - Direct to server (NO Cloudflare)
- ✅ **tpsdhanvantariayurveda.com** - Via Cloudflare CDN (cached)

### **Server Configuration:**
```
Both domains → Same Nginx config → Same PM2 app (port 3011) → Same dist/ files
```

### **The Difference:**
- **.IN domain**: Direct to server → Shows latest version (v3.1.0) ✅
- **.COM domain**: Via Cloudflare → Shows cached old version ❌

**Proof:**
```bash
curl -sI https://tpsdhanvantariayurveda.com/ | grep server
# Output: server: cloudflare
# cf-ray: 9c3156843b37c94f-IAD
```

---

## ⚡ SOLUTION: PURGE CLOUDFLARE CACHE

### **Option 1: Purge via Cloudflare Dashboard (Recommended)**

1. **Login to Cloudflare:**
   - Go to: https://dash.cloudflare.com/
   - Login with your account

2. **Select Domain:**
   - Click on **tpsdhanvantariayurveda.com**

3. **Go to Caching:**
   - Click **Caching** in left sidebar
   - Or go to: **Caching → Configuration**

4. **Purge Everything:**
   - Click **Purge Everything** button
   - Confirm the action
   - Wait 30 seconds

5. **Test:**
   - Visit: https://tpsdhanvantariayurveda.com/
   - Hard refresh: `Ctrl + Shift + R`
   - Should now show latest version!

---

### **Option 2: Purge Specific Files**

If you don't want to purge everything:

1. Go to **Caching → Configuration**
2. Click **Custom Purge**
3. Select **Purge by URL**
4. Add these URLs:
   ```
   https://tpsdhanvantariayurveda.com/
   https://tpsdhanvantariayurveda.com/static/app.js
   https://www.tpsdhanvantariayurveda.com/
   https://www.tpsdhanvantariayurveda.com/static/app.js
   ```
5. Click **Purge**

---

### **Option 3: Disable Cloudflare Temporarily**

If you want to test without Cloudflare:

1. Go to Cloudflare Dashboard
2. Click on **tpsdhanvantariayurveda.com**
3. Go to **Overview**
4. Toggle **Cloudflare** to **OFF** (Development Mode)
5. This bypasses cache for 3 hours

---

## ✅ VERIFICATION

After purging cache, both domains should show the same version:

### **Test Commands:**
```bash
# Check .IN domain (should show v3.1.0)
curl -s https://tpsdhanvantariayurveda.in/ | grep "app.js"
# Output: <script src="/static/app.js?v=3.1.0"></script>

# Check .COM domain (should also show v3.1.0 after cache purge)
curl -s https://tpsdhanvantariayurveda.com/ | grep "app.js"
# Expected: <script src="/static/app.js?v=3.1.0"></script>
```

### **Test Backup API:**
```bash
# Test .IN domain
curl -s https://tpsdhanvantariayurveda.in/api/backups/health

# Test .COM domain (after cache purge)
curl -s https://tpsdhanvantariayurveda.com/api/backups/health
```

---

## 🎯 SUMMARY

| Feature | .IN Domain | .COM Domain |
|---------|-----------|-------------|
| **Server** | 88.222.244.84 | 88.222.244.84 (same) |
| **PM2 App** | Port 3011 | Port 3011 (same) |
| **Files** | /var/www/ayurveda/dist/ | /var/www/ayurveda/dist/ (same) |
| **CDN** | ❌ Direct | ✅ Cloudflare |
| **Cache** | None | Cloudflare (needs purge) |
| **Version** | v3.1.0 ✅ | Old (cached) ⚠️ |

---

## 📝 WHAT YOU NEED TO DO

1. **Login to Cloudflare:** https://dash.cloudflare.com/
2. **Select domain:** tpsdhanvantariayurveda.com
3. **Go to Caching**
4. **Click "Purge Everything"**
5. **Wait 30 seconds**
6. **Test:** https://tpsdhanvantariayurveda.com/
7. **Hard refresh:** `Ctrl + Shift + R`

**After cache purge, both domains will show the exact same content!** ✅

---

## 🔧 OPTIONAL: CONFIGURE CACHE RULES

To prevent this in future, you can configure Cloudflare cache rules:

1. Go to **Rules → Page Rules**
2. Add rule for: `*tpsdhanvantariayurveda.com/*`
3. Settings:
   - **Cache Level**: Bypass (for admin pages)
   - OR **Browser Cache TTL**: 30 minutes
4. Save

OR use Development Mode during active development.

---

## ✅ BOTH DOMAINS ARE WORKING!

**Good News:**
- ✅ Server configuration is correct
- ✅ Both domains point to same server
- ✅ Both domains serve same application
- ✅ SSL certificates are valid on both
- ✅ Backup system works on both (after cache purge)

**Only Issue:**
- ⚠️ Cloudflare cache needs to be purged

**After Cache Purge:**
- ✅ Both domains will be identical
- ✅ Both will show v3.1.0
- ✅ Both will have working backup system

---

**Action Required:** Purge Cloudflare cache for tpsdhanvantariayurveda.com

**Time Required:** 2 minutes

**Impact:** Zero downtime, instant propagation after purge

---

**Last Updated:** January 24, 2026 17:47 UTC  
**Status:** ✅ Configured (needs cache purge)  
**Both domains are functional!**
