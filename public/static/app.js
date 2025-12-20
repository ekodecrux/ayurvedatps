// TPS DHANVANTRI AYURVEDA - Complete Application
const API_BASE = '/api';
let currentPatients = [];
let currentAppointments = [];
let currentHerbsRoutes = [];
let currentReminders = [];
let currentUser = null;

// Authentication check
async function checkAuth() {
  try {
    const res = await axios.get(`${API_BASE}/auth/me`);
    if (res.data.authenticated) {
      currentUser = res.data.user;
      updateUserUI();
      return true;
    } else {
      window.location.href = '/login';
      return false;
    }
  } catch (error) {
    console.error('Auth check error:', error);
    window.location.href = '/login';
    return false;
  }
}

// Update user UI
function updateUserUI() {
  if (currentUser) {
    document.getElementById('user-name').textContent = currentUser.name;
    document.getElementById('user-email').textContent = currentUser.email;
    
    if (currentUser.profile_picture) {
      document.getElementById('user-avatar').src = currentUser.profile_picture;
      document.getElementById('user-avatar').classList.remove('hidden');
      document.getElementById('user-avatar-placeholder').classList.add('hidden');
    } else {
      const initial = currentUser.name.charAt(0).toUpperCase();
      document.getElementById('user-avatar-placeholder').textContent = initial;
    }
  }
}

// Logout function
async function logout() {
  if (confirm('Are you sure you want to logout?')) {
    try {
      await axios.post(`${API_BASE}/auth/logout`);
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/login';
    }
  }
}

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

const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

function showLoading() { document.body.style.cursor = 'wait'; }
function hideLoading() { document.body.style.cursor = 'default'; }

function showSection(sectionName) {
  document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
  document.getElementById(`${sectionName}-section`)?.classList.remove('hidden');
  
  switch(sectionName) {
    case 'dashboard': loadDashboard(); break;
    case 'patients': loadPatients(); break;
    case 'appointments': loadAppointments(); break;
    case 'prescriptions': loadHerbsRoutes(); break;
    case 'reminders': loadReminders(); break;
    case 'settings': loadSettings(); break;
  }
}

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatDateTime(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
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

    const apptRes = await axios.get(`${API_BASE}/appointments?limit=5`);
    const remRes = await axios.get(`${API_BASE}/reminders?limit=5`);
    
    renderDashboardAppointments(apptRes.data.data || []);
    renderDashboardReminders(remRes.data.data || []);
  } catch (error) {
    console.error('Dashboard error:', error);
  } finally {
    hideLoading();
  }
}

function renderDashboardAppointments(appointments) {
  const html = appointments.slice(0, 5).map(apt => `
    <div class="flex justify-between items-center p-4 hover:bg-gray-50 rounded">
      <div>
        <p class="font-medium">${apt.patient_name}</p>
        <p class="text-sm text-gray-600">${formatDateTime(apt.appointment_date)}</p>
      </div>
      <span class="px-3 py-1 rounded-full text-sm ${apt.status === 'completed' ? 'bg-green-100 text-green-800' : apt.status === 'confirmed' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}">${apt.status}</span>
    </div>
  `).join('') || '<p class="text-gray-500 p-4">No recent appointments</p>';
  document.getElementById('recent-appointments').innerHTML = html;
}

function renderDashboardReminders(reminders) {
  const html = reminders.slice(0, 5).map(rem => `
    <div class="flex justify-between items-center p-4 hover:bg-gray-50 rounded">
      <div>
        <p class="font-medium">${rem.patient_name}</p>
        <p class="text-sm text-gray-600">${formatDate(rem.reminder_date)}</p>
      </div>
      <span class="px-3 py-1 rounded-full text-sm ${rem.status === 'sent' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">${rem.status}</span>
    </div>
  `).join('') || '<p class="text-gray-500 p-4">No upcoming reminders</p>';
  document.getElementById('upcoming-reminders').innerHTML = html;
}

// ==================== PATIENTS ====================
async function loadPatients() {
  try {
    showLoading();
    const search = document.getElementById('patient-search')?.value || '';
    const country = document.getElementById('patient-filter-country')?.value || '';
    
    let url = `${API_BASE}/patients?search=${search}`;
    if (country) url += `&country=${country}`;
    
    const res = await axios.get(url);
    currentPatients = res.data.data || [];
    renderPatients();
  } catch (error) {
    console.error('Load patients error:', error);
    alert('Error loading patients');
  } finally {
    hideLoading();
  }
}

function renderPatients() {
  const html = currentPatients.map(p => `
    <tr class="hover:bg-gray-50">
      <td class="px-6 py-4 border-b">${p.patient_id || 'N/A'}</td>
      <td class="px-6 py-4 border-b font-medium">${p.name}</td>
      <td class="px-6 py-4 border-b">${p.age || 'N/A'} / ${p.gender || 'N/A'}</td>
      <td class="px-6 py-4 border-b">${p.country_code || ''} ${p.phone}</td>
      <td class="px-6 py-4 border-b">${p.country || 'N/A'}</td>
      <td class="px-6 py-4 border-b">${formatDate(p.created_at)}</td>
      <td class="px-6 py-4 border-b">
        <button onclick="viewPatient(${p.id})" class="text-blue-600 hover:text-blue-800 mr-2"><i class="fas fa-eye"></i></button>
        <button onclick="editPatient(${p.id})" class="text-green-600 hover:text-green-800 mr-2"><i class="fas fa-edit"></i></button>
        <button onclick="deletePatient(${p.id})" class="text-red-600 hover:text-red-800"><i class="fas fa-trash"></i></button>
      </td>
    </tr>
  `).join('') || '<tr><td colspan="7" class="px-6 py-4 text-center text-gray-500">No patients found</td></tr>';
  
  document.getElementById('patients-table-body').innerHTML = html;
}

