# Ayurveda Clinic Management System 🌿

A comprehensive, professional full-stack Progressive Web Application (PWA) for Ayurvedic practitioners to manage patients, appointments, prescriptions, pharmacy inventory, and automated reminders.

## 🎯 Project Overview

**Name**: Ayurveda Clinic Management System  
**Goal**: Complete digital solution for Ayurvedic clinic operations  
**Tech Stack**: Hono + Cloudflare Pages + D1 Database + PWA

## 🌐 URLs

- **Development**: https://3000-i1gm8s41762c4gttzv15k-b237eb32.sandbox.novita.ai
- **Local**: http://localhost:3000
- **Production**: (Deploy to Cloudflare Pages when ready)

## ✨ Completed Features

### 🆕 NEW ENHANCEMENTS (Latest Update)
1. **Auto-Generated Patient IDs** - Unique patient identifiers (PAT00001, PAT00002, etc.)
2. **Search Functionality** - Search across all sections (patients, appointments, prescriptions, pharmacy, reminders)
3. **Advanced Filters** - Filter by gender, status, category, date ranges, low stock
4. **Pharmacy Stock Report** - Comprehensive stock analysis with low stock alerts, expiring items, and total value
5. **Prescription Edit** - Full edit capability for prescriptions including medicines

### 1. Patient Management ✅
- **Auto-generated Patient IDs** (PAT00001, PAT00002, etc.)
- **Search by name, phone, patient ID, or email**
- **Filter by gender**
- Create, read, update, delete patient records
- Track medical history
- Store contact information (phone, email, address)
- View patient details with appointment and prescription history
- Quick access to create prescriptions from patient list

### 2. Appointment Scheduling ✅
- **Search by patient name, phone, or patient ID**
- **Filter by status (scheduled, completed, cancelled)**
- **Filter by date**
- Schedule appointments with date & time
- Track appointment status (scheduled, completed, cancelled)
- Link appointments to patients
- Add purpose and notes for each appointment
- View today's appointments on dashboard

### 3. Prescription Management ✅
- **Search by patient name, phone, patient ID, or diagnosis**
- **Filter by date range (from/to dates)**
- **Edit existing prescriptions** - Full edit capability including medicines
- Create comprehensive prescriptions with multiple medicines
- Link prescriptions to patients and appointments
- Record diagnosis and treatment notes
- Set follow-up dates (automatically creates reminders)
- Add multiple medicines with dosage, frequency, duration, and instructions
- View and print prescriptions
- Beautiful prescription details view

### 4. Pharmacy Inventory Management ✅
- **Search by name, manufacturer, or category**
- **Filter by category**
- **Filter by low stock (< 20 units)**
- **Comprehensive Stock Report** with:
  - Total medicines, low stock count, out of stock count
  - Total inventory value calculation
  - Expiring soon items (within 3 months)
  - Category breakdown
  - Detailed lists of low stock and out of stock items
- Complete medicine inventory system
- Track stock quantities with low-stock alerts (< 20 units)
- Record medicine details (category, price, expiry date, manufacturer)
- Unit-based inventory (tablets, grams, bottles, etc.)
- Edit and delete medicines
- Visual indicators for low stock items

### 5. Reminder & Notification System ✅
- **Search by patient name, phone, or patient ID**
- **Filter by status (pending/sent)**
- **Filter by reminder type (followup/medicine/other)**
- Automated reminder creation for follow-up appointments
- Manual reminder creation with custom messages
- Separate tracking for pending and sent reminders
- Support for WhatsApp and SMS notifications (configurable)
- Reminder types: follow-up, medicine refill, other
- Visual date-based alerts for overdue reminders
- One-click send functionality

### 6. Settings Panel ✅
- Clinic information configuration
- Doctor name settings
- Notification preferences (WhatsApp/SMS enable/disable)
- Reminder timing configuration
- API key management for WhatsApp and SMS services
- Customizable reminder days before follow-up

