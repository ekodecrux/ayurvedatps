# TPS Dhanvantari Ayurveda - Production Deployment

## Original Problem Statement
Deploy the GitHub repository `https://github.com/ekodecrux/ayurvedatps` to production at `https://tpsdhanvantariayurveda.in/` on VPS server `88.222.244.84`.

## Architecture
- **Tech Stack**: Hono.js + SQLite (D1) + Cloudflare Workers/Wrangler
- **Server**: Hostinger VPS (88.222.244.84)
- **Process Manager**: PM2
- **Web Server**: Nginx (reverse proxy)
- **Port**: 3011 (internal), accessed via HTTPS through Nginx
- **Domain**: https://tpsdhanvantariayurveda.in

## What Was Implemented (January 29, 2026)
1. **Verified existing deployment** at `/var/www/ayurveda`
2. **Fixed database schema issues**:
   - Created `admin_users` table with proper columns
   - Added `password_hash` column with SHA-256 hashed password
   - Created `sessions` table for authentication
   - Added `name` and `profile_picture` columns
3. **Verified Nginx configuration** pointing to port 3011
4. **Tested and confirmed login functionality**

## User Personas
- **Admin Users**: Clinic staff managing patients, appointments, prescriptions
- **Primary User**: Shankar Herbal Treatment (admin@example.com)

## Core Features
- Patient Management (CRUD)
- Herbs & Roots Prescription Management
- Payment Tracking
- Appointment Scheduling
- Reminder System
- Data Export (CSV/Excel/PDF)

## Admin Credentials
- **Email**: Shankaranherbaltreatment@gmail.com
- **Password**: 123456

## Server Access
- **IP**: 88.222.244.84
- **SSH**: root@88.222.244.84
- **Password**: Yourkpo@202526

## Status
- ✅ Site is LIVE at https://tpsdhanvantariayurveda.in
- ✅ Login working
- ✅ Dashboard accessible
- ✅ PM2 process stable

## Recent Fixes (February 2, 2026)

### Fix 1: "Entire Course" Value Display (P0 - FIXED)
**Issue**: 
1. "Entire Course" column was showing same value as "Completed Months"
2. In edit modal, "Entire Course" dropdown wasn't showing the saved value

**Root Cause**: 
1. The code was using `hr.total_course_months` (calculated from active medicines) instead of `hr.course` (user-selected value)
2. The dropdown value wasn't being parsed correctly from "10.0" string to integer 10

**Fix Applied**:
- Updated list view to use `parseInt(hr.course) || hr.total_course_months || 0`
- Updated edit modal to use `parseInt(hr.course) || 1` for dropdown
- Updated Excel export, PDF export, and summary view similarly
- Bumped cache version to 3.3.0

### Fix 2: Payment Collections Not Showing in Edit Modal (P0 - FIXED)
**Issue**: When editing a prescription in "Herbs & Roots", previously collected payment data was not displayed in the edit modal.

**Root Cause**: The `course_id` stored in `payment_collections` table could be "1" or "1.0" (TEXT type with inconsistent format). The frontend matching logic used strict string comparison, causing "1.0" != "1" mismatch.

**Fix Applied**:
- Updated `/var/www/ayurveda/public/static/app.js` to normalize `course_id` values using `String(parseInt(collection.course_id) || 1)` for consistent matching
- Added console logging for debugging

### Fix 3: Patient and Prescription Delete (P1 - FIXED)
**Issue**: Delete buttons for both Patients and Herbs & Roots were not working due to foreign key constraints in SQLite.

**Root Cause**: The DELETE API endpoints were only deleting the main record without first removing related records (medicines_tracking, payment_collections, appointments, etc.), causing SQLite foreign key constraint failures.

**Fix Applied**:
- Updated `DELETE /api/patients/:id` endpoint in `/var/www/ayurveda/src/index.tsx` to cascade delete:
  - medicines_tracking for all herbs_routes
  - payment_collections for all herbs_routes
  - herbs_routes
  - appointments
  - patient_diseases
  - reminders
  - Then finally the patient record
- Updated `DELETE /api/prescriptions/:id` endpoint to cascade delete:
  - medicines_tracking
  - payment_collections
  - Then the herbs_routes record

## Backlog (P0/P1/P2)
### P0 (Critical) - COMPLETED
- ~~Fix "Entire Course" value display~~ ✅
- ~~Fix payment collections not showing in edit modal~~ ✅

### P1 (High Priority)
- ~~Patient and Prescription delete functionality~~ ✅ FIXED (cascade delete implemented)
- Restore functionality (reported regression) - PENDING
- Verify `view` and `print` actions in "Herbs & Roots" section - PENDING

### P2 (Medium Priority)
- Consider password hashing best practices (bcrypt)
- Automated offsite backups
- SSL certificate renewal monitoring
- Frontend architecture refactor (stop editing built files directly)