// Helper function to update country code based on country selection
function updateCountryCode() {
  const countryMap = {
    'India': '+91', 'USA': '+1', 'UK': '+44', 'Australia': '+61',
    'Canada': '+1', 'UAE': '+971', 'Singapore': '+65', 
    'Malaysia': '+60', 'Saudi Arabia': '+966'
  };
  const country = document.getElementById('patient-country').value;
  document.getElementById('patient-country-code').value = countryMap[country] || '+91';
}

// Helper function to add disease row with 4 fields
let diseaseCounter = 0;
function addDiseaseRow(healthIssue = '', medicine = '', mgValue = '', attackedBy = '') {
  diseaseCounter++;
  const html = `
    <div class="border rounded-lg p-4 disease-row" data-id="${diseaseCounter}">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
        <div>
          <label class="block text-xs font-medium mb-1 text-gray-600">Present Health Issue</label>
          <input type="text" placeholder="Enter health issue" value="${healthIssue}" 
                 class="disease-health-issue border rounded px-3 py-2 w-full" />
        </div>
        <div>
          <label class="block text-xs font-medium mb-1 text-gray-600">Present Medicine</label>
          <input type="text" placeholder="Enter medicine" value="${medicine}"
                 class="disease-medicine border rounded px-3 py-2 w-full" />
        </div>
        <div>
          <label class="block text-xs font-medium mb-1 text-gray-600">MG Value</label>
          <input type="text" placeholder="Enter MG value" value="${mgValue}"
                 class="disease-mg border rounded px-3 py-2 w-full" />
        </div>
        <div>
          <label class="block text-xs font-medium mb-1 text-gray-600">Attacked By</label>
          <input type="text" placeholder="e.g., Viral, Bacterial" value="${attackedBy}"
                 class="disease-attacked-by border rounded px-3 py-2 w-full" />
        </div>
      </div>
      <button type="button" onclick="removeDiseaseRow(${diseaseCounter})" 
              class="text-red-600 hover:text-red-800 text-sm">
        <i class="fas fa-trash mr-1"></i>Remove Disease
      </button>
    </div>
  `;
  document.getElementById('diseases-container').insertAdjacentHTML('beforeend', html);
}

function removeDiseaseRow(id) {
  document.querySelector(`.disease-row[data-id="${id}"]`)?.remove();
}

function showPatientModal(patient = null) {
  const modal = document.getElementById('patient-modal');
  const title = document.getElementById('patient-modal-title');
  const form = document.getElementById('patient-form');
  
  title.textContent = patient ? 'Edit Patient' : 'Add New Patient';
  
  // Clear diseases container
  document.getElementById('diseases-container').innerHTML = '';
  diseaseCounter = 0;
  
  if (patient) {
    document.getElementById('patient-id').value = patient.id;
    document.getElementById('patient-name').value = patient.name || '';
    document.getElementById('patient-age').value = patient.age || '';
    document.getElementById('patient-gender').value = patient.gender || '';
    document.getElementById('patient-weight').value = patient.weight || '';
    document.getElementById('patient-height').value = patient.height || '';
    
    document.getElementById('patient-country-code').value = patient.country_code || '+91';
    document.getElementById('patient-phone').value = patient.phone || '';
    document.getElementById('patient-phone2').value = patient.phone2 || '';
    document.getElementById('patient-email').value = patient.email || '';
    
    document.getElementById('patient-address-hno').value = patient.address_hno || '';
    document.getElementById('patient-address-street').value = patient.address_street || '';
    document.getElementById('patient-address-apartment').value = patient.address_apartment || '';
    document.getElementById('patient-address-area').value = patient.address_area || '';
    document.getElementById('patient-address-district').value = patient.address_district || '';
    document.getElementById('patient-address-state').value = patient.address_state || '';
    document.getElementById('patient-address-pincode').value = patient.address_pincode || '';
    document.getElementById('patient-address').value = patient.address || '';
    
    document.getElementById('patient-referred-by').value = patient.referred_by_name || '';
    document.getElementById('patient-referred-by-phone').value = patient.referred_by_phone || '';
    document.getElementById('patient-referred-by-address').value = patient.referred_by_address || '';
    
    document.getElementById('patient-present-health-issue').value = patient.present_health_issue || '';
    document.getElementById('patient-present-medicine').value = patient.present_medicine || '';
    document.getElementById('patient-mg').value = patient.mg_value || '';
    document.getElementById('patient-attacked-by').value = patient.attacked_by || '';
    document.getElementById('patient-medical-history').value = patient.medical_history || '';
  } else {
    form.reset();
    document.getElementById('patient-id').value = '';
    document.getElementById('patient-country-code').value = '+91';
  }
  
  modal.classList.remove('hidden');
}

function closePatientModal() {
  document.getElementById('patient-modal').classList.add('hidden');
}

