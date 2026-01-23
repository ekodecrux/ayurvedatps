# 🎯 TPS DHANVANTARI AYURVEDA - ACCESS INFORMATION

## ✅ SANDBOX DEMO ENVIRONMENT

### 🌐 Sandbox URL
**URL**: https://3000-i19pmgwbxafv8g6ewmjed-b9b802c4.sandbox.novita.ai

**Status**: ✅ **ONLINE AND WORKING**

**Note**: This sandbox URL is temporary and will expire after 1 hour of inactivity. The sandbox extends its lifetime when accessed.

---

## 🔐 LOGIN CREDENTIALS

### Admin/User Login:
- **Email**: `Shankaranherbaltreatment@gmail.com`
- **Password**: `123456`

**Important**: Please change the password after first login in production environment.

---

## 🌍 PRODUCTION ENVIRONMENT (Your Live Server)

### Production URL:
**URL**: https://tpsdhanvantariayurveda.in

**Status**: ✅ **ONLINE AND WORKING** (on Port 3011)

**Login Credentials**: Same as above
- **Email**: `Shankaranherbaltreatment@gmail.com`
- **Password**: `123456`

### Server Details:
- **IP Address**: 88.222.244.84
- **SSH User**: root
- **SSH Password**: Yourkpo@202526
- **Application Port**: 3011
- **Application Path**: /var/www/ayurveda/
- **PM2 Process Name**: ayurveda-clinic

---

## 📊 SANDBOX TECHNICAL DETAILS

### Application Configuration:
- **Framework**: Hono (Cloudflare Workers compatible)
- **Runtime**: Wrangler Pages Dev
- **Port**: 3000
- **Database**: SQLite (local file-based)
- **Database File**: ayurveda.db (created automatically)
- **Process Manager**: PM2

### PM2 Status:
```
┌────┬─────────────────────┬─────────┬────────┐
│ id │ name                │ status  │ port   │
├────┼─────────────────────┼─────────┼────────┤
│ 0  │ ayurveda-clinic     │ online  │ 3000   │
└────┴─────────────────────┴─────────┴────────┘
```

### Startup Command:
```bash
cd /home/user/webapp
npx wrangler pages dev dist --ip 0.0.0.0 --port 3000
```

---

## 🎯 FEATURES AVAILABLE

### Patient Management:
- ✅ Patient registration and profile management
- ✅ Medical history tracking
- ✅ Contact information (multiple phone numbers)
- ✅ Complete address management
- ✅ Patient search functionality

### Herbs & Roots Prescription:
- ✅ Multi-course prescription tracking
- ✅ Medicine dosage scheduling (Morning/Afternoon/Evening/Night)
- ✅ Medicine quantity management (1-360)
- ✅ Roman ID system for medicine identification
- ✅ Active/Inactive course status
- ✅ Treatment duration tracking (1-12 months)

### Payment Management:
- ✅ Course-wise payment tracking
- ✅ Payment collection recording
- ✅ Advance payment tracking
- ✅ Balance calculation
- ✅ Payment status (Paid/Due)
- ✅ Multiple payment methods
- ✅ Payment history

### Appointment System:
- ✅ Appointment scheduling
- ✅ Status tracking (Pending/Confirmed/Completed)
- ✅ Patient integration
- ✅ Appointment reminders

### Data Export:
- ✅ Patient list export (CSV/Excel)
- ✅ Complete address in exports
- ✅ Additional phone numbers included
- ✅ Prescription reports

---

## 🧪 TEST DATA AVAILABLE

### Test Patient:
- **Patient ID**: IND00001
- **Name**: Rajesh Kumar
- **Phone**: +91 9876543210
- **Features**: Has additional phones, complete address, prescriptions with payment collections

---

## 🚀 HOW TO ACCESS

### Sandbox Demo:
1. Click on: https://3000-i19pmgwbxafv8g6ewmjed-b9b802c4.sandbox.novita.ai
2. You'll see the login page
3. Enter credentials:
   - Email: `Shankaranherbaltreatment@gmail.com`
   - Password: `123456`
4. Click "Login"
5. You'll be redirected to the dashboard

### Production Site:
1. Open: https://tpsdhanvantariayurveda.in
2. **IMPORTANT**: Clear browser cache first (Ctrl+Shift+R)
3. Login with same credentials
4. Access the full production system

---

## 📝 NOTES

### Sandbox Environment:
- ✅ Fully functional demo environment
- ✅ Isolated database (changes don't affect production)
- ✅ Same features as production
- ⚠️ Temporary URL (expires after 1 hour of inactivity)
- ⚠️ Data resets when sandbox restarts

### Production Environment:
- ✅ Permanent URL
- ✅ Persistent data storage
- ✅ SSL/HTTPS enabled
- ✅ Backed by SQLite database
- ✅ PM2 process management with auto-restart

---

## 🔧 TROUBLESHOOTING

### If Sandbox URL doesn't load:
1. Wait 10-15 seconds for the application to start
2. Refresh the page
3. Check if PM2 process is running (it should be)

### If Login doesn't work:
1. Clear browser cache and cookies
2. Make sure you're using the exact credentials (case-sensitive)
3. Try in incognito/private mode

### If Production site shows 502 error:
1. Clear browser cache (Ctrl+Shift+R)
2. Wait 30 seconds and try again
3. The application is running on port 3011 now
4. Nginx should be proxying correctly

---

## 📞 SUPPORT INFORMATION

### GitHub Repository:
**URL**: https://github.com/ekodecrux/ayurvedatps

### Documentation Files:
- `README.md` - Project overview
- `FIX_SUMMARY.md` - Port conflict fix summary
- `PORT_CONFLICT_FIX_GUIDE.md` - Detailed troubleshooting
- `IMPLEMENTATION_GUIDE.md` - Complete implementation guide
- `VISUAL_DIAGRAM.md` - Visual explanation

---

## ✅ SUMMARY

**Sandbox Demo**: https://3000-i19pmgwbxafv8g6ewmjed-b9b802c4.sandbox.novita.ai  
**Production Site**: https://tpsdhanvantariayurveda.in  
**Login Email**: Shankaranherbaltreatment@gmail.com  
**Password**: 123456  

**Both environments are now ONLINE and WORKING!** 🎉

---

**Created**: January 15, 2026  
**Status**: ✅ Active  
**Version**: 2.4.0+
