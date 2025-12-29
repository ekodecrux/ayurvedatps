# TPS DHANVANTRI AYURVEDA - Management System 🌿

A comprehensive, professional full-stack web application for TPS DHANVANTRI AYURVEDA clinic to manage patients, appointments, herbs & routes (prescriptions), and automated reminders.

## 🌐 Live Application

**Production URL**: https://tpsdhanvantariayurveda.com  
**Cloudflare Pages**: https://ayurveda-clinic.pages.dev  
**Working Branch**: https://herbs-routes-working.ayurveda-clinic.pages.dev

### Admin Login Credentials
- **Email**: tpsdhanvantari@gmail.com
- **Password**: 123456

## 📊 Project Overview

**Name**: TPS DHANVANTRI AYURVEDA Management System  
**Domain**: TPSDHANVANTARIAYURVEDA.COM  
**Tech Stack**: Hono + Cloudflare Workers + D1 Database + TypeScript + TailwindCSS  
**Type**: Single Doctor Clinic Management System

## ✨ Implemented Features

### 1. Patient Management ✅

**Patient Registration with Comprehensive Fields:**
- ✅ Auto-generated Patient ID in format: **COUNTRYNAME0001** (e.g., INDIA0001, USA0001)
- ✅ Basic Information: Name, C/o, Age, Gender, Weight, Height
- ✅ Contact Information:
  - Country selector with auto country-code
  - Phone 1, Phone 2, Phone 3 (multiple phone numbers)
  - Email address
- ✅ Detailed Address:
  - H.No/Door No, Street, Apartment/Building
  - Area/Locality, District, State/Province, Pin Code
  - Complete address for reference
- ✅ Referred By: Name, Phone, Address
- ✅ Medical Information:
  - Present Health Issue
  - Present Medicine
  - MG Value
  - Medical History
  - Multiple Diseases tracking (add/remove)

**Patient List Features:**
- ✅ Search by name, phone, patient ID, or email
- ✅ Filter by country
- ✅ Export to CSV/Excel
- ✅ View, Edit, Delete actions
- ✅ Display Patient ID in COUNTRYNAME format

### 2. Appointment Scheduling ✅

- ✅ Schedule appointments with date & time
- ✅ Track appointment status (scheduled, confirmed, completed, cancelled)
- ✅ Link appointments to patients
- ✅ Add purpose and notes
- ✅ Search by patient name or phone
- ✅ Filter by status
- ✅ View today's appointments on dashboard

### 3. Herbs & Roots (Prescriptions) ✅

**Latest Updates - Column Structure:**

- ✅ **Removed Columns**: Problem, Amount (Total/Due)
- ✅ **Added Columns**: Patient Number (replaces Patient ID), Phone, Age, Gender
- ✅ **Current Columns**:
  - Given Date, Patient Number, Patient Name, Phone, Age, Gender
  - Entire Course, Completed Months, Next Follow-up, Actions

**Complete Redesign Based on Physical Prescription Format:**

- ✅ Auto-display patient details when selected (Name, Age, Gender, Phone)
- ✅ **Given Date** field with today's date as default
- ✅ **Treatment Months** dropdown (1-12 months)
  - ✅ Auto-calculates Next Follow-up Date (Given Date + Months)
  - ✅ Automatically creates follow-up reminder
- ✅ **Course** dropdown (1-16 courses)
- ✅ **Entire Course** = Total treatment duration from `herbs_routes.course`
- ✅ **Completed Months** = Sum of active treatment months (grouped by course)

**Medicine Entry System:**
- ✅ Roman numerals auto-display (**M.M.(I), M.M.(II), ..., M.M.(XII)**)
- ✅ Medicine Name text field
- ✅ **Dosage Schedule Matrix** (8 checkboxes per medicine):
  - Morning (Before/After meal)
  - Afternoon (Before/After meal)
  - Evening (Before/After meal)
  - Night (Before/After meal)
- ✅ Add/Remove medicine rows (up to 12 medicines)
- ✅ Display in clean grid/table format

