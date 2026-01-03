# AYURVEDA APPLICATION - CRITICAL FIXES REQUIRED

## Date: January 3, 2026

## Summary of Issues

All 7 issues are related to displaying complete patient information (address fields and additional phones) and payment calculations in various sections of the application.

### Root Cause Analysis

1. **Missing Helper Functions**: No centralized functions to format complete address (8 fields) and additional phones
2. **Incomplete Data Display**: Views/Edits not showing all patient address fields
3. **Missing Quantity Field**: Medicine quantity not displayed in view/edit modes  
4. **Balance Calculation Bug**: Balance showing as "Due" even when fully paid

### Required Code Changes

#### 1. Add Helper Functions (Add after line 7, after `let currentUser = null;`)

```javascript
// Helper function to format complete address from 8 fields
function getCompleteAddress(patient) {
    if (!patient) return 'N/A';
    const parts = [];
    if (patient.address_hno) parts.push(patient.address_hno);
    if (patient.address_street) parts.push(patient.address_street);
    if (patient.address_apartment) parts.push(patient.address_apartment);
    if (patient.address_area) parts.push(patient.address_area);
    if (patient.address_district) parts.push(patient.address_district);
    if (patient.address_state) parts.push(patient.address_state);
    if (patient.address_pincode) parts.push(patient.address_pincode);
    return parts.length > 0 ? parts.join(', ') : 'N/A';
}

// Helper function to format additional phones from JSON
function getAdditionalPhonesHTML(patient) {
    if (!patient || !patient.additional_phones) return 'None';
    try {
        const phones = typeof patient.additional_phones === 'string' 
            ? JSON.parse(patient.additional_phones) 
            : patient.additional_phones;
        if (Array.isArray(phones) && phones.length > 0) {
            return phones.map(p => `<div>${p.label || 'Phone'}: ${p.number || ''}</div>`).join('');
        }
    } catch (e) {
        console.error('Error parsing additional phones:', e);
    }
    return 'None';
}

// Helper function for plain text additional phones (for print/export)
function getAdditionalPhonesText(patient) {
    if (!patient || !patient.additional_phones) return '';
    try {
        const phones = typeof patient.additional_phones === 'string' 
            ? JSON.parse(patient.additional_phones) 
            : patient.additional_phones;
        if (Array.isArray(phones) && phones.length > 0) {
            return phones.map(p => `${p.label || 'Phone'}: ${p.number || ''}`).join(', ');
        }
    } catch (e) {
        return '';
    }
    return '';
}

// Helper function to calculate balance correctly
function calculateBalance(totalAmount, totalCollected) {
    const amount = parseFloat(totalAmount || 0);
    const collected = parseFloat(totalCollected || 0);
    const balance = amount - collected;
    return {
        balance: balance,
        status: balance <= 0.01 ? 'Paid' : 'Due',  // Allow for small rounding errors
        formattedBalance: formatCurrency(Math.abs(balance))
    };
}
```

#### 2. Fix displayPatientInfo Function (Around line 1270)

Replace the entire function with:

```javascript
async function displayPatientInfo() {
  const selectElement = document.getElementById('prescription-patient');
  const patientId = selectElement?.value;
  
  if (!patientId) {
    document.getElementById('selected-patient-info').innerHTML = 
      '<p class="text-gray-500">Select a patient to view details</p>';
    return;
  }
  
  try {
    const res = await axios.get(`${API_BASE}/patients/${patientId}`);
    const patient = res.data.data;
    
    if (!patient) {
      document.getElementById('selected-patient-info').innerHTML = 
        '<p class="text-red-500">Patient not found</p>';
      return;
    }
    
    const completeAddress = getCompleteAddress(patient);
    const additionalPhones = getAdditionalPhonesHTML(patient);
    
    document.getElementById('selected-patient-info').innerHTML = `
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 class="font-semibold text-blue-800 mb-3">
          <i class="fas fa-user mr-2"></i>Selected Patient Information
        </h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div><span class="font-medium text-gray-700">Name:</span> <span class="text-gray-900">${patient.name}</span></div>
          <div><span class="font-medium text-gray-700">Patient ID:</span> <span class="text-gray-900">${patient.patient_id || 'N/A'}</span></div>
          <div><span class="font-medium text-gray-700">Age:</span> <span class="text-gray-900">${patient.age || 'N/A'}</span></div>
          <div><span class="font-medium text-gray-700">Gender:</span> <span class="text-gray-900">${patient.gender || 'N/A'}</span></div>
          <div><span class="font-medium text-gray-700">Primary Phone:</span> <span class="text-gray-900">${patient.country_code || ''} ${patient.phone}</span></div>
          <div><span class="font-medium text-gray-700">Email:</span> <span class="text-gray-900">${patient.email || 'N/A'}</span></div>
          <div class="md:col-span-2 border-t pt-2 mt-2">
            <span class="font-medium text-gray-700">Additional Phone Numbers:</span>
            <div class="text-gray-900 mt-1 ml-4">${additionalPhones}</div>
          </div>
          <div class="md:col-span-2 border-t pt-2 mt-2">
            <span class="font-medium text-gray-700">Complete Address:</span>
            <div class="text-gray-900 mt-1">${completeAddress}</div>
          </div>
          <div><span class="font-medium text-gray-700">Country:</span> <span class="text-gray-900">${patient.country || 'N/A'}</span></div>
          <div><span class="font-medium text-gray-700">Country Code:</span> <span class="text-gray-900">${patient.country_code || 'N/A'}</span></div>
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Error fetching patient info:', error);
    document.getElementById('selected-patient-info').innerHTML = 
      '<p class="text-red-500">Error loading patient information</p>';
  }
}
```

#### 3. Backend Fix for Patient Export (Fix Issue #1)

The patient export function calls `/api/patients/export` which is handled by the backend. 
The backend needs to be updated to include the complete address field in the export.

**Backend Changes Required** (in `_worker.js` or source TypeScript file):

In the `/patients/export` route, update the CSV/Excel generation to include:
- Complete address as a concatenated string of all 8 address fields
- Additional phones as comma-separated values

#### 4. Fix Medicine Quantity Display in View Mode

Search for where medicines are displayed in view mode and ensure quantity is shown.
Look for the medicine listing loop and add quantity display.

#### 5. Fix Balance Calculation in Print/View

In the `printHerbsRoutes` function (around line 2537), ensure balance is calculated correctly:

```javascript
// Use the helper function
const balanceInfo = calculateBalance(hr.total_amount, hr.total_collected);
// Display balanceInfo.formattedBalance and balanceInfo.status
```

### Backend API Updates Required

For complete fixes, the backend (`_worker.js` or source file) needs updates:

1. **GET /api/patients/:id** - Ensure it returns all address fields and additional_phones
2. **GET /api/patients/export** - Include complete address in export
3. **GET /api/prescriptions/:id** - Include medicine quantity field
4. **GET /api/prescriptions** - Include calculated balance and payment status

### Testing Checklist

- [ ] Patient List Excel export shows complete address
- [ ] Herbs & Roots Add - Patient info shows additional phones and complete address
- [ ] Herbs & Roots View - Patient info shows complete data
- [ ] Herbs & Roots View - Medicine quantity visible
- [ ] Herbs & Roots Edit - Patient info complete
- [ ] Herbs & Roots Edit - Quantity dropdown present  
- [ ] Herbs & Roots View/Print - Balance="Paid" when fully paid

### Deployment Steps

1. Apply frontend fixes to `public/static/app.js`
2. Rebuild application: `npm run build`
3. Restart server: `pm2 restart ayurveda-clinic`
4. Test all 7 issues
5. If backend changes needed, update source and rebuild

---

**Status**: Documentation complete. Ready to apply fixes.
**Next Action**: Apply helper functions and displayPatientInfo fix first, then test.
