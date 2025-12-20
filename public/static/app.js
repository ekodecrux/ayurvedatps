// TPS DHANVANTRI AYURVEDA - Complete Application
const API_BASE = '/api';
let currentPatients = [];
let currentAppointments = [];
let currentHerbsRoutes = [];
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

function showPatientModal(patient = null) {
  const modal = document.getElementById('patient-modal');
  const title = document.getElementById('patient-modal-title');
  const form = document.getElementById('patient-form');
  
  title.textContent = patient ? 'Edit Patient' : 'Add New Patient';
  
  if (patient) {
    document.getElementById('patient-id').value = patient.id;
    document.getElementById('patient-name').value = patient.name || '';
    document.getElementById('patient-age').value = patient.age || '';
    document.getElementById('patient-gender').value = patient.gender || '';
    document.getElementById('patient-country').value = patient.country || 'India';
    document.getElementById('patient-country-code').value = patient.country_code || '+91';
    document.getElementById('patient-phone').value = patient.phone || '';
    document.getElementById('patient-email').value = patient.email || '';
    document.getElementById('patient-weight').value = patient.weight || '';
    document.getElementById('patient-height').value = patient.height || '';
    document.getElementById('patient-address').value = patient.address || '';
    document.getElementById('patient-medical-history').value = patient.medical_history || '';
    document.getElementById('patient-referred-by').value = patient.referred_by_name || '';
  } else {
    form.reset();
    document.getElementById('patient-id').value = '';
    document.getElementById('patient-country').value = 'India';
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
    
    const data = {
      name: document.getElementById('patient-name').value,
      age: parseInt(document.getElementById('patient-age').value) || null,
      gender: document.getElementById('patient-gender').value,
      country: document.getElementById('patient-country').value,
      country_code: document.getElementById('patient-country-code').value,
      phone: document.getElementById('patient-phone').value,
      email: document.getElementById('patient-email').value,
      weight: parseFloat(document.getElementById('patient-weight').value) || null,
      height: parseFloat(document.getElementById('patient-height').value) || null,
      address: document.getElementById('patient-address').value,
      medical_history: document.getElementById('patient-medical-history').value,
      referred_by_name: document.getElementById('patient-referred-by').value
    };
    
    if (id) {
      await axios.put(`${API_BASE}/patients/${id}`, data);
      alert('Patient updated successfully');
    } else {
      await axios.post(`${API_BASE}/patients`, data);
      alert('Patient added successfully');
    }
    
    closePatientModal();
    loadPatients();
  } catch (error) {
    console.error('Save patient error:', error);
    alert('Error saving patient');
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

async function exportPatients() {
  try {
    const country = document.getElementById('patient-filter-country')?.value || '';
    let url = `${API_BASE}/patients/export?format=csv`;
    if (country) url += `&country=${country}`;
    
    window.open(url, '_blank');
  } catch (error) {
    console.error('Export error:', error);
    alert('Error exporting patients');
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
  const modal = document.getElementById('appointment-modal');
  const title = document.getElementById('appointment-modal-title');
  
  title.textContent = appointment ? 'Edit Appointment' : 'Add New Appointment';
  
  if (appointment) {
    document.getElementById('appointment-id').value = appointment.id;
    document.getElementById('appointment-patient').value = appointment.patient_id;
    document.getElementById('appointment-date').value = appointment.appointment_date ? appointment.appointment_date.substring(0, 16) : '';
    document.getElementById('appointment-reason').value = appointment.reason || '';
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
      reason: document.getElementById('appointment-reason').value,
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
    showAppointmentModal(res.data.data);
  } catch (error) {
    console.error('Load appointment error:', error);
    alert('Error loading appointment details');
  } finally {
    hideLoading();
  }
}

// ==================== HERBS & ROUTES (PRESCRIPTIONS) ====================
async function loadHerbsRoutes() {
  try {
    showLoading();
    const search = document.getElementById('prescription-search')?.value || '';
    
    const res = await axios.get(`${API_BASE}/herbs-routes?search=${search}`);
    currentHerbsRoutes = res.data.data || [];
    renderHerbsRoutes();
  } catch (error) {
    console.error('Load herbs & routes error:', error);
    alert('Error loading herbs & routes');
  } finally {
    hideLoading();
  }
}

function renderHerbsRoutes() {
  const html = currentHerbsRoutes.map(hr => `
    <tr class="hover:bg-gray-50">
      <td class="px-6 py-4 border-b">${formatDate(hr.given_date)}</td>
      <td class="px-6 py-4 border-b font-medium">${hr.patient_name}</td>
      <td class="px-6 py-4 border-b">${hr.problem || 'N/A'}</td>
      <td class="px-6 py-4 border-b">${hr.course || 'N/A'}</td>
      <td class="px-6 py-4 border-b">₹${hr.total_amount || 0}</td>
      <td class="px-6 py-4 border-b">${hr.months || 0} months</td>
      <td class="px-6 py-4 border-b">${formatDate(hr.next_followup_date)}</td>
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
    
    select.innerHTML = '<option value="">Select Patient</option>' + 
      patients.map(p => `<option value="${p.id}">${p.name} (${p.patient_id || p.phone})</option>`).join('');
  } catch (error) {
    console.error('Load patients error:', error);
  }
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
    
    const nextFollowupDate = new Date(givenDate);
    nextFollowupDate.setMonth(nextFollowupDate.getMonth() + months);
    
    const medicines = [];
    document.querySelectorAll('.medicine-row').forEach((row, index) => {
      const rowNum = row.dataset.row;
      const romanId = romanNumerals[index] || `#${index + 1}`;
      
      medicines.push({
        roman_id: romanId,
        medicine_name: row.querySelector(`[name="medicine_name_${rowNum}"]`).value,
        morning_before: row.querySelector(`[name="morning_before_${rowNum}"]`)?.checked || false,
        morning_after: row.querySelector(`[name="morning_after_${rowNum}"]`)?.checked || false,
        afternoon_before: row.querySelector(`[name="afternoon_before_${rowNum}"]`)?.checked || false,
        afternoon_after: row.querySelector(`[name="afternoon_after_${rowNum}"]`)?.checked || false,
        evening_before: row.querySelector(`[name="evening_before_${rowNum}"]`)?.checked || false,
        evening_after: row.querySelector(`[name="evening_after_${rowNum}"]`)?.checked || false,
        night_before: row.querySelector(`[name="night_before_${rowNum}"]`)?.checked || false,
        night_after: row.querySelector(`[name="night_after_${rowNum}"]`)?.checked || false
      });
    });
    
    const data = {
      patient_id: parseInt(document.getElementById('prescription-patient').value),
      given_date: givenDate,
      months: months,
      next_followup_date: nextFollowupDate.toISOString().split('T')[0],
      problem: document.getElementById('prescription-problem').value,
      course: document.getElementById('prescription-course').value,
      total_amount: parseFloat(document.getElementById('prescription-amount').value) || 0,
      advance_paid: parseFloat(document.getElementById('prescription-advance').value) || 0,
      balance_due: (parseFloat(document.getElementById('prescription-amount').value) || 0) - (parseFloat(document.getElementById('prescription-advance').value) || 0),
      payment_notes: document.getElementById('prescription-payment-notes').value,
      medicines: medicines
    };
    
    await axios.post(`${API_BASE}/herbs-routes`, data);
    alert('Herbs & Routes record created successfully');
    
    closeHerbsRoutesModal();
    loadHerbsRoutes();
  } catch (error) {
    console.error('Save herbs & routes error:', error);
    alert('Error saving herbs & routes record');
  } finally {
    hideLoading();
  }
}

async function deleteHerbsRoutes(id) {
  if (!confirm('Are you sure you want to delete this record?')) return;
  
  try {
    showLoading();
    await axios.delete(`${API_BASE}/herbs-routes/${id}`);
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
    const res = await axios.get(`${API_BASE}/herbs-routes/${id}`);
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
    window.open(`/api/herbs-routes/${id}/print`, '_blank');
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
      <td class="px-6 py-4 border-b">${formatDate(rem.reminder_date)}</td>
      <td class="px-6 py-4 border-b font-medium">${rem.patient_name}</td>
      <td class="px-6 py-4 border-b">${rem.patient_phone}</td>
      <td class="px-6 py-4 border-b">${rem.reminder_type}</td>
      <td class="px-6 py-4 border-b">${rem.message || 'N/A'}</td>
      <td class="px-6 py-4 border-b">
        <span class="px-3 py-1 rounded-full text-sm ${rem.status === 'sent' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">${rem.status}</span>
      </td>
      <td class="px-6 py-4 border-b">
        <button onclick="markReminderSent(${rem.id})" class="text-green-600 hover:text-green-800 mr-2" ${rem.status === 'sent' ? 'disabled' : ''}>
          <i class="fas fa-check"></i>
        </button>
        <button onclick="deleteReminder(${rem.id})" class="text-red-600 hover:text-red-800"><i class="fas fa-trash"></i></button>
      </td>
    </tr>
  `).join('') || '<tr><td colspan="7" class="px-6 py-4 text-center text-gray-500">No reminders found</td></tr>';
  
  document.getElementById('reminders-table-body').innerHTML = html;
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
    
    settings.forEach(setting => {
      const input = document.getElementById(`setting-${setting.setting_key}`);
      if (input) input.value = setting.setting_value || '';
    });
  } catch (error) {
    console.error('Load settings error:', error);
  } finally {
    hideLoading();
  }
}

async function saveSettings() {
  try {
    showLoading();
    
    const settings = {
      clinic_name: document.getElementById('setting-clinic_name')?.value || '',
      clinic_phone: document.getElementById('setting-clinic_phone')?.value || '',
      clinic_email: document.getElementById('setting-clinic_email')?.value || '',
      whatsapp_enabled: document.getElementById('setting-whatsapp_enabled')?.checked || false
    };
    
    for (const [key, value] of Object.entries(settings)) {
      await axios.post(`${API_BASE}/settings`, { key, value });
    }
    
    alert('Settings saved successfully');
  } catch (error) {
    console.error('Save settings error:', error);
    alert('Error saving settings');
  } finally {
    hideLoading();
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  loadDashboard();
});