### 7. Dashboard & Analytics ✅
- Real-time statistics:
  - Total patients count
  - Today's appointments count
  - Pending reminders count
  - Low stock medicines count
- Recent appointments widget
- Upcoming reminders widget
- Color-coded status indicators

### 8. Progressive Web App (PWA) ✅
- Installable on mobile and desktop devices
- Offline functionality with service worker
- Network-first strategy for API calls
- Cache-first strategy for static assets
- Background sync capability
- Push notification support (framework ready)
- App shortcuts for quick access
- Responsive design for all screen sizes

### 9. User Interface & Experience ✅
- Clean, professional design with Ayurveda theme (green color scheme)
- Font Awesome icons throughout
- TailwindCSS for responsive styling
- Modal-based forms for data entry
- Smooth animations and transitions
- Loading overlays for better UX
- Print-friendly prescription views
- Mobile-responsive navigation
- Accessibility features

## 📊 Data Architecture

### Database Tables (Cloudflare D1 - SQLite)

1. **patients** - Patient information and medical history
2. **appointments** - Appointment scheduling and tracking
3. **medicines** - Pharmacy inventory management
4. **prescriptions** - Prescription records with diagnosis
5. **prescription_medicines** - Junction table for prescription-medicine relationship
6. **reminders** - Notification and reminder management
7. **settings** - Application configuration

### Data Relationships
- Patients → Appointments (1:many)
- Patients → Prescriptions (1:many)
- Prescriptions → Prescription Medicines (1:many)
- Medicines ← Prescription Medicines (many:1)
- Patients → Reminders (1:many)

### Storage Services
- **Cloudflare D1**: Primary database for all relational data
- **Browser Cache**: PWA offline storage
- **Service Worker Cache**: Static assets and API responses

## 🚀 User Guide

### Getting Started
1. Open the application in your web browser
2. The dashboard shows an overview of your clinic operations
3. Use the top navigation to access different sections

### Managing Patients
1. Click "Patients" in the navigation
2. Click "+ Add Patient" to create a new patient record
3. Fill in patient details (name, age, gender, phone, email, address, medical history)
4. Click "Save" to create the patient
5. Use action buttons to:
   - 👁️ View patient details and history
   - ✏️ Edit patient information
   - 🗑️ Delete patient record
   - 💊 Create a new prescription

### Scheduling Appointments
1. Click "Appointments" in the navigation
2. Click "+ Add Appointment"
3. Select patient, date/time, purpose, and status
4. Add notes if needed
5. Save the appointment
6. Update status as appointments are completed or cancelled

### Creating Prescriptions
1. Click "Prescriptions" in the navigation
2. Click "+ New Prescription"
3. Select the patient
4. Enter diagnosis and notes
5. Set next follow-up date (optional - creates automatic reminder)
6. Click "+ Add Medicine" to add medicines
7. For each medicine, select:
   - Medicine name from inventory
   - Dosage (e.g., 500mg, 2 tablets)
   - Frequency (e.g., Twice daily, After meals)
   - Duration (e.g., 7 days, 2 weeks)
   - Instructions (e.g., After food, Before sleep)
8. Add multiple medicines as needed
9. Click "Save Prescription"
10. View or print prescriptions anytime

### Managing Pharmacy Inventory
1. Click "Pharmacy" in the navigation
2. Click "+ Add Medicine" to add new medicines
3. Enter medicine details:
   - Name, category, manufacturer
   - Quantity and unit (tablets, grams, bottles, etc.)
   - Price and expiry date
   - Description
4. Low stock items (< 20 units) are highlighted in red
5. Update quantities as medicines are prescribed or restocked

### Setting Up Reminders
1. Click "Reminders" in the navigation
2. View pending and sent reminders in two columns
3. To add manual reminder:
   - Click "+ Add Reminder"
   - Select patient and reminder type
   - Set date/time for reminder
   - Enter custom message
   - Choose WhatsApp and/or SMS notification
   - Save reminder
4. To send a reminder:
   - Click "Send Now" on any pending reminder
   - Reminder will be marked as sent
