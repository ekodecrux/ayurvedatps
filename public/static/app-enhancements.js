// ==================== ENHANCEMENTS - APPOINTMENTS ====================

// Update loadAppointments to accept filters
const originalLoadAppointments = loadAppointments;
async function loadAppointments(search = '', status = '', date = '') {
  try {
    showLoading();
    let url = `${API_BASE}/appointments`;
    const params = [];
    if (search) params.push(`search=${encodeURIComponent(search)}`);
    if (status) params.push(`status=${encodeURIComponent(status)}`);
    if (date) params.push(`date=${encodeURIComponent(date)}`);
    if (params.length > 0) url += '?' + params.join('&');
    
    const appointmentsRes = await axios.get(url);
    const patientsRes = await axios.get(`${API_BASE}/patients`);
    
    if (appointmentsRes.data.success) {
      currentAppointments = appointmentsRes.data.data;
    }
    if (patientsRes.data.success) {
      currentPatients = patientsRes.data.data;
    }
    
    renderAppointmentsEnhanced();
    hideLoading();
  } catch (error) {
    console.error('Error loading appointments:', error);
    hideLoading();
  }
}

function renderAppointmentsEnhanced() {
  const section = document.getElementById('appointments-section');
  section.innerHTML = `
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-3xl font-bold text-gray-800">
        <i class="fas fa-calendar-alt mr-3 text-ayurveda-600"></i>Appointments (${currentAppointments.length})
      </h2>
      <button onclick="showAppointmentForm()" class="bg-ayurveda-600 hover:bg-ayurveda-700 text-white px-4 py-2 rounded-lg shadow">
        <i class="fas fa-plus mr-2"></i>Add Appointment
      </button>
    </div>
    
    <!-- Search and Filter -->
    <div class="bg-white rounded-lg shadow p-4 mb-4">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="md:col-span-2">
          <input type="text" id="appointment-search" placeholder="Search by patient name, phone, ID..." 
            class="w-full border border-gray-300 rounded px-3 py-2"
            onkeyup="if(event.key==='Enter') applyAppointmentFilter()">
        </div>
        <select id="appointment-status-filter" class="border border-gray-300 rounded px-3 py-2">
          <option value="">All Status</option>
          <option value="scheduled">Scheduled</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <div class="flex gap-2">
          <input type="date" id="appointment-date-filter" class="flex-1 border border-gray-300 rounded px-3 py-2">
          <button onclick="applyAppointmentFilter()" class="bg-ayurveda-600 hover:bg-ayurveda-700 text-white px-4 py-2 rounded">
            <i class="fas fa-search"></i>
          </button>
          <button onclick="clearAppointmentFilter()" class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded" title="Clear">
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
                  <span class="px-2 py-1 text-xs font-mono bg-blue-100 text-blue-800 rounded">${apt.patient_id || 'N/A'}</span>
                </td>
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
                ${currentPatients.map(p => `<option value="${p.id}">${p.patient_id} - ${p.name} (${p.phone})</option>`).join('')}
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

function applyAppointmentFilter() {
  const search = document.getElementById('appointment-search').value;
  const status = document.getElementById('appointment-status-filter').value;
  const date = document.getElementById('appointment-date-filter').value;
  loadAppointments(search, status, date);
}

function clearAppointmentFilter() {
  document.getElementById('appointment-search').value = '';
  document.getElementById('appointment-status-filter').value = '';
  document.getElementById('appointment-date-filter').value = '';
  loadAppointments();
}

// ==================== ENHANCEMENTS - PHARMACY ====================

async function loadPharmacy(search = '', category = '', lowStock = false) {
  try {
    showLoading();
    let url = `${API_BASE}/medicines`;
    const params = [];
    if (search) params.push(`search=${encodeURIComponent(search)}`);
    if (category) params.push(`category=${encodeURIComponent(category)}`);
    if (lowStock) params.push(`lowStock=true`);
    if (params.length > 0) url += '?' + params.join('&');
    
    const res = await axios.get(url);
    if (res.data.success) {
      currentMedicines = res.data.data;
      renderPharmacyEnhanced();
    }
    hideLoading();
  } catch (error) {
    console.error('Error loading pharmacy:', error);
    hideLoading();
  }
}

async function showPharmacyStockReport() {
  try {
    showLoading();
    const res = await axios.get(`${API_BASE}/pharmacy/stock-report`);
    if (!res.data.success) {
      alert('Error loading stock report');
      hideLoading();
      return;
    }
    
    const report = res.data.data;
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto';
    modal.innerHTML = `
      <div class="bg-white rounded-lg p-6 max-w-6xl w-full my-8 max-h-screen overflow-y-auto">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-2xl font-bold text-gray-800">Pharmacy Stock Report</h3>
          <button onclick="this.closest('.fixed').remove()" class="text-gray-600 hover:text-gray-800">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>
        
        <!-- Summary Cards -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div class="text-sm text-blue-600 mb-1">Total Medicines</div>
            <div class="text-2xl font-bold text-blue-900">${report.totalMedicines}</div>
          </div>
          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div class="text-sm text-yellow-600 mb-1">Low Stock</div>
            <div class="text-2xl font-bold text-yellow-900">${report.lowStockCount}</div>
          </div>
          <div class="bg-red-50 border border-red-200 rounded-lg p-4">
            <div class="text-sm text-red-600 mb-1">Out of Stock</div>
            <div class="text-2xl font-bold text-red-900">${report.outOfStockCount}</div>
          </div>
          <div class="bg-green-50 border border-green-200 rounded-lg p-4">
            <div class="text-sm text-green-600 mb-1">Total Value</div>
            <div class="text-2xl font-bold text-green-900">₹${report.totalValue}</div>
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div class="bg-gray-50 rounded-lg p-4">
            <div class="text-lg font-bold mb-2">Categories: ${report.categories}</div>
            <div class="flex flex-wrap gap-2">
              ${report.categoryList.map(cat => `<span class="px-3 py-1 bg-white border rounded text-sm">${cat}</span>`).join('')}
            </div>
          </div>
          <div class="bg-orange-50 rounded-lg p-4">
            <div class="text-lg font-bold text-orange-800 mb-2">
              <i class="fas fa-exclamation-triangle mr-2"></i>Expiring Soon: ${report.expiringSoonCount}
            </div>
            <div class="text-sm text-gray-600">Medicines expiring within 3 months</div>
          </div>
        </div>
        
        <!-- Low Stock Items -->
        ${report.lowStockItems.length > 0 ? `
          <div class="mb-6">
            <h4 class="text-lg font-bold mb-3 text-yellow-800">
              <i class="fas fa-exclamation-circle mr-2"></i>Low Stock Items
            </h4>
            <div class="bg-white border rounded-lg overflow-hidden">
              <table class="min-w-full">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">Medicine</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">Category</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">Quantity</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">Price</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  ${report.lowStockItems.map(item => `
                    <tr class="bg-yellow-50">
                      <td class="px-4 py-2 font-medium">${item.name}</td>
                      <td class="px-4 py-2 text-sm">${item.category || 'N/A'}</td>
                      <td class="px-4 py-2 text-sm font-bold text-yellow-800">${item.quantity} ${item.unit || ''}</td>
                      <td class="px-4 py-2 text-sm">₹${item.price || 'N/A'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        ` : ''}
        
        <!-- Out of Stock Items -->
        ${report.outOfStockItems.length > 0 ? `
          <div class="mb-6">
            <h4 class="text-lg font-bold mb-3 text-red-800">
              <i class="fas fa-times-circle mr-2"></i>Out of Stock Items
            </h4>
            <div class="bg-white border rounded-lg overflow-hidden">
              <table class="min-w-full">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">Medicine</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">Category</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">Last Price</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  ${report.outOfStockItems.map(item => `
                    <tr class="bg-red-50">
                      <td class="px-4 py-2 font-medium">${item.name}</td>
                      <td class="px-4 py-2 text-sm">${item.category || 'N/A'}</td>
                      <td class="px-4 py-2 text-sm">₹${item.price || 'N/A'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        ` : ''}
        
        <!-- Expiring Soon Items -->
        ${report.expiringSoonItems.length > 0 ? `
          <div>
            <h4 class="text-lg font-bold mb-3 text-orange-800">
              <i class="fas fa-calendar-times mr-2"></i>Expiring Soon (3 months)
            </h4>
            <div class="bg-white border rounded-lg overflow-hidden">
              <table class="min-w-full">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">Medicine</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">Quantity</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">Expiry Date</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  ${report.expiringSoonItems.map(item => `
                    <tr class="bg-orange-50">
                      <td class="px-4 py-2 font-medium">${item.name}</td>
                      <td class="px-4 py-2 text-sm">${item.quantity} ${item.unit || ''}</td>
                      <td class="px-4 py-2 text-sm font-medium text-orange-800">${formatDate(item.expiry_date)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        ` : ''}
      </div>
    `;
    document.body.appendChild(modal);
    hideLoading();
  } catch (error) {
    console.error('Error loading stock report:', error);
    hideLoading();
  }
}

// Add prescription edit functionality
let editingPrescriptionId = null;

async function editPrescription(id) {
  try {
    showLoading();
    editingPrescriptionId = id;
    
    const res = await axios.get(`${API_BASE}/prescriptions/${id}`);
    if (!res.data.success) {
      alert('Error loading prescription');
      hideLoading();
      return;
    }
    
    const presc = res.data.data;
    
    // Show prescription form with data
    showPrescriptionForm();
    document.getElementById('prescription-patient').value = presc.patient_id;
    document.getElementById('prescription-followup').value = presc.next_followup_date ? presc.next_followup_date.split('T')[0] : '';
    document.getElementById('prescription-diagnosis').value = presc.diagnosis || '';
    document.getElementById('prescription-notes').value = presc.notes || '';
    
    // Load medicines
    document.getElementById('medicines-list').innerHTML = '';
    if (presc.medicines && presc.medicines.length > 0) {
      for (const med of presc.medicines) {
        addMedicineRow();
        const rows = document.querySelectorAll('#medicines-list > div');
        const lastRow = rows[rows.length - 1];
        lastRow.querySelector('.medicine-select').value = med.medicine_id;
        lastRow.querySelector('.medicine-dosage').value = med.dosage;
        lastRow.querySelector('.medicine-frequency').value = med.frequency || '';
        lastRow.querySelector('.medicine-duration').value = med.duration || '';
        lastRow.querySelector('.medicine-instructions').value = med.instructions || '';
      }
    } else {
      addMedicineRow();
    }
    
    hideLoading();
  } catch (error) {
    console.error('Error editing prescription:', error);
    alert('Error loading prescription');
    hideLoading();
  }
}

// Override savePrescription to handle both create and update
const originalSavePrescription = savePrescription;
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
    if (editingPrescriptionId) {
      // Update existing prescription
      await axios.put(`${API_BASE}/prescriptions/${editingPrescriptionId}`, data);
      editingPrescriptionId = null;
    } else {
      // Create new prescription
      await axios.post(`${API_BASE}/prescriptions`, data);
    }
    closePrescriptionForm();
    loadPrescriptions();
  } catch (error) {
    console.error('Error saving prescription:', error);
    alert('Error saving prescription');
    hideLoading();
  }
}
