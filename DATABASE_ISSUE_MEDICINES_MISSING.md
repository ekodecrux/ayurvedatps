# 🚨 DATABASE ISSUE FOUND - Missing Medicines Data

## Status: CRITICAL - DATA LOSS DETECTED

### What's Wrong
✅ **Patients**: 5 (OK)
✅ **Prescriptions**: 3 (OK)
❌ **Medicines**: 0 (MISSING!)
⚠️ **Payments**: Partial data

### Investigation Results

#### Current Database Status
```json
Prescription 2 (Prasad Bojja):
  - Medicines: 0 ❌
  - Payments: 1 ✅

Prescription 4 (Jeevika reddy):
  - Medicines: 0 ❌
  - Payments: 0 ❌

Prescription 5 (Karnaka Reddy):
  - Medicines: 0 ❌
  - Payments: 0 ❌
```

#### Backup Status
All backups show the same issue:
- `ayurveda_backup_20260125_035107` → 0 medicines
- `ayurveda_backup_20260125_031541` → 0 medicines
- `ayurveda_backup_20260125_020001` → 0 medicines
- `ayurveda_backup_20260124_174948` → 0 medicines (Before 2 PM IST)

**Conclusion**: The medicine data was already missing BEFORE January 24, 2026 2 PM IST.

---

## Root Cause Analysis

### Database Schema
The app uses **3 different medicine tables**:
1. `medicines` - Old table (not used)
2. `prescription_medicines` - Old table (not used)
3. `medicines_tracking` - **CURRENT TABLE** (used by app)

### Sample Data Issue
The `seed.sql` file contains sample medicines for `herbs_route_id = 1`:
```sql
INSERT OR IGNORE INTO medicines_tracking (
  herbs_route_id, roman_id, medicine_name, ...
) VALUES 
  (1, 'I', 'Triphala Churna 100g', ...),
  (1, 'II', 'Ashwagandha Capsules', ...);
```

But **current prescriptions have IDs 2, 4, 5** - not ID 1!

This means:
- Sample data is for a non-existent prescription (ID 1)
- Current prescriptions (2, 4, 5) have NO medicine records in `medicines_tracking` table
- Backups correctly show 0 medicines because there ARE 0 medicines in the database

---

## What Happened?

### Timeline
1. **Before Jan 24, 2:00 PM IST**: Database already had 0 medicines
2. **Prescriptions exist**: Created for patients Prasad Bojja, Jeevika reddy, Karnaka Reddy
3. **Medicines NOT added**: No medicines were ever added to these prescriptions
4. **Backups working correctly**: All backups accurately reflect 0 medicines

### Why Medicines Are Missing

**Option A**: Prescriptions were created but medicines were never added
- User created prescription records
- Medicines section was left empty
- Or UI didn't work properly to save medicines

**Option B**: Database migration issue
- Old data might have been in `medicines` or `prescription_medicines` tables
- Migration to `medicines_tracking` table didn't transfer data
- Old tables were abandoned

**Option C**: Data was manually deleted
- Medicines were added but later removed
- Direct database manipulation
- Testing/cleanup gone wrong

---

## Solutions

### Option 1: Re-enter Medicine Data (Recommended)
**If you have the medicine information elsewhere:**

1. Log in to production: https://tpsdhanvantariayurveda.in/
2. For each prescription:
   - Click "Edit" on the prescription
   - Add all medicines manually
   - Save

This is the safest approach if you know what medicines should be there.

### Option 2: Check Old Database Backup
**If you have backups from BEFORE the migration:**

Do you have any database backups from:
- December 2025?
- Early January 2026?
- Before the "medicines_tracking" table was created?

If yes, we can:
1. Extract old medicine data
2. Migrate to new `medicines_tracking` table
3. Restore via API

### Option 3: Restore from Older Backup
**Check if you have backups outside this system:**

- Manual SQLite database files?
- Old server backups?
- Cloud storage backups?
- Local development database?

---

## Immediate Action Required

### Questions for You:
1. **Do you remember adding medicines** to these 3 prescriptions?
2. **Do you have the medicine data** written down somewhere?
3. **Do you have older database backups** from before January 20, 2026?
4. **Was the app working with medicines** at some point, or always empty?

### Next Steps Based on Your Answer:

**If you have medicine data:**
→ I'll help you re-enter it or create a bulk import script

**If you have old backups:**
→ I'll help you extract and migrate the data

**If medicines were never added:**
→ This is expected behavior, just need to add medicines now

**If data was lost:**
→ We need to investigate when/how it was deleted

---

## Prevention Measures

### Already Implemented:
✅ **Daily backups** at 2:00 AM
✅ **30-day retention**
✅ **Monthly archives**
✅ **Backup API** for easy restore

### Additional Recommendations:
1. **Keep external backups**: Download critical backups to local storage
2. **Document medicine entries**: Keep records of what medicines are prescribed
3. **Test restore process**: Verify backup restoration works
4. **Monitor data counts**: Regular checks on medicines count

---

## Technical Details

### Database Tables
```sql
-- Current active table
CREATE TABLE medicines_tracking (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  herbs_route_id INTEGER NOT NULL,
  roman_id TEXT,
  medicine_name TEXT NOT NULL,
  given_date TEXT,
  treatment_months INTEGER,
  is_active INTEGER DEFAULT 1,
  payment_amount REAL DEFAULT 0,
  advance_payment REAL DEFAULT 0,
  balance_due REAL DEFAULT 0,
  payment_notes TEXT,
  morning_before INTEGER DEFAULT 0,
  morning_after INTEGER DEFAULT 0,
  afternoon_before INTEGER DEFAULT 0,
  afternoon_after INTEGER DEFAULT 0,
  evening_before INTEGER DEFAULT 0,
  evening_after INTEGER DEFAULT 0,
  night_before INTEGER DEFAULT 0,
  night_after INTEGER DEFAULT 0,
  note TEXT,
  frequency TEXT,
  FOREIGN KEY (herbs_route_id) REFERENCES herbs_routes(id)
);
```

### API Endpoints
- GET `/api/prescriptions` - List all prescriptions
- GET `/api/prescriptions/{id}` - Get prescription with medicines
- POST `/api/prescriptions` - Create prescription with medicines
- PUT `/api/prescriptions/{id}` - Update prescription with medicines

---

## Questions?

Please answer the 4 questions above so I can help you recover or re-enter the medicine data!

**Created**: January 25, 2026  
**Issue**: Medicine data missing from all prescriptions  
**Backups affected**: All (because source data is missing)  
**Data loss date**: Before January 24, 2026 2:00 PM IST