async function savePatient() {
  try {
    showLoading();
    const id = document.getElementById('patient-id').value;
    
    // Collect secondary phone (only one now)
    const secondaryPhone = document.getElementById('patient-phone2')?.value || '';
    
    // Collect diseases with all 4 fields
    const diseases = Array.from(document.querySelectorAll('.disease-row')).map(row => ({
      present_health_issue: row.querySelector('.disease-health-issue').value,
      present_medicine: row.querySelector('.disease-medicine').value,
      mg_value: row.querySelector('.disease-mg').value,
      attacked_by: row.querySelector('.disease-attacked-by').value
    })).filter(d => d.present_health_issue); // Only include rows with health issue filled
    
    // Extract country name from country code
    const countryCode = document.getElementById('patient-country-code').value;
    const countryMap = {
      '+91': 'India', '+1': 'USA', '+44': 'UK', '+61': 'Australia',
      '+971': 'UAE', '+65': 'Singapore', '+60': 'Malaysia', '+966': 'Saudi Arabia'
    };
    const country = countryMap[countryCode] || 'India';
    
    const data = {
      name: document.getElementById('patient-name').value,
      age: parseInt(document.getElementById('patient-age').value) || null,
      gender: document.getElementById('patient-gender').value,
      country: country,
      country_code: countryCode,
      phone: document.getElementById('patient-phone').value,
      email: document.getElementById('patient-email').value,
      weight: parseFloat(document.getElementById('patient-weight').value) || null,
      height: parseFloat(document.getElementById('patient-height').value) || null,
      
      // Detailed address fields
      address_hno: document.getElementById('patient-address-hno').value,
      address_street: document.getElementById('patient-address-street').value,
      address_apartment: document.getElementById('patient-address-apartment').value,
      address_area: document.getElementById('patient-address-area').value,
      address_district: document.getElementById('patient-address-district').value,
      address_state: document.getElementById('patient-address-state').value,
      address_pincode: document.getElementById('patient-address-pincode').value,
      address: document.getElementById('patient-address').value,
      
      // Referred by
      referred_by_name: document.getElementById('patient-referred-by').value,
      referred_by_phone: document.getElementById('patient-referred-by-phone').value,
      referred_by_address: document.getElementById('patient-referred-by-address').value,
      
      // Medical history
      medical_history: document.getElementById('patient-medical-history').value,
      
      // Additional phones as JSON (now just secondary phone)
      additional_phones: secondaryPhone ? JSON.stringify([secondaryPhone]) : null,
      
      // Diseases as JSON array
      diseases: diseases.length > 0 ? JSON.stringify(diseases) : null
    };
      
      // Medical information
      present_health_issue: document.getElementById('patient-present-health-issue').value,
      present_medicine: document.getElementById('patient-present-medicine').value,
      mg_value: document.getElementById('patient-mg').value,
      medical_history: document.getElementById('patient-medical-history').value,
      
      // Additional phones as JSON
      additional_phones: phones.length > 0 ? JSON.stringify(phones) : null
    };
    
    if (id) {
      await axios.put(`${API_BASE}/patients/${id}`, data);
      
      // Update diseases if editing
      if (diseases.length > 0) {
        // Delete existing diseases and add new ones
        await axios.delete(`${API_BASE}/patients/${id}/diseases/all`).catch(() => {});
        for (const disease of diseases) {
          await axios.post(`${API_BASE}/patients/${id}/diseases`, disease);
        }
      }
      
      alert('Patient updated successfully! Patient ID: ' + (await axios.get(`${API_BASE}/patients/${id}`)).data.data.patient_id);
    } else {
      const result = await axios.post(`${API_BASE}/patients`, data);
      const patientId = result.data.data.patient_id;
      
      // Add diseases for new patient
      if (diseases.length > 0) {
        const newId = result.data.data.id;
        for (const disease of diseases) {
          await axios.post(`${API_BASE}/patients/${newId}/diseases`, disease);
        }
      }
      
      alert(`Patient added successfully! Patient ID: ${patientId}`);
    }
    
    closePatientModal();
    loadPatients();
  } catch (error) {
    console.error('Save patient error:', error);
    alert('Error saving patient: ' + (error.response?.data?.error || error.message));
  } finally {
    hideLoading();
  }
}

async function deletePatient(id) {
  if (!confirm('Are you sure you want to delete this patient?')) return;
  
  try {
    showLoading();
    await axios.delete(`${API_BASE}/patients/${id}`);
    alert('Patient deleted successfully');
    loadPatients();
  } catch (error) {
    console.error('Delete patient error:', error);
    alert('Error deleting patient');
  } finally {
    hideLoading();
  }
}

async function editPatient(id) {
  try {
    showLoading();
    const res = await axios.get(`${API_BASE}/patients/${id}`);
    showPatientModal(res.data.data);
  } catch (error) {
    console.error('Load patient error:', error);
    alert('Error loading patient details');
  } finally {
    hideLoading();
  }
}

async function viewPatient(id) {
  editPatient(id);
}

async function exportPatients(format = 'csv') {
  try {
    const country = document.getElementById('patient-filter-country')?.value || '';
    let url = `${API_BASE}/patients/export?format=${format}`;
    if (country) url += `&country=${country}`;
    
    window.open(url, '_blank');
  } catch (error) {
    console.error('Export error:', error);
    alert(`Error exporting patients to ${format.toUpperCase()}`);
  }
}

// ==================== APPOINTMENTS ====================
async function loadAppointments() {
  try {
    showLoading();
    const search = document.getElementById('appointment-search')?.value || '';
    const status = document.getElementById('appointment-filter-status')?.value || '';
    
    let url = `${API_BASE}/appointments?search=${search}`;
    if (status) url += `&status=${status}`;
    
    const res = await axios.get(url);
    currentAppointments = res.data.data || [];
    renderAppointments();
  } catch (error) {
    console.error('Load appointments error:', error);
    alert('Error loading appointments');
  } finally {
    hideLoading();
  }
}

