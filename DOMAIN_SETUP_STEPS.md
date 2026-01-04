# Step-by-Step Domain Mapping Instructions
## Map tpsdhanvantariayurveda.in to Your Application

---

## Current Situation
- ✅ Your app is running at: http://88.222.244.84:3001/
- ❌ Your domain shows a parking page instead of your app
- 🎯 Goal: Make https://tpsdhanvantariayurveda.in show your application

---

## STEP-BY-STEP INSTRUCTIONS

### Step 1: Login to Hostinger Control Panel

1. Open your web browser
2. Go to: **https://hpanel.hostinger.com/**
3. Enter your login details:
   - **Email**: `parimi.prasad@gmail.com`
   - **Password**: `Yourkpo@202425`
4. Click **Login**

---

### Step 2: Navigate to Domain Settings

1. After logging in, you'll see the Hostinger dashboard
2. On the left sidebar, click on **Domains**
3. You'll see a list of your domains
4. Find and click on: **tpsdhanvantariayurveda.in**

---

### Step 3: Access DNS Management

1. In the domain overview page, look for tabs or sections
2. Click on **DNS / Name Servers** (or just **DNS**)
3. You'll see the current DNS records

---

### Step 4: Update DNS A Records

**Important**: You need to change where the domain points to

#### 4a. Find the Current A Records

Look for records that look like this:
```
Type: A
Name: @
Points to: 84.32.84.32  (or something similar)
```

#### 4b. Delete or Edit the @ Record

1. Find the A record with name **@**
2. Click the **Edit** or **Trash/Delete** icon next to it
3. If editing:
   - Change **Points to**: `88.222.244.84`
   - Click **Save**
4. If you deleted it, click **Add Record** and create:
   - **Type**: `A`
   - **Name**: `@`
   - **Points to**: `88.222.244.84`
   - **TTL**: `14400` (or leave default)
   - Click **Add Record** or **Save**

#### 4c. Update or Add the www Record

1. Find the A record with name **www**
2. Click **Edit** or **Delete** it
3. If editing:
   - Change **Points to**: `88.222.244.84`
   - Click **Save**
4. If you deleted it or it doesn't exist, click **Add Record**:
   - **Type**: `A`
   - **Name**: `www`
   - **Points to**: `88.222.244.84`
   - **TTL**: `14400` (or leave default)
   - Click **Add Record** or **Save**

#### 4d. Final DNS Records Should Look Like:

```
Type: A    Name: @      Points to: 88.222.244.84    TTL: 14400
Type: A    Name: www    Points to: 88.222.244.84    TTL: 14400
```

---

### Step 5: Save and Confirm

1. Make sure both records are saved
2. You should see a success message
3. Your DNS page should now show:
   - `@` pointing to `88.222.244.84`
   - `www` pointing to `88.222.244.84`

---

### Step 6: Wait for DNS Propagation

**Important**: DNS changes take time to spread across the internet

- **Minimum**: 5-10 minutes
- **Typical**: 1-2 hours
- **Maximum**: Up to 48 hours

You can check progress at: **https://dnschecker.org/**
- Enter: `tpsdhanvantariayurveda.in`
- It should show `88.222.244.84` in most locations

---

### Step 7: Test Your Domain (After Propagation)

#### 7a. Test in Command Line (if you have access)

```bash
# Check DNS
dig +short tpsdhanvantariayurveda.in
# Should show: 88.222.244.84

# Test HTTP
curl -I http://tpsdhanvantariayurveda.in
# Should return: HTTP/1.1 200 OK
```

#### 7b. Test in Browser

1. Open a **new incognito/private browser window** (to avoid cache)
2. Go to: `http://tpsdhanvantariayurveda.in`
3. You should see your **TPS DHANVANTARI AYURVEDA** application
4. Try logging in:
   - Email: `Shankaranherbaltreatment@gmail.com`
   - Password: `123456`

---

### Step 8: Set Up HTTPS/SSL Certificate

