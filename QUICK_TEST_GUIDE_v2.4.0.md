# 🔍 Quick Testing Guide - TPS DHANVANTARI v2.4.0

## Application Access
- **URL**: http://88.222.244.84:3001
- **Login**: Shankaranherbaltreatment@gmail.com
- **Password**: 123456

---

## ✅ Test Checklist (All Fixed)

### 1. Patient Export Test (Issue #1 ✅)
1. Navigate to **Patients** tab
2. Click **Export to Excel** button
3. Open downloaded Excel file
4. **Verify**: Column "Complete Address" exists with full formatted address
5. **Expected**: H.No, Street, Apartment, Area, District, State, Pincode

### 2. Add Herbs & Roots Test (Issue #2 ✅)
1. Navigate to **Herbs & Roots** tab
2. Click **Add New** button
3. Select patient: **IND00001 - Rajesh Kumar**
4. **Verify**: Patient info shows:
   - ✅ Complete address (all fields combined)
   - ✅ Additional phones (Home, Office, Emergency)
   - ✅ Primary phone with country code

### 3. View Herbs & Roots Test (Issue #3 & #4 ✅)
1. Navigate to **Herbs & Roots** tab
2. Click **View** on any prescription
3. **Verify** in Patient Information:
   - ✅ Complete address displayed
   - ✅ Additional phones listed
4. **Verify** in Medicine Details:
   - ✅ Quantity displayed for each medicine
   - ✅ Shows actual quantity value or "N/A"

### 4. Edit Herbs & Roots Test (Issue #5 & #6 ✅)
1. Navigate to **Herbs & Roots** tab
2. Click **Edit** on any prescription
3. **Verify** Patient Information shows:
   - ✅ Complete address
   - ✅ All additional phone numbers
4. **Verify** Medicine section has:
   - ✅ Quantity dropdown between "Medicine Name" and "Dosage Schedule"
   - ✅ Dropdown options: 1-10, 15, 20, 25, 30, 40, 50, 60, 75, 90, 100, 120, 150, 180, 200, 250, 300, 360
   - ✅ Current quantity value is pre-selected

### 5. Payment Status Test (Issue #7 ✅)
1. Navigate to **Herbs & Roots** tab
2. Click **View** on a prescription
3. Check **Course Details** section
4. **Verify** Payment Status:
   - ✅ Shows "Paid" (green) when fully paid (balance = 0)
   - ✅ Shows "Due" (red) when balance > 0
   - ✅ Balance calculation is correct
5. Click **Print** button
6. **Verify** print view also shows correct status

---

## 🎯 Quick Verification Commands

### Check Application Status
```bash
curl -I http://88.222.244.84:3001/
# Expected: HTTP/1.1 200 OK
```

### Test API Endpoints
```bash
# Get patient data
curl http://88.222.244.84:3001/api/patients/1

# Test export endpoint
curl "http://88.222.244.84:3001/api/patients/export?format=csv" -o test.csv

# Check stats
curl http://88.222.244.84:3001/api/stats
```

---

## 📋 Test Data Available

### Test Patient: Rajesh Kumar
- **Patient ID**: IND00001
- **Phone**: +91 9876543210
- **Additional Phones**:
  - Home: 080-12345678
  - Office: 9988776655
  - Emergency: 9876543211
- **Address**: 123, Plot 44 dno 14-24-64 11 road 3 Krishna devaraya nagar ph 2 beeramguda sangareddy dist, Koramangala, Bangalore, Karnataka, 560034
- **Diseases**: 
  - Diabetes Type 2
  - Hypertension
- **Prescriptions**: 1 prescription with medicines and payment collections

---

## ✅ All Issues Resolved

| Issue | Description | Status |
|-------|-------------|--------|
| #1 | Patient Excel Export - Complete Address | ✅ FIXED |
| #2 | Add Herbs - Missing Patient Info | ✅ FIXED |
| #3 | View Herbs - Missing Complete Address | ✅ FIXED |
| #4 | View Herbs - Missing Medicine Quantity | ✅ FIXED |
| #5 | Edit Herbs - Missing Patient Info | ✅ FIXED |
| #6 | Edit Medicine - Missing Quantity Dropdown | ✅ FIXED |
| #7 | Payment Status - Wrong Balance Calculation | ✅ FIXED |

**Success Rate**: 100% (7/7 issues resolved)

---

## 🚀 Version Information

- **Version**: v2.4.0
- **Deployment Date**: January 3, 2026
- **Status**: ✅ LIVE & FULLY FUNCTIONAL
- **Server**: 88.222.244.84:3001
- **PM2 Status**: Online

---

## 📞 Need Help?

If you encounter any issues:
1. Clear browser cache and reload
2. Check PM2 logs: `pm2 logs ayurveda-clinic`
3. Verify API endpoints are responding
4. Check browser console for errors

**All fixes are deployed and tested. Application is ready for use!** ✅
