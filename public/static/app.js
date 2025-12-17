// API Base URL
const API_BASE = '/api';

// Global state
let currentPatients = [];
let currentAppointments = [];
let currentMedicines = [];
let currentPrescriptions = [];
let currentReminders = [];
let currentSettings = {};

// Utility Functions
function showLoading() {
  document.getElementById('loading-overlay').classList.remove('hidden');
}

function hideLoading() {
  document.getElementById('loading-overlay').classList.add('hidden');
}

function showSection(sectionName) {
  // Hide all sections
  document.querySelectorAll('.section').forEach(section => {
    section.classList.add('hidden');
  });
  
  // Show selected section
  document.getElementById(`${sectionName}-section`).classList.remove('hidden');
  
  // Load section data
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
    case 'pharmacy':
      loadPharmacy();
      break;
    case 'reminders':
      loadReminders();
      break;
    case 'settings':
      loadSettings();
      break;
  }
}

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
    
    // Load stats
    const statsRes = await axios.get(`${API_BASE}/stats`);
    if (statsRes.data.success) {
      const stats = statsRes.data.data;
      document.getElementById('stat-patients').textContent = stats.totalPatients;
      document.getElementById('stat-appointments').textContent = stats.todayAppointments;
      document.getElementById('stat-reminders').textContent = stats.pendingReminders;
      document.getElementById('stat-lowstock').textContent = stats.lowStockMedicines;
    }
    
    // Load recent appointments
    const appointmentsRes = await axios.get(`${API_BASE}/appointments`);
    if (appointmentsRes.data.success) {
      const appointments = appointmentsRes.data.data.slice(0, 5);
      const html = appointments.length > 0 ? appointments.map(apt => `
        <div class="flex items-center justify-between border-b pb-2">
          <div>
            <p class="font-semibold">${apt.patient_name}</p>
            <p class="text-sm text-gray-600">${formatDateTime(apt.appointment_date)}</p>
          </div>
          <span class="px-2 py-1 text-xs rounded ${
            apt.status === 'completed' ? 'bg-green-100 text-green-800' :
            apt.status === 'cancelled' ? 'bg-red-100 text-red-800' :
            'bg-blue-100 text-blue-800'
          }">${apt.status}</span>
        </div>
      `).join('') : '<p class="text-gray-500">No recent appointments</p>';
      document.getElementById('recent-appointments').innerHTML = html;
    }
    
    // Load upcoming reminders
    const remindersRes = await axios.get(`${API_BASE}/reminders/pending`);
    if (remindersRes.data.success) {
      const reminders = remindersRes.data.data.slice(0, 5);
      const html = reminders.length > 0 ? reminders.map(reminder => `
        <div class="flex items-center justify-between border-b pb-2">
          <div>
            <p class="font-semibold">${reminder.patient_name}</p>
            <p class="text-sm text-gray-600">${reminder.reminder_type}: ${formatDate(reminder.reminder_date)}</p>
          </div>
          <button onclick="sendReminder(${reminder.id})" class="text-ayurveda-600 hover:text-ayurveda-800">
            <i class="fas fa-paper-plane"></i>
          </button>
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

async function loadPatients(search = '', gender = '') {
  try {
    showLoading();
    let url = `${API_BASE}/patients`;
    const params = [];
    if (search) params.push(`search=${encodeURIComponent(search)}`);
    if (gender) params.push(`gender=${encodeURIComponent(gender)}`);
    if (params.length > 0) url += '?' + params.join('&');
    
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
        <i class="fas fa-users mr-3 text-ayurveda-600"></i>Patients (${currentPatients.length})
      </h2>
      <button onclick="showPatientForm()" class="bg-ayurveda-600 hover:bg-ayurveda-700 text-white px-4 py-2 rounded-lg shadow">
        <i class="fas fa-plus mr-2"></i>Add Patient
      </button>
    </div>
    
    <!-- Search and Filter -->
    <div class="bg-white rounded-lg shadow p-4 mb-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="md:col-span-2">
          <input type="text" id="patient-search" placeholder="Search by name, phone, patient ID, email..." 
            class="w-full border border-gray-300 rounded px-3 py-2"
            onkeyup="if(event.key==='Enter') applyPatientFilter()">
        </div>
        <div class="flex gap-2">
          <select id="patient-gender-filter" class="flex-1 border border-gray-300 rounded px-3 py-2">
            <option value="">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          <button onclick="applyPatientFilter()" class="bg-ayurveda-600 hover:bg-ayurveda-700 text-white px-4 py-2 rounded">
            <i class="fas fa-search"></i>
          </button>
          <button onclick="clearPatientFilter()" class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded" title="Clear">
            <i class="fas fa-times"></i>
          </button>
        </div>
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
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            ${currentPatients.map(patient => `
              <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 py-1 text-xs font-mono bg-blue-100 text-blue-800 rounded">${patient.patient_id || 'N/A'}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="font-medium text-gray-900">${patient.name}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  ${patient.age || 'N/A'} / ${patient.gender || 'N/A'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${patient.phone}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${patient.email || 'N/A'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                  <button onclick="viewPatientDetails(${patient.id})" class="text-blue-600 hover:text-blue-800" title="View Details">
                    <i class="fas fa-eye"></i>
                  </button>
                  <button onclick="editPatient(${patient.id})" class="text-green-600 hover:text-green-800" title="Edit">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button onclick="deletePatient(${patient.id})" class="text-red-600 hover:text-red-800" title="Delete">
                    <i class="fas fa-trash"></i>
                  </button>
                  <button onclick="createPrescriptionForPatient(${patient.id})" class="text-purple-600 hover:text-purple-800" title="New Prescription">
                    <i class="fas fa-file-prescription"></i>
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
    
    <div id="patient-form-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-2xl w-full max-h-screen overflow-y-auto">
        <h3 class="text-2xl font-bold mb-4" id="patient-form-title">Add Patient</h3>
        <form id="patient-form" onsubmit="savePatient(event)">
          <input type="hidden" id="patient-id">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input type="text" id="patient-name" required class="w-full border border-gray-300 rounded px-3 py-2">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Age</label>
              <input type="number" id="patient-age" class="w-full border border-gray-300 rounded px-3 py-2">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select id="patient-gender" class="w-full border border-gray-300 rounded px-3 py-2">
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
              <input type="tel" id="patient-phone" required class="w-full border border-gray-300 rounded px-3 py-2">
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" id="patient-email" class="w-full border border-gray-300 rounded px-3 py-2">
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea id="patient-address" rows="2" class="w-full border border-gray-300 rounded px-3 py-2"></textarea>
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Medical History</label>
              <textarea id="patient-history" rows="3" class="w-full border border-gray-300 rounded px-3 py-2"></textarea>
            </div>
          </div>
          <div class="flex justify-end space-x-3 mt-6">
            <button type="button" onclick="closePatientForm()" class="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">Cancel</button>
            <button type="submit" class="px-4 py-2 bg-ayurveda-600 text-white rounded hover:bg-ayurveda-700">Save</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function showPatientForm(patient = null) {
  document.getElementById('patient-form-modal').classList.remove('hidden');
  document.getElementById('patient-form-title').textContent = patient ? 'Edit Patient' : 'Add Patient';
  
  if (patient) {
    document.getElementById('patient-id').value = patient.id;
    document.getElementById('patient-name').value = patient.name;
    document.getElementById('patient-age').value = patient.age || '';
    document.getElementById('patient-gender').value = patient.gender || '';
    document.getElementById('patient-phone').value = patient.phone;
    document.getElementById('patient-email').value = patient.email || '';
    document.getElementById('patient-address').value = patient.address || '';
    document.getElementById('patient-history').value = patient.medical_history || '';
  } else {
    document.getElementById('patient-form').reset();
    document.getElementById('patient-id').value = '';
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
    age: parseInt(document.getElementById('patient-age').value) || null,
    gender: document.getElementById('patient-gender').value || null,
    phone: document.getElementById('patient-phone').value,
    email: document.getElementById('patient-email').value || null,
    address: document.getElementById('patient-address').value || null,
    medical_history: document.getElementById('patient-history').value || null
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

function applyPatientFilter() {
  const search = document.getElementById('patient-search').value;
  const gender = document.getElementById('patient-gender-filter').value;
  loadPatients(search, gender);
}

function clearPatientFilter() {
  document.getElementById('patient-search').value = '';
  document.getElementById('patient-gender-filter').value = '';
  loadPatients();
}

async function viewPatientDetails(id) {
  try {
    showLoading();
    const [patientRes, appointmentsRes, prescriptionsRes] = await Promise.all([
      axios.get(`${API_BASE}/patients/${id}`),
      axios.get(`${API_BASE}/patients/${id}/appointments`),
      axios.get(`${API_BASE}/patients/${id}/prescriptions`)
    ]);
    
    const patient = patientRes.data.data;
    const appointments = appointmentsRes.data.data;
    const prescriptions = prescriptionsRes.data.data;
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-white rounded-lg p-6 max-w-4xl w-full max-h-screen overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-2xl font-bold">Patient Details</h3>
          <button onclick="this.closest('.fixed').remove()" class="text-gray-600 hover:text-gray-800">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div><strong>Name:</strong> ${patient.name}</div>
          <div><strong>Age/Gender:</strong> ${patient.age || 'N/A'} / ${patient.gender || 'N/A'}</div>
          <div><strong>Phone:</strong> ${patient.phone}</div>
          <div><strong>Email:</strong> ${patient.email || 'N/A'}</div>
          <div class="md:col-span-2"><strong>Address:</strong> ${patient.address || 'N/A'}</div>
          <div class="md:col-span-2"><strong>Medical History:</strong> ${patient.medical_history || 'N/A'}</div>
        </div>
        
        <div class="mb-6">
          <h4 class="text-xl font-bold mb-3">Recent Appointments</h4>
          ${appointments.length > 0 ? `
            <div class="space-y-2">
              ${appointments.slice(0, 5).map(apt => `
                <div class="border rounded p-3">
                  <div class="flex justify-between">
                    <span><strong>Date:</strong> ${formatDateTime(apt.appointment_date)}</span>
                    <span class="px-2 py-1 text-xs rounded ${
                      apt.status === 'completed' ? 'bg-green-100 text-green-800' :
                      apt.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }">${apt.status}</span>
                  </div>
                  <div><strong>Purpose:</strong> ${apt.purpose || 'N/A'}</div>
                </div>
              `).join('')}
            </div>
          ` : '<p class="text-gray-500">No appointments yet</p>'}
        </div>
        
        <div>
          <h4 class="text-xl font-bold mb-3">Recent Prescriptions</h4>
          ${prescriptions.length > 0 ? `
            <div class="space-y-2">
              ${prescriptions.slice(0, 5).map(presc => `
                <div class="border rounded p-3">
                  <div><strong>Date:</strong> ${formatDate(presc.created_at)}</div>
                  <div><strong>Diagnosis:</strong> ${presc.diagnosis || 'N/A'}</div>
                  <div><strong>Follow-up:</strong> ${formatDate(presc.next_followup_date)}</div>
                </div>
              `).join('')}
            </div>
          ` : '<p class="text-gray-500">No prescriptions yet</p>'}
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    hideLoading();
  } catch (error) {
    console.error('Error loading patient details:', error);
    hideLoading();
  }
}

// ==================== APPOINTMENTS ====================

async function loadAppointments() {
  try {
    showLoading();
    const [appointmentsRes, patientsRes] = await Promise.all([
      axios.get(`${API_BASE}/appointments`),
      axios.get(`${API_BASE}/patients`)
    ]);
    
    if (appointmentsRes.data.success) {
      currentAppointments = appointmentsRes.data.data;
    }
    if (patientsRes.data.success) {
      currentPatients = patientsRes.data.data;
    }
    
    renderAppointments();
    hideLoading();
  } catch (error) {
    console.error('Error loading appointments:', error);
    hideLoading();
  }
}

function renderAppointments() {
  const section = document.getElementById('appointments-section');
  section.innerHTML = `
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-3xl font-bold text-gray-800">
        <i class="fas fa-calendar-alt mr-3 text-ayurveda-600"></i>Appointments
      </h2>
      <button onclick="showAppointmentForm()" class="bg-ayurveda-600 hover:bg-ayurveda-700 text-white px-4 py-2 rounded-lg shadow">
        <i class="fas fa-plus mr-2"></i>Add Appointment
      </button>
    </div>
    
    <div class="bg-white rounded-lg shadow-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Purpose</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            ${currentAppointments.map(apt => `
              <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="font-medium text-gray-900">${apt.patient_name}</div>
                  <div class="text-sm text-gray-500">${apt.patient_phone}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  ${formatDateTime(apt.appointment_date)}
                </td>
                <td class="px-6 py-4 text-sm text-gray-600">${apt.purpose || 'N/A'}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 py-1 text-xs rounded ${
                    apt.status === 'completed' ? 'bg-green-100 text-green-800' :
                    apt.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }">${apt.status}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                  <button onclick="editAppointment(${apt.id})" class="text-green-600 hover:text-green-800" title="Edit">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button onclick="deleteAppointment(${apt.id})" class="text-red-600 hover:text-red-800" title="Delete">
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
    
    <div id="appointment-form-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-xl w-full">
        <h3 class="text-2xl font-bold mb-4" id="appointment-form-title">Add Appointment</h3>
        <form id="appointment-form" onsubmit="saveAppointment(event)">
          <input type="hidden" id="appointment-id">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Patient *</label>
              <select id="appointment-patient" required class="w-full border border-gray-300 rounded px-3 py-2">
                <option value="">Select Patient</option>
                ${currentPatients.map(p => `<option value="${p.id}">${p.name} (${p.phone})</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Date & Time *</label>
              <input type="datetime-local" id="appointment-date" required class="w-full border border-gray-300 rounded px-3 py-2">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
              <input type="text" id="appointment-purpose" class="w-full border border-gray-300 rounded px-3 py-2">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select id="appointment-status" class="w-full border border-gray-300 rounded px-3 py-2">
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea id="appointment-notes" rows="3" class="w-full border border-gray-300 rounded px-3 py-2"></textarea>
            </div>
          </div>
          <div class="flex justify-end space-x-3 mt-6">
            <button type="button" onclick="closeAppointmentForm()" class="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">Cancel</button>
            <button type="submit" class="px-4 py-2 bg-ayurveda-600 text-white rounded hover:bg-ayurveda-700">Save</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function showAppointmentForm(appointment = null) {
  document.getElementById('appointment-form-modal').classList.remove('hidden');
  document.getElementById('appointment-form-title').textContent = appointment ? 'Edit Appointment' : 'Add Appointment';
  
  if (appointment) {
    document.getElementById('appointment-id').value = appointment.id;
    document.getElementById('appointment-patient').value = appointment.patient_id;
    document.getElementById('appointment-date').value = new Date(appointment.appointment_date).toISOString().slice(0, 16);
    document.getElementById('appointment-purpose').value = appointment.purpose || '';
    document.getElementById('appointment-status').value = appointment.status;
    document.getElementById('appointment-notes').value = appointment.notes || '';
  } else {
    document.getElementById('appointment-form').reset();
    document.getElementById('appointment-id').value = '';
  }
}

function closeAppointmentForm() {
  document.getElementById('appointment-form-modal').classList.add('hidden');
}

async function saveAppointment(event) {
  event.preventDefault();
  
  const id = document.getElementById('appointment-id').value;
  const data = {
    patient_id: parseInt(document.getElementById('appointment-patient').value),
    appointment_date: new Date(document.getElementById('appointment-date').value).toISOString(),
    purpose: document.getElementById('appointment-purpose').value || null,
    status: document.getElementById('appointment-status').value,
    notes: document.getElementById('appointment-notes').value || null
  };
  
  try {
    showLoading();
    if (id) {
      await axios.put(`${API_BASE}/appointments/${id}`, data);
    } else {
      await axios.post(`${API_BASE}/appointments`, data);
    }
    closeAppointmentForm();
    loadAppointments();
  } catch (error) {
    console.error('Error saving appointment:', error);
    alert('Error saving appointment');
    hideLoading();
  }
}

function editAppointment(id) {
  const appointment = currentAppointments.find(a => a.id === id);
  if (appointment) showAppointmentForm(appointment);
}

async function deleteAppointment(id) {
  if (!confirm('Are you sure you want to delete this appointment?')) return;
  
  try {
    showLoading();
    await axios.delete(`${API_BASE}/appointments/${id}`);
    loadAppointments();
  } catch (error) {
    console.error('Error deleting appointment:', error);
    alert('Error deleting appointment');
    hideLoading();
  }
}

// Continue in next part...

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  loadDashboard();
  
  // Register service worker for PWA
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/static/sw.js')
      .then(reg => console.log('Service Worker registered'))
      .catch(err => console.log('Service Worker registration failed', err));
  }
});
// ==================== PRESCRIPTIONS ====================

async function loadPrescriptions() {
  try {
    showLoading();
    const [prescriptionsRes, patientsRes, medicinesRes] = await Promise.all([
      axios.get(`${API_BASE}/prescriptions`),
      axios.get(`${API_BASE}/patients`),
      axios.get(`${API_BASE}/medicines`)
    ]);
    
    if (prescriptionsRes.data.success) {
      currentPrescriptions = prescriptionsRes.data.data;
    }
    if (patientsRes.data.success) {
      currentPatients = patientsRes.data.data;
    }
    if (medicinesRes.data.success) {
      currentMedicines = medicinesRes.data.data;
    }
    
    renderPrescriptions();
    hideLoading();
  } catch (error) {
    console.error('Error loading prescriptions:', error);
    hideLoading();
  }
}

function renderPrescriptions() {
  const section = document.getElementById('prescriptions-section');
  section.innerHTML = `
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-3xl font-bold text-gray-800">
        <i class="fas fa-file-prescription mr-3 text-ayurveda-600"></i>Prescriptions
      </h2>
      <button onclick="showPrescriptionForm()" class="bg-ayurveda-600 hover:bg-ayurveda-700 text-white px-4 py-2 rounded-lg shadow">
        <i class="fas fa-plus mr-2"></i>New Prescription
      </button>
    </div>
    
    <div class="bg-white rounded-lg shadow-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Diagnosis</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Follow-up</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            ${currentPrescriptions.map(presc => `
              <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="font-medium text-gray-900">${presc.patient_name}</div>
                  <div class="text-sm text-gray-500">${presc.patient_phone}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  ${formatDate(presc.created_at)}
                </td>
                <td class="px-6 py-4 text-sm text-gray-600">${presc.diagnosis || 'N/A'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  ${formatDate(presc.next_followup_date)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                  <button onclick="viewPrescription(${presc.id})" class="text-blue-600 hover:text-blue-800" title="View">
                    <i class="fas fa-eye"></i>
                  </button>
                  <button onclick="editPrescription(${presc.id})" class="text-purple-600 hover:text-purple-800" title="Edit">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button onclick="printPrescription(${presc.id})" class="text-green-600 hover:text-green-800" title="Print">
                    <i class="fas fa-print"></i>
                  </button>
                  <button onclick="deletePrescription(${presc.id})" class="text-red-600 hover:text-red-800" title="Delete">
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
    
    <div id="prescription-form-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div class="bg-white rounded-lg p-6 max-w-4xl w-full my-8">
        <h3 class="text-2xl font-bold mb-4">New Prescription</h3>
        <form id="prescription-form" onsubmit="savePrescription(event)">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Patient *</label>
              <select id="prescription-patient" required class="w-full border border-gray-300 rounded px-3 py-2">
                <option value="">Select Patient</option>
                ${currentPatients.map(p => `<option value="${p.id}">${p.name} (${p.phone})</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Next Follow-up Date</label>
              <input type="date" id="prescription-followup" class="w-full border border-gray-300 rounded px-3 py-2">
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Diagnosis</label>
              <textarea id="prescription-diagnosis" rows="2" class="w-full border border-gray-300 rounded px-3 py-2"></textarea>
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea id="prescription-notes" rows="2" class="w-full border border-gray-300 rounded px-3 py-2"></textarea>
            </div>
          </div>
          
          <div class="border-t pt-4 mb-4">
            <div class="flex items-center justify-between mb-3">
              <h4 class="text-lg font-bold">Medicines</h4>
              <button type="button" onclick="addMedicineRow()" class="text-ayurveda-600 hover:text-ayurveda-800">
                <i class="fas fa-plus-circle mr-1"></i>Add Medicine
              </button>
            </div>
            <div id="medicines-list" class="space-y-3">
              <!-- Medicine rows will be added here -->
            </div>
          </div>
          
          <div class="flex justify-end space-x-3 mt-6">
            <button type="button" onclick="closePrescriptionForm()" class="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">Cancel</button>
            <button type="submit" class="px-4 py-2 bg-ayurveda-600 text-white rounded hover:bg-ayurveda-700">Save Prescription</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function showPrescriptionForm() {
  document.getElementById('prescription-form-modal').classList.remove('hidden');
  document.getElementById('prescription-form').reset();
  document.getElementById('medicines-list').innerHTML = '';
  addMedicineRow();
}

function createPrescriptionForPatient(patientId) {
  showSection('prescriptions');
  setTimeout(() => {
    showPrescriptionForm();
    document.getElementById('prescription-patient').value = patientId;
  }, 100);
}

function closePrescriptionForm() {
  document.getElementById('prescription-form-modal').classList.add('hidden');
}

function addMedicineRow() {
  const container = document.getElementById('medicines-list');
  const index = container.children.length;
  const row = document.createElement('div');
  row.className = 'grid grid-cols-12 gap-2 items-end';
  row.innerHTML = `
    <div class="col-span-3">
      <label class="block text-xs font-medium text-gray-700 mb-1">Medicine</label>
      <select class="medicine-select w-full border border-gray-300 rounded px-2 py-1 text-sm">
        <option value="">Select</option>
        ${currentMedicines.map(m => `<option value="${m.id}">${m.name}</option>`).join('')}
      </select>
    </div>
    <div class="col-span-2">
      <label class="block text-xs font-medium text-gray-700 mb-1">Dosage</label>
      <input type="text" class="medicine-dosage w-full border border-gray-300 rounded px-2 py-1 text-sm" placeholder="e.g., 500mg">
    </div>
    <div class="col-span-2">
      <label class="block text-xs font-medium text-gray-700 mb-1">Frequency</label>
      <input type="text" class="medicine-frequency w-full border border-gray-300 rounded px-2 py-1 text-sm" placeholder="e.g., Twice daily">
    </div>
    <div class="col-span-2">
      <label class="block text-xs font-medium text-gray-700 mb-1">Duration</label>
      <input type="text" class="medicine-duration w-full border border-gray-300 rounded px-2 py-1 text-sm" placeholder="e.g., 7 days">
    </div>
    <div class="col-span-2">
      <label class="block text-xs font-medium text-gray-700 mb-1">Instructions</label>
      <input type="text" class="medicine-instructions w-full border border-gray-300 rounded px-2 py-1 text-sm" placeholder="After meal">
    </div>
    <div class="col-span-1">
      <button type="button" onclick="this.parentElement.parentElement.remove()" class="w-full text-red-600 hover:text-red-800 py-1">
        <i class="fas fa-trash"></i>
      </button>
    </div>
  `;
  container.appendChild(row);
}

async function savePrescription(event) {
  event.preventDefault();
  
  const patientId = parseInt(document.getElementById('prescription-patient').value);
  const followupDate = document.getElementById('prescription-followup').value || null;
  const diagnosis = document.getElementById('prescription-diagnosis').value || null;
  const notes = document.getElementById('prescription-notes').value || null;
  
  // Collect medicines
  const medicineRows = document.querySelectorAll('#medicines-list > div');
  const medicines = [];
  medicineRows.forEach(row => {
    const medicineId = row.querySelector('.medicine-select').value;
    const dosage = row.querySelector('.medicine-dosage').value;
    if (medicineId && dosage) {
      medicines.push({
        medicine_id: parseInt(medicineId),
        dosage: dosage,
        frequency: row.querySelector('.medicine-frequency').value || null,
        duration: row.querySelector('.medicine-duration').value || null,
        instructions: row.querySelector('.medicine-instructions').value || null
      });
    }
  });
  
  const data = {
    patient_id: patientId,
    appointment_id: null,
    diagnosis: diagnosis,
    notes: notes,
    next_followup_date: followupDate,
    medicines: medicines
  };
  
  try {
    showLoading();
    await axios.post(`${API_BASE}/prescriptions`, data);
    closePrescriptionForm();
    loadPrescriptions();
  } catch (error) {
    console.error('Error saving prescription:', error);
    alert('Error saving prescription');
    hideLoading();
  }
}

async function viewPrescription(id) {
  try {
    showLoading();
    const res = await axios.get(`${API_BASE}/prescriptions/${id}`);
    if (!res.data.success) {
      alert('Error loading prescription');
      hideLoading();
      return;
    }
    
    const presc = res.data.data;
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-white rounded-lg p-8 max-w-3xl w-full max-h-screen overflow-y-auto">
        <div class="flex justify-between items-center mb-6 border-b pb-4">
          <h3 class="text-2xl font-bold text-ayurveda-700">Prescription Details</h3>
          <button onclick="this.closest('.fixed').remove()" class="text-gray-600 hover:text-gray-800">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>
        
        <div class="mb-6">
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div><strong>Patient:</strong> ${presc.patient_name}</div>
            <div><strong>Phone:</strong> ${presc.patient_phone}</div>
            <div><strong>Date:</strong> ${formatDate(presc.created_at)}</div>
            <div><strong>Follow-up:</strong> ${formatDate(presc.next_followup_date)}</div>
          </div>
          <div class="mb-2"><strong>Diagnosis:</strong></div>
          <div class="bg-gray-50 p-3 rounded">${presc.diagnosis || 'N/A'}</div>
          ${presc.notes ? `
            <div class="mt-3 mb-2"><strong>Notes:</strong></div>
            <div class="bg-gray-50 p-3 rounded">${presc.notes}</div>
          ` : ''}
        </div>
        
        <div>
          <h4 class="text-xl font-bold mb-3">Prescribed Medicines</h4>
          ${presc.medicines && presc.medicines.length > 0 ? `
            <table class="w-full border">
              <thead class="bg-gray-100">
                <tr>
                  <th class="border px-3 py-2 text-left">Medicine</th>
                  <th class="border px-3 py-2 text-left">Dosage</th>
                  <th class="border px-3 py-2 text-left">Frequency</th>
                  <th class="border px-3 py-2 text-left">Duration</th>
                  <th class="border px-3 py-2 text-left">Instructions</th>
                </tr>
              </thead>
              <tbody>
                ${presc.medicines.map(med => `
                  <tr>
                    <td class="border px-3 py-2">${med.medicine_name}</td>
                    <td class="border px-3 py-2">${med.dosage}</td>
                    <td class="border px-3 py-2">${med.frequency || 'N/A'}</td>
                    <td class="border px-3 py-2">${med.duration || 'N/A'}</td>
                    <td class="border px-3 py-2">${med.instructions || 'N/A'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : '<p class="text-gray-500">No medicines prescribed</p>'}
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    hideLoading();
  } catch (error) {
    console.error('Error viewing prescription:', error);
    hideLoading();
  }
}

function printPrescription(id) {
  viewPrescription(id);
  setTimeout(() => window.print(), 500);
}

async function deletePrescription(id) {
  if (!confirm('Are you sure you want to delete this prescription?')) return;
  
  try {
    showLoading();
    await axios.delete(`${API_BASE}/prescriptions/${id}`);
    loadPrescriptions();
  } catch (error) {
    console.error('Error deleting prescription:', error);
    alert('Error deleting prescription');
    hideLoading();
  }
}

// ==================== PHARMACY ====================

async function loadPharmacy() {
  try {
    showLoading();
    const res = await axios.get(`${API_BASE}/medicines`);
    if (res.data.success) {
      currentMedicines = res.data.data;
      renderPharmacy();
    }
    hideLoading();
  } catch (error) {
    console.error('Error loading pharmacy:', error);
    hideLoading();
  }
}

function renderPharmacy() {
  const section = document.getElementById('pharmacy-section');
  section.innerHTML = `
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-3xl font-bold text-gray-800">
        <i class="fas fa-pills mr-3 text-ayurveda-600"></i>Pharmacy Inventory
      </h2>
      <div class="flex gap-2">
        <button onclick="showPharmacyStockReport()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow">
          <i class="fas fa-chart-bar mr-2"></i>Stock Report
        </button>
        <button onclick="showMedicineForm()" class="bg-ayurveda-600 hover:bg-ayurveda-700 text-white px-4 py-2 rounded-lg shadow">
          <i class="fas fa-plus mr-2"></i>Add Medicine
        </button>
      </div>
    </div>
    
    <div class="bg-white rounded-lg shadow-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expiry</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            ${currentMedicines.map(med => `
              <tr class="hover:bg-gray-50 ${med.quantity < 20 ? 'bg-red-50' : ''}">
                <td class="px-6 py-4">
                  <div class="font-medium text-gray-900">${med.name}</div>
                  <div class="text-sm text-gray-500">${med.manufacturer || 'N/A'}</div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-600">${med.category || 'N/A'}</td>
                <td class="px-6 py-4 text-sm">
                  <span class="${med.quantity < 20 ? 'text-red-600 font-bold' : 'text-gray-600'}">
                    ${med.quantity} ${med.unit || ''}
                  </span>
                  ${med.quantity < 20 ? '<i class="fas fa-exclamation-triangle text-red-500 ml-2"></i>' : ''}
                </td>
                <td class="px-6 py-4 text-sm text-gray-600">₹${med.price || 'N/A'}</td>
                <td class="px-6 py-4 text-sm text-gray-600">${formatDate(med.expiry_date)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                  <button onclick="editMedicine(${med.id})" class="text-green-600 hover:text-green-800" title="Edit">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button onclick="deleteMedicine(${med.id})" class="text-red-600 hover:text-red-800" title="Delete">
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
    
    <div id="medicine-form-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-2xl w-full max-h-screen overflow-y-auto">
        <h3 class="text-2xl font-bold mb-4" id="medicine-form-title">Add Medicine</h3>
        <form id="medicine-form" onsubmit="saveMedicine(event)">
          <input type="hidden" id="medicine-id">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input type="text" id="medicine-name" required class="w-full border border-gray-300 rounded px-3 py-2">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input type="text" id="medicine-category" class="w-full border border-gray-300 rounded px-3 py-2">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
              <input type="number" id="medicine-quantity" required class="w-full border border-gray-300 rounded px-3 py-2">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Unit</label>
              <input type="text" id="medicine-unit" placeholder="e.g., tablets, grams" class="w-full border border-gray-300 rounded px-3 py-2">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
              <input type="number" step="0.01" id="medicine-price" class="w-full border border-gray-300 rounded px-3 py-2">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
              <input type="date" id="medicine-expiry" class="w-full border border-gray-300 rounded px-3 py-2">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Manufacturer</label>
              <input type="text" id="medicine-manufacturer" class="w-full border border-gray-300 rounded px-3 py-2">
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea id="medicine-description" rows="2" class="w-full border border-gray-300 rounded px-3 py-2"></textarea>
            </div>
          </div>
          <div class="flex justify-end space-x-3 mt-6">
            <button type="button" onclick="closeMedicineForm()" class="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">Cancel</button>
            <button type="submit" class="px-4 py-2 bg-ayurveda-600 text-white rounded hover:bg-ayurveda-700">Save</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function showMedicineForm(medicine = null) {
  document.getElementById('medicine-form-modal').classList.remove('hidden');
  document.getElementById('medicine-form-title').textContent = medicine ? 'Edit Medicine' : 'Add Medicine';
  
  if (medicine) {
    document.getElementById('medicine-id').value = medicine.id;
    document.getElementById('medicine-name').value = medicine.name;
    document.getElementById('medicine-category').value = medicine.category || '';
    document.getElementById('medicine-quantity').value = medicine.quantity;
    document.getElementById('medicine-unit').value = medicine.unit || '';
    document.getElementById('medicine-price').value = medicine.price || '';
    document.getElementById('medicine-expiry').value = medicine.expiry_date || '';
    document.getElementById('medicine-manufacturer').value = medicine.manufacturer || '';
    document.getElementById('medicine-description').value = medicine.description || '';
  } else {
    document.getElementById('medicine-form').reset();
    document.getElementById('medicine-id').value = '';
  }
}

function closeMedicineForm() {
  document.getElementById('medicine-form-modal').classList.add('hidden');
}

async function saveMedicine(event) {
  event.preventDefault();
  
  const id = document.getElementById('medicine-id').value;
  const data = {
    name: document.getElementById('medicine-name').value,
    category: document.getElementById('medicine-category').value || null,
    quantity: parseInt(document.getElementById('medicine-quantity').value),
    unit: document.getElementById('medicine-unit').value || null,
    price: parseFloat(document.getElementById('medicine-price').value) || null,
    expiry_date: document.getElementById('medicine-expiry').value || null,
    manufacturer: document.getElementById('medicine-manufacturer').value || null,
    description: document.getElementById('medicine-description').value || null
  };
  
  try {
    showLoading();
    if (id) {
      await axios.put(`${API_BASE}/medicines/${id}`, data);
    } else {
      await axios.post(`${API_BASE}/medicines`, data);
    }
    closeMedicineForm();
    loadPharmacy();
  } catch (error) {
    console.error('Error saving medicine:', error);
    alert('Error saving medicine');
    hideLoading();
  }
}

function editMedicine(id) {
  const medicine = currentMedicines.find(m => m.id === id);
  if (medicine) showMedicineForm(medicine);
}

async function deleteMedicine(id) {
  if (!confirm('Are you sure you want to delete this medicine?')) return;
  
  try {
    showLoading();
    await axios.delete(`${API_BASE}/medicines/${id}`);
    loadPharmacy();
  } catch (error) {
    console.error('Error deleting medicine:', error);
    alert('Error deleting medicine');
    hideLoading();
  }
}

// ==================== REMINDERS ====================

async function loadReminders() {
  try {
    showLoading();
    const [remindersRes, patientsRes] = await Promise.all([
      axios.get(`${API_BASE}/reminders`),
      axios.get(`${API_BASE}/patients`)
    ]);
    
    if (remindersRes.data.success) {
      currentReminders = remindersRes.data.data;
    }
    if (patientsRes.data.success) {
      currentPatients = patientsRes.data.data;
    }
    
    renderReminders();
    hideLoading();
  } catch (error) {
    console.error('Error loading reminders:', error);
    hideLoading();
  }
}

function renderReminders() {
  const section = document.getElementById('reminders-section');
  const pendingReminders = currentReminders.filter(r => r.status === 'pending');
  const sentReminders = currentReminders.filter(r => r.status === 'sent');
  
  section.innerHTML = `
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-3xl font-bold text-gray-800">
        <i class="fas fa-bell mr-3 text-ayurveda-600"></i>Reminders & Notifications
      </h2>
      <button onclick="showReminderForm()" class="bg-ayurveda-600 hover:bg-ayurveda-700 text-white px-4 py-2 rounded-lg shadow">
        <i class="fas fa-plus mr-2"></i>Add Reminder
      </button>
    </div>
    
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white rounded-lg shadow-lg p-6">
        <h3 class="text-xl font-bold mb-4 text-yellow-700">
          <i class="fas fa-clock mr-2"></i>Pending Reminders (${pendingReminders.length})
        </h3>
        <div class="space-y-3 max-h-96 overflow-y-auto">
          ${pendingReminders.length > 0 ? pendingReminders.map(reminder => `
            <div class="border rounded-lg p-4 ${new Date(reminder.reminder_date) < new Date() ? 'border-red-300 bg-red-50' : 'border-gray-200'}">
              <div class="flex justify-between items-start mb-2">
                <div>
                  <div class="font-semibold text-gray-900">${reminder.patient_name}</div>
                  <div class="text-sm text-gray-600">${reminder.patient_phone}</div>
                </div>
                <span class="px-2 py-1 text-xs rounded ${
                  reminder.reminder_type === 'followup' ? 'bg-blue-100 text-blue-800' :
                  reminder.reminder_type === 'medicine' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }">${reminder.reminder_type}</span>
              </div>
              <div class="text-sm mb-2">
                <strong>Date:</strong> ${formatDateTime(reminder.reminder_date)}
              </div>
              <div class="text-sm mb-3">${reminder.message || 'No message'}</div>
              <div class="flex items-center space-x-2 text-xs mb-3">
                ${reminder.send_whatsapp ? '<span class="px-2 py-1 bg-green-100 text-green-700 rounded"><i class="fab fa-whatsapp mr-1"></i>WhatsApp</span>' : ''}
                ${reminder.send_sms ? '<span class="px-2 py-1 bg-blue-100 text-blue-700 rounded"><i class="fas fa-sms mr-1"></i>SMS</span>' : ''}
              </div>
              <div class="flex space-x-2">
                <button onclick="sendReminder(${reminder.id})" class="flex-1 bg-ayurveda-600 hover:bg-ayurveda-700 text-white px-3 py-1 rounded text-sm">
                  <i class="fas fa-paper-plane mr-1"></i>Send Now
                </button>
                <button onclick="deleteReminder(${reminder.id})" class="px-3 py-1 text-red-600 hover:text-red-800 border border-red-300 rounded text-sm">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          `).join('') : '<p class="text-gray-500 text-center py-8">No pending reminders</p>'}
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow-lg p-6">
        <h3 class="text-xl font-bold mb-4 text-green-700">
          <i class="fas fa-check-circle mr-2"></i>Sent Reminders (${sentReminders.length})
        </h3>
        <div class="space-y-3 max-h-96 overflow-y-auto">
          ${sentReminders.length > 0 ? sentReminders.slice(0, 20).map(reminder => `
            <div class="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div class="flex justify-between items-start mb-2">
                <div>
                  <div class="font-semibold text-gray-900">${reminder.patient_name}</div>
                  <div class="text-sm text-gray-600">${reminder.patient_phone}</div>
                </div>
                <span class="px-2 py-1 text-xs rounded ${
                  reminder.reminder_type === 'followup' ? 'bg-blue-100 text-blue-800' :
                  reminder.reminder_type === 'medicine' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }">${reminder.reminder_type}</span>
              </div>
              <div class="text-sm mb-2">
                <strong>Sent:</strong> ${formatDateTime(reminder.sent_at)}
              </div>
              <div class="text-sm text-gray-600">${reminder.message || 'No message'}</div>
            </div>
          `).join('') : '<p class="text-gray-500 text-center py-8">No sent reminders</p>'}
        </div>
      </div>
    </div>
    
    <div id="reminder-form-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-xl w-full">
        <h3 class="text-2xl font-bold mb-4">Add Reminder</h3>
        <form id="reminder-form" onsubmit="saveReminder(event)">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Patient *</label>
              <select id="reminder-patient" required class="w-full border border-gray-300 rounded px-3 py-2">
                <option value="">Select Patient</option>
                ${currentPatients.map(p => `<option value="${p.id}">${p.name} (${p.phone})</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Reminder Type *</label>
              <select id="reminder-type" required class="w-full border border-gray-300 rounded px-3 py-2">
                <option value="followup">Follow-up Appointment</option>
                <option value="medicine">Medicine Refill</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Reminder Date & Time *</label>
              <input type="datetime-local" id="reminder-date" required class="w-full border border-gray-300 rounded px-3 py-2">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea id="reminder-message" rows="3" class="w-full border border-gray-300 rounded px-3 py-2" placeholder="Reminder message..."></textarea>
            </div>
            <div class="flex items-center space-x-4">
              <label class="flex items-center">
                <input type="checkbox" id="reminder-whatsapp" checked class="mr-2">
                <i class="fab fa-whatsapp text-green-600 mr-1"></i>
                <span class="text-sm">Send WhatsApp</span>
              </label>
              <label class="flex items-center">
                <input type="checkbox" id="reminder-sms" checked class="mr-2">
                <i class="fas fa-sms text-blue-600 mr-1"></i>
                <span class="text-sm">Send SMS</span>
              </label>
            </div>
          </div>
          <div class="flex justify-end space-x-3 mt-6">
            <button type="button" onclick="closeReminderForm()" class="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">Cancel</button>
            <button type="submit" class="px-4 py-2 bg-ayurveda-600 text-white rounded hover:bg-ayurveda-700">Save</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function showReminderForm() {
  document.getElementById('reminder-form-modal').classList.remove('hidden');
  document.getElementById('reminder-form').reset();
}

function closeReminderForm() {
  document.getElementById('reminder-form-modal').classList.add('hidden');
}

async function saveReminder(event) {
  event.preventDefault();
  
  const data = {
    patient_id: parseInt(document.getElementById('reminder-patient').value),
    prescription_id: null,
    reminder_type: document.getElementById('reminder-type').value,
    reminder_date: new Date(document.getElementById('reminder-date').value).toISOString(),
    message: document.getElementById('reminder-message').value || null,
    send_whatsapp: document.getElementById('reminder-whatsapp').checked,
    send_sms: document.getElementById('reminder-sms').checked
  };
  
  try {
    showLoading();
    await axios.post(`${API_BASE}/reminders`, data);
    closeReminderForm();
    loadReminders();
  } catch (error) {
    console.error('Error saving reminder:', error);
    alert('Error saving reminder');
    hideLoading();
  }
}

async function sendReminder(id) {
  try {
    showLoading();
    await axios.put(`${API_BASE}/reminders/${id}/sent`);
    alert('Reminder marked as sent! In production, this would trigger WhatsApp/SMS notifications.');
    loadReminders();
  } catch (error) {
    console.error('Error sending reminder:', error);
    alert('Error sending reminder');
    hideLoading();
  }
}

async function deleteReminder(id) {
  if (!confirm('Are you sure you want to delete this reminder?')) return;
  
  try {
    showLoading();
    await axios.delete(`${API_BASE}/reminders/${id}`);
    loadReminders();
  } catch (error) {
    console.error('Error deleting reminder:', error);
    alert('Error deleting reminder');
    hideLoading();
  }
}

// ==================== SETTINGS ====================

async function loadSettings() {
  try {
    showLoading();
    const res = await axios.get(`${API_BASE}/settings`);
    if (res.data.success) {
      currentSettings = res.data.data;
      renderSettings();
    }
    hideLoading();
  } catch (error) {
    console.error('Error loading settings:', error);
    hideLoading();
  }
}

function renderSettings() {
  const section = document.getElementById('settings-section');
  section.innerHTML = `
    <h2 class="text-3xl font-bold text-gray-800 mb-6">
      <i class="fas fa-cog mr-3 text-ayurveda-600"></i>Settings
    </h2>
    
    <div class="bg-white rounded-lg shadow-lg p-6">
      <form id="settings-form" onsubmit="saveSettings(event)">
        <div class="space-y-6">
          <div>
            <h3 class="text-xl font-bold mb-4 border-b pb-2">Clinic Information</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Clinic Name</label>
                <input type="text" id="setting-clinic-name" value="${currentSettings.clinic_name || ''}" class="w-full border border-gray-300 rounded px-3 py-2">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Doctor Name</label>
                <input type="text" id="setting-doctor-name" value="${currentSettings.doctor_name || ''}" class="w-full border border-gray-300 rounded px-3 py-2">
              </div>
            </div>
          </div>
          
          <div>
            <h3 class="text-xl font-bold mb-4 border-b pb-2">Notification Settings</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Reminder Days Before Follow-up</label>
                <input type="number" id="setting-reminder-days" value="${currentSettings.reminder_days_before || '3'}" class="w-full border border-gray-300 rounded px-3 py-2">
                <p class="text-xs text-gray-500 mt-1">Number of days before follow-up to send reminder</p>
              </div>
              <div class="flex items-center space-x-6">
                <label class="flex items-center">
                  <input type="checkbox" id="setting-whatsapp-enabled" ${currentSettings.whatsapp_enabled === 'true' ? 'checked' : ''} class="mr-2">
                  <i class="fab fa-whatsapp text-green-600 mr-2"></i>
                  <span>Enable WhatsApp Notifications</span>
                </label>
                <label class="flex items-center">
                  <input type="checkbox" id="setting-sms-enabled" ${currentSettings.sms_enabled === 'true' ? 'checked' : ''} class="mr-2">
                  <i class="fas fa-sms text-blue-600 mr-2"></i>
                  <span>Enable SMS Notifications</span>
                </label>
              </div>
            </div>
          </div>
          
          <div>
            <h3 class="text-xl font-bold mb-4 border-b pb-2">API Configuration</h3>
            <div class="bg-yellow-50 border border-yellow-200 rounded p-4 mb-4">
              <p class="text-sm text-yellow-800">
                <i class="fas fa-info-circle mr-2"></i>
                To enable automated WhatsApp and SMS reminders, you need to configure API keys from service providers like Twilio, MSG91, or similar services.
              </p>
            </div>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">WhatsApp API Key</label>
                <input type="password" id="setting-whatsapp-key" value="${currentSettings.whatsapp_api_key || ''}" placeholder="Enter your WhatsApp API key" class="w-full border border-gray-300 rounded px-3 py-2">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">SMS API Key</label>
                <input type="password" id="setting-sms-key" value="${currentSettings.sms_api_key || ''}" placeholder="Enter your SMS API key" class="w-full border border-gray-300 rounded px-3 py-2">
              </div>
            </div>
          </div>
        </div>
        
        <div class="flex justify-end mt-6">
          <button type="submit" class="px-6 py-2 bg-ayurveda-600 text-white rounded-lg hover:bg-ayurveda-700 shadow">
            <i class="fas fa-save mr-2"></i>Save Settings
          </button>
        </div>
      </form>
    </div>
  `;
}

async function saveSettings(event) {
  event.preventDefault();
  
  const settings = {
    clinic_name: document.getElementById('setting-clinic-name').value,
    doctor_name: document.getElementById('setting-doctor-name').value,
    reminder_days_before: document.getElementById('setting-reminder-days').value,
    whatsapp_enabled: document.getElementById('setting-whatsapp-enabled').checked ? 'true' : 'false',
    sms_enabled: document.getElementById('setting-sms-enabled').checked ? 'true' : 'false',
    whatsapp_api_key: document.getElementById('setting-whatsapp-key').value,
    sms_api_key: document.getElementById('setting-sms-key').value
  };
  
  try {
    showLoading();
    for (const [key, value] of Object.entries(settings)) {
      await axios.put(`${API_BASE}/settings/${key}`, { value });
    }
    alert('Settings saved successfully!');
    hideLoading();
  } catch (error) {
    console.error('Error saving settings:', error);
    alert('Error saving settings');
    hideLoading();
  }
}
