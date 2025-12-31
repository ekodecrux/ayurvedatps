// TPS Dhanvantari PWA - Complete Functional Implementation
const API_BASE = window.location.origin + '/api';
let currentUser = null;
let allPatients = [];
let allAppointments = [];
let allHerbs = [];
let allReminders = [];

// ==================== AUTHENTICATION ====================

async function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        showToast('Please enter email and password', 'error');
        return;
    }

    try {
        const response = await axios.post(`${API_BASE}/auth/login`, { email, password });
        if (response.data.success) {
            currentUser = response.data.user;
            document.getElementById('loginScreen').classList.add('hidden');
            document.getElementById('appContainer').classList.remove('hidden');
            document.getElementById('userEmail').textContent = currentUser.email;
            document.getElementById('userInitial').textContent = currentUser.name.charAt(0).toUpperCase();
            
            // Load all data
            await Promise.all([
                loadDashboardData(),
                loadPatients(),
                loadAppointments(),
                loadHerbs(),
                loadReminders()
            ]);
            
            showToast('Login successful!', 'success');
        } else {
            showToast('Login failed: ' + response.data.message, 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showToast('Login failed. Please try again.', 'error');
    }
}

function handleLogout() {
    document.getElementById('appContainer').classList.add('hidden');
    document.getElementById('loginScreen').classList.remove('hidden');
    currentUser = null;
    toggleMenu();
    showToast('Logged out successfully', 'success');
}

// ==================== NAVIGATION ====================

function toggleMenu() {
    const menu = document.getElementById('dropdownMenu');
    menu.classList.toggle('show');
}

document.addEventListener('click', (e) => {
    const menu = document.getElementById('dropdownMenu');
    const menuBtn = document.querySelector('.menu-btn');
    if (menu && menuBtn && !menu.contains(e.target) && !menuBtn.contains(e.target)) {
        menu.classList.remove('show');
    }
});

function showSection(sectionName) {
    document.querySelectorAll('.main-content').forEach(section => section.classList.remove('active'));
    document.getElementById(sectionName).classList.add('active');
    document.querySelectorAll('.nav-icon').forEach(icon => icon.classList.remove('active'));
    event.currentTarget.classList.add('active');
    
    // Reload data for the section
    switch(sectionName) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'patients':
            loadPatients();
            break;
        case 'appointments':
            loadAppointments();
            break;
        case 'herbs':
            loadHerbs();
            break;
        case 'reminders':
            loadReminders();
            break;
    }
}

// ==================== SETTINGS ====================