function renderAppointments() {
  const html = currentAppointments.map(apt => `
    <tr class="hover:bg-gray-50">
      <td class="px-6 py-4 border-b">${formatDateTime(apt.appointment_date)}</td>
      <td class="px-6 py-4 border-b font-medium">${apt.patient_name}</td>
      <td class="px-6 py-4 border-b">${apt.patient_phone}</td>
      <td class="px-6 py-4 border-b">${apt.reason || 'N/A'}</td>
      <td class="px-6 py-4 border-b">
        <span class="px-3 py-1 rounded-full text-sm ${apt.status === 'completed' ? 'bg-green-100 text-green-800' : apt.status === 'confirmed' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}">${apt.status}</span>
      </td>
      <td class="px-6 py-4 border-b">
        <button onclick="editAppointment(${apt.id})" class="text-green-600 hover:text-green-800 mr-2"><i class="fas fa-edit"></i></button>
        <button onclick="deleteAppointment(${apt.id})" class="text-red-600 hover:text-red-800"><i class="fas fa-trash"></i></button>
      </td>
    </tr>
  `).join('') || '<tr><td colspan="6" class="px-6 py-4 text-center text-gray-500">No appointments found</td></tr>';
  
  document.getElementById('appointments-table-body').innerHTML = html;
}

function showAppointmentModal(appointment = null) {
  try {
    const modal = document.getElementById('appointment-modal');
    const title = document.getElementById('appointment-modal-title');
    
    if (!modal || !title) {
      console.error('Appointment modal elements not found');
      return;
    }
    
    title.textContent = appointment ? 'Edit Appointment' : 'Add New Appointment';
    
    if (appointment) {
      document.getElementById('appointment-id').value = appointment.id;
      document.getElementById('appointment-patient').value = appointment.patient_id;
      document.getElementById('appointment-date').value = appointment.appointment_date ? appointment.appointment_date.substring(0, 16) : '';
      document.getElementById('appointment-reason').value = appointment.purpose || '';
      document.getElementById('appointment-status').value = appointment.status || 'scheduled';
    } else {
      document.getElementById('appointment-form').reset();
      document.getElementById('appointment-id').value = '';
      document.getElementById('appointment-status').value = 'scheduled';
    }
    
    loadPatientsForSelect();
    modal.classList.remove('hidden');
  } catch (error) {
    console.error('Error showing appointment modal:', error);
    alert('Error opening appointment modal: ' + error.message);
  }
}
  
  if (appointment) {
    document.getElementById('appointment-id').value = appointment.id;
    document.getElementById('appointment-patient').value = appointment.patient_id;
    document.getElementById('appointment-date').value = appointment.appointment_date ? appointment.appointment_date.substring(0, 16) : '';
    document.getElementById('appointment-reason').value = appointment.purpose || '';
    document.getElementById('appointment-status').value = appointment.status || 'scheduled';
  } else {
    document.getElementById('appointment-form').reset();
    document.getElementById('appointment-id').value = '';
    document.getElementById('appointment-status').value = 'scheduled';
  }
  
  loadPatientsForSelect();
  modal.classList.remove('hidden');
}

function closeAppointmentModal() {
  document.getElementById('appointment-modal').classList.add('hidden');
}

async function loadPatientsForSelect() {
  try {
    const res = await axios.get(`${API_BASE}/patients`);
    const patients = res.data.data || [];
    const select = document.getElementById('appointment-patient');
    
    select.innerHTML = '<option value="">Select Patient</option>' + 
      patients.map(p => `<option value="${p.id}">${p.name} (${p.phone})</option>`).join('');
  } catch (error) {
    console.error('Load patients error:', error);
  }
}

async function saveAppointment() {
  try {
    showLoading();
    const id = document.getElementById('appointment-id').value;
    
    const data = {
      patient_id: parseInt(document.getElementById('appointment-patient').value),
      appointment_date: document.getElementById('appointment-date').value,
      purpose: document.getElementById('appointment-reason').value,
      notes: document.getElementById('appointment-reason').value,
      status: document.getElementById('appointment-status').value
    };
    
    if (id) {
      await axios.put(`${API_BASE}/appointments/${id}`, data);
      alert('Appointment updated successfully');
    } else {
      await axios.post(`${API_BASE}/appointments`, data);
      alert('Appointment added successfully');
    }
    
    closeAppointmentModal();
    loadAppointments();
  } catch (error) {
    console.error('Save appointment error:', error);
    alert('Error saving appointment');
  } finally {
    hideLoading();
  }
}

async function deleteAppointment(id) {
  if (!confirm('Are you sure you want to delete this appointment?')) return;
  
  try {
    showLoading();
    await axios.delete(`${API_BASE}/appointments/${id}`);
    alert('Appointment deleted successfully');
    loadAppointments();
  } catch (error) {
    console.error('Delete appointment error:', error);
    alert('Error deleting appointment');
  } finally {
    hideLoading();
  }
}

async function editAppointment(id) {
  try {
    showLoading();
    const res = await axios.get(`${API_BASE}/appointments/${id}`);
    
    // Ensure loading is hidden before showing modal
    hideLoading();
    
    // Show modal
    showAppointmentModal(res.data.data);
  } catch (error) {
    console.error('Load appointment error:', error);
    alert('Error loading appointment details');
    hideLoading();
  }
}

// ==================== HERBS & ROUTES (PRESCRIPTIONS) ====================
async function loadHerbsRoutes() {
  try {
    showLoading();
    const search = document.getElementById('prescription-search')?.value || '';
    
    const res = await axios.get(`${API_BASE}/prescriptions?search=${search}`);
    currentHerbsRoutes = res.data.data || [];
    renderHerbsRoutes();
  } catch (error) {
    console.error('Load herbs & routes error:', error);
    alert('Error loading herbs & routes: ' + (error.response?.data?.error || error.message));
  } finally {
    hideLoading();
  }
}

