# Cloudflare API Token Setup Guide

**Date**: January 25, 2026  
**Issue**: Current token is invalid/expired  
**Error**: "No route for that URI" (Error 7000)

---

## 🔑 How to Get a Valid Cloudflare API Token

### Step 1: Log into Cloudflare
1. Go to: https://dash.cloudflare.com/
2. Log in with your credentials

### Step 2: Navigate to API Tokens
1. Click on your profile icon (top right)
2. Select **"My Profile"**
3. Click on **"API Tokens"** tab
4. Click **"Create Token"** button

### Step 3: Create Token with Correct Permissions
**Option A: Use Template (Recommended)**
1. Find template: **"Edit zone DNS"**
2. Click **"Use template"**
3. Under **Zone Resources**:
   - Zone: `tpsdhanvantariayurveda.com`
   - Or select "All zones" if you manage both .in and .com
4. Click **"Continue to summary"**
5. Click **"Create Token"**
6. **COPY THE TOKEN** (you can only see it once!)

**Option B: Custom Token (More Control)**
1. Click **"Create Custom Token"**
2. Token name: `Ayurveda DNS Manager`
3. Permissions:
   - Zone → Zone → Read
   - Zone → DNS → Edit
   - Zone → Cache Purge → Purge
4. Zone Resources:
   - Include → Specific zone → `tpsdhanvantariayurveda.com`
5. Click **"Continue to summary"**
6. Click **"Create Token"**
7. **COPY THE TOKEN**

### Step 4: Test the Token
Paste the new token here and I'll run automated tests.

---

## 🎯 What We'll Do With the Token

Once you provide a valid token, I will automatically:

1. ✅ **Purge Cloudflare cache** (clear old cached version)
2. ✅ **Update DNS records** to point to `88.222.244.84`
3. ✅ **Disable proxy** (change orange cloud to gray - DNS-only)
4. ✅ **Verify changes**

**Expected Time**: 2 minutes to execute + 5-10 minutes DNS propagation

---

## 🔄 Alternative: Manual Fix (No Token Needed)

If you prefer to do it manually without API:

### Quick Manual Fix (5 minutes)

1. **Log into Cloudflare Dashboard**
   - https://dash.cloudflare.com/

2. **Select Domain**
   - Click on `tpsdhanvantariayurveda.com`

3. **Purge Cache**
   - Left menu: **Caching** → **Configuration**
   - Click **"Purge Everything"**
   - Confirm: **"Purge Everything"**

4. **Update DNS to DNS-Only Mode**
   - Left menu: **DNS** → **Records**
   - Find A record for **@** (root)
     - Should point to: `88.222.244.84`
     - **Click the orange cloud** to make it **gray** (DNS-only)
     - Save
   - Find A record for **www**
     - Should point to: `88.222.244.84`
     - **Click the orange cloud** to make it **gray** (DNS-only)
     - Save

5. **Wait and Test**
   - Wait 5-10 minutes for DNS propagation
   - Visit: https://tpsdhanvantariayurveda.com/
   - Press: **Ctrl + Shift + R** (hard refresh)
   - Should now show the NEW version!

6. **Get SSL Certificate** (after DNS propagates)
   ```bash
   ssh root@88.222.244.84
   sudo certbot --nginx -d tpsdhanvantariayurveda.com -d www.tpsdhanvantariayurveda.com
   ```

---

## ✅ Current Status

- **✅ .in domain**: https://tpsdhanvantariayurveda.in/ - **WORKING PERFECTLY**
- **⚠️  .com domain**: https://tpsdhanvantariayurveda.com/ - **Serving old cached version**

### Working Domain Details
- **URL**: https://tpsdhanvantariayurveda.in/
- **Server**: 88.222.244.84:3011
- **SSL**: Let's Encrypt (Direct)
- **Login**: Shankaranherbaltreatment@gmail.com / 123456
- **Status**: ✅ Fully functional
- **Backup & Restore**: ✅ Working

---

## 📋 What You Need to Do

**Choose ONE option:**

### Option 1: Provide Valid Token (Automated - 2 min)
- Create token following Step 1-3 above
- Paste token here
- I'll run the automated script

### Option 2: Manual Fix (5 min)
- Follow "Quick Manual Fix" steps above
- No coding/terminal needed
- Just click through Cloudflare dashboard

### Option 3: Use .in Domain Only (0 min)
- Already working: https://tpsdhanvantariayurveda.in/
- Fix .com later
- Both domains use same database

---

## 🎯 Recommended Approach

**For fastest resolution**: Choose **Option 2 (Manual Fix)**
- No token setup needed
- Simple point-and-click
- Works in 5 minutes + propagation time

**Waiting for**: Your preference - which option would you like to use?

---

## 📞 Support

- **.in domain (working)**: https://tpsdhanvantariayurveda.in/
- **GitHub**: https://github.com/ekodecrux/ayurvedatps
- **Server**: 88.222.244.84
- **Login**: Shankaranherbaltreatment@gmail.com / 123456

---

**Last Updated**: January 25, 2026