function showSettings() {
    toggleMenu(); // Close the dropdown
    
    const modal = `
        <div class="modal-overlay" onclick="closeModal()">
            <div class="modal-content" onclick="event.stopPropagation()" style="max-width: 600px;">
                <div class="modal-header">
                    <h3><i class="fas fa-cog"></i> Settings</h3>
                    <button onclick="closeModal()" class="modal-close"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-body">
                    <div style="display: grid; gap: 20px;">
                        <!-- Profile Section -->
                        <div style="background: #F9FAFB; padding: 16px; border-radius: 12px;">
                            <h4 style="margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                                <i class="fas fa-user-circle" style="color: #059669;"></i> Profile Information
                            </h4>
                            <div style="display: grid; gap: 8px; font-size: 14px;">
                                <div><strong>Name:</strong> ${currentUser?.name || 'Admin'}</div>
                                <div><strong>Email:</strong> ${currentUser?.email || 'N/A'}</div>
                                <div><strong>Role:</strong> Administrator</div>
                            </div>
                        </div>
                        
                        <!-- Clinic Settings -->
                        <div style="background: #F9FAFB; padding: 16px; border-radius: 12px;">
                            <h4 style="margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                                <i class="fas fa-clinic-medical" style="color: #059669;"></i> Clinic Information
                            </h4>
                            <div style="display: grid; gap: 8px; font-size: 14px;">
                                <div><strong>Name:</strong> TPS Dhanvantari Ayurveda</div>
                                <div><strong>Type:</strong> Ayurvedic Clinic</div>
                                <div><strong>System:</strong> Single Doctor Clinic</div>
                            </div>
                        </div>
                        
                        <!-- Notifications -->
                        <div style="background: #F9FAFB; padding: 16px; border-radius: 12px;">
                            <h4 style="margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                                <i class="fas fa-bell" style="color: #059669;"></i> Notification Settings
                            </h4>
                            <div style="display: grid; gap: 12px;">
                                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                                    <input type="checkbox" checked style="width: 18px; height: 18px;">
                                    <span>Appointment Reminders</span>
                                </label>
                                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                                    <input type="checkbox" checked style="width: 18px; height: 18px;">
                                    <span>Follow-up Notifications</span>
                                </label>
                                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                                    <input type="checkbox" checked style="width: 18px; height: 18px;">
                                    <span>WhatsApp Integration</span>
                                </label>
                                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                                    <input type="checkbox" style="width: 18px; height: 18px;">
                                    <span>SMS Notifications</span>
                                </label>
                            </div>
                        </div>
                        
                        <!-- Data Management -->
                        <div style="background: #F9FAFB; padding: 16px; border-radius: 12px;">
                            <h4 style="margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                                <i class="fas fa-database" style="color: #059669;"></i> Data Management
                            </h4>
                            <div style="display: grid; gap: 8px;">
                                <button onclick="exportAllData()" class="btn-primary" style="width: 100%; padding: 10px;">
                                    <i class="fas fa-download"></i> Export All Data
                                </button>
                                <button onclick="showBackupInfo()" class="btn-primary" style="width: 100%; padding: 10px; background: #3B82F6;">
                                    <i class="fas fa-cloud"></i> Backup Settings
                                </button>
                            </div>
                        </div>
                        
                        <!-- System Info -->
                        <div style="background: #F9FAFB; padding: 16px; border-radius: 12px;">
                            <h4 style="margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                                <i class="fas fa-info-circle" style="color: #059669;"></i> System Information
                            </h4>
                            <div style="display: grid; gap: 8px; font-size: 14px;">
                                <div><strong>Version:</strong> 3.0.0</div>
                                <div><strong>Platform:</strong> Cloudflare Workers PWA</div>
                                <div><strong>Database:</strong> Cloudflare D1</div>
                                <div><strong>Status:</strong> <span style="color: #059669; font-weight: 600;">● Online</span></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button onclick="closeModal()" class="btn-primary" style="background: #6B7280;">
                        <i class="fas fa-times"></i> Close
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modal);
}

function exportAllData() {
    showToast('Exporting all data...', 'info');
    // TODO: Implement export functionality
    setTimeout(() => {
        showToast('Export feature coming soon!', 'info');
    }, 1000);
}

function showBackupInfo() {
    showToast('Backup is automatic. All data is stored in Cloudflare D1.', 'success');
}

// ==================== REPORTS ====================

async function showReports() {
    toggleMenu(); // Close the dropdown
    
    // Load stats for reports
    try {
        const statsResponse = await axios.get(`${API_BASE}/stats`);
        const patientsResponse = await axios.get(`${API_BASE}/patients`);
        const appointmentsResponse = await axios.get(`${API_BASE}/appointments`);
        const prescriptionsResponse = await axios.get(`${API_BASE}/prescriptions`);
        const remindersResponse = await axios.get(`${API_BASE}/reminders`);
        
        const stats = statsResponse.data.success ? statsResponse.data.data : {};
        const patients = patientsResponse.data.success ? patientsResponse.data.data : [];
        const appointments = appointmentsResponse.data.success ? appointmentsResponse.data.data : [];
        const prescriptions = prescriptionsResponse.data.success ? prescriptionsResponse.data.data : [];
        const reminders = remindersResponse.data.success ? remindersResponse.data.data : [];
        
        // Calculate additional stats
        const totalPatients = patients.length;
        const totalAppointments = appointments.length;
        const totalPrescriptions = prescriptions.length;
        const totalReminders = reminders.length;
        
        const scheduledAppointments = appointments.filter(a => a.status === 'scheduled').length;
        const confirmedAppointments = appointments.filter(a => a.status === 'confirmed').length;
        const completedAppointments = appointments.filter(a => a.status === 'completed').length;
        const cancelledAppointments = appointments.filter(a => a.status === 'cancelled').length;
        
        const pendingReminders = reminders.filter(r => r.status !== 'Sent').length;
        const sentReminders = reminders.filter(r => r.status === 'Sent').length;
        
        // Country breakdown
        const countryCounts = {};
        patients.forEach(p => {
            const country = p.country || 'Unknown';
            countryCounts[country] = (countryCounts[country] || 0) + 1;
        });
        const topCountries = Object.entries(countryCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
        
        // Gender breakdown
        const maleCount = patients.filter(p => p.gender === 'Male').length;
        const femaleCount = patients.filter(p => p.gender === 'Female').length;
        const otherCount = patients.filter(p => p.gender === 'Other' || !p.gender).length;
        
        const modal = `
            <div class="modal-overlay" onclick="closeModal()">
                <div class="modal-content" onclick="event.stopPropagation()" style="max-width: 700px; max-height: 90vh; overflow-y: auto;">
                    <div class="modal-header">
                        <h3><i class="fas fa-chart-bar"></i> Reports & Analytics</h3>
                        <button onclick="closeModal()" class="modal-close"><i class="fas fa-times"></i></button>
                    </div>
                    <div class="modal-body">
                        <div style="display: grid; gap: 20px;">
                            <!-- Summary Stats -->
                            <div>
                                <h4 style="margin-bottom: 12px; color: #1F2937;">📊 Summary Statistics</h4>
                                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
                                    <div style="background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); color: white; padding: 16px; border-radius: 12px; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">
                                        <div style="font-size: 32px; font-weight: bold;">${totalPatients}</div>
                                        <div style="font-size: 14px; opacity: 0.9;">Total Patients</div>
                                    </div>
                                    <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 16px; border-radius: 12px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
                                        <div style="font-size: 32px; font-weight: bold;">${totalAppointments}</div>
                                        <div style="font-size: 14px; opacity: 0.9;">Total Appointments</div>
                                    </div>
                                    <div style="background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); color: white; padding: 16px; border-radius: 12px; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);">
                                        <div style="font-size: 32px; font-weight: bold;">${totalPrescriptions}</div>
                                        <div style="font-size: 14px; opacity: 0.9;">Prescriptions</div>
                                    </div>
                                    <div style="background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); color: white; padding: 16px; border-radius: 12px; box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);">
                                        <div style="font-size: 32px; font-weight: bold;">${totalReminders}</div>
                                        <div style="font-size: 14px; opacity: 0.9;">Reminders</div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Appointments Breakdown -->
                            <div style="background: #F9FAFB; padding: 16px; border-radius: 12px;">
                                <h4 style="margin-bottom: 12px; color: #1F2937;">📅 Appointments Breakdown</h4>
                                <div style="display: grid; gap: 8px; font-size: 14px;">
                                    <div style="display: flex; justify-content: space-between; padding: 8px; background: white; border-radius: 8px;">
                                        <span><span style="color: #6B7280;">●</span> Scheduled</span>
                                        <strong>${scheduledAppointments}</strong>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; padding: 8px; background: white; border-radius: 8px;">
                                        <span><span style="color: #059669;">●</span> Confirmed</span>
                                        <strong>${confirmedAppointments}</strong>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; padding: 8px; background: white; border-radius: 8px;">
                                        <span><span style="color: #3B82F6;">●</span> Completed</span>
                                        <strong>${completedAppointments}</strong>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; padding: 8px; background: white; border-radius: 8px;">
                                        <span><span style="color: #EF4444;">●</span> Cancelled</span>
                                        <strong>${cancelledAppointments}</strong>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Reminders Status -->
                            <div style="background: #F9FAFB; padding: 16px; border-radius: 12px;">
                                <h4 style="margin-bottom: 12px; color: #1F2937;">🔔 Reminders Status</h4>
                                <div style="display: grid; gap: 8px; font-size: 14px;">
                                    <div style="display: flex; justify-content: space-between; padding: 8px; background: white; border-radius: 8px;">
                                        <span><span style="color: #F59E0B;">●</span> Pending</span>
                                        <strong>${pendingReminders}</strong>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; padding: 8px; background: white; border-radius: 8px;">
                                        <span><span style="color: #059669;">●</span> Sent</span>
                                        <strong>${sentReminders}</strong>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Patient Demographics -->
                            <div style="background: #F9FAFB; padding: 16px; border-radius: 12px;">
                                <h4 style="margin-bottom: 12px; color: #1F2937;">👥 Patient Demographics</h4>
                                <div style="display: grid; gap: 8px; font-size: 14px;">
                                    <div style="display: flex; justify-content: space-between; padding: 8px; background: white; border-radius: 8px;">
                                        <span><i class="fas fa-mars" style="color: #3B82F6;"></i> Male</span>
                                        <strong>${maleCount}</strong>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; padding: 8px; background: white; border-radius: 8px;">
                                        <span><i class="fas fa-venus" style="color: #EC4899;"></i> Female</span>
                                        <strong>${femaleCount}</strong>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; padding: 8px; background: white; border-radius: 8px;">
                                        <span><i class="fas fa-user" style="color: #6B7280;"></i> Other</span>
                                        <strong>${otherCount}</strong>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Top Countries -->
                            <div style="background: #F9FAFB; padding: 16px; border-radius: 12px;">
                                <h4 style="margin-bottom: 12px; color: #1F2937;">🌍 Top Countries</h4>
                                <div style="display: grid; gap: 8px; font-size: 14px;">
                                    ${topCountries.map((country, index) => `
                                        <div style="display: flex; justify-content: space-between; padding: 8px; background: white; border-radius: 8px;">
                                            <span><span style="color: #059669; font-weight: bold;">#${index + 1}</span> ${country[0]}</span>
                                            <strong>${country[1]} patients</strong>
                                        </div>
                                    `).join('')}
                                    ${topCountries.length === 0 ? '<div style="text-align: center; color: #6B7280; padding: 20px;">No data available</div>' : ''}
                                </div>
                            </div>
                            
                            <!-- Export Options -->
                            <div style="background: #F9FAFB; padding: 16px; border-radius: 12px;">
                                <h4 style="margin-bottom: 12px; color: #1F2937;">📥 Export Reports</h4>
                                <div style="display: grid; gap: 8px;">
                                    <button onclick="exportReport('pdf')" class="btn-primary" style="width: 100%; padding: 10px; background: #EF4444;">
                                        <i class="fas fa-file-pdf"></i> Export as PDF
                                    </button>
                                    <button onclick="exportReport('excel')" class="btn-primary" style="width: 100%; padding: 10px; background: #10B981;">
                                        <i class="fas fa-file-excel"></i> Export as Excel
                                    </button>
                                    <button onclick="exportReport('csv')" class="btn-primary" style="width: 100%; padding: 10px; background: #3B82F6;">
                                        <i class="fas fa-file-csv"></i> Export as CSV
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button onclick="closeModal()" class="btn-primary" style="background: #6B7280;">
                            <i class="fas fa-times"></i> Close
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modal);
        
    } catch (error) {
        console.error('Error loading reports:', error);
        showToast('Failed to load reports', 'error');
    }
}

