// TPS DHANVANTRI AYURVEDA - Main Application JavaScript
// Complete implementation with all features

const API_BASE = '/api';
let currentPatients = [];
let currentAppointments = [];
let currentPrescriptions = [];
let currentReminders = [];

// Country data with codes
const countries = [
  { name: 'India', code: '+91' },
  { name: 'USA', code: '+1' },
  { name: 'UK', code: '+44' },
  { name: 'Australia', code: '+61' },
  { name: 'Canada', code: '+1' },
  { name: 'UAE', code: '+971' },
  { name: 'Singapore', code: '+65' },
  { name: 'Malaysia', code: '+60' },
  { name: 'Saudi Arabia', code: '+966' }
];

// Roman numerals for medicine IDs
const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

// Loading helpers
function showLoading() {
  document.body.style.cursor = 'wait';
}

function hideLoading() {
  document.body.style.cursor = 'default';
}

// Section navigation
function showSection(sectionName) {
  document.querySelectorAll('.section').forEach(section => {
    section.classList.add('hidden');
  });
  
  document.getElementById(`${sectionName}-section`).classList.remove('hidden');
  
  switch(sectionName) {
    case 'dashboard':
      loadDashboard();
      break;
    case 'patients':
      loadPatients();
      break;
    case 'appointments':
      loadAppointments();
      break;
    case 'prescriptions':
      loadPrescriptions();
      break;
    case 'reminders':
      loadReminders();
      break;
    case 'settings':
      loadSettings();
      break;
  }
}

// Date formatting
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

