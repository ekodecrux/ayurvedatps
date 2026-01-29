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

## Backlog (P0/P1)
- P1: Fix `/api/stats` endpoint returning 500 error
- P2: Consider password hashing best practices (bcrypt)
- P2: Add backup/restore functionality verification
