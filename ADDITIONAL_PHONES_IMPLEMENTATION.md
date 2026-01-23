# Additional Phone Numbers Feature - Implementation Guide

## Overview
Add support for multiple phone numbers per patient with labels (e.g., Home, Office, Emergency, etc.)

## Database Schema
✅ **Already Implemented** - The `additional_phones` column exists in the patients table:
```sql
-- From migration 0003_tps_dhanvantri_updates.sql
ALTER TABLE patients ADD COLUMN additional_phones TEXT; 
-- JSON array format: [{"label": "Home", "number": "+91 9876543210"}, ...]
```

## Backend API
✅ **Already Implemented** - The API endpoints already support `additional_phones`:
- `POST /api/patients` - Line 690: `body.additional_phones || null`
- `PUT /api/patients/:id` - Line 747: `body.additional_phones || null`

## Frontend Implementation Needed

### 1. HTML Structure for Patient Form

Add this section after the primary phone number field in the patient form:

```html
<!-- Additional Phone Numbers -->
<div class="col-span-2">
  <label class="block text-sm font-medium text-gray-700 mb-2">
    Additional Phone Numbers
  </label>
  <div id="additionalPhonesContainer" class="space-y-2">
    <!-- Dynamic phone entries will be added here -->
  </div>
  <button 
    type="button" 
    onclick="addPhoneNumberField()" 
    class="mt-2 text-sm text-ayurveda-600 hover:text-ayurveda-700 flex items-center"
  >
    <i class="fas fa-plus-circle mr-1"></i>
    Add Another Phone Number
  </button>
</div>
```

### 2. JavaScript Functions to Add

Add these functions to `/home/user/webapp/public/static/app.js`:

```javascript
// Global array to track additional phones
let additionalPhones = [];

// Add a new phone number field
function addPhoneNumberField(label = '', number = '') {
  const container = document.getElementById('additionalPhonesContainer');
  const index = additionalPhones.length;
  
  const phoneEntry = document.createElement('div');
  phoneEntry.className = 'flex gap-2 items-center';
  phoneEntry.id = `phone-entry-${index}`;
  
  phoneEntry.innerHTML = `
    <select 
      class="px-3 py-2 border border-gray-300 rounded-md flex-shrink-0 w-32"
      onchange="updateAdditionalPhone(${index}, 'label', this.value)"
    >
      <option value="Home" ${label === 'Home' ? 'selected' : ''}>Home</option>
      <option value="Office" ${label === 'Office' ? 'selected' : ''}>Office</option>
      <option value="Mobile" ${label === 'Mobile' ? 'selected' : ''}>Mobile</option>
      <option value="Emergency" ${label === 'Emergency' ? 'selected' : ''}>Emergency</option>
      <option value="Other" ${label === 'Other' ? 'selected' : ''}>Other</option>
    </select>
    <input 
      type="tel" 
      placeholder="Phone Number" 
      value="${number}"
      class="flex-1 px-3 py-2 border border-gray-300 rounded-md"
      onchange="updateAdditionalPhone(${index}, 'number', this.value)"
    />
    <button 
      type="button"
      onclick="removePhoneNumberField(${index})"
      class="text-red-600 hover:text-red-800 px-2"
    >
      <i class="fas fa-trash"></i>
    </button>
  `;
  
  container.appendChild(phoneEntry);
  additionalPhones.push({ label: label || 'Home', number: number || '' });
}

// Update a phone entry
function updateAdditionalPhone(index, field, value) {
  if (additionalPhones[index]) {
    additionalPhones[index][field] = value;
  }
}

// Remove a phone number field
function removePhoneNumberField(index) {
  const entry = document.getElementById(`phone-entry-${index}`);
  if (entry) {
    entry.remove();
    additionalPhones[index] = null; // Mark as deleted
  }
}

// Get valid additional phones (non-null, with number)
function getAdditionalPhonesJSON() {
  const validPhones = additionalPhones.filter(p => p !== null && p.number.trim() !== '');
  return validPhones.length > 0 ? JSON.stringify(validPhones) : null;
}

// Clear additional phones (for new form)
function clearAdditionalPhones() {
  additionalPhones = [];
  const container = document.getElementById('additionalPhonesContainer');
  if (container) {
    container.innerHTML = '';
  }
}

// Load additional phones from patient data (for edit form)
function loadAdditionalPhones(patient) {
  clearAdditionalPhones();
  
  if (patient && patient.additional_phones) {
    try {
      const phones = typeof patient.additional_phones === 'string' 
        ? JSON.parse(patient.additional_phones) 
        : patient.additional_phones;
      
      if (Array.isArray(phones)) {
        phones.forEach(phone => {
          addPhoneNumberField(phone.label || 'Home', phone.number || '');
        });
      }
    } catch (e) {
      console.error('Error parsing additional phones:', e);
    }
  }
}
```

### 3. Modify Patient Form Submission

Update the form submission function to include additional phones:

```javascript
// In the savePatient() or handlePatientSubmit() function:
const patientData = {
  // ... existing fields ...
  name: document.getElementById('patientName').value,
  age: document.getElementById('patientAge').value,
  gender: document.getElementById('patientGender').value,
  phone: document.getElementById('patientPhone').value,
  email: document.getElementById('patientEmail').value,
  // ... other fields ...
  
  // Add this line:
  additional_phones: getAdditionalPhonesJSON()
};
```

### 4. Modify showAddPatientModal()

Clear additional phones when opening add modal:

```javascript
function showAddPatientModal() {
  clearAdditionalPhones(); // Clear previous entries
  // ... rest of the function
}
```

### 5. Modify showEditPatientModal()

Load additional phones when editing:

```javascript
function showEditPatientModal(patient) {
  // ... existing code to populate form fields ...
  
  // Load additional phones
  loadAdditionalPhones(patient);
  
  // ... rest of the function
}
```

## Testing Steps

1. **Add Patient with Additional Phones:**
   - Open "Add Patient" modal
   - Fill in basic details
   - Click "Add Another Phone Number"
   - Select label (Home/Office/Mobile/Emergency/Other)
   - Enter phone number
   - Add multiple phone numbers
   - Save patient
   - Verify in patient details view

2. **Edit Patient with Additional Phones:**
   - Open existing patient
   - Click "Edit Patient"
   - Existing additional phones should appear
   - Add new phone numbers
   - Remove phone numbers
   - Modify existing phone numbers
   - Save changes
   - Verify updates

3. **Display in Patient List:**
   - Additional phones should show in patient details
   - Export to Excel should include additional phones

## Files to Modify

1. **`/home/user/webapp/public/static/app.js`**
   - Add the JavaScript functions above
   - Modify form HTML generation
   - Update form submission handlers

2. **Database** (Already Complete)
   - ✅ Column exists: `additional_phones TEXT`
   - ✅ Stores JSON array

3. **Backend API** (Already Complete)
   - ✅ POST /api/patients accepts additional_phones
   - ✅ PUT /api/patients/:id accepts additional_phones

## Implementation Priority

1. ✅ Database schema - DONE
2. ✅ Backend API - DONE
3. ⚠️ Frontend UI - NEEDS IMPLEMENTATION
4. ⚠️ Form submission - NEEDS MODIFICATION
5. ⚠️ Edit form loading - NEEDS MODIFICATION

## Next Steps

Run the provided `fix_additional_phones.sh` script or manually:
1. Add the JavaScript functions to app.js
2. Add the HTML structure to patient forms
3. Test add/edit/display functionality
4. Rebuild and deploy: `npm run build && pm2 restart ayurveda-clinic`
