# Cloudflare Manual Fix - Step by Step Guide

**Date**: January 25, 2026  
**Status**: ⚠️ INCOMPLETE - Cloudflare proxy still active

---

## 🔍 CURRENT VERIFICATION RESULTS

```
✅ Domain loads: 200 OK
⚠️  Cloudflare proxy: STILL ACTIVE (orange cloud)
⚠️  Version: OLD cached version
⚠️  DNS: Points to Cloudflare IP (2606:4700:310c::ac42:2d08)
⚠️  Backup API: 404 Not Found
```

**Issues Remaining**: 2
1. Cloudflare proxy still active
2. Serving old cached content

---

## 🎯 WHAT YOU NEED TO DO

### Critical Issue
The **orange cloud is still active** in Cloudflare DNS settings. This means:
- Traffic goes through Cloudflare's servers
- Cloudflare is caching the old version
- DNS points to Cloudflare IP instead of our server (88.222.244.84)

### Solution
You need to **turn the orange cloud to gray** (DNS-only mode)

---

## 📋 COMPLETE STEP-BY-STEP INSTRUCTIONS

### Step 1: Login to Cloudflare Dashboard
1. Open browser
2. Go to: **https://dash.cloudflare.com/**
3. Enter your login credentials
4. Click **"Log In"**

---

### Step 2: Select Your Domain
1. You should see a list of domains
2. Click on: **tpsdhanvantariayurveda.com**
3. This opens the domain management page

---

### Step 3: Purge Cache (IMPORTANT!)
1. Look at the **left sidebar menu**
2. Click on: **"Caching"**
3. Then click: **"Configuration"**
4. Scroll down to find **"Purge Cache"** section
5. Click the button: **"Purge Everything"**
6. A popup appears asking for confirmation
7. Click: **"Purge Everything"** again to confirm
8. Wait for green success message: "Cache successfully purged"

**This is CRITICAL** - it removes the old cached version!

---

### Step 4: Go to DNS Settings
1. Look at the **left sidebar menu**
2. Click on: **"DNS"**
3. Then click: **"Records"**
4. You should now see a list of DNS records

---

### Step 5: Update ROOT Domain Record (@)

Look for a record that shows:
```
Type: A
Name: @  (or tpsdhanvantariayurveda.com)
Content: 88.222.244.84 (or some other IP)
Proxy status: 🟠 (orange cloud icon)
```

**What to do:**
1. Find this record in the list
2. Look at the **Proxy status** column
3. You'll see an **orange cloud icon** 🟠
4. **Click on the orange cloud icon**
5. It will turn **GRAY** ⚪
6. This is what you want!
7. Click **"Save"** button (if it appears)

**Before:**  
`@ | A | 88.222.244.84 | 🟠 Proxied`

**After:**  
`@ | A | 88.222.244.84 | ⚪ DNS only`

---

### Step 6: Update WWW Subdomain Record

Look for another record that shows:
```
Type: A
Name: www
Content: 88.222.244.84 (or some other IP)
Proxy status: 🟠 (orange cloud icon)
```

**What to do:**
1. Find this record in the list
2. Look at the **Proxy status** column
3. You'll see an **orange cloud icon** 🟠
4. **Click on the orange cloud icon**
5. It will turn **GRAY** ⚪
6. Click **"Save"** button (if it appears)

**Before:**  
`www | A | 88.222.244.84 | 🟠 Proxied`

**After:**  
`www | A | 88.222.244.84 | ⚪ DNS only`

---

### Step 7: Verify Both Records Are Gray

After completing steps 5 and 6, verify:

Your DNS records should now look like this:
```
Name    Type    Content          Proxy Status
@       A       88.222.244.84    ⚪ DNS only
www     A       88.222.244.84    ⚪ DNS only
```

**Both should show GRAY cloud (⚪ DNS only)**  
**NOT orange cloud (🟠 Proxied)**

---

### Step 8: Wait for DNS Propagation

1. **Wait 5-10 minutes** for DNS to propagate globally
2. DNS changes take time to spread across the internet
3. During this time, don't make any more changes

You can check propagation status here:
- https://www.whatsmydns.net/
- Enter: `tpsdhanvantariayurveda.com`
- Select: `A` record type
- Should eventually show: `88.222.244.84` worldwide

---

### Step 9: Test the Website

**After waiting 5-10 minutes:**

1. Open a **new incognito/private window** in your browser
2. Go to: **https://tpsdhanvantariayurveda.com/**
3. The page should load
4. Press: **Ctrl + Shift + R** (hard refresh)
5. Check if you see the new version