function renderHerbsRoutes() {
  const html = currentHerbsRoutes.map(hr => `
    <tr class="hover:bg-gray-50">
      <td class="px-6 py-4 border-b">${formatDate(hr.given_date || hr.created_at)}</td>
      <td class="px-6 py-4 border-b font-medium">${hr.patient_name}</td>
      <td class="px-6 py-4 border-b">${hr.diagnosis || 'N/A'}</td>
      <td class="px-6 py-4 border-b">${hr.course || 'N/A'}</td>
      <td class="px-6 py-4 border-b">₹${hr.payment_amount || 0}</td>
      <td class="px-6 py-4 border-b">${hr.treatment_months || 0} months</td>
      <td class="px-6 py-4 border-b">${formatDate(hr.follow_up_date || hr.next_followup_date)}</td>
      <td class="px-6 py-4 border-b">
        <button onclick="viewHerbsRoutes(${hr.id})" class="text-blue-600 hover:text-blue-800 mr-2"><i class="fas fa-eye"></i></button>
        <button onclick="printHerbsRoutes(${hr.id})" class="text-purple-600 hover:text-purple-800 mr-2"><i class="fas fa-print"></i></button>
        <button onclick="deleteHerbsRoutes(${hr.id})" class="text-red-600 hover:text-red-800"><i class="fas fa-trash"></i></button>
      </td>
    </tr>
  `).join('') || '<tr><td colspan="8" class="px-6 py-4 text-center text-gray-500">No records found</td></tr>';
  
  document.getElementById('prescriptions-table-body').innerHTML = html;
}

function showHerbsRoutesModal() {
  const modal = document.getElementById('prescription-modal');
  document.getElementById('prescription-modal-title').textContent = 'New Herbs & Routes Record';
  document.getElementById('prescription-form').reset();
  document.getElementById('prescription-id').value = '';
  document.getElementById('medicines-list').innerHTML = '';
  medicineCounter = 0;
  
  // Set today's date as default
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('prescription-date').value = today;
  
  // Reset balance display
  const balanceDisplay = document.getElementById('prescription-balance-display');
  if (balanceDisplay) balanceDisplay.textContent = '₹0.00';
  
  addMedicineRow();
  loadPatientsForHerbsRoutes();
  
  modal.classList.remove('hidden');
}

function closeHerbsRoutesModal() {
  document.getElementById('prescription-modal').classList.add('hidden');
}

async function loadPatientsForHerbsRoutes() {
  try {
    const res = await axios.get(`${API_BASE}/patients`);
    const patients = res.data.data || [];
    const select = document.getElementById('prescription-patient');
    
    // Store patients data globally for quick access
    window.patientsData = patients;
    
    select.innerHTML = '<option value="">Select Patient</option>' + 
      patients.map(p => `<option value="${p.id}">${p.name} (${p.patient_id || p.phone})</option>`).join('');
  } catch (error) {
    console.error('Load patients error:', error);
  }
}

// Display patient information when selected
async function displayPatientInfo() {
  const patientId = document.getElementById('prescription-patient').value;
  const display = document.getElementById('patient-info-display');
  
  if (!patientId) {
    display.classList.add('hidden');
    return;
  }
  
  try {
    // Fetch full patient data
    const res = await axios.get(`${API_BASE}/patients/${patientId}`);
    const patient = res.data.data;
    
    // Display patient information
    document.getElementById('display-patient-id').textContent = patient.patient_id || 'N/A';
    document.getElementById('display-patient-age-gender').textContent = `${patient.age || 'N/A'} / ${patient.gender || 'N/A'}`;
    document.getElementById('display-patient-country').textContent = patient.country || 'N/A';
    document.getElementById('display-patient-phone').textContent = `${patient.country_code || ''} ${patient.phone || 'N/A'}`;
    document.getElementById('display-patient-email').textContent = patient.email || 'N/A';
    document.getElementById('display-patient-weight-height').textContent = `${patient.weight || 'N/A'} kg / ${patient.height || 'N/A'} cm`;
    
    // Build full address
    const addressParts = [];
    if (patient.address_hno) addressParts.push(patient.address_hno);
    if (patient.address_street) addressParts.push(patient.address_street);
    if (patient.address_apartment) addressParts.push(patient.address_apartment);
    if (patient.address_area) addressParts.push(patient.address_area);
    if (patient.address_district) addressParts.push(patient.address_district);
    if (patient.address_state) addressParts.push(patient.address_state);
    if (patient.address_pincode) addressParts.push(patient.address_pincode);
    document.getElementById('display-patient-address').textContent = addressParts.join(', ') || 'N/A';
    
    document.getElementById('display-patient-health-issue').textContent = patient.present_health_issue || 'N/A';
    document.getElementById('display-patient-medical-history').textContent = patient.medical_history || 'N/A';
    
    display.classList.remove('hidden');
  } catch (error) {
    console.error('Error loading patient details:', error);
    alert('Error loading patient details');
  }
}

// Calculate follow-up date based on given date + treatment months
function calculateFollowUpDate() {
  const givenDate = document.getElementById('prescription-date').value;
  const months = parseInt(document.getElementById('prescription-months').value) || 0;
  
  if (!givenDate) {
    document.getElementById('prescription-followup').value = '';
    return;
  }
  
  const followUpDate = new Date(givenDate);
  followUpDate.setMonth(followUpDate.getMonth() + months);
  
  // Format as YYYY-MM-DD for date input
  const formattedDate = followUpDate.toISOString().split('T')[0];
  document.getElementById('prescription-followup').value = formattedDate;
}