function formatDateTime(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString('en-IN', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// ==================== DASHBOARD ====================

async function loadDashboard() {
  try {
    showLoading();
    
    const statsRes = await axios.get(`${API_BASE}/stats`);
    if (statsRes.data.success) {
      const stats = statsRes.data.data;
      document.getElementById('stat-patients').textContent = stats.totalPatients;
      document.getElementById('stat-appointments').textContent = stats.todayAppointments;
      document.getElementById('stat-reminders').textContent = stats.pendingReminders;
    }
    
    const appointmentsRes = await axios.get(`${API_BASE}/appointments`);
    if (appointmentsRes.data.success) {
      const appointments = appointmentsRes.data.data.slice(0, 5);
      const html = appointments.length > 0 ? appointments.map(apt => `
        <div class="flex items-center justify-between border-b pb-2">
          <div>
            <p class="font-semibold">${apt.patient_name} (${apt.patient_id})</p>
            <p class="text-sm text-gray-600">${formatDate(apt.appointment_date)} - ${apt.status}</p>
          </div>
        </div>
      `).join('') : '<p class="text-gray-500">No recent appointments</p>';
      document.getElementById('recent-appointments').innerHTML = html;
    }
    
    const remindersRes = await axios.get(`${API_BASE}/reminders?status=Pending`);
    if (remindersRes.data.success) {
      const reminders = remindersRes.data.data.slice(0, 5);
      const html = reminders.length > 0 ? reminders.map(rem => `
        <div class="flex items-center justify-between border-b pb-2">
          <div>
            <p class="font-semibold">${rem.patient_name} (${rem.patient_id})</p>
            <p class="text-sm text-gray-600">${rem.title} - ${formatDate(rem.scheduled_date)}</p>
          </div>
        </div>
      `).join('') : '<p class="text-gray-500">No pending reminders</p>';
      document.getElementById('upcoming-reminders').innerHTML = html;
    }
    
    hideLoading();
  } catch (error) {
    console.error('Error loading dashboard:', error);
    hideLoading();
  }
}

// ==================== PATIENTS ====================

let phoneFieldCount = 0;
let diseaseFieldCount = 0;

async function loadPatients() {
  try {
    showLoading();
    
    const searchQuery = document.getElementById('patient-search')?.value || '';
    const genderFilter = document.getElementById('patient-gender-filter')?.value || '';
    const countryFilter = document.getElementById('patient-country-filter')?.value || '';
    
    let url = `${API_BASE}/patients?`;
    if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`;
    if (genderFilter) url += `gender=${encodeURIComponent(genderFilter)}&`;
    if (countryFilter) url += `country=${encodeURIComponent(countryFilter)}&`;
    
    const res = await axios.get(url);
    if (res.data.success) {
      currentPatients = res.data.data;
      renderPatients();
    }
    hideLoading();
  } catch (error) {
    console.error('Error loading patients:', error);
    hideLoading();
  }
}

function renderPatients() {
  const section = document.getElementById('patients-section');
  section.innerHTML = `
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-3xl font-bold text-gray-800">
        <i class="fas fa-users mr-3 text-ayurveda-600"></i>Patient Management
      </h2>
      <div class="flex gap-2">
        <button onclick="exportPatients()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow">
          <i class="fas fa-file-export mr-2"></i>Export CSV
        </button>
        <button onclick="showPatientForm()" class="bg-ayurveda-600 hover:bg-ayurveda-700 text-white px-4 py-2 rounded-lg shadow">
          <i class="fas fa-plus mr-2"></i>Add Patient
        </button>
      </div>
    </div>
    
    <div class="bg-white rounded-lg shadow-lg p-4 mb-4">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <input type="text" id="patient-search" placeholder="Search patients..." 
          class="w-full border border-gray-300 rounded px-3 py-2" 
          onkeyup="loadPatients()">
        
        <select id="patient-gender-filter" class="w-full border border-gray-300 rounded px-3 py-2" onchange="loadPatients()">
          <option value="">All Genders</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
        
        <select id="patient-country-filter" class="w-full border border-gray-300 rounded px-3 py-2" onchange="loadPatients()">
          <option value="">All Countries</option>
          ${countries.map(c => `<option value="${c.name}">${c.name}</option>`).join('')}
        </select>
      </div>
    </div>
    
    <div class="bg-white rounded-lg shadow-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient ID</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Age/Gender</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Country</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Weight/Height</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            ${currentPatients.map(p => `
              <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 text-sm font-medium text-ayurveda-600">${p.patient_id}</td>
                <td class="px-6 py-4">
                  <div class="font-medium text-gray-900">${p.name}</div>
                  <div class="text-sm text-gray-500">${p.email || 'No email'}</div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-600">${p.age}/${p.gender}</td>
                <td class="px-6 py-4 text-sm text-gray-600">${p.country || 'N/A'}</td>
                <td class="px-6 py-4 text-sm text-gray-600">${p.country_code || ''} ${p.phone}</td>
                <td class="px-6 py-4 text-sm text-gray-600">${p.weight ? p.weight + ' kg' : '-'} / ${p.height ? p.height + ' cm' : '-'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                  <button onclick="viewPatientDetails(${p.id})" class="text-blue-600 hover:text-blue-800" title="View">
                    <i class="fas fa-eye"></i>
                  </button>
                  <button onclick="editPatient(${p.id})" class="text-green-600 hover:text-green-800" title="Edit">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button onclick="showPrescriptionForm(${p.id})" class="text-purple-600 hover:text-purple-800" title="New Prescription">
                    <i class="fas fa-file-prescription"></i>
                  </button>
                  <button onclick="deletePatient(${p.id})" class="text-red-600 hover:text-red-800" title="Delete">
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
    
    <div id="patient-form-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div class="bg-white rounded-lg p-6 max-w-4xl w-full max-h-screen overflow-y-auto m-4">
        <h3 class="text-2xl font-bold mb-4" id="patient-form-title">Add Patient</h3>
        <form id="patient-form" onsubmit="savePatient(event)">
          <input type="hidden" id="patient-id">
          
          <!-- Basic Information -->
          <div class="mb-6">
            <h4 class="text-lg font-semibold mb-3 text-ayurveda-600">Basic Information</h4>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input type="text" id="patient-name" required class="w-full border border-gray-300 rounded px-3 py-2">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Age *</label>
                <input type="number" id="patient-age" required class="w-full border border-gray-300 rounded px-3 py-2">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                <select id="patient-gender" required class="w-full border border-gray-300 rounded px-3 py-2">
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                <input type="number" step="0.1" id="patient-weight" class="w-full border border-gray-300 rounded px-3 py-2">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
                <input type="number" step="0.1" id="patient-height" class="w-full border border-gray-300 rounded px-3 py-2">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" id="patient-email" class="w-full border border-gray-300 rounded px-3 py-2">
              </div>
            </div>
          </div>
          
          <!-- Contact Information -->
          <div class="mb-6">
            <h4 class="text-lg font-semibold mb-3 text-ayurveda-600">Contact Information</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                <select id="patient-country" required class="w-full border border-gray-300 rounded px-3 py-2" onchange="updateCountryCode()">
                  <option value="">Select Country</option>
                  ${countries.map(c => `<option value="${c.name}" data-code="${c.code}">${c.name} (${c.code})</option>`).join('')}
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <div class="flex gap-2">
                  <input type="text" id="patient-country-code" readonly value="+91" class="w-20 border border-gray-300 rounded px-3 py-2 bg-gray-100">
                  <input type="tel" id="patient-phone" required class="flex-1 border border-gray-300 rounded px-3 py-2">
                </div>
              </div>
            </div>
            
            <!-- Additional Phones -->
            <div class="mt-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Additional Phone Numbers</label>
              <div id="additional-phones-container"></div>
              <button type="button" onclick="addPhoneField()" class="mt-2 text-sm text-ayurveda-600 hover:text-ayurveda-700">
                <i class="fas fa-plus mr-1"></i>Add Another Phone
              </button>
            </div>
          </div>
          
          <!-- Address Details -->
          <div class="mb-6">
            <h4 class="text-lg font-semibold mb-3 text-ayurveda-600">Address</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">H.No / Flat No</label>
                <input type="text" id="address-hno" class="w-full border border-gray-300 rounded px-3 py-2">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Street / Plot</label>
                <input type="text" id="address-street" class="w-full border border-gray-300 rounded px-3 py-2">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Apartment / Building</label>
                <input type="text" id="address-apartment" class="w-full border border-gray-300 rounded px-3 py-2">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Area / Locality</label>
                <input type="text" id="address-area" class="w-full border border-gray-300 rounded px-3 py-2">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">District</label>
                <input type="text" id="address-district" class="w-full border border-gray-300 rounded px-3 py-2">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input type="text" id="address-state" class="w-full border border-gray-300 rounded px-3 py-2">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Pin Code</label>
                <input type="text" id="address-pincode" class="w-full border border-gray-300 rounded px-3 py-2">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Full Address (Legacy)</label>
                <input type="text" id="patient-address" class="w-full border border-gray-300 rounded px-3 py-2">
              </div>
            </div>
          </div>
          
          <!-- Medical History -->
          <div class="mb-6">
            <h4 class="text-lg font-semibold mb-3 text-ayurveda-600">Medical History</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Present Health Issue</label>
                <textarea id="present-health-issue" rows="2" class="w-full border border-gray-300 rounded px-3 py-2"></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Present Medicine</label>
                <textarea id="present-medicine" rows="2" class="w-full border border-gray-300 rounded px-3 py-2"></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">MG Value</label>
                <input type="text" id="mg-value" class="w-full border border-gray-300 rounded px-3 py-2">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Additional Medical History</label>
                <textarea id="medical-history" rows="2" class="w-full border border-gray-300 rounded px-3 py-2"></textarea>
              </div>
            </div>
            
            <!-- Diseases -->
            <div class="mt-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Diseases / Conditions</label>
              <div id="diseases-container"></div>
              <button type="button" onclick="addDiseaseField()" class="mt-2 text-sm text-ayurveda-600 hover:text-ayurveda-700">
                <i class="fas fa-plus mr-1"></i>Add Disease
              </button>
            </div>
          </div>
          
          <!-- Referral Information -->
          <div class="mb-6">
            <h4 class="text-lg font-semibold mb-3 text-ayurveda-600">Referred By (Optional)</h4>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Referrer Name</label>
                <input type="text" id="referred-by-name" class="w-full border border-gray-300 rounded px-3 py-2">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Referrer Phone</label>
                <input type="tel" id="referred-by-phone" class="w-full border border-gray-300 rounded px-3 py-2">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Referrer Address</label>
                <input type="text" id="referred-by-address" class="w-full border border-gray-300 rounded px-3 py-2">
              </div>
            </div>
          </div>
          
          <div class="flex justify-end space-x-3 mt-6">
            <button type="button" onclick="closePatientForm()" class="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">Cancel</button>
            <button type="submit" class="px-4 py-2 bg-ayurveda-600 text-white rounded hover:bg-ayurveda-700">Save Patient</button>
          </div>
        </form>
      </div>
    </div>
    
    <div id="patient-details-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div class="bg-white rounded-lg p-6 max-w-4xl w-full max-h-screen overflow-y-auto m-4">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-2xl font-bold">Patient Details</h3>
          <button onclick="closePatientDetails()" class="text-gray-500 hover:text-gray-700">
            <i class="fas fa-times text-2xl"></i>
          </button>
        </div>
        <div id="patient-details-content"></div>
      </div>
    </div>
  `;
}

function updateCountryCode() {
  const countrySelect = document.getElementById('patient-country');
  const selectedOption = countrySelect.options[countrySelect.selectedIndex];
  const countryCode = selectedOption.getAttribute('data-code') || '+91';
  document.getElementById('patient-country-code').value = countryCode;
}

function addPhoneField() {
  phoneFieldCount++;
  const container = document.getElementById('additional-phones-container');
  const fieldHtml = `
    <div class="flex gap-2 mb-2" id="phone-field-${phoneFieldCount}">
      <input type="text" id="phone-label-${phoneFieldCount}" placeholder="Label (e.g., Work, Home)" 
        class="w-40 border border-gray-300 rounded px-3 py-2 text-sm">
      <input type="tel" id="phone-number-${phoneFieldCount}" placeholder="Phone Number" 
        class="flex-1 border border-gray-300 rounded px-3 py-2 text-sm">
      <button type="button" onclick="removePhoneField(${phoneFieldCount})" 
        class="px-3 py-2 text-red-600 hover:text-red-800">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `;
  container.insertAdjacentHTML('beforeend', fieldHtml);
}

function removePhoneField(id) {
  document.getElementById(`phone-field-${id}`)?.remove();
}

function collectAdditionalPhones() {
  const phones = [];
  for (let i = 1; i <= phoneFieldCount; i++) {
    const labelEl = document.getElementById(`phone-label-${i}`);
    const numberEl = document.getElementById(`phone-number-${i}`);
    if (labelEl && numberEl && numberEl.value) {
      phones.push({
        label: labelEl.value || `Phone ${i}`,
        number: numberEl.value
      });
    }
  }
  return JSON.stringify(phones);
}

function addDiseaseField() {
  diseaseFieldCount++;
  const container = document.getElementById('diseases-container');
  const fieldHtml = `
    <div class="flex gap-2 mb-2" id="disease-field-${diseaseFieldCount}">
      <input type="text" id="disease-name-${diseaseFieldCount}" placeholder="Disease Name" 
        class="flex-1 border border-gray-300 rounded px-3 py-2 text-sm">
      <input type="text" id="disease-attacked-${diseaseFieldCount}" placeholder="Attacked By" 
        class="w-48 border border-gray-300 rounded px-3 py-2 text-sm">
      <button type="button" onclick="removeDiseaseField(${diseaseFieldCount})" 
        class="px-3 py-2 text-red-600 hover:text-red-800">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `;
  container.insertAdjacentHTML('beforeend', fieldHtml);
}

function removeDiseaseField(id) {
  document.getElementById(`disease-field-${id}`)?.remove();
}

function showPatientForm(patient = null) {
  document.getElementById('patient-form-modal').classList.remove('hidden');
  document.getElementById('patient-form-title').textContent = patient ? 'Edit Patient' : 'Add Patient';
  
  phoneFieldCount = 0;
  diseaseFieldCount = 0;
  document.getElementById('additional-phones-container').innerHTML = '';
  document.getElementById('diseases-container').innerHTML = '';
  
  if (patient) {
    document.getElementById('patient-id').value = patient.id;
    document.getElementById('patient-name').value = patient.name;
    document.getElementById('patient-age').value = patient.age;
    document.getElementById('patient-gender').value = patient.gender;
    document.getElementById('patient-weight').value = patient.weight || '';
    document.getElementById('patient-height').value = patient.height || '';
    document.getElementById('patient-email').value = patient.email || '';
    document.getElementById('patient-country').value = patient.country || 'India';
    document.getElementById('patient-country-code').value = patient.country_code || '+91';
    document.getElementById('patient-phone').value = patient.phone;
    document.getElementById('address-hno').value = patient.address_hno || '';
    document.getElementById('address-street').value = patient.address_street || '';
    document.getElementById('address-apartment').value = patient.address_apartment || '';
    document.getElementById('address-area').value = patient.address_area || '';
    document.getElementById('address-district').value = patient.address_district || '';
    document.getElementById('address-state').value = patient.address_state || '';
    document.getElementById('address-pincode').value = patient.address_pincode || '';
    document.getElementById('patient-address').value = patient.address || '';
    document.getElementById('present-health-issue').value = patient.present_health_issue || '';
    document.getElementById('present-medicine').value = patient.present_medicine || '';
    document.getElementById('mg-value').value = patient.mg_value || '';
    document.getElementById('medical-history').value = patient.medical_history || '';
    document.getElementById('referred-by-name').value = patient.referred_by_name || '';
    document.getElementById('referred-by-phone').value = patient.referred_by_phone || '';
    document.getElementById('referred-by-address').value = patient.referred_by_address || '';
    
    if (patient.additional_phones) {
      try {
        const phones = JSON.parse(patient.additional_phones);
        phones.forEach(phone => {
          addPhoneField();
          document.getElementById(`phone-label-${phoneFieldCount}`).value = phone.label;
          document.getElementById(`phone-number-${phoneFieldCount}`).value = phone.number;
        });
      } catch(e) {}
    }
  } else {
    document.getElementById('patient-form').reset();
    document.getElementById('patient-id').value = '';
    document.getElementById('patient-country').value = 'India';
    document.getElementById('patient-country-code').value = '+91';
  }
}

function closePatientForm() {
  document.getElementById('patient-form-modal').classList.add('hidden');
}

async function savePatient(event) {
  event.preventDefault();
  
  const id = document.getElementById('patient-id').value;
  
  const data = {
    name: document.getElementById('patient-name').value,
    age: parseInt(document.getElementById('patient-age').value),
    gender: document.getElementById('patient-gender').value,
    weight: parseFloat(document.getElementById('patient-weight').value) || null,
    height: parseFloat(document.getElementById('patient-height').value) || null,
    email: document.getElementById('patient-email').value || null,
    country: document.getElementById('patient-country').value,
    country_code: document.getElementById('patient-country-code').value,
    phone: document.getElementById('patient-phone').value,
    additional_phones: collectAdditionalPhones(),
    address_hno: document.getElementById('address-hno').value || null,
    address_street: document.getElementById('address-street').value || null,
    address_apartment: document.getElementById('address-apartment').value || null,
    address_area: document.getElementById('address-area').value || null,
    address_district: document.getElementById('address-district').value || null,
    address_state: document.getElementById('address-state').value || null,
    address_pincode: document.getElementById('address-pincode').value || null,
    address: document.getElementById('patient-address').value || null,
    present_health_issue: document.getElementById('present-health-issue').value || null,
    present_medicine: document.getElementById('present-medicine').value || null,
    mg_value: document.getElementById('mg-value').value || null,
    medical_history: document.getElementById('medical-history').value || null,
    referred_by_name: document.getElementById('referred-by-name').value || null,
    referred_by_phone: document.getElementById('referred-by-phone').value || null,
    referred_by_address: document.getElementById('referred-by-address').value || null
  };
  
  try {
    showLoading();
    if (id) {
      await axios.put(`${API_BASE}/patients/${id}`, data);
    } else {
      await axios.post(`${API_BASE}/patients`, data);
    }
    closePatientForm();
    loadPatients();
  } catch (error) {
    console.error('Error saving patient:', error);
    alert('Error saving patient');
    hideLoading();
  }
}

function editPatient(id) {
  const patient = currentPatients.find(p => p.id === id);
  if (patient) showPatientForm(patient);
}

async function deletePatient(id) {
  if (!confirm('Are you sure you want to delete this patient?')) return;
  
  try {
    showLoading();
    await axios.delete(`${API_BASE}/patients/${id}`);
    loadPatients();
  } catch (error) {
    console.error('Error deleting patient:', error);
    alert('Error deleting patient');
    hideLoading();
  }
}

async function viewPatientDetails(id) {
  try {
    showLoading();
    const [patientRes, prescriptionsRes, appointmentsRes] = await Promise.all([
      axios.get(`${API_BASE}/patients/${id}`),
      axios.get(`${API_BASE}/patients/${id}/prescriptions`),
      axios.get(`${API_BASE}/appointments`)
    ]);
    
    if (!patientRes.data.success) return;
    
    const patient = patientRes.data.data;
    const prescriptions = prescriptionsRes.data.success ? prescriptionsRes.data.data : [];
    const appointments = appointmentsRes.data.success ? 
      appointmentsRes.data.data.filter(a => a.patient_id === id) : [];
    
    const html = `
      <div class="space-y-6">
        <div class="bg-ayurveda-50 p-4 rounded-lg">
          <h4 class="font-bold text-lg mb-2">Basic Information</h4>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            <div><strong>Patient ID:</strong> ${patient.patient_id}</div>
            <div><strong>Name:</strong> ${patient.name}</div>
            <div><strong>Age/Gender:</strong> ${patient.age}/${patient.gender}</div>
            <div><strong>Country:</strong> ${patient.country || 'N/A'}</div>
            <div><strong>Phone:</strong> ${patient.country_code} ${patient.phone}</div>
            <div><strong>Email:</strong> ${patient.email || 'N/A'}</div>
            <div><strong>Weight:</strong> ${patient.weight ? patient.weight + ' kg' : 'N/A'}</div>
            <div><strong>Height:</strong> ${patient.height ? patient.height + ' cm' : 'N/A'}</div>
          </div>
        </div>
        
        ${patient.present_health_issue || patient.present_medicine ? `
          <div class="bg-yellow-50 p-4 rounded-lg">
            <h4 class="font-bold text-lg mb-2">Current Health Status</h4>
            <div class="space-y-2 text-sm">
              ${patient.present_health_issue ? `<div><strong>Present Issue:</strong> ${patient.present_health_issue}</div>` : ''}
              ${patient.present_medicine ? `<div><strong>Current Medicine:</strong> ${patient.present_medicine}</div>` : ''}
              ${patient.mg_value ? `<div><strong>MG Value:</strong> ${patient.mg_value}</div>` : ''}
            </div>
          </div>
        ` : ''}
        
        <div>
          <h4 class="font-bold text-lg mb-2">Recent Herbs & Routes (${prescriptions.length})</h4>
          <div class="space-y-2">
            ${prescriptions.slice(0, 5).map(p => `
              <div class="border p-3 rounded">
                <div class="flex justify-between">
                  <div><strong>Date:</strong> ${formatDate(p.created_at)}</div>
                  <div><strong>Course:</strong> ${p.course || 'N/A'}</div>
                </div>
                <div class="text-sm mt-1">${p.diagnosis || 'No diagnosis'}</div>
                <div class="text-sm mt-1"><strong>Payment:</strong> ₹${p.payment_amount} (Due: ₹${p.due_balance})</div>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div>
          <h4 class="font-bold text-lg mb-2">Appointments (${appointments.length})</h4>
          <div class="space-y-2">
            ${appointments.slice(0, 5).map(a => `
              <div class="border p-3 rounded">
                <div class="flex justify-between">
                  <div><strong>Date:</strong> ${formatDate(a.appointment_date)}</div>
                  <div><strong>Status:</strong> ${a.status}</div>
                </div>
                <div class="text-sm mt-1">${a.reason || 'No reason specified'}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
    
    document.getElementById('patient-details-content').innerHTML = html;
    document.getElementById('patient-details-modal').classList.remove('hidden');
    hideLoading();
  } catch (error) {
    console.error('Error loading patient details:', error);
    hideLoading();
  }
}

function closePatientDetails() {
  document.getElementById('patient-details-modal').classList.add('hidden');
}

async function exportPatients() {
  try {
    showLoading();
    const response = await axios.get(`${API_BASE}/patients/export/csv`, {
      responseType: 'blob'
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `patients_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    hideLoading();
  } catch (error) {
    console.error('Error exporting patients:', error);
    alert('Error exporting patients');
    hideLoading();
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  showSection('dashboard');
});