**After DNS is working (Step 7 confirms it works)**, add SSL:

1. Send me a message saying: "DNS is working, please set up SSL"
2. I will run commands on your server to:
   - Install free SSL certificate from Let's Encrypt
   - Configure automatic HTTPS redirect
   - Set up auto-renewal

**OR** if you want to do it yourself:

```bash
# SSH into your server
ssh root@88.222.244.84
# (Enter password: Yourkpo@202526)

# Install SSL certificate
sudo certbot --nginx -d tpsdhanvantariayurveda.in -d www.tpsdhanvantariayurveda.in \
  --non-interactive --agree-tos --email parimi.prasad@gmail.com --redirect

# You should see: "Successfully received certificate"
```

---

### Step 9: Final Testing with HTTPS

After SSL is installed:

1. Open browser (incognito/private mode)
2. Go to: `https://tpsdhanvantariayurveda.in`
3. You should see:
   - 🔒 **Secure padlock** in address bar
   - Your application loads over HTTPS
4. Also test: `http://tpsdhanvantariayurveda.in`
   - Should automatically redirect to HTTPS

---

## Quick Summary Checklist

- [ ] Step 1: Login to Hostinger hPanel
- [ ] Step 2: Go to Domains section
- [ ] Step 3: Click on tpsdhanvantariayurveda.in
- [ ] Step 4: Go to DNS settings
- [ ] Step 5: Update A record `@` to point to `88.222.244.84`
- [ ] Step 6: Update A record `www` to point to `88.222.244.84`
- [ ] Step 7: Save changes
- [ ] Step 8: Wait 1-2 hours for DNS propagation
- [ ] Step 9: Test domain in browser
- [ ] Step 10: Set up SSL certificate (I can help with this)
- [ ] Step 11: Test HTTPS

---

## Visual Guide - What to Look For

### In Hostinger DNS Panel:

**BEFORE (Current - Wrong):**
```
Type | Name | Points to        | TTL
-----|------|------------------|-------
A    | @    | 84.32.84.32     | 14400
A    | www  | 84.32.84.32     | 14400
```

**AFTER (Correct - What you need):**
```
Type | Name | Points to        | TTL
-----|------|------------------|-------
A    | @    | 88.222.244.84   | 14400
A    | www  | 88.222.244.84   | 14400
```

---

## Troubleshooting

### Problem: DNS records won't save
- **Solution**: Make sure you clicked "Save" or "Add Record"
- Try logging out and logging back in

### Problem: Still showing parking page after 2 hours
- **Check**: Did you change BOTH `@` and `www` records?
- **Test**: Try `http://88.222.244.84:3001` - does this work?
- **Clear**: Clear your browser cache or use incognito mode

### Problem: Can't find DNS settings in Hostinger
- **Look for**: "DNS Zone", "DNS Records", "Name Servers", or "DNS Management"
- **Alternative**: Search in Hostinger help docs or contact their support

---

## Important Notes

1. **Don't change Name Servers** - Only change the A records
2. **Keep other DNS records** - Only modify the A records for `@` and `www`
3. **DNS takes time** - Be patient, it can take up to 2 hours
4. **Use incognito mode** - To avoid seeing cached old pages

---

## Need Help?

**If you get stuck at any step:**

1. Take a screenshot of what you see in Hostinger
2. Tell me which step you're on
3. I'll guide you through it

**Or let me know when:**
- ✅ DNS changes are saved
- ✅ You can access http://tpsdhanvantariayurveda.in
- Then I'll set up SSL for you

---

## Final Result

After all steps are complete:

- ✅ `https://tpsdhanvantariayurveda.in` → Your application
- ✅ `https://www.tpsdhanvantariayurveda.in` → Your application  
- ✅ `http://tpsdhanvantariayurveda.in` → Redirects to HTTPS
- ✅ Secure padlock 🔒 in browser
- ✅ Professional URL for your clinic

---

**Start with Step 1 and let me know when you've completed Step 7 (DNS propagation) so I can help with SSL!**