let medicineCounter = 0;

function addMedicineRow() {
  medicineCounter++;
  const romanId = romanNumerals[medicineCounter - 1] || `#${medicineCounter}`;
  
  const html = `
    <div class="medicine-row border rounded-lg p-4 mb-4 bg-gray-50" data-row="${medicineCounter}">
      <div class="flex justify-between items-center mb-3">
        <h4 class="font-semibold text-lg">M.M.(${romanId})</h4>
        <button type="button" onclick="removeMedicineRow(${medicineCounter})" class="text-red-600 hover:text-red-800">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium mb-1">Medicine Name</label>
          <input type="text" name="medicine_name_${medicineCounter}" class="w-full border rounded px-3 py-2" required>
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-1">Dosage Schedule</label>
          <div class="grid grid-cols-2 gap-2 text-sm">
            <label class="flex items-center">
              <input type="checkbox" name="morning_before_${medicineCounter}" class="mr-2">
              Morning (Before)
            </label>
            <label class="flex items-center">
              <input type="checkbox" name="morning_after_${medicineCounter}" class="mr-2">
              Morning (After)
            </label>
            <label class="flex items-center">
              <input type="checkbox" name="afternoon_before_${medicineCounter}" class="mr-2">
              Afternoon (Before)
            </label>
            <label class="flex items-center">
              <input type="checkbox" name="afternoon_after_${medicineCounter}" class="mr-2">
              Afternoon (After)
            </label>
            <label class="flex items-center">
              <input type="checkbox" name="evening_before_${medicineCounter}" class="mr-2">
              Evening (Before)
            </label>
            <label class="flex items-center">
              <input type="checkbox" name="evening_after_${medicineCounter}" class="mr-2">
              Evening (After)
            </label>
            <label class="flex items-center">
              <input type="checkbox" name="night_before_${medicineCounter}" class="mr-2">
              Night (Before)
            </label>
            <label class="flex items-center">
              <input type="checkbox" name="night_after_${medicineCounter}" class="mr-2">
              Night (After)
            </label>
          </div>
        </div>
      </div>
    </div>
  `;
  
  document.getElementById('medicines-list').insertAdjacentHTML('beforeend', html);
}

function removeMedicineRow(rowId) {
  const row = document.querySelector(`.medicine-row[data-row="${rowId}"]`);
  if (row) row.remove();
}

async function saveHerbsRoutes() {
  try {
    showLoading();
    
    const givenDate = document.getElementById('prescription-date').value;
    const months = parseInt(document.getElementById('prescription-months').value) || 0;
    const patientId = parseInt(document.getElementById('prescription-patient').value);
    
    // Auto-calculate follow-up date
    const nextFollowupDate = new Date(givenDate);
    nextFollowupDate.setMonth(nextFollowupDate.getMonth() + months);
    const followUpDateStr = nextFollowupDate.toISOString().split('T')[0];
    
    // Collect medicines with dosage schedule
    const medicines = [];
    document.querySelectorAll('.medicine-row').forEach((row, index) => {
      const rowNum = row.dataset.row;
      const romanId = romanNumerals[index] || `#${index + 1}`;
      
      const medicineName = row.querySelector(`[name="medicine_name_${rowNum}"]`).value;
      if (!medicineName) return; // Skip empty medicine rows
      
      medicines.push({
        roman_id: romanId,
        medicine_name: medicineName,
        given_date: givenDate,
        treatment_months: months,
        morning_before: row.querySelector(`[name="morning_before_${rowNum}"]`)?.checked ? 1 : 0,
        morning_after: row.querySelector(`[name="morning_after_${rowNum}"]`)?.checked ? 1 : 0,
        afternoon_before: row.querySelector(`[name="afternoon_before_${rowNum}"]`)?.checked ? 1 : 0,
        afternoon_after: row.querySelector(`[name="afternoon_after_${rowNum}"]`)?.checked ? 1 : 0,
        evening_before: row.querySelector(`[name="evening_before_${rowNum}"]`)?.checked ? 1 : 0,
        evening_after: row.querySelector(`[name="evening_after_${rowNum}"]`)?.checked ? 1 : 0,
        night_before: row.querySelector(`[name="night_before_${rowNum}"]`)?.checked ? 1 : 0,
        night_after: row.querySelector(`[name="night_after_${rowNum}"]`)?.checked ? 1 : 0
      });
    });
    
    if (medicines.length === 0) {
      alert('Please add at least one medicine');
      hideLoading();
      return;
    }
    
    const totalAmount = parseFloat(document.getElementById('prescription-amount').value) || 0;
    const advancePaid = parseFloat(document.getElementById('prescription-advance').value) || 0;
    
    const data = {
      patient_id: patientId,
      given_date: givenDate,
      treatment_months: months,
      follow_up_date: followUpDateStr,
      diagnosis: document.getElementById('prescription-problem').value || 'Not specified',
      notes: '',
      course: parseInt(document.getElementById('prescription-course').value) || null,
      payment_amount: totalAmount,
      advance_payment: advancePaid,
      due_balance: totalAmount - advancePaid,
      payment_notes: document.getElementById('prescription-payment-notes').value,
      medicines: medicines
    };
    
    // Save the Herbs & Routes record
    const result = await axios.post(`${API_BASE}/prescriptions`, data);
    
    // Auto-create reminder for follow-up date
    try {
      const reminderData = {
        patient_id: patientId,
        reminder_date: followUpDateStr,
        reminder_type: 'Follow-up',
        notes: `Follow-up for Herbs & Routes treatment (${months} month${months > 1 ? 's' : ''} course)`
      };
      await axios.post(`${API_BASE}/reminders`, reminderData);
      console.log('Reminder created automatically for follow-up date');
    } catch (reminderError) {
      console.error('Error creating reminder:', reminderError);
      // Don't fail the whole operation if reminder creation fails
    }
    
    alert(`Herbs & Routes record created successfully!\nFollow-up date: ${formatDate(followUpDateStr)}\nReminder has been set automatically.`);
    
    closeHerbsRoutesModal();
    loadHerbsRoutes();
    loadReminders(); // Refresh reminders to show the new one
  } catch (error) {
    console.error('Save herbs & routes error:', error);
    alert('Error saving herbs & routes record: ' + (error.response?.data?.error || error.message));
  } finally {
    hideLoading();
  }
}

