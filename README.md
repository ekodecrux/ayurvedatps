# 🏥 TPS DHANVANTARI AYURVEDA - Management System

[![Version](https://img.shields.io/badge/version-2.4.0-blue.svg)](https://github.com/ekodecrux/ayurvedatps)
[![Status](https://img.shields.io/badge/status-production-green.svg)](http://88.222.244.84:3001)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

A comprehensive Ayurveda clinic management system built with modern web technologies, deployed on Hostinger VPS.

## 🌟 Features

### Patient Management
- ✅ Complete patient registration with detailed information
- ✅ Medical history tracking
- ✅ Disease and medication records
- ✅ Multiple contact numbers support
- ✅ Complete address management
- ✅ Patient data export (CSV/Excel/PDF)

### Herbs & Roots Prescription Management
- ✅ Multi-course prescription tracking
- ✅ Medicine dosage scheduling (Morning/Afternoon/Evening/Night)
- ✅ Medicine quantity management with dropdown (1-360)
- ✅ Roman ID system for medicine identification
- ✅ Active/Inactive course status
- ✅ Treatment months tracking (1-12 months)

### Payment Management
- ✅ Course-wise payment tracking
- ✅ Payment collection recording
- ✅ Advance payment tracking
- ✅ Balance calculation with payment collections
- ✅ Payment status (Paid/Due) with accurate calculation
- ✅ Multiple payment methods support
- ✅ Payment notes and history

### Appointment System
- ✅ Appointment scheduling
- ✅ Status tracking (Pending/Confirmed/Completed)
- ✅ Patient information integration
- ✅ Appointment reminders

### Reminders
- ✅ WhatsApp integration for reminders
- ✅ SMS reminder support
- ✅ Follow-up date tracking
- ✅ Reminder status management

### Data Export
- ✅ Patient list export (CSV/Excel)
- ✅ Complete address in exports
- ✅ Additional phone numbers included
- ✅ Prescription reports (PDF/Excel)
- ✅ Print-friendly views

## 🚀 Technology Stack

### Backend
- **Framework**: Hono.js (Cloudflare Workers)
- **Runtime**: Cloudflare Workers
- **Database**: SQLite (D1)
- **Build Tool**: Vite
- **Language**: TypeScript

### Frontend
- **UI Framework**: Vanilla JavaScript
- **CSS Framework**: Tailwind CSS (CDN)
- **Icons**: Font Awesome 6
- **HTTP Client**: Axios
- **Utilities**: Lodash, Day.js

### Deployment
- **Server**: Hostinger VPS (88.222.244.84)
- **Process Manager**: PM2
- **Web Server**: Nginx (reverse proxy)
- **Port**: 3001

## 📦 Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Setup Steps

1. **Clone the repository**
```bash
git clone https://github.com/ekodecrux/ayurvedatps.git
cd ayurvedatps
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup database**
```bash
# Create local D1 database
npx wrangler d1 create webapp-production

# Update wrangler.jsonc with database ID

# Run migrations
npx wrangler d1 migrations apply webapp-production --local
```

4. **Development**
```bash
# Build the project
npm run build

# Start development server
npm run dev:sandbox
```

5. **Production Deployment**
```bash
# Deploy to Cloudflare Pages
npm run deploy

# Or deploy to VPS using PM2
pm2 start ecosystem.config.cjs
```

## 🗂️ Project Structure

```
ayurvedatps/
├── src/
│   ├── index.tsx           # Main Hono application
│   └── renderer.tsx        # SSR renderer
├── public/
│   └── static/
│       ├── app.js          # Frontend application
│       ├── styles.css      # Custom styles
│       └── ayurveda-logo.png
├── migrations/             # Database migrations
├── deploy-package/         # Deployment scripts
│   ├── ecosystem.config.cjs
│   └── start.sh
├── dist/                   # Built files
│   ├── _worker.js          # Compiled backend
│   └── static/             # Static assets
├── wrangler.jsonc          # Cloudflare configuration
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 🔧 Configuration

### Environment Variables
Create a `.dev.vars` file for local development:
```bash
# Add any environment variables here
```

### Database Configuration
Update `wrangler.jsonc`:
```json
{
  "name": "webapp",
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "webapp-production",
      "database_id": "your-database-id"
    }
  ]
}
```

### PM2 Configuration
`ecosystem.config.cjs`:
```javascript
module.exports = {
  apps: [{
    name: 'ayurveda-clinic',
    script: 'npx',
    args: 'wrangler pages dev dist --ip 0.0.0.0 --port 3001',
    env: {
      NODE_ENV: 'development',
      PORT: 3001
    }
  }]
}
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Patients
- `GET /api/patients` - List all patients
- `GET /api/patients/:id` - Get patient details
- `POST /api/patients` - Create new patient
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient
- `GET /api/patients/export?format=csv|excel` - Export patients

### Prescriptions
- `GET /api/prescriptions` - List all prescriptions
- `GET /api/prescriptions/:id` - Get prescription details
- `POST /api/prescriptions` - Create new prescription
- `PUT /api/prescriptions/:id` - Update prescription
- `DELETE /api/prescriptions/:id` - Delete prescription

### Appointments
- `GET /api/appointments` - List appointments
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Delete appointment

### Reminders
- `GET /api/reminders` - List reminders
- `POST /api/reminders` - Create reminder
- `PUT /api/reminders/:id` - Update reminder
- `DELETE /api/reminders/:id` - Delete reminder

### WhatsApp Integration
- `POST /api/send-whatsapp` - Send WhatsApp message

## 🎯 Recent Updates (v2.4.0)

### All 7 Issues Fixed ✅

1. **Patient Excel Export** - Added complete address column to CSV/Excel exports
2. **Add Herbs & Roots** - Fixed patient info display (address + phones)
3. **View Herbs & Roots** - Added complete address display
4. **View Herbs & Roots** - Added medicine quantity display
5. **Edit Herbs & Roots** - Fixed patient info display
6. **Edit Medicine** - Added quantity dropdown (1-360 options)
7. **Payment Status** - Fixed balance calculation (amount - totalCollected)

### Technical Improvements
- Added 4 helper functions for data formatting
- Improved address assembly logic
- Enhanced payment tracking with collections
- Better UI consistency across views

## 🚀 Deployment

### Production Server
- **URL**: http://88.222.244.84:3001
- **Server**: Hostinger VPS
- **Process Manager**: PM2
- **Status**: ✅ Online

### Deployment Commands
```bash
# Check PM2 status
pm2 status ayurveda-clinic

# View logs
pm2 logs ayurveda-clinic --lines 50

# Restart service
pm2 restart ayurveda-clinic

# Stop service
pm2 stop ayurveda-clinic
```

## 🔐 Default Credentials

**Admin Login**:
- Email: `Shankaranherbaltreatment@gmail.com`
- Password: `123456`

**Note**: Please change the password after first login in production.

## 📊 Database Schema

### Main Tables
- `patients` - Patient information
- `prescriptions` - Prescription records
- `medicines` - Medicine details per prescription
- `payment_collections` - Payment collection records
- `appointments` - Appointment scheduling
- `reminders` - Reminder system
- `admin_users` - System users

## 🧪 Testing

### Test Patient Available
- **Patient ID**: IND00001
- **Name**: Rajesh Kumar
- **Phone**: +91 9876543210
- **Has**: Additional phones, complete address, prescriptions with payment collections

### Testing Checklist
1. ✅ Login functionality
2. ✅ Patient CRUD operations
3. ✅ Prescription management
4. ✅ Payment tracking
5. ✅ Export functionality (CSV/Excel)
6. ✅ Appointment scheduling
7. ✅ Reminder system

## 📝 Documentation

Comprehensive documentation available in the repository:
- `FINAL_FIXES_COMPLETE_v2.4.0.md` - Complete fix documentation
- `QUICK_TEST_GUIDE_v2.4.0.md` - Testing instructions
- `DEPLOYMENT_SUMMARY_v2.4.0.md` - Deployment details
- `DOMAIN_MAPPING_COMPLETE_GUIDE.md` - Domain setup guide

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Ekode Crux** - *Initial work* - [ekodecrux](https://github.com/ekodecrux)

## 🙏 Acknowledgments

- Thanks to all contributors
- Hono.js framework team
- Cloudflare Workers platform
- Tailwind CSS team

## 📞 Support

For issues, questions, or contributions:
- **GitHub Issues**: [Create an issue](https://github.com/ekodecrux/ayurvedatps/issues)
- **Email**: Contact through GitHub profile

## 🔄 Version History

### v2.4.0 (January 3, 2026)
- ✅ Fixed all 7 reported issues
- ✅ Added complete address in exports
- ✅ Added quantity dropdown in medicine edit
- ✅ Fixed payment balance calculation
- ✅ Improved patient info display consistency

### v2.3.0
- Added payment collections feature
- Improved herbs & roots management
- Enhanced UI/UX

### v2.2.0
- Initial production deployment
- Core features implementation
- Patient and prescription management

---

**Status**: ✅ Production Ready | **Version**: 2.4.0 | **Last Updated**: January 3, 2026
