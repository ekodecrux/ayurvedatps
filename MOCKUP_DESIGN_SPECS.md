# PWA Mobile App - Exact Mockup Implementation

## ✅ CONFIRMED DESIGN SPECIFICATIONS

Based on the provided mockup screenshots, here are the EXACT design specifications:

### Color Palette
```css
/* Primary Colors */
--primary-green: #059669;
--light-mint-bg: #E8F5F0;

/* Stat Card Border Colors */
--stat-blue-border: #3B82F6;
--stat-blue-bg: #DBEAFE;
--stat-green-border: #10B981;
--stat-green-bg: #D1FAE5;
--stat-yellow-border: #F59E0B;
--stat-yellow-bg: #FEF3C7;

/* Action Button Colors */
--btn-green: #059669;
--btn-blue: #3B82F6;
--btn-red: #EF4444;
--btn-orange: #F59E0B;

/* Text Colors */
--text-dark: #1F2937;
--text-gray: #6B7280;
--text-light: #9CA3AF;

/* Background Colors */
--bg-white: #FFFFFF;
--bg-gray: #F3F4F6;
```

### Typography
```css
/* Font Family */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;

/* Font Sizes */
--text-xs: 12px;
--text-sm: 14px;
--text-base: 16px;
--text-lg: 18px;
--text-xl: 20px;
--text-2xl: 24px;
--text-3xl: 30px;
```

### Spacing
```css
/* Card Padding */
--card-padding: 16px;

/* Screen Padding */
--screen-padding: 16px;

/* Element Gaps */
--gap-xs: 4px;
--gap-sm: 8px;
--gap-md: 12px;
--gap-lg: 16px;
--gap-xl: 24px;
```

### Border Radius
```css
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-full: 999px;
```

## Screen Specifications

### 1. Login Screen
```
- Background: Light mint green (#E8F5F0)
- Logo: Green circle (80px) with white leaf icon
- Title: "TPS DHANVANTARI" (bold, dark green)
- Subtitle: "Ayurveda Clinic Management" (gray)
- Card: White, rounded (16px), centered
  - Email input with envelope icon
  - Password input with lock icon
  - Sign In button (green, full width, rounded)
- Footer: Security text (small, gray)
```

### 2. Navigation Header
```
- Background: Green (#059669)
- Height: 60px
- Layout: [3-dot menu] [5 icons swipeable] [Profile circle]
- Icons: Home, Patients, Appointments, Herbs, Reminders
- Profile: Circle with initial, white background
- Email display above icons (white text, small)
```

### 3. Dashboard
```
- Background: Light gray (#F3F4F6)
- Title: "Dashboard" with chart icon
- 3 Stat Cards:
  
  Card 1 (Total Patients):
  - Left border: Blue (4px)
  - Icon: People icon in light blue circle
  - Label: "Total Patients" (gray)
  - Value: Large number (dark)
  
  Card 2 (Today's Appointments):
  - Left border: Green (4px)
  - Icon: Calendar check in light green circle
  - Label: "Today's Appointments" (gray)
  - Value: Large number (dark)
  
  Card 3 (Pending Reminders):
  - Left border: Yellow (4px)
  - Icon: Bell in light yellow circle
  - Label: "Pending Reminders" (gray)
  - Value: Large number (dark)

- Recent Appointments section
- Upcoming Reminders section
```

### 4. Patients List
```
- Header: Green with "+ Add Patient" button (top right)
- Search bar with magnifying glass icon
- Filters: "All Countries" dropdown, CSV/Excel/PDF buttons
- Patient Cards:
  - White background, rounded corners
  - Name (bold, large) | Patient ID (gray, right)
  - Row 1: Person icon + Age/Gender | Phone icon + Number
  - Row 2: Flag icon + Country | Calendar icon + Added date
  - Actions: [View (green)] [Edit (blue)] [Delete (red)]
  - All buttons rounded, white text
```

### 5. Appointments
```
- Search bar with dropdown filter
- Empty state:
  - Large calendar icon (gray)
  - "No appointments found" (bold)
  - Subtitle text
  - "+ Add Appointment" button (green outline)
- FAB: Green circle (56px) with + icon and "Add Appointment" label
  - Position: Bottom right, 24px from edge
```

### 6. Herbs & Roots
```
- Title with leaf icon
- Search bar
- Export buttons: Excel (green), PDF (red)
- Cards with GREEN LEFT BORDER (4px):
  - Patient name (bold) | Patient ID link (blue, right)
  - Phone icon + number | Person icon + Age | Gender text
  - Calendar icon + Given Date
  - Clock icon + Entire Course | Green badge + Completed months
  - Calendar icon + Next Follow-up (orange background)
  - 4 circular action buttons (green): View, Edit, Print, Delete
```

### 7. Reminders
```
- Search and status filter
- Cards with COLORED LEFT BORDER (yellow or green, 4px):
  - Date (left) | Patient name (bold, large)
  - Phone icon + number
  - Reminder type badge (blue or green pill)
  - Message preview text
  - Status badge (Pending: yellow, Sent: green)
```

### 8. Patient Details
```
- Green header with back arrow
- Large circular avatar (80px) with initials
- Patient name (bold, large)
- Patient ID (blue link) + Active badge (green)

- CONTACT INFORMATION section (white card):
  - Phone with call button (green circle)
  - Email
  - Location

- PERSONAL DETAILS section (white card):
  - 2x2 grid: Age, Blood Group, Gender, Added date

- MEDICAL HISTORY section:
  - "Recent Prescriptions" with "View all" link
  - Prescription rows showing: Given date, Course, Status

- Bottom action buttons (full width):
  - Edit Patient (blue)
  - New Prescription (green)
  - Schedule Appointment (orange)
```

### 9. 3-Dot Menu
```
- White dropdown card with shadow
- Options:
  - Settings (gray icon + text)
  - Reports (gray icon + text)
  - Divider line
  - Logout (red icon + text)
```

## Implementation Priority

1. ✅ Login Screen (HIGHEST - entry point)
2. ✅ Navigation Header (HIGHEST - used everywhere)
3. ✅ Dashboard (HIGH - home screen)
4. ✅ Patients List (HIGH - most used)
5. ✅ Appointments (HIGH - core feature)
6. ✅ Herbs & Roots (HIGH - core feature)
7. ✅ Reminders (HIGH - core feature)
8. ⏳ Patient Details (MEDIUM - secondary screen)
9. ⏳ Forms/Modals (MEDIUM - add/edit functionality)
10. ⏳ PWA Features (MEDIUM - offline, install)

## Technical Approach

1. Start from scratch with clean HTML/CSS/JS
2. Use existing backend API (already working)
3. Implement pixel-perfect design matching mockups
4. Add PWA features (manifest, service worker)
5. Test on mobile devices
6. Deploy to Cloudflare Pages

## Estimated Time
- Core screens (1-7): 3-4 hours
- Patient details & forms: 1-2 hours
- PWA setup: 30 minutes
- Testing & fixes: 1 hour
- **Total: 5-7 hours**

Ready to start implementation!
