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

## User Personas
- **Admin Users**: Clinic staff managing patients, appointments, prescriptions
- **Primary User**: Shankar Herbal Treatment (Shankaranherbaltreatment@gmail.com)

## Core Features
- Patient Management (CRUD)
- Herbs & Roots Prescription Management
- Payment Tracking
- Appointment Scheduling
- Reminder System
- Data Export (CSV/Excel/PDF)
- Backup & Restore System

## Admin Credentials
- **Email**: Shankaranherbaltreatment@gmail.com
- **Password**: 123456

## Server Access
- **IP**: 88.222.244.84
- **SSH**: root@88.222.244.84
- **Password**: Yourkpo@202526

---

## What's Been Implemented

### Initial Deployment (January 29, 2026)
1. Verified existing deployment at `/var/www/ayurveda`
2. Fixed database schema issues (admin_users, sessions tables)
3. Verified Nginx configuration pointing to port 3011
4. Tested and confirmed login functionality

### Bug Fixes (February 2-3, 2026)

#### Fix 1: "Entire Course" Value Display ✅
- **Issue**: "Entire Course" column showing same value as "Completed Months"
- **Fix**: Updated code to use `parseInt(hr.course)` for user-selected value

#### Fix 2: Payment Collections Not Showing in Edit Modal ✅
- **Issue**: Payment data not displayed in edit modal
- **Fix**: Normalized `course_id` values using `String(parseInt(collection.course_id) || 1)`

#### Fix 3: Patient and Prescription Delete ✅
- **Issue**: Delete buttons not working due to foreign key constraints
- **Fix**: Added cascade delete in backend for patients and prescriptions

#### Fix 4: Backup & Restore Page Loading ✅
- **Issue**: Backup section showing "Loading backups..." indefinitely
- **Fix**: Added nginx proxy rule for `/api/backups/` to route to port 5000

#### Fix 5: Backup/Restore Data Integrity ✅
- **Issue**: Data loss/null values after restore
- **Fix**: Completely rewrote backup scripts to dynamically handle all columns

#### Fix 6: UI Label Changes ✅
- Changed "MG Value" label to "MG Value/Units"
- Added "Client Discussion" text field to patient form

### Feature Additions (February 3-4, 2026)

#### "Patient Added Date" Feature ✅ (VERIFIED - Auto Mode)
- Implemented in New Record, Edit Modal, View Modal, Print
- Backend joins `patients.created_at` as `patient_created_at`
- Frontend formats as "DD MMM YYYY" in green color

#### "Patient Added Date" - Manual Input (February 4, 2026) ✅
- **NEW**: Added manual date picker field at top of patient form
- Defaults to today's date for new patients
- Preserves existing date when editing
- Added `patient_added_date` column to database
- Updated backend INSERT and UPDATE queries
- Cache version: 3.9.0

#### Frequency Checkboxes - Mutual Exclusion (February 4, 2026) ✅
- **NEW**: "Daily" and "Alternate-day" now mutually exclusive
- Clicking one automatically unchecks the other
- Works in both New Record and Edit forms
- Added `handleFrequencyChange()` JavaScript function

---

## Prioritized Backlog

### P0 - Critical
- **Codebase Refactoring**: Stop editing built `app.js` directly. Set up proper source-based workflow with `vite build`.

### P1 - High Priority
- Full regression testing of all modules
- Automated offsite backups

### P2 - Medium Priority
- SSL certificate renewal monitoring
- Add "Patient Added Date" column to main Herbs & Roots list table

### P3 - Low Priority
- Code cleanup and optimization
- Performance monitoring

---

## Key Files Reference
- `/var/www/ayurveda/public/static/app.js` - Frontend logic (EDITED DIRECTLY - HIGH RISK)
- `/var/www/ayurveda/src/index.tsx` - Backend API and HTML template
- `/var/www/ayurveda/daily_backup.py` - Backup creation script
- `/var/www/ayurveda/restore_from_backup.sh` - Restore script
- `/var/www/ayurveda/backup_api_server.py` - Flask backup API
- `/etc/nginx/sites-available/tpsdhanvantariayurveda.in` - Nginx config

## Key API Endpoints
- `/api/patients`, `/api/patients/:id` - Patient CRUD
- `/api/prescriptions`, `/api/prescriptions/:id` - Prescription (Herbs & Roots) CRUD
- `/api/backups/list`, `/api/backups/create`, `/api/backups/restore` - Backup management

## DB Schema
- **patients**: {id, patient_id, name, phone, client_discussion, created_at, patient_added_date, ...}
- **herbs_routes**: {id, patient_fk, diagnosis, course, next_followup_date, ...}
- **payment_collections**: {id, herbs_route_id, course_id, collection_date, amount, ...}
- **appointments**: {id, patient_id, appointment_date, appointment_time, ...}
- **medicines_tracking**: {id, herbs_route_id, roman_id, medicine_id, is_daily, is_alternate_day, ...}

---

## Current Cache Version
**app.js?v=3.9.0** (Updated February 4, 2026)

## Status
- ✅ Site is LIVE at https://tpsdhanvantariayurveda.in
- ✅ All reported bugs fixed
- ✅ "Patient Added Date" manual input implemented
- ✅ Frequency checkbox mutual exclusion implemented
- ⚠️ High regression risk due to direct built-file editing