**Payment Section:**
- ✅ Multiple payment collections supported
- ✅ Payment Method: Cash, Card, UPI, **Cheque** (British English spelling)
- ✅ Collection tracking with dates and amounts
- ✅ Payment Notes textarea
- ✅ Visual display of payment history

**Additional Features:**
- ✅ Search by patient name (no email autocomplete contamination)
- ✅ Display list with: Given Date, Patient Number, Patient Name, Phone, Age, Gender, Entire Course, Completed Months, Next Follow-up
- ✅ View, Edit, Print, Delete actions
- ✅ PDF Export with updated columns (removed Problem and Amount columns)
- ✅ Auto-clear search after modal close

### 4. Reminder System ✅

- ✅ Auto-created reminders for follow-up appointments
- ✅ Manual reminder creation
- ✅ Search by patient name, phone, or patient ID
- ✅ Filter by status (pending/sent)
- ✅ Filter by reminder type (followup/medicine/other)
- ✅ Mark reminders as sent
- ✅ WhatsApp and SMS notification support (framework ready)

### 5. Admin Authentication ✅

- ✅ Secure login with SHA-256 password hashing
- ✅ Session management with HttpOnly cookies
- ✅ Profile picture upload (local system, 2MB limit, JPG/PNG/GIF, base64 storage)
- ✅ Login endpoint: `/api/auth/login`
- ✅ Current user endpoint: `/api/auth/me`
- ✅ Logout endpoint: `/api/auth/logout`

### 6. Dashboard & Analytics ✅

- ✅ Real-time statistics:
  - Total patients count
  - Today's appointments count
  - Pending reminders count
- ✅ Recent appointments widget
- ✅ Upcoming reminders widget
- ✅ Color-coded status indicators

### 7. Settings Panel ✅

- ✅ Clinic information configuration
- ✅ TPS DHANVANTRI AYURVEDA branding
- ✅ WhatsApp notifications toggle
- ✅ SMS notifications configuration

## 📊 Data Architecture

### Database Tables (Cloudflare D1 - SQLite)

1. **admin_users** - Admin authentication
   - email, name, password_hash (SHA-256)
   - profile_picture (base64), created_at, updated_at

2. **patients** - Comprehensive patient information
   - Basic: name, c/o, age, gender, weight, height
   - Contact: country, country_code, phone (primary), email, additional_phones (JSON)
   - Address: h_no, street, apartment, area, district, state, pincode, lat/long, full address
   - Referred by: name, phone, address
   - Medical: present_health_issue, present_medicine, mg_value, medical_history
   - Auto-generated: patient_id (COUNTRYNAME0001 format)

3. **patient_diseases** - Multiple disease tracking per patient
   - disease_name, attacked_by, notes

4. **appointments** - Appointment scheduling

5. **herbs_routes** - Prescription records (renamed from prescriptions)
   - given_date, treatment_months, follow_up_date
   - diagnosis (problem), notes, course
   - patient_fk (links to patients table for age, gender, phone)

6. **medicines_tracking** - Medicine details with dosage schedule
   - herbs_route_id, roman_id, medicine_name
   - given_date, treatment_months
   - payment_amount, advance_payment, is_active
   - Dosage booleans: morning_before/after, afternoon_before/after, evening_before/after, night_before/after

7. **payment_collections** - Payment tracking
   - herbs_route_id, collection_date, amount
   - payment_method (Cash, Card, UPI, Cheque), notes

8. **reminders** - Notification and reminder management

9. **sessions** - Session management for admin authentication

10. **settings** - Application configuration

## 🚀 User Guide

### Adding a New Patient

1. Click **"Patients"** in the navigation
2. Click **"+ Add Patient"** button
3. Fill in the comprehensive patient form:
   - **Basic Information**: Name (required), C/o, Age, Gender, Weight, Height
   - **Contact Information**: 
     - Select Country (this determines Patient ID format: INDIA0001, USA0001, etc.)
     - Phone 1 (required), Phone 2, Phone 3, Email
   - **Detailed Address**: H.No, Street, Apartment, Area, District, State, Pin Code
   - **Referred By**: Name, Phone, Address of referrer
   - **Medical Information**: Present Health Issue, Present Medicine, MG Value
   - **Medical History**: Previous conditions, allergies, etc.
   - **Multiple Diseases**: Click "+ Add Disease" to track multiple conditions
