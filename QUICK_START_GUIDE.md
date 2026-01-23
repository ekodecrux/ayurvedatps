# 🚀 QUICK START: Additional Phone Numbers for Referred By

## ✅ What's Been Done
I've successfully added the ability to add multiple phone numbers for the "Referred By" person in your patient management system - **exactly the same as the patient additional phones feature**.

---

## 🎯 Test It Right Now!

### 1. Open Sandbox
**URL**: https://3000-i19pmgwbxafv8g6ewmjed-b9b802c4.sandbox.novita.ai

### 2. Login
- **Email**: `admin@tpsdhanvantari.com`
- **Password**: `123456`

### 3. Add New Patient
1. Click **"Add Patient"** button
2. Fill required fields:
   - Name: Test Patient
   - Country: India (default)
   - Phone: 9876543210

3. Scroll to **"Referred By"** section
4. Fill:
   - Name: Dr. Sharma
   - Phone: 9123456789
   - Address: Chennai

5. Click **"+ Add Phone Number"** button
6. You'll see a new row appear:
   ```
   Label: [        ]  Phone Number: [              ]  [X Remove]
   ```

7. Fill in:
   - Label: `Home`
   - Phone Number: `9876543210`

8. Click **"+ Add Phone Number"** again
9. Fill in:
   - Label: `Office`
   - Phone Number: `9111222333`

10. **Save Patient**

### 4. Edit Patient
1. Find the patient you just created
2. Click **Edit** button
3. Scroll to "Referred By" section
4. You should see **both phone numbers** you added!
5. Try:
   - Adding a 3rd phone number
   - Removing one
   - Changing a number
6. **Save** and verify changes persist

---

## 📋 Features

### What You Can Do:
✅ Add unlimited phone numbers for referred by person  
✅ Custom labels (Home, Office, Mobile, Emergency, etc.)  
✅ Remove any phone number with one click  
✅ Edit existing phone numbers  
✅ All data persists in database  
✅ Shows up automatically when editing patient  

### Where It Appears:
- ✅ Add Patient Form → Referred By section
- ✅ Edit Patient Form → Referred By section
- ✅ Stored in database as JSON

---

## 🗂️ Technical Details

### Database:
```sql
-- New column added
ALTER TABLE patients 
ADD COLUMN referred_by_additional_phones TEXT;
```

### Data Format:
```json
[
  {"label": "Home", "number": "9876543210"},
  {"label": "Office", "number": "9111222333"}
]
```

### Files Changed:
- ✅ `migrations/0014_add_referred_by_additional_phones.sql` - Database
- ✅ `src/index.tsx` - Backend API + HTML
- ✅ `public/static/app.js` - Frontend logic
- ✅ All changes committed and pushed to GitHub

---

## 🚀 Deploy to Production

When you're ready to deploy to your live server:

```bash
# SSH to your server
ssh root@88.222.244.84

# Navigate to project
cd /var/www/ayurveda

# Pull latest code
git pull origin main

# Apply database migration
npx wrangler d1 migrations apply ayurveda-production

# Restart the service
pm2 restart ayurveda-clinic

# Verify it's running
pm2 status
curl http://localhost:3011/
```

---

## 📸 Visual Guide

### 1. Find "Referred By" Section
When you open Add/Edit Patient modal, scroll down to:
```
╔════════════════════════════════════════╗
║ Referred By                             ║
╠════════════════════════════════════════╣
║ Name:    [                        ]    ║
║ Phone:   [                        ]    ║
║ Address: [                        ]    ║
║                                         ║
║ Additional Phone Numbers (Referred By)  ║
║ [No phone numbers added yet]            ║
║ [+ Add Phone Number]   ← CLICK THIS    ║
╚════════════════════════════════════════╝
```

### 2. After Adding Phones
```
╔════════════════════════════════════════╗
║ Additional Phone Numbers (Referred By)  ║
╠════════════════════════════════════════╣
║ Label: [Home    ]  Number: [9876543210] [X] ║
║ Label: [Office  ]  Number: [9111222333] [X] ║
║ Label: [Mobile  ]  Number: [9999888877] [X] ║
║ [+ Add Phone Number]                    ║
╚════════════════════════════════════════╝
```

---

## 🎉 That's It!

The feature is **100% complete and ready to use**. 

No mistakes this time - I've added the feature exactly where you wanted it: **in the "Referred By" section**. 

Test it out and let me know if you need any adjustments! 🚀

---

## 📞 Support

If something doesn't work or you need changes:
1. Check PM2 status: `pm2 status`
2. Check logs: `pm2 logs ayurveda-clinic --nostream`
3. Verify migration: `npx wrangler d1 migrations list ayurveda-db --local`

All good? Great! Enjoy your new feature! 🎊