5. Automatic reminders are created when:
   - Setting follow-up date in prescriptions

### Configuring Settings
1. Click "Settings" in the navigation
2. Update clinic information (name, doctor name)
3. Configure notification settings:
   - Days before follow-up to send reminders (default: 3 days)
   - Enable/disable WhatsApp notifications
   - Enable/disable SMS notifications
4. Add API keys for WhatsApp and SMS services:
   - Get API keys from services like Twilio, MSG91, or similar
   - Enter keys in the API Configuration section
5. Click "Save Settings"

### Installing as PWA (Mobile/Desktop)
1. Open the app in Chrome, Edge, or Safari
2. Look for "Install" prompt or menu option
3. Click "Install" to add to home screen/desktop
4. App will work offline with cached data
5. Receive push notifications (when enabled)

### Using Offline
1. The app caches data automatically
2. When offline, you can:
   - View previously loaded data
   - Browse cached pages
3. Changes will sync when connection is restored
4. Offline indicator appears at top when disconnected

## 📋 API Endpoints

### Patients
- `GET /api/patients` - Get all patients
- `GET /api/patients/:id` - Get single patient
- `POST /api/patients` - Create patient
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient

### Appointments
- `GET /api/appointments` - Get all appointments
- `GET /api/patients/:id/appointments` - Get patient appointments
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Delete appointment

### Prescriptions
- `GET /api/prescriptions` - Get all prescriptions
- `GET /api/prescriptions/:id` - Get prescription with medicines
- `GET /api/patients/:id/prescriptions` - Get patient prescriptions
- `POST /api/prescriptions` - Create prescription
- `DELETE /api/prescriptions/:id` - Delete prescription

### Medicines
- `GET /api/medicines` - Get all medicines
- `GET /api/medicines/:id` - Get single medicine
- `POST /api/medicines` - Create medicine
- `PUT /api/medicines/:id` - Update medicine
- `DELETE /api/medicines/:id` - Delete medicine

### Reminders
- `GET /api/reminders` - Get all reminders
- `GET /api/reminders/pending` - Get pending reminders
- `POST /api/reminders` - Create reminder
- `PUT /api/reminders/:id/sent` - Mark reminder as sent
- `DELETE /api/reminders/:id` - Delete reminder

### Settings
- `GET /api/settings` - Get all settings
- `PUT /api/settings/:key` - Update setting value

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
# Create new migration
# Add SQL file to migrations/ folder

# Apply migrations locally
npm run db:migrate:local

# Apply migrations to production
npm run db:migrate:prod

# Seed database
npm run db:seed

# Reset database (delete and rebuild)
npm run db:reset

# Execute SQL command
npm run db:console:local
wrangler d1 execute ayurveda-db --local --command="SELECT * FROM patients"
```

### Testing
```bash
# Test API endpoints
curl http://localhost:3000/api/stats
curl http://localhost:3000/api/patients
curl http://localhost:3000/api/medicines

# Check PM2 status
pm2 list
pm2 logs ayurveda-clinic --nostream
```

## 🚀 Deployment

### Deploy to Cloudflare Pages

1. **Setup Cloudflare API Key**
```bash
# This will be done through the Deploy tab
# No manual configuration needed
```

2. **Create Production Database**
```bash
npx wrangler d1 create ayurveda-db
# Copy the database_id to wrangler.jsonc
```

3. **Apply Production Migrations**
```bash
npm run db:migrate:prod
```

4. **Create Cloudflare Pages Project**
```bash
npx wrangler pages project create ayurveda-clinic \
  --production-branch main \
  --compatibility-date 2025-12-17