// Auto-calculate balance when amount or advance changes
function calculateBalance() {
  const total = parseFloat(document.getElementById('prescription-amount').value) || 0;
  const advance = parseFloat(document.getElementById('prescription-advance').value) || 0;
  const balance = total - advance;
  
  // Show balance in the UI (if we have a balance display field)
  const balanceDisplay = document.getElementById('prescription-balance-display');
  if (balanceDisplay) {
    balanceDisplay.textContent = `₹${balance.toFixed(2)}`;
  }
}

async function deleteHerbsRoutes(id) {
  if (!confirm('Are you sure you want to delete this record?')) return;
  
  try {
    showLoading();
    await axios.delete(`${API_BASE}/prescriptions/${id}`);
    alert('Record deleted successfully');
    loadHerbsRoutes();
  } catch (error) {
    console.error('Delete error:', error);
    alert('Error deleting record');
  } finally {
    hideLoading();
  }
}

async function viewHerbsRoutes(id) {
  try {
    showLoading();
    const res = await axios.get(`${API_BASE}/prescriptions/${id}`);
    const hr = res.data.data;
    
    // Display in a modal or new section
    alert(`Record Details:\n\nPatient: ${hr.patient_name}\nDate: ${formatDate(hr.given_date)}\nProblem: ${hr.problem}\nCourse: ${hr.course}\nAmount: ₹${hr.total_amount}`);
  } catch (error) {
    console.error('View error:', error);
    alert('Error loading record details');
  } finally {
    hideLoading();
  }
}

async function printHerbsRoutes(id) {
  try {
    // Open print view in new window
    window.open(`/api/prescriptions/${id}/print`, '_blank');
  } catch (error) {
    console.error('Print error:', error);
    alert('Error printing record');
  }
}

// ==================== REMINDERS ====================
async function loadReminders() {
  try {
    showLoading();
    const search = document.getElementById('reminder-search')?.value || '';
    const status = document.getElementById('reminder-filter-status')?.value || '';
    
    let url = `${API_BASE}/reminders?search=${search}`;
    if (status) url += `&status=${status}`;
    
    const res = await axios.get(url);
    currentReminders = res.data.data || [];
    renderReminders();
  } catch (error) {
    console.error('Load reminders error:', error);
    alert('Error loading reminders');
  } finally {
    hideLoading();
  }
}

function renderReminders() {
  const html = currentReminders.map(rem => `
    <tr class="hover:bg-gray-50">
      <td class="px-6 py-4 border-b">${formatDate(rem.scheduled_date || rem.reminder_date)}</td>
      <td class="px-6 py-4 border-b font-medium">${rem.patient_name}</td>
      <td class="px-6 py-4 border-b">${rem.patient_phone}</td>
      <td class="px-6 py-4 border-b">${rem.type || rem.reminder_type}</td>
      <td class="px-6 py-4 border-b">${rem.message || 'N/A'}</td>
      <td class="px-6 py-4 border-b">
        <span class="px-3 py-1 rounded-full text-sm ${rem.status === 'Sent' || rem.status === 'sent' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">${rem.status}</span>
      </td>
      <td class="px-6 py-4 border-b">
        ${rem.status === 'Sent' || rem.status === 'sent' ? '' : `
          <button onclick="sendReminderWhatsApp(${rem.id}, '${rem.patient_phone}', '${escape(rem.patient_name)}', '${escape(rem.message)}')" 
                  class="text-green-600 hover:text-green-800 mr-2" title="Send WhatsApp">
            <i class="fab fa-whatsapp"></i>
          </button>
          <button onclick="sendReminderSMS(${rem.id}, '${rem.patient_phone}', '${escape(rem.patient_name)}', '${escape(rem.message)}')" 
                  class="text-blue-600 hover:text-blue-800 mr-2" title="Send SMS">
            <i class="fas fa-sms"></i>
          </button>
        `}
        <button onclick="markReminderSent(${rem.id})" class="text-gray-600 hover:text-gray-800 mr-2" ${rem.status === 'Sent' || rem.status === 'sent' ? 'disabled' : ''} title="Mark as sent">
          <i class="fas fa-check"></i>
        </button>
        <button onclick="deleteReminder(${rem.id})" class="text-red-600 hover:text-red-800" title="Delete">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    </tr>
  `).join('') || '<tr><td colspan="7" class="px-6 py-4 text-center text-gray-500">No reminders found</td></tr>';
  
  document.getElementById('reminders-table-body').innerHTML = html;
}