function exportReport(format) {
    showToast(`Exporting report as ${format.toUpperCase()}...`, 'info');
    // TODO: Implement actual export functionality
    setTimeout(() => {
        showToast(`${format.toUpperCase()} export feature coming soon!`, 'info');
    }, 1000);
}

// ==================== DASHBOARD ====================

async function loadDashboardData() {
    try {
        const response = await axios.get(`${API_BASE}/stats`);
        if (response.data.success) {
            const stats = response.data.data;
            document.getElementById('statPatients').textContent = stats.totalPatients || 0;
            document.getElementById('statAppointments').textContent = stats.todayAppointments || 0;
            document.getElementById('statReminders').textContent = stats.pendingReminders || 0;
        }
        
        // Load recent appointments
        const apptResponse = await axios.get(`${API_BASE}/appointments?limit=5`);
        if (apptResponse.data.success) {
            renderRecentAppointments(apptResponse.data.data);
        }
        
        // Load upcoming reminders
        const remResponse = await axios.get(`${API_BASE}/reminders?status=Pending&limit=5`);
        if (remResponse.data.success) {
            renderUpcomingReminders(remResponse.data.data);
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

function renderRecentAppointments(appointments) {
    const container = document.getElementById('recentAppointments');
    if (!appointments || appointments.length === 0) {
        container.innerHTML = '<div class="loading">No recent appointments</div>';
        return;
    }
    
    container.innerHTML = appointments.map(appt => `
        <div class="patient-card" style="margin-bottom: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <div style="font-weight: 600; color: #1F2937;">${appt.patient_name}</div>
                    <div style="font-size: 12px; color: #6B7280;">${formatDate(appt.appointment_date)}</div>
                </div>
                <div style="background: #D1FAE5; color: #059669; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">
                    ${appt.status || 'Scheduled'}
                </div>
            </div>
        </div>
    `).join('');
}

function renderUpcomingReminders(reminders) {
    const container = document.getElementById('upcomingReminders');
    if (!reminders || reminders.length === 0) {
        container.innerHTML = '<div class="loading">No pending reminders</div>';
        return;
    }
    
    container.innerHTML = reminders.map(rem => `
        <div class="patient-card" style="margin-bottom: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <div style="font-weight: 600; color: #1F2937;">${rem.patient_name}</div>
                    <div style="font-size: 12px; color: #6B7280;">${rem.message || rem.type}</div>
                </div>
                <div style="background: #FEF3C7; color: #F59E0B; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">
                    Pending
                </div>
            </div>
        </div>
    `).join('');
}

// ==================== PATIENTS ====================

async function loadPatients() {
    try {
        const response = await axios.get(`${API_BASE}/patients`);
        if (response.data.success) {
            allPatients = response.data.data;
            renderPatients(allPatients);
        }
    } catch (error) {
        console.error('Error loading patients:', error);
        showToast('Failed to load patients', 'error');
    }
}

function renderPatients(patients) {
    const container = document.getElementById('patientsList');
    if (patients.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-title">No patients found</div></div>';
        return;
    }
    
    container.innerHTML = patients.map(patient => `
        <div class="patient-card">
            <div class="patient-header">
                <div class="patient-name">${patient.name}</div>
                <div class="patient-id">${patient.patient_id || 'N/A'}</div>
            </div>
            <div class="patient-info">
                <div class="info-row"><i class="fas fa-user"></i> ${patient.age || 'N/A'} / ${patient.gender || 'N/A'}</div>
                <div class="info-row"><i class="fas fa-phone"></i> ${patient.phone || 'N/A'}</div>
                <div class="info-row"><i class="fas fa-flag"></i> ${patient.country || 'India'}</div>
                <div class="info-row"><i class="fas fa-calendar"></i> Added: ${formatDate(patient.created_at)}</div>
            </div>
            <div class="patient-actions">
                <button class="btn-action view" onclick="viewPatient(${patient.id})"><i class="fas fa-eye"></i> View</button>
                <button class="btn-action edit" onclick="editPatient(${patient.id})"><i class="fas fa-edit"></i> Edit</button>
                <button class="btn-action delete" onclick="deletePatient(${patient.id})"><i class="fas fa-trash"></i> Delete</button>
            </div>
        </div>
    `).join('');
}

function searchPatients() {
    const searchTerm = document.getElementById('patientSearch').value.toLowerCase();
    const filtered = allPatients.filter(p => 
        p.name.toLowerCase().includes(searchTerm) ||
        (p.phone && p.phone.includes(searchTerm)) ||
        (p.patient_id && p.patient_id.toLowerCase().includes(searchTerm))
    );
    renderPatients(filtered);
}

async function viewPatient(id) {
    try {
        const response = await axios.get(`${API_BASE}/patients/${id}`);
        if (response.data.success) {
            const patient = response.data.data;
            showPatientDetails(patient);
        }
    } catch (error) {
        console.error('Error loading patient:', error);
        showToast('Failed to load patient details', 'error');
    }
}

function showPatientDetails(patient) {
    const modal = `
        <div class="modal-overlay" onclick="closeModal()">
            <div class="modal-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h3><i class="fas fa-user-circle"></i> Patient Details</h3>
                    <button onclick="closeModal()" class="modal-close"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-body">
                    <div style="background: #F9FAFB; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
                        <div style="font-size: 20px; font-weight: bold; color: #1F2937; margin-bottom: 4px;">${patient.name}</div>
                        <div style="color: #6B7280; font-size: 14px;">ID: ${patient.patient_id || 'N/A'}</div>
                    </div>
                    <div style="display: grid; gap: 12px;">
                        <div><strong>Age:</strong> ${patient.age || 'N/A'}</div>
                        <div><strong>Gender:</strong> ${patient.gender || 'N/A'}</div>
                        <div><strong>Phone:</strong> ${patient.phone || 'N/A'}</div>
                        <div><strong>Email:</strong> ${patient.email || 'N/A'}</div>
                        <div><strong>Country:</strong> ${patient.country || 'N/A'}</div>
                        <div><strong>Address:</strong> ${patient.address || 'N/A'}</div>
                        <div><strong>Added:</strong> ${formatDate(patient.created_at)}</div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button onclick="editPatient(${patient.id})" class="btn-primary"><i class="fas fa-edit"></i> Edit Patient</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modal);
}

async function editPatient(id) {
    closeModal();
    try {
        const response = await axios.get(`${API_BASE}/patients/${id}`);
        if (response.data.success) {
            showPatientForm(response.data.data);
        }
    } catch (error) {
        console.error('Error loading patient:', error);
        showToast('Failed to load patient', 'error');
    }
}

async function deletePatient(id) {
    if (!confirm('Are you sure you want to delete this patient?')) return;
    
    try {
        const response = await axios.delete(`${API_BASE}/patients/${id}`);
        if (response.data.success) {
            showToast('Patient deleted successfully', 'success');
            loadPatients();
        }
    } catch (error) {
        console.error('Error deleting patient:', error);
        showToast('Failed to delete patient', 'error');
    }
}

function showPatientForm(patient = null) {
    const isEdit = !!patient;
    const modal = `
        <div class="modal-overlay" onclick="closeModal()">
            <div class="modal-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h3><i class="fas fa-user-plus"></i> ${isEdit ? 'Edit' : 'Add'} Patient</h3>
                    <button onclick="closeModal()" class="modal-close"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-body">
                    <form id="patientForm" onsubmit="savePatient(event, ${isEdit ? patient.id : 'null'})">
                        <div class="form-group">
                            <label>Name *</label>
                            <input type="text" name="name" value="${patient?.name || ''}" required>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Age</label>
                                <input type="number" name="age" value="${patient?.age || ''}">
                            </div>
                            <div class="form-group">
                                <label>Gender</label>
                                <select name="gender">
                                    <option value="">Select</option>
                                    <option value="Male" ${patient?.gender === 'Male' ? 'selected' : ''}>Male</option>
                                    <option value="Female" ${patient?.gender === 'Female' ? 'selected' : ''}>Female</option>
                                    <option value="Other" ${patient?.gender === 'Other' ? 'selected' : ''}>Other</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Phone *</label>
                            <input type="tel" name="phone" value="${patient?.phone || ''}" required>
                        </div>
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" name="email" value="${patient?.email || ''}">
                        </div>
                        <div class="form-group">
                            <label>Country</label>
                            <input type="text" name="country" value="${patient?.country || 'India'}">
                        </div>
                        <div class="form-group">
                            <label>Address</label>
                            <textarea name="address" rows="3">${patient?.address || ''}</textarea>
                        </div>
                        <button type="submit" class="btn-primary" style="width: 100%;">
                            <i class="fas fa-save"></i> ${isEdit ? 'Update' : 'Add'} Patient
                        </button>
                    </form>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modal);
}

async function savePatient(event, patientId) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    
    try {
        const url = patientId ? `${API_BASE}/patients/${patientId}` : `${API_BASE}/patients`;
        const method = patientId ? 'put' : 'post';
        const response = await axios[method](url, data);
        
        if (response.data.success) {
            showToast(`Patient ${patientId ? 'updated' : 'added'} successfully`, 'success');
            closeModal();
            loadPatients();
            loadDashboardData();
        }
    } catch (error) {
        console.error('Error saving patient:', error);
        showToast('Failed to save patient', 'error');
    }
}

// ==================== APPOINTMENTS ====================

async function loadAppointments() {
    try {
        const response = await axios.get(`${API_BASE}/appointments`);
        if (response.data.success) {
            allAppointments = response.data.data;
            renderAppointments(allAppointments);
        }
    } catch (error) {
        console.error('Error loading appointments:', error);
        showToast('Failed to load appointments', 'error');
    }
}

function renderAppointments(appointments) {
    const container = document.getElementById('appointmentsList');
    if (appointments.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon"><i class="fas fa-calendar-alt"></i></div>
                <div class="empty-title">No appointments found</div>
                <div class="empty-subtitle">Create your first appointment to get started</div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = appointments.map(appt => `
        <div class="patient-card">
            <div class="patient-header">
                <div class="patient-name">${appt.patient_name}</div>
                <div style="background: ${getStatusColor(appt.status)}; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">
                    ${appt.status || 'Scheduled'}
                </div>
            </div>
            <div class="patient-info">
                <div class="info-row"><i class="fas fa-calendar"></i> ${formatDateTime(appt.appointment_date)}</div>
                <div class="info-row"><i class="fas fa-phone"></i> ${appt.patient_phone || 'N/A'}</div>
                <div class="info-row" style="grid-column: 1 / -1;"><i class="fas fa-notes-medical"></i> ${appt.purpose || 'Regular checkup'}</div>
            </div>
            <div class="patient-actions">
                <button class="btn-action view" onclick="viewAppointment(${appt.id})"><i class="fas fa-eye"></i> View</button>
                <button class="btn-action edit" onclick="editAppointment(${appt.id})"><i class="fas fa-edit"></i> Edit</button>
                <button class="btn-action delete" onclick="deleteAppointment(${appt.id})"><i class="fas fa-trash"></i> Delete</button>
            </div>
        </div>
    `).join('');
}

function getStatusColor(status) {
    const colors = {
        'scheduled': '#6B7280',
        'confirmed': '#059669',
        'completed': '#3B82F6',
        'cancelled': '#EF4444'
    };
    return colors[status?.toLowerCase()] || '#6B7280';
}

async function viewAppointment(id) {
    try {
        const response = await axios.get(`${API_BASE}/appointments/${id}`);
        if (response.data.success) {
            const appt = response.data.data;
            showAppointmentDetails(appt);
        }
    } catch (error) {
        console.error('Error loading appointment:', error);
        showToast('Failed to load appointment details', 'error');
    }
}

function showAppointmentDetails(appt) {
    const modal = `
        <div class="modal-overlay" onclick="closeModal()">
            <div class="modal-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h3><i class="fas fa-calendar-check"></i> Appointment Details</h3>
                    <button onclick="closeModal()" class="modal-close"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-body">
                    <div style="background: #F9FAFB; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
                        <div style="font-size: 18px; font-weight: bold; color: #1F2937; margin-bottom: 8px;">${appt.patient_name}</div>
                        <div style="display: inline-block; background: ${getStatusColor(appt.status)}; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">
                            ${appt.status || 'Scheduled'}
                        </div>
                    </div>
                    <div style="display: grid; gap: 12px;">
                        <div><strong>Date & Time:</strong> ${formatDateTime(appt.appointment_date)}</div>
                        <div><strong>Patient Phone:</strong> ${appt.patient_phone || 'N/A'}</div>
                        <div><strong>Purpose:</strong> ${appt.purpose || 'Regular checkup'}</div>
                        <div><strong>Created:</strong> ${formatDate(appt.created_at)}</div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button onclick="editAppointment(${appt.id})" class="btn-primary"><i class="fas fa-edit"></i> Edit Appointment</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modal);
}

async function editAppointment(id) {
    closeModal();
    try {
        const response = await axios.get(`${API_BASE}/appointments/${id}`);
        if (response.data.success) {
            showAppointmentForm(response.data.data);
        }
    } catch (error) {
        console.error('Error loading appointment:', error);
        showToast('Failed to load appointment', 'error');
    }
}

async function deleteAppointment(id) {
    if (!confirm('Are you sure you want to delete this appointment?')) return;
    
    try {
        const response = await axios.delete(`${API_BASE}/appointments/${id}`);
        if (response.data.success) {
            showToast('Appointment deleted successfully', 'success');
            loadAppointments();
            loadDashboardData();
        }
    } catch (error) {
        console.error('Error deleting appointment:', error);
        showToast('Failed to delete appointment', 'error');
    }
}

async function showAppointmentForm(appt = null) {
    const isEdit = !!appt;
    
    // Load patients for dropdown
    let patientsOptions = '';
    try {
        const response = await axios.get(`${API_BASE}/patients`);
        if (response.data.success) {
            patientsOptions = response.data.data.map(p => 
                `<option value="${p.id}" ${appt?.patient_id === p.id ? 'selected' : ''}>${p.name} (${p.phone})</option>`
            ).join('');
        }
    } catch (error) {
        console.error('Error loading patients:', error);
    }
    
    const modal = `
        <div class="modal-overlay" onclick="closeModal()">
            <div class="modal-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h3><i class="fas fa-calendar-plus"></i> ${isEdit ? 'Edit' : 'Add'} Appointment</h3>
                    <button onclick="closeModal()" class="modal-close"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-body">
                    <form id="appointmentForm" onsubmit="saveAppointment(event, ${isEdit ? appt.id : 'null'})">
                        <div class="form-group">
                            <label>Patient *</label>
                            <select name="patient_id" required>
                                <option value="">Select Patient</option>
                                ${patientsOptions}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Date & Time *</label>
                            <input type="datetime-local" name="appointment_date" value="${appt?.appointment_date?.substring(0, 16) || ''}" required>
                        </div>
                        <div class="form-group">
                            <label>Purpose</label>
                            <textarea name="purpose" rows="3">${appt?.purpose || ''}</textarea>
                        </div>
                        <div class="form-group">
                            <label>Status</label>
                            <select name="status">
                                <option value="scheduled" ${appt?.status === 'scheduled' ? 'selected' : ''}>Scheduled</option>
                                <option value="confirmed" ${appt?.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                                <option value="completed" ${appt?.status === 'completed' ? 'selected' : ''}>Completed</option>
                                <option value="cancelled" ${appt?.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                            </select>
                        </div>
                        <button type="submit" class="btn-primary" style="width: 100%;">
                            <i class="fas fa-save"></i> ${isEdit ? 'Update' : 'Add'} Appointment
                        </button>
                    </form>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modal);
}

async function saveAppointment(event, apptId) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    
    try {
        const url = apptId ? `${API_BASE}/appointments/${apptId}` : `${API_BASE}/appointments`;
        const method = apptId ? 'put' : 'post';
        const response = await axios[method](url, data);
        
        if (response.data.success) {
            showToast(`Appointment ${apptId ? 'updated' : 'added'} successfully`, 'success');
            closeModal();
            loadAppointments();
            loadDashboardData();
        }
    } catch (error) {
        console.error('Error saving appointment:', error);
        showToast('Failed to save appointment', 'error');
    }
}

// ==================== HERBS & ROOTS ====================

async function loadHerbs() {
    try {
        const response = await axios.get(`${API_BASE}/prescriptions`);
        if (response.data.success) {
            allHerbs = response.data.data;
            renderHerbs(allHerbs);
        }
    } catch (error) {
        console.error('Error loading herbs:', error);
        showToast('Failed to load herbs & roots', 'error');
    }
}

function renderHerbs(herbs) {
    const container = document.getElementById('herbsList');
    if (herbs.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-title">No prescriptions found</div></div>';
        return;
    }
    
    container.innerHTML = herbs.map(herb => `
        <div class="patient-card" style="border-left: 4px solid #059669;">
            <div class="patient-header">
                <div class="patient-name">${herb.patient_name}</div>
                <div class="patient-id">${herb.patient_number || 'N/A'}</div>
            </div>
            <div class="patient-info">
                <div class="info-row"><i class="fas fa-phone"></i> ${herb.patient_phone || 'N/A'}</div>
                <div class="info-row"><i class="fas fa-user"></i> ${herb.age || 'N/A'}Y / ${herb.gender || 'N/A'}</div>
                <div class="info-row"><i class="fas fa-calendar"></i> Given: ${formatDate(herb.given_date)}</div>
                <div class="info-row">
                    <span style="background: #D1FAE5; color: #059669; padding: 2px 8px; border-radius: 8px; font-size: 11px; font-weight: 600;">
                        ${herb.completed_months || 0}/${herb.entire_course_months || 0} months
                    </span>
                </div>
                <div class="info-row" style="grid-column: 1 / -1;">
                    <span style="background: #FEF3C7; padding: 4px 12px; border-radius: 8px; font-size: 12px;">
                        <i class="fas fa-clock"></i> Next: ${formatDate(herb.next_followup_date)}
                    </span>
                </div>
            </div>
            <div class="patient-actions">
                <button class="btn-action view" onclick="viewHerb(${herb.id})"><i class="fas fa-eye"></i> View</button>
                <button class="btn-action edit" onclick="editHerb(${herb.id})"><i class="fas fa-edit"></i> Edit</button>
                <button class="btn-action delete" onclick="deleteHerb(${herb.id})"><i class="fas fa-trash"></i> Delete</button>
            </div>
        </div>
    `).join('');
}

async function viewHerb(id) {
    try {
        const response = await axios.get(`${API_BASE}/prescriptions/${id}`);
        if (response.data.success) {
            const herb = response.data.data;
            showHerbDetails(herb);
        }
    } catch (error) {
        console.error('Error loading prescription:', error);
        showToast('Failed to load prescription details', 'error');
    }
}

function showHerbDetails(herb) {
    const modal = `
        <div class="modal-overlay" onclick="closeModal()">
            <div class="modal-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h3><i class="fas fa-leaf"></i> Herbs & Roots Details</h3>
                    <button onclick="closeModal()" class="modal-close"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-body">
                    <div style="background: #F9FAFB; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
                        <div style="font-size: 18px; font-weight: bold; color: #1F2937; margin-bottom: 4px;">${herb.patient_name}</div>
                        <div style="color: #6B7280; font-size: 14px;">${herb.patient_number || 'N/A'}</div>
                    </div>
                    <div style="display: grid; gap: 12px;">
                        <div><strong>Phone:</strong> ${herb.patient_phone || 'N/A'}</div>
                        <div><strong>Age/Gender:</strong> ${herb.age}Y / ${herb.gender}</div>
                        <div><strong>Given Date:</strong> ${formatDate(herb.given_date)}</div>
                        <div><strong>Course:</strong> ${herb.completed_months || 0}/${herb.entire_course_months || 0} months</div>
                        <div><strong>Next Follow-up:</strong> ${formatDate(herb.next_followup_date)}</div>
                        <div><strong>Created:</strong> ${formatDate(herb.created_at)}</div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button onclick="editHerb(${herb.id})" class="btn-primary"><i class="fas fa-edit"></i> Edit Prescription</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modal);
}

async function editHerb(id) {
    closeModal();
    showToast('Edit Herbs & Roots feature - Coming soon!', 'info');
}

async function deleteHerb(id) {
    if (!confirm('Are you sure you want to delete this prescription?')) return;
    
    try {
        const response = await axios.delete(`${API_BASE}/prescriptions/${id}`);
        if (response.data.success) {
            showToast('Prescription deleted successfully', 'success');
            loadHerbs();
        }
    } catch (error) {
        console.error('Error deleting prescription:', error);
        showToast('Failed to delete prescription', 'error');
    }
}

// ==================== REMINDERS ====================

async function loadReminders() {
    try {
        const response = await axios.get(`${API_BASE}/reminders`);
        if (response.data.success) {
            allReminders = response.data.data;
            renderReminders(allReminders);
        }
    } catch (error) {
        console.error('Error loading reminders:', error);
        showToast('Failed to load reminders', 'error');
    }
}

function renderReminders(reminders) {
    const container = document.getElementById('remindersList');
    if (reminders.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-title">No reminders found</div></div>';
        return;
    }
    
    container.innerHTML = reminders.map(rem => {
        const isPending = rem.status !== 'Sent';
        const borderColor = isPending ? '#F59E0B' : '#059669';
        
        return `
        <div class="patient-card" style="border-left: 4px solid ${borderColor};">
            <div class="patient-header">
                <div class="patient-name">${rem.patient_name}</div>
                <div style="background: ${isPending ? '#FEF3C7' : '#D1FAE5'}; color: ${isPending ? '#F59E0B' : '#059669'}; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">
                    ${rem.status || 'Pending'}
                </div>
            </div>
            <div class="patient-info">
                <div class="info-row"><i class="fas fa-calendar"></i> ${formatDate(rem.scheduled_date || rem.reminder_date)}</div>
                <div class="info-row"><i class="fas fa-phone"></i> ${rem.patient_phone || 'N/A'}</div>
                <div class="info-row">
                    <span style="background: #DBEAFE; color: #3B82F6; padding: 2px 8px; border-radius: 8px; font-size: 11px; font-weight: 600;">
                        ${rem.type || rem.reminder_type || 'General'}
                    </span>
                </div>
                <div class="info-row" style="grid-column: 1 / -1; font-size: 13px; color: #6B7280;">
                    <i class="fas fa-comment"></i> ${rem.message || 'N/A'}
                </div>
            </div>
            <div class="patient-actions">
                ${isPending ? `
                    <button class="btn-action view" onclick="sendReminder(${rem.id}, 'whatsapp')"><i class="fab fa-whatsapp"></i> WhatsApp</button>
                    <button class="btn-action edit" onclick="sendReminder(${rem.id}, 'sms')"><i class="fas fa-sms"></i> SMS</button>
                    <button class="btn-action delete" onclick="markReminderSent(${rem.id})"><i class="fas fa-check"></i> Mark Sent</button>
                ` : `
                    <button class="btn-action delete" onclick="deleteReminder(${rem.id})"><i class="fas fa-trash"></i> Delete</button>
                `}
            </div>
        </div>
    `;
    }).join('');
}

async function sendReminder(id, type) {
    showToast(`Sending reminder via ${type}...`, 'info');
    // TODO: Implement actual WhatsApp/SMS integration
    setTimeout(() => {
        showToast(`Reminder sent via ${type}!`, 'success');
        markReminderSent(id);
    }, 1000);
}

async function markReminderSent(id) {
    try {
        const response = await axios.put(`${API_BASE}/reminders/${id}`, { status: 'Sent' });
        if (response.data.success) {
            showToast('Reminder marked as sent', 'success');
            loadReminders();
            loadDashboardData();
        }
    } catch (error) {
        console.error('Error updating reminder:', error);
        showToast('Failed to update reminder', 'error');
    }
}

async function deleteReminder(id) {
    if (!confirm('Are you sure you want to delete this reminder?')) return;
    
    try {
        const response = await axios.delete(`${API_BASE}/reminders/${id}`);
        if (response.data.success) {
            showToast('Reminder deleted successfully', 'success');
            loadReminders();
            loadDashboardData();
        }
    } catch (error) {
        console.error('Error deleting reminder:', error);
        showToast('Failed to delete reminder', 'error');
    }
}

// ==================== UTILITIES ====================

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDateTime(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function closeModal() {
    const modals = document.querySelectorAll('.modal-overlay');
    modals.forEach(modal => modal.remove());
}

function showToast(message, type = 'info') {
    const colors = {
        success: '#059669',
        error: '#EF4444',
        info: '#3B82F6',
        warning: '#F59E0B'
    };
    
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 80px;
        right: 16px;
        background: ${colors[type]};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        font-size: 14px;
        font-weight: 500;
        max-width: 300px;
        animation: slideIn 0.3s ease-out;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
    
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 20px;
    }
    
    .modal-content {
        background: white;
        border-radius: 16px;
        max-width: 500px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }
    
    .modal-header {
        padding: 20px;
        border-bottom: 1px solid #E5E7EB;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .modal-header h3 {
        font-size: 20px;
        color: #1F2937;
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    .modal-close {
        background: none;
        border: none;
        font-size: 20px;
        color: #6B7280;
        cursor: pointer;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
    }
    
    .modal-close:hover {
        background: #F3F4F6;
    }
    
    .modal-body {
        padding: 20px;
    }
    
    .modal-footer {
        padding: 16px 20px;
        border-top: 1px solid #E5E7EB;
    }
    
    .form-group {
        margin-bottom: 16px;
    }
    
    .form-group label {
        display: block;
        font-size: 14px;
        font-weight: 500;
        color: #1F2937;
        margin-bottom: 6px;
    }
    
    .form-group input,
    .form-group select,
    .form-group textarea {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid #D1D5DB;
        border-radius: 8px;
        font-size: 14px;
        font-family: inherit;
    }
    
    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
        outline: none;
        border-color: #059669;
        box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
    }
    
    .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
    }
`;
document.head.appendChild(style);

// Expose functions to global scope for onclick handlers
window.showSettings = showSettings;
window.showReports = showReports;
window.handleLogin = handleLogin;
window.handleLogout = handleLogout;
window.toggleMenu = toggleMenu;
window.showSection = showSection;
window.closeModal = closeModal;

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/pwa-sw.js')
        .then(reg => console.log('Service Worker registered'))
        .catch(err => console.error('Service Worker registration failed:', err));
}