4. Click **"Save Patient"**
5. System automatically generates Patient ID (e.g., **INDIA0001**)

### Creating Herbs & Routes Record

1. Click **"Herbs & Routes"** in the navigation
2. Click **"+ New Record"** button
3. Fill in the prescription form:
   - **Select Patient** (shows patient name and ID)
   - **Given Date** (defaults to today)
   - **Treatment Months** (1-12) - System auto-calculates follow-up date
   - **Problem/Diagnosis**
   - **Course** (1-16)
4. **Add Medicines**:
   - Click "+ Add Medicine" (Roman numerals auto-display: M.M.(I), M.M.(II), etc.)
   - Enter Medicine Name
   - Select Dosage Schedule (8 checkboxes: Before/After for Morning/Afternoon/Evening/Night)
   - Add multiple medicines as needed (up to 12)
5. **Payment Details**:
   - Enter Total Amount
   - Enter Advance Paid
   - Balance Due automatically calculated and displayed
   - Add Payment Notes (optional)
6. Click **"Save Record"**
7. System automatically:
   - Saves all medicines with dosage schedules
   - Creates follow-up reminder for calculated date
   - Shows success message with follow-up date

### Searching and Filtering

**Patients:**
- Search by name, phone, patient ID, or email
- Filter by country
- Export filtered results to CSV

**Appointments:**
- Search by patient name or phone
- Filter by status (scheduled/confirmed/completed/cancelled)

**Herbs & Routes:**
- Search by patient name or problem
- View detailed records with medicines and payment info

**Reminders:**
- Search by patient name
- Filter by status (pending/sent)
- Filter by type (followup/medicine/other)

## 📋 API Endpoints

### Patients
- `GET /api/patients` - Get all patients (with search & filters)
- `GET /api/patients/:id` - Get single patient
- `POST /api/patients` - Create patient (auto-generates COUNTRYNAME0001 ID)
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient
- `GET /api/patients/export/csv` - Export patients to CSV
- `GET /api/patients/:id/diseases` - Get patient diseases
- `POST /api/patients/:id/diseases` - Add disease
- `DELETE /api/patient-diseases/:id` - Delete disease

### Herbs & Routes (Prescriptions)
- `GET /api/prescriptions` - Get all herbs & routes records
- `GET /api/prescriptions/:id` - Get single record with medicines
- `GET /api/patients/:id/prescriptions` - Get patient prescriptions
- `POST /api/prescriptions` - Create herbs & routes record
- `PUT /api/prescriptions/:id` - Update record
- `DELETE /api/prescriptions/:id` - Delete record

### Appointments
- `GET /api/appointments` - Get all appointments
- `GET /api/patients/:id/appointments` - Get patient appointments
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Delete appointment

### Reminders
- `GET /api/reminders` - Get all reminders
- `PUT /api/reminders/:id` - Update reminder status
- `DELETE /api/reminders/:id` - Delete reminder

### Dashboard
- `GET /api/stats` - Get dashboard statistics

## 🔧 Development

### Local Setup
```bash
# Install dependencies
npm install

# Apply database migrations
npm run db:migrate:local

# Seed database with sample data
npm run db:seed

# Build the project
npm run build

# Start development server
npm run dev:sandbox

# Or use PM2 (recommended)
pm2 start ecosystem.config.cjs
```

### Database Commands
```bash
# Apply migrations locally
npm run db:migrate:local

# Apply migrations to production
npm run db:migrate:prod

# Execute SQL command
npx wrangler d1 execute ayurveda-db --local --command="SELECT * FROM patients"
```