// Send reminder via WhatsApp (using Business API)
async function sendReminderWhatsApp(id, phone, patientName, message) {
  if (!confirm(`Send WhatsApp reminder to ${unescape(patientName)} (${phone})?`)) return;
  
  try {
    showLoading();
    
    const whatsappMessage = unescape(message) || `Dear ${unescape(patientName)}, this is a reminder from TPS DHANVANTRI AYURVEDA for your upcoming consultation.`;
    
    const response = await axios.post(`${API_BASE}/send-whatsapp`, {
      to: phone,
      message: whatsappMessage,
      reminderId: id
    });
    
    if (response.data.success) {
      alert('✅ WhatsApp message sent successfully!');
      loadReminders();
    } else {
      alert('❌ Failed to send WhatsApp: ' + response.data.error);
    }
  } catch (error) {
    console.error('WhatsApp send error:', error);
    const errorMsg = error.response?.data?.error || error.message;
    alert('❌ WhatsApp Error: ' + errorMsg + '\n\nPlease check your WhatsApp settings.');
  } finally {
    hideLoading();
  }
}

// Send reminder via SMS (using SMS Gateway)
async function sendReminderSMS(id, phone, patientName, message) {
  if (!confirm(`Send SMS reminder to ${unescape(patientName)} (${phone})?`)) return;
  
  try {
    showLoading();
    
    const smsMessage = unescape(message) || `Dear ${unescape(patientName)}, this is a reminder from TPS DHANVANTRI AYURVEDA for your upcoming consultation.`;
    
    const response = await axios.post(`${API_BASE}/send-sms`, {
      to: phone,
      message: smsMessage,
      reminderId: id
    });
    
    if (response.data.success) {
      alert('✅ SMS sent successfully!');
      loadReminders();
    } else {
      alert('❌ Failed to send SMS: ' + response.data.error);
    }
  } catch (error) {
    console.error('SMS send error:', error);
    const errorMsg = error.response?.data?.error || error.message;
    alert('❌ SMS Error: ' + errorMsg + '\n\nPlease check your SMS settings.');
  } finally {
    hideLoading();
  }
}

async function markReminderSent(id) {
  try {
    showLoading();
    await axios.put(`${API_BASE}/reminders/${id}`, { status: 'sent' });
    alert('Reminder marked as sent');
    loadReminders();
  } catch (error) {
    console.error('Update reminder error:', error);
    alert('Error updating reminder');
  } finally {
    hideLoading();
  }
}

async function deleteReminder(id) {
  if (!confirm('Are you sure you want to delete this reminder?')) return;
  
  try {
    showLoading();
    await axios.delete(`${API_BASE}/reminders/${id}`);
    alert('Reminder deleted successfully');
    loadReminders();
  } catch (error) {
    console.error('Delete reminder error:', error);
    alert('Error deleting reminder');
  } finally {
    hideLoading();
  }
}

// ==================== SETTINGS ====================
async function loadSettings() {
  try {
    showLoading();
    const res = await axios.get(`${API_BASE}/settings`);
    const settings = res.data.data || [];
    
    // Create a settings map for easy lookup
    const settingsMap = {};
    settings.forEach(setting => {
      settingsMap[setting.key] = setting.value;
    });
    
    // Load all settings fields
    const fields = [
      'clinic_name', 'clinic_phone', 'clinic_email',
      'whatsapp_phone_id', 'whatsapp_token',
      'sms_provider', 'sms_api_key', 'sms_auth_token', 'sms_sender_id'
    ];
    
    fields.forEach(field => {
      const input = document.getElementById(`setting-${field}`);
      if (input) {
        if (input.type === 'checkbox') {
          input.checked = settingsMap[field] === 'true' || settingsMap[field] === true;
        } else {
          input.value = settingsMap[field] || '';
        }
      }
    });
    
    // Load checkboxes
    const whatsappEnabled = document.getElementById('setting-whatsapp_enabled');
    if (whatsappEnabled) {
      whatsappEnabled.checked = settingsMap['whatsapp_enabled'] === 'true';
    }
    
    const smsEnabled = document.getElementById('setting-sms_enabled');
    if (smsEnabled) {
      smsEnabled.checked = settingsMap['sms_enabled'] === 'true';
    }
  } catch (error) {
    console.error('Load settings error:', error);
  } finally {
    hideLoading();
  }
}

async function saveSettings() {
  try {
    showLoading();
    
    // Collect all settings
    const settings = {
      clinic_name: document.getElementById('setting-clinic_name')?.value || '',
      clinic_phone: document.getElementById('setting-clinic_phone')?.value || '',
      clinic_email: document.getElementById('setting-clinic_email')?.value || '',
      whatsapp_enabled: document.getElementById('setting-whatsapp_enabled')?.checked ? 'true' : 'false',
      whatsapp_phone_id: document.getElementById('setting-whatsapp_phone_id')?.value || '',
      whatsapp_token: document.getElementById('setting-whatsapp_token')?.value || '',
      sms_enabled: document.getElementById('setting-sms_enabled')?.checked ? 'true' : 'false',
      sms_provider: document.getElementById('setting-sms_provider')?.value || 'twilio',
      sms_api_key: document.getElementById('setting-sms_api_key')?.value || '',
      sms_auth_token: document.getElementById('setting-sms_auth_token')?.value || '',
      sms_sender_id: document.getElementById('setting-sms_sender_id')?.value || ''
    };
    
    // Save each setting
    for (const [key, value] of Object.entries(settings)) {
      await axios.post(`${API_BASE}/settings`, { key, value });
    }
    
    alert('Settings saved successfully! You can now send WhatsApp and SMS reminders.');
  } catch (error) {
    console.error('Save settings error:', error);
    alert('Error saving settings: ' + (error.response?.data?.error || error.message));
  } finally {
    hideLoading();
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  loadDashboard();
});
