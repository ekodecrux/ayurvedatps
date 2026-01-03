# 🚀 Ayurveda Clinic - Production Deployment Guide

## 📦 Download Project
Download the project backup from: **https://www.genspark.ai/api/files/s/JfLrpFJ4**

Extract the tar.gz file to get the complete project.

---

## 🔧 Prerequisites

1. **Node.js** (v18 or higher)
2. **Cloudflare Account** (free account is fine)
3. **Cloudflare API Token** (already configured in your account)

---

## 📝 Step-by-Step Deployment

### Step 1: Install Dependencies

```bash
cd webapp
npm install
```

### Step 2: Login to Cloudflare

```bash
npx wrangler login
```

This will open a browser window to authenticate with Cloudflare.

### Step 3: Create Production D1 Database

```bash
npx wrangler d1 create ayurveda-db-prod
```

**Copy the database_id from the output!** It will look like: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

### Step 4: Update wrangler.jsonc

Edit `wrangler.jsonc` and add the D1 database configuration:

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "ayurveda-clinic",
  "compatibility_date": "2025-12-17",
  "pages_build_output_dir": "./dist",
  "compatibility_flags": [
    "nodejs_compat"
  ],
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "ayurveda-db-prod",
      "database_id": "YOUR_DATABASE_ID_HERE"
    }
  ]
}
```

Replace `YOUR_DATABASE_ID_HERE` with the database_id you copied in Step 3.

### Step 5: Apply Database Migrations

```bash
npx wrangler d1 migrations apply ayurveda-db-prod
```

This will create all the necessary tables in production.

### Step 6: Create Admin User in Production

```bash
npx wrangler d1 execute ayurveda-db-prod --command="
INSERT INTO admin_users (email, name, password_hash, created_at, updated_at) 
VALUES (
  'tpsdhanvantari@gmail.com', 
  'Nilesh',
  'e38ad214943daad1d64c102faec29de4afe9da3d',
  datetime('now'),
  datetime('now')
)"
```

**Login Credentials:**
- Email: `tpsdhanvantari@gmail.com`
- Password: `123456`

### Step 7: Build for Production

```bash
npm run build
```

This creates the `dist/` folder with production-ready files.

### Step 8: Create Cloudflare Pages Project

```bash
npx wrangler pages project create ayurveda-clinic --production-branch main
```

### Step 9: Deploy to Production

```bash
npx wrangler pages deploy dist --project-name ayurveda-clinic
```

**You will receive a URL like:**
- Production: `https://ayurveda-clinic.pages.dev`

---

## 🌐 Connect Your Domain (tpsdhanvantariayurveda.com)

### Option A: Via Cloudflare Dashboard (Easiest)

1. Go to: https://dash.cloudflare.com/
2. Navigate to: **Workers & Pages** → **ayurveda-clinic**
3. Click: **Custom domains** tab
4. Click: **Set up a custom domain**
5. Enter: `tpsdhanvantariayurveda.com`
6. Follow the DNS instructions provided

### Option B: Via Wrangler CLI

```bash
npx wrangler pages domain add tpsdhanvantariayurveda.com --project-name ayurveda-clinic
```

### Configure DNS in Hostinger

1. Login to Hostinger control panel
2. Go to **DNS/Name Servers** for `tpsdhanvantariayurveda.com`
3. Add these DNS records (provided by Cloudflare after adding domain):

**Example DNS Records:**
```
Type: CNAME
Name: @
Value: ayurveda-clinic.pages.dev
Proxy: Yes (Orange cloud)
```

**Wait 24-48 hours for DNS propagation** (usually takes 1-2 hours)

---

## 📊 Bind D1 Database to Pages Project

After deployment, bind the database:

```bash
npx wrangler pages deployment tail --project-name ayurveda-clinic
```

**Or via Cloudflare Dashboard:**
1. Go to **Workers & Pages** → **ayurveda-clinic** → **Settings**
2. Click **Functions** → **D1 database bindings**
3. Add binding:
   - Variable name: `DB`
   - D1 database: `ayurveda-db-prod`

---

## ✅ Verification

1. Visit: `https://ayurveda-clinic.pages.dev`
2. Login with:
   - Email: `tpsdhanvantari@gmail.com`
   - Password: `123456`
3. Test all features:
   - Patient management
   - Herbs & Roots records
   - Appointments
   - Reminders

---

## 🔄 Future Updates

To deploy updates:

```bash
npm run build
npx wrangler pages deploy dist --project-name ayurveda-clinic
```

---

## 🆘 Troubleshooting

### Database not connected
```bash
# Check database binding in dashboard
# Or add via CLI:
npx wrangler pages deployment tail --project-name ayurveda-clinic
```

### Domain not working
- Wait 24-48 hours for DNS propagation
- Check DNS settings in Hostinger match Cloudflare instructions
- Ensure CNAME points to: `ayurveda-clinic.pages.dev`

### Can't login
- Verify admin user exists:
```bash
npx wrangler d1 execute ayurveda-db-prod --command="SELECT email, name FROM admin_users"
```

---

## 📞 Support

If you encounter issues:
1. Check Cloudflare Pages deployment logs
2. Verify D1 database binding
3. Confirm DNS settings are correct

---

## 🎉 Success!

Once deployed, your application will be live at:
- **Production URL**: `https://ayurveda-clinic.pages.dev`
- **Custom Domain**: `https://tpsdhanvantariayurveda.com` (after DNS setup)

**All features working:**
✅ Admin authentication
✅ Patient management
✅ Herbs & Roots tracking
✅ Appointments & Reminders
✅ PDF/Excel exports
✅ WhatsApp integration (configure in Settings)