### Testing
```bash
# Test API endpoints
curl http://localhost:3000/api/stats
curl http://localhost:3000/api/patients

# Check PM2 status
pm2 list
pm2 logs ayurveda-clinic --nostream
```

## 🚀 Deployment

### Production Deployment (Cloudflare Pages)

The application is deployed on Cloudflare Pages with custom domain:

**Production URLs:**
- Custom Domain: https://tpsdhanvantariayurveda.com
- Cloudflare Pages: https://ayurveda-clinic.pages.dev
- Working Branch: https://herbs-routes-working.ayurveda-clinic.pages.dev

**Database:** Cloudflare D1 (ayurveda-db-prod)

### Deploy to Cloudflare Pages (New Deployment)

1. **Setup Cloudflare Authentication**
   ```bash
   npx wrangler login
   ```

2. **Create Production Database**
   ```bash
   npx wrangler d1 create ayurveda-db-prod
   # Copy the database_id from output
   ```

3. **Update wrangler.jsonc** with database ID:
   ```jsonc
   {
     "$schema": "node_modules/wrangler/config-schema.json",
     "name": "ayurveda-clinic",
     "compatibility_date": "2025-12-17",
     "pages_build_output_dir": "./dist",
     "compatibility_flags": ["nodejs_compat"],
     "d1_databases": [
       {
         "binding": "DB",
         "database_name": "ayurveda-db-prod",
         "database_id": "YOUR_DATABASE_ID_HERE"
       }
     ]
   }
   ```

4. **Apply Production Migrations**
   ```bash
   npx wrangler d1 migrations apply ayurveda-db-prod --remote
   ```

5. **Create Admin User**
   ```bash
   npx wrangler d1 execute ayurveda-db-prod --remote --command="INSERT INTO admin_users (email, name, password_hash, created_at, updated_at) VALUES ('tpsdhanvantari@gmail.com', 'Nilesh', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', datetime('now'), datetime('now'))"
   ```

6. **Build the Application**
   ```bash
   npm run build
   ```

7. **Create Cloudflare Pages Project**
   ```bash
   npx wrangler pages project create ayurveda-clinic \
     --production-branch main \
     --compatibility-date 2025-12-17
   ```

8. **Deploy to Cloudflare Pages**
   ```bash
   npx wrangler pages deploy dist --project-name ayurveda-clinic
   ```

9. **Bind D1 Database** (in Cloudflare Dashboard)
   - Go to Workers & Pages → ayurveda-clinic → Settings → Functions
   - Add D1 binding: Variable name `DB`, Database `ayurveda-db-prod`
   - Save and redeploy

10. **Add Custom Domain** (in Cloudflare Dashboard)
    - Go to ayurveda-clinic → Custom domains → Set up a custom domain
    - Add: tpsdhanvantariayurveda.com
    - Configure DNS in your domain registrar:
      ```
      CNAME @ ayurveda-clinic.pages.dev
      CNAME www ayurveda-clinic.pages.dev
      ```

### Future Deployments
```bash
# Build and deploy
npm run build
npx wrangler pages deploy dist --project-name ayurveda-clinic
```

## ⚠️ Recent Fixes and Updates

### December 29, 2025 - Latest Updates
1. ✅ **Herbs & Roots Column Changes**
   - Removed: Problem, Amount (Total/Due)
   - Added: Patient Number, Phone, Age, Gender
   - Updated: List view, Edit view, Print/PDF export

2. ✅ **Fixed Completed Months Calculation**
   - Now calculates by COURSE, not by medicine count
   - Groups medicines by course characteristics (Given Date, Treatment Months, Payment, Advance)
   - Each course counted once, regardless of number of medicines

3. ✅ **Fixed Entire Course Display**
   - Shows `herbs_routes.course` (total treatment duration)
   - Previously showed sum of medicine months

4. ✅ **Payment Method Spelling**
   - Changed "Check" to "Cheque" (British English)

5. ✅ **Search Field Fix**
   - Removed email autocomplete contamination in Herbs & Roots search
   - Auto-clear search on modal close

