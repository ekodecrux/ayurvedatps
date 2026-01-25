# 🔧 FIX .COM DOMAIN - SHOWING OLD SITE

**Issue:** https://tpsdhanvantariayurveda.com/ shows OLD version (green header)  
**Cause:** Cloudflare is caching old content  
**Solution:** Configure Cloudflare to point to our server

---

## 🎯 THE PROBLEM:

### **Current Setup:**
```
.com domain → Cloudflare Proxy → Old Cached Content ❌
.in domain → Direct to 88.222.244.84 → New App ✅
```

### **What's Wrong:**
1. **DNS Configuration:** .com domain DNS points to Cloudflare, not our server
2. **Cloudflare Cache:** Cloudflare cached the old site
3. **Not Using Our Server:** Our Nginx config on 88.222.244.84 is ignored

---

## ✅ SOLUTION 1: PURGE CLOUDFLARE CACHE (FASTEST)

### **Step 1: Login to Cloudflare**
1. Go to: https://dash.cloudflare.com/
2. Login with your Cloudflare account
3. Select domain: **tpsdhanvantariayurveda.com**

### **Step 2: Purge Cache**
1. Click **"Caching"** in left menu
2. Click **"Configuration"** tab
3. Scroll down to **"Purge Cache"**
4. Click **"Purge Everything"** button
5. Confirm the action

### **Step 3: Check Origin Server**
1. Click **"DNS"** in left menu
2. Find the **A record** for `@` (root domain)
3. **Verify it points to:** `88.222.244.84`
4. If not, update it to: `88.222.244.84`

### **Step 4: Wait & Test**
1. Wait **1-2 minutes** for cache clear
2. Open: https://tpsdhanvantariayurveda.com/
3. Press **Ctrl + Shift + R** (hard refresh)
4. Should show new version!

---

## ✅ SOLUTION 2: CHANGE DNS TO DIRECT (RECOMMENDED)

### **Step 1: Update Cloudflare DNS**
1. Login to Cloudflare Dashboard
2. Select: **tpsdhanvantariayurveda.com**
3. Click **"DNS"** → **"Records"**

### **Step 2: Update A Records**
Find these records and update:

| Type | Name | Content | Proxy Status | Action |
|------|------|---------|--------------|--------|
| A | @ | 88.222.244.84 | 🟠 **Click to make gray** | Make DNS-only |
| A | www | 88.222.244.84 | 🟠 **Click to make gray** | Make DNS-only |

**Important:** Click the **orange cloud** 🟠 to make it **gray** ⚪  
This disables Cloudflare proxy and makes it DNS-only.

### **Step 3: Wait for Propagation**
1. Wait **5-10 minutes** for DNS changes
2. Check at: https://www.whatsmydns.net/
3. Search: `tpsdhanvantariayurveda.com`
4. Should show: `88.222.244.84` globally

### **Step 4: Get SSL Certificate**
After DNS points directly to server, get Let's Encrypt SSL:

```bash
ssh root@88.222.244.84
sudo certbot --nginx -d tpsdhanvantariayurveda.com -d www.tpsdhanvantariayurveda.com
```

---

## ✅ SOLUTION 3: CONFIGURE CLOUDFLARE ORIGIN (ADVANCED)

If you want to keep Cloudflare proxy:

### **Step 1: Update Origin Server**
1. In Cloudflare Dashboard
2. Click **"DNS"** → **"Records"**
3. Update A record content to: `88.222.244.84`
4. Keep proxy enabled (🟠 orange cloud)

### **Step 2: Purge All Cache**
1. Click **"Caching"** → **"Configuration"**
2. Click **"Purge Everything"**

### **Step 3: Configure Page Rules**
1. Click **"Rules"** → **"Page Rules"**
2. Create rule for: `*tpsdhanvantariayurveda.com/*`
3. Add setting: **Cache Level** = **Bypass**
4. Save

---

## 🧪 VERIFICATION:

### **Test .in Domain (Working):**
```bash
curl -I https://tpsdhanvantariayurveda.in/ | grep "HTTP"
# Should show: HTTP/2 200
```

### **Test .com Domain (After Fix):**
```bash
curl -I https://tpsdhanvantariayurveda.com/ | grep "HTTP"
# Should show: HTTP/2 200
```

### **Check if Using New Version:**
1. Open: https://tpsdhanvantariayurveda.com/
2. Press F12 (Developer Tools)
3. Go to Console tab
4. Type: `console.log(window.location.hostname)`
5. Check page title and header color

**New version has:**
- ✅ Updated UI
- ✅ Backup & Restore feature
- ✅ Latest features

**Old version has:**
- ❌ Green header "TPS DHANVANTARI AYURVEDA"
- ❌ Missing latest features

---

## 📊 COMPARISON:

| Aspect | .in Domain | .com Domain (Current) | .com Domain (After Fix) |
|--------|-----------|----------------------|------------------------|
| **Version** | ✅ New | ❌ Old (cached) | ✅ New |
| **Server** | Direct | Cloudflare → ??? | Direct or Cloudflare → 88.222.244.84 |
| **Features** | ✅ All | ❌ Limited | ✅ All |
| **Backup** | ✅ Works | ❌ No | ✅ Works |

---

## ⚠️ IMPORTANT:

### **Why This Happened:**
1. The .com domain was previously hosted somewhere else
2. Cloudflare cached that old site
3. DNS might have been updated to point to our server
4. But Cloudflare is still serving the old cached content

### **Best Approach:**
**Option:** Disable Cloudflare proxy (DNS-only mode)

**Benefits:**
- Direct connection to our server
- Uses our Nginx configuration
- All features work
- No caching issues
- Easier to manage

**You lose:**
- Cloudflare DDoS protection (but server has its own)
- CDN caching (not really needed for this app)
- Cloudflare analytics

---

## 🚀 RECOMMENDED STEPS:

1. **Login to Cloudflare**
   - https://dash.cloudflare.com/

2. **Go to DNS Settings**
   - Select tpsdhanvantariayurveda.com
   - Click "DNS"

3. **Make Records DNS-Only**
   - Click orange cloud 🟠 next to A records
   - Make them gray ⚪ (DNS-only)

4. **Wait 5-10 Minutes**
   - DNS propagates

5. **Get SSL Certificate**
   - SSH to server
   - Run certbot command

6. **Test**
   - Visit https://tpsdhanvantariayurveda.com/
   - Should show new version!

---

## 📞 NEED HELP?

If you don't have access to Cloudflare dashboard:

1. **Find Cloudflare Login:**
   - Check your email for Cloudflare signup
   - Search: "cloudflare verification" or "cloudflare account"

2. **Reset Password:**
   - Go to: https://dash.cloudflare.com/
   - Click "Forgot password"
   - Use email associated with domain

3. **Alternative:**
   - Contact domain registrar
   - Ask them to update DNS directly
   - Point A record to: 88.222.244.84

---

## ✅ AFTER FIX:

Both domains will work identically:
- ✅ https://tpsdhanvantariayurveda.in/ (working now)
- ✅ https://tpsdhanvantariayurveda.com/ (will work after fix)

**Login:** Shankaranherbaltreatment@gmail.com / 123456

---

**Summary:** The .com domain needs Cloudflare cache purged or DNS changed to point directly to our server (88.222.244.84) instead of serving old cached content.