**How to verify new version:**
1. Login with: Shankaranherbaltreatment@gmail.com / 123456
2. Go to: **Settings** (gear icon or settings menu)
3. Look for: **"Backup & Restore"** section
4. If you see it → ✅ **NEW VERSION LOADED!**
5. If you don't see it → Still cached, wait longer

---

### Step 10: Get SSL Certificate

**After confirming the new version loads:**

The .com domain will now be showing a certificate warning because it's no longer using Cloudflare's SSL. We need to install Let's Encrypt SSL.

**I'll do this for you via SSH** - just let me know when you see the new version loading!

---

## 🎨 VISUAL GUIDE

### What the Orange vs Gray Cloud Means:

**🟠 Orange Cloud (Proxied) - CURRENT STATE - BAD**
```
User → Cloudflare Servers → Our Server (88.222.244.84)
      ↑ Caching old content here!
```

**⚪ Gray Cloud (DNS only) - WHAT WE WANT**
```
User → Directly to Our Server (88.222.244.84)
      ↑ No caching, always fresh!
```

---

## ✅ CHECKLIST

Use this to track your progress:

- [ ] Step 1: Logged into Cloudflare dashboard
- [ ] Step 2: Selected tpsdhanvantariayurveda.com domain
- [ ] Step 3: Purged all cache
- [ ] Step 4: Opened DNS Records page
- [ ] Step 5: Changed @ record from orange 🟠 to gray ⚪
- [ ] Step 6: Changed www record from orange 🟠 to gray ⚪
- [ ] Step 7: Verified both records show gray cloud ⚪
- [ ] Step 8: Waited 5-10 minutes for propagation
- [ ] Step 9: Tested in incognito window - new version loads
- [ ] Step 10: Informed me for SSL certificate installation

---

## 🆘 TROUBLESHOOTING

### "I don't see the orange cloud icon"
- Look in the **Proxy status** column
- It might be a toggle switch instead of a cloud icon
- Some Cloudflare interfaces show it differently
- Look for "Proxied" vs "DNS only" toggle

### "I can't find the DNS Records page"
- Make sure you selected the domain first (tpsdhanvantariayurveda.com)
- Look at the left sidebar
- Click "DNS" → "Records"
- If you don't see "DNS", you might not have permission

### "The record content shows a different IP"
- First: Turn the cloud to gray (DNS only)
- Then: Click "Edit" on the record
- Change Content/Target to: `88.222.244.84`
- Set TTL to: `Auto` or `1 minute`
- Click "Save"

### "I purged cache but still seeing old version"
1. Wait the full 5-10 minutes for DNS propagation
2. Try incognito/private browsing window
3. Hard refresh: Ctrl + Shift + R (or Cmd + Shift + R on Mac)
4. Clear your browser cache completely
5. Try a different browser
6. Check on mobile data (bypasses local DNS cache)

### "Website says 'SSL certificate invalid' after fix"
- This is NORMAL after switching from orange to gray cloud
- Cloudflare was providing SSL when proxied
- Now we need to install Let's Encrypt SSL on our server
- **Tell me when you reach this point** - I'll install SSL via SSH

---

## 📞 WHEN TO CONTACT ME

**Contact me (just reply here) when:**

1. ✅ **You completed all steps** - Tell me: "Done! What's next?"
2. 🆘 **You're stuck** - Tell me: "Stuck at step X" with screenshot if possible
3. ✅ **New version is loading** - Tell me: "I see the Backup & Restore section!"
4. 🔒 **SSL certificate warning** - Tell me: "Getting SSL warning" - I'll install cert

**I'm here to help!** Don't worry if you get stuck - just let me know which step is unclear.

---

## 🎯 CURRENT STATUS SUMMARY

### What's Working:
- ✅ .in domain: https://tpsdhanvantariayurveda.in/ (PERFECT)
- ✅ Server: 88.222.244.84 (HEALTHY)
- ✅ Application: Running on port 3011
- ✅ Backup API: Running on port 5000

### What Needs Fixing:
- ⚠️  .com domain: Cloudflare proxy still active (orange cloud)
- ⚠️  .com domain: Serving old cached content
- ⚠️  .com domain: SSL will need to be installed after DNS fix

### Next Step:
**👉 You need to complete Steps 5 & 6 in Cloudflare dashboard**
- Turn orange cloud 🟠 to gray cloud ⚪ for both @ and www records

---

**Remember**: 
- The .in domain already works perfectly!
- You can use it while fixing .com
- Both domains will work identically after this fix

**Once you complete the steps, just reply with:** "Done!" or "Completed Steps 1-7"

---

**Created**: January 25, 2026  
**Last Verification**: Cloudflare proxy still active (need to change orange to gray)