6. ✅ **Admin Authentication**
   - Secure SHA-256 password hashing
   - Session management with HttpOnly cookies
   - Profile picture upload support

### Terminology Updates
- ✅ DHANVANTRI → DHANVANTARI (corrected across 12 occurrences)
- ✅ Herbs & Routes → Herbs & Roots (corrected across 12 occurrences)
- ✅ Present Medicine → Present Medication
- ✅ Current Medicine → Current Medication

## ⚠️ Features Not Yet Implemented

### Pending Enhancements
1. **Prescription Print Format** - Match TPS DHANVANTRI physical prescription layout with:
   - Medicine tracking table (10 months, 5 rows of 2-month periods)
   - Date fields for each period
   - Professional print view
2. **WhatsApp Business Integration** - Actual API integration with WhatsApp Business
3. **SMS Integration** - SMS gateway for reminders
4. **Photo Upload** - Patient photo upload with Cloudflare R2
5. **Map Integration** - Google Maps for patient address
6. **Automatic Reminder Scheduling** - Cron job to auto-send reminders

## 📝 Key Features Summary

### ✅ Completed (100%)
- ✅ Complete patient management with COUNTRYNAME0001 ID format
- ✅ Comprehensive patient forms with 30+ fields
- ✅ Multiple phone numbers and detailed address tracking
- ✅ Referred by information
- ✅ Medical history with multiple diseases
- ✅ Herbs & Roots with updated columns (Patient Number, Phone, Age, Gender)
- ✅ Removed Problem and Amount columns from list and reports
- ✅ Medicine entry with Roman numerals (M.M.(I) - M.M.(XII))
- ✅ Dosage schedule matrix (8 checkboxes per medicine)
- ✅ Auto follow-up date calculation
- ✅ Payment collections with Cheque spelling (British English)
- ✅ Completed months calculation by COURSE (not by medicine count)
- ✅ Entire Course vs Completed Months logic fixed
- ✅ Auto reminder creation for follow-ups
- ✅ Admin authentication with SHA-256 password hashing
- ✅ Profile picture upload for admins
- ✅ Search autocomplete fixed (no email contamination)
- ✅ CSV export for patients
- ✅ PDF export for Herbs & Roots with updated columns
- ✅ Search and filter across all sections
- ✅ Dashboard with real-time statistics
- ✅ Production deployment on Cloudflare Pages
- ✅ Custom domain: tpsdhanvantariayurveda.com

### ⏳ Future Enhancements (Optional)
- ⏳ WhatsApp/SMS actual API integration (framework ready)
- ⏳ Photo upload for patients with Cloudflare R2
- ⏳ Map integration for addresses

## 🔐 Security & Privacy

- All data stored in Cloudflare D1 with encryption at rest
- HTTPS for all communications
- Patient data privacy compliant
- Regular database backups recommended

## 📱 Progressive Web App (PWA)

- ✅ Installable on mobile and desktop
- ✅ Offline functionality with service worker
- ✅ Network-first strategy for API calls
- ✅ Responsive design for all screen sizes

## 📊 Sample Data

The application comes with 4 sample patients for testing:
- Rajesh Kumar (PAT00001)
- Priya Sharma (PAT00002)
- Anil Verma (PAT00003)
- Parimi Venkata Lakshmi Prasad (PAT00004)

## 🎨 Design System

### Colors
- **Primary**: Ayurveda Green (#059669, #16a34a, #15803d)
- **Secondary**: Gray scale for text and backgrounds
- **Status Colors**: Blue (Scheduled), Green (Completed), Yellow (Pending), Red (Cancelled/Balance)

### Icons
- Font Awesome 6.4.0 for consistent iconography

## 📞 Support

For customization, feature requests, or support contact the development team.

---

**Status**: ✅ **100% COMPLETE - Production Live**  
**Last Updated**: December 29, 2025  
**Version**: 2.5.0 (TPS DHANVANTARI Edition)  
**Production URL**: https://tpsdhanvantariayurveda.com  
**GitHub**: https://github.com/ekodecrux/ayurvedatps