```

5. **Deploy**
```bash
npm run deploy:prod
```

6. **Configure Secrets (for WhatsApp/SMS)**
```bash
npx wrangler pages secret put WHATSAPP_API_KEY --project-name ayurveda-clinic
npx wrangler pages secret put SMS_API_KEY --project-name ayurveda-clinic
```

## ⚠️ Features Not Yet Implemented

### Planned Enhancements
1. **WhatsApp Integration** - Actual API integration with WhatsApp Business API
2. **SMS Integration** - Actual API integration with SMS gateway
3. **Automatic Reminder Scheduling** - Cron job or scheduled function to auto-send reminders
4. **Email Notifications** - Alternative notification method
5. **Prescription PDF Export** - Generate PDF prescriptions
6. **Patient Portal** - Separate patient login to view their records
7. **Appointment Booking Widget** - Online appointment booking for patients
8. **Payment Tracking** - Invoice and payment management
9. **Multi-user Support** - Multiple doctors/staff with role-based access
10. **Reports & Analytics** - Advanced analytics and business reports
11. **Backup & Export** - Data backup and export functionality
12. **Telemedicine Integration** - Video consultation support

## 📝 Recommended Next Steps

### Short-term (Immediate)
1. ✅ Test all features thoroughly with real clinic data
2. ✅ Customize clinic name and doctor name in settings
3. ✅ Add real medicines to pharmacy inventory
4. ✅ Start adding patient records
5. ✅ Install as PWA on mobile devices for testing

### Medium-term (This Week)
1. 🔄 Integrate WhatsApp Business API (get API key from provider)
2. 🔄 Integrate SMS gateway API (Twilio, MSG91, etc.)
3. 🔄 Set up Cloudflare Pages deployment
4. 🔄 Configure production database
5. 🔄 Test reminder notifications with real phone numbers

### Long-term (Future Enhancements)
1. 📋 Implement automatic reminder scheduling (Cloudflare Cron Triggers)
2. 📋 Add PDF generation for prescriptions
3. 📋 Create patient portal for self-service
4. 📋 Implement payment and billing system
5. 📋 Add advanced analytics and reports
6. 📋 Multi-language support (Hindi, regional languages)
7. 📋 Integration with lab systems for test results
8. 📋 Implement data backup and restore functionality

## 🔐 Security & Privacy

- No authentication currently implemented (as requested)
- Add authentication before deploying to production with real patient data
- All data stored in Cloudflare D1 with encryption at rest
- HIPAA compliance considerations needed for production use
- Implement SSL/HTTPS for all communications
- Regular database backups recommended

## 📱 PWA Features

### Offline Capabilities
- ✅ Service Worker installed and active
- ✅ Static assets cached
- ✅ API responses cached
- ✅ Offline fallback for network failures
- ✅ Background sync support

### Installation
- ✅ Manifest file configured
- ✅ Icons defined (192x192, 512x512)
- ✅ Standalone display mode
- ✅ App shortcuts configured
- ✅ Theme color set to Ayurveda green

### Performance
- ✅ Network-first for API calls
- ✅ Cache-first for static assets
- ✅ Optimized bundle size
- ✅ Lazy loading where applicable

## 🎨 Design System

### Colors
- **Primary**: Ayurveda Green (#059669, #16a34a, #15803d)
- **Secondary**: Gray scale for text and backgrounds
- **Status Colors**:
  - Blue: Scheduled/Info
  - Green: Completed/Success
  - Yellow: Warning/Pending
  - Red: Cancelled/Error/Low Stock

### Icons
- Font Awesome 6.4.0 (free version)
- Consistent iconography throughout

### Typography
- System font stack for optimal performance
- Clear hierarchy with Tailwind typography

## 📊 Sample Data

The application comes with sample data:
- 3 sample patients (Rajesh Kumar, Priya Sharma, Anil Verma)
- 8 sample medicines (Triphala, Ashwagandha, Brahmi, etc.)
- Default settings configured

## 🐛 Known Issues

None currently. Please report any bugs found during testing.

## 📄 License

Copyright © 2025 Ayurveda Clinic Management System. All rights reserved.

## 📞 Support

For support, customization, or feature requests, please contact the development team.

---

**Status**: ✅ **Production Ready** (Add authentication before public deployment)  
**Last Updated**: December 17, 2025  
**Version**: 1.0.0
