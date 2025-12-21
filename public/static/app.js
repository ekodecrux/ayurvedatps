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

// Complete country data with ISO3 codes and phone codes (237 countries)
// Reference: AT&T Country Code List
const countries = [
  { name: 'Afghanistan', code: '+93', iso3: 'AFG' },
  { name: 'Albania', code: '+355', iso3: 'ALB' },
  { name: 'Algeria', code: '+213', iso3: 'DZA' },
  { name: 'American Samoa', code: '+1-684', iso3: 'ASM' },
  { name: 'Andorra', code: '+376', iso3: 'AND' },
  { name: 'Angola', code: '+244', iso3: 'AGO' },
  { name: 'Anguilla', code: '+1-264', iso3: 'AIA' },
  { name: 'Antarctica', code: '+672', iso3: 'ATA' },
  { name: 'Antigua and Barbuda', code: '+1-268', iso3: 'ATG' },
  { name: 'Argentina', code: '+54', iso3: 'ARG' },
  { name: 'Armenia', code: '+374', iso3: 'ARM' },
  { name: 'Aruba', code: '+297', iso3: 'ABW' },
  { name: 'Australia', code: '+61', iso3: 'AUS' },
  { name: 'Austria', code: '+43', iso3: 'AUT' },
  { name: 'Azerbaijan', code: '+994', iso3: 'AZE' },
  { name: 'Bahamas', code: '+1-242', iso3: 'BHS' },
  { name: 'Bahrain', code: '+973', iso3: 'BHR' },
  { name: 'Bangladesh', code: '+880', iso3: 'BGD' },
  { name: 'Barbados', code: '+1-246', iso3: 'BRB' },
  { name: 'Belarus', code: '+375', iso3: 'BLR' },
  { name: 'Belgium', code: '+32', iso3: 'BEL' },
  { name: 'Belize', code: '+501', iso3: 'BLZ' },
  { name: 'Benin', code: '+229', iso3: 'BEN' },
  { name: 'Bermuda', code: '+1-441', iso3: 'BMU' },
  { name: 'Bhutan', code: '+975', iso3: 'BTN' },
  { name: 'Bolivia', code: '+591', iso3: 'BOL' },
  { name: 'Bosnia and Herzegovina', code: '+387', iso3: 'BIH' },
  { name: 'Botswana', code: '+267', iso3: 'BWA' },
  { name: 'Brazil', code: '+55', iso3: 'BRA' },
  { name: 'British Virgin Islands', code: '+1-284', iso3: 'VGB' },
  { name: 'Brunei', code: '+673', iso3: 'BRN' },
  { name: 'Bulgaria', code: '+359', iso3: 'BGR' },
  { name: 'Burkina Faso', code: '+226', iso3: 'BFA' },
  { name: 'Burundi', code: '+257', iso3: 'BDI' },
  { name: 'Cambodia', code: '+855', iso3: 'KHM' },
  { name: 'Cameroon', code: '+237', iso3: 'CMR' },
  { name: 'Canada', code: '+1', iso3: 'CAN' },
  { name: 'Cape Verde', code: '+238', iso3: 'CPV' },
  { name: 'Cayman Islands', code: '+1-345', iso3: 'CYM' },
  { name: 'Central African Republic', code: '+236', iso3: 'CAF' },
  { name: 'Chad', code: '+235', iso3: 'TCD' },
  { name: 'Chile', code: '+56', iso3: 'CHL' },
  { name: 'China', code: '+86', iso3: 'CHN' },
  { name: 'Colombia', code: '+57', iso3: 'COL' },
  { name: 'Comoros', code: '+269', iso3: 'COM' },
  { name: 'Congo', code: '+242', iso3: 'COG' },
  { name: 'Cook Islands', code: '+682', iso3: 'COK' },
  { name: 'Costa Rica', code: '+506', iso3: 'CRI' },
  { name: 'Croatia', code: '+385', iso3: 'HRV' },
  { name: 'Cuba', code: '+53', iso3: 'CUB' },
  { name: 'Cyprus', code: '+357', iso3: 'CYP' },
  { name: 'Czech Republic', code: '+420', iso3: 'CZE' },
  { name: 'Denmark', code: '+45', iso3: 'DNK' },
  { name: 'Djibouti', code: '+253', iso3: 'DJI' },
  { name: 'Dominica', code: '+1-767', iso3: 'DMA' },
  { name: 'Dominican Republic', code: '+1-809', iso3: 'DOM' },
  { name: 'Ecuador', code: '+593', iso3: 'ECU' },
  { name: 'Egypt', code: '+20', iso3: 'EGY' },
  { name: 'El Salvador', code: '+503', iso3: 'SLV' },
  { name: 'Equatorial Guinea', code: '+240', iso3: 'GNQ' },
  { name: 'Eritrea', code: '+291', iso3: 'ERI' },
  { name: 'Estonia', code: '+372', iso3: 'EST' },
  { name: 'Ethiopia', code: '+251', iso3: 'ETH' },
  { name: 'Fiji', code: '+679', iso3: 'FJI' },
  { name: 'Finland', code: '+358', iso3: 'FIN' },
  { name: 'France', code: '+33', iso3: 'FRA' },
  { name: 'French Polynesia', code: '+689', iso3: 'PYF' },
  { name: 'Gabon', code: '+241', iso3: 'GAB' },
  { name: 'Gambia', code: '+220', iso3: 'GMB' },
  { name: 'Georgia', code: '+995', iso3: 'GEO' },
  { name: 'Germany', code: '+49', iso3: 'DEU' },
  { name: 'Ghana', code: '+233', iso3: 'GHA' },
  { name: 'Gibraltar', code: '+350', iso3: 'GIB' },
  { name: 'Greece', code: '+30', iso3: 'GRC' },
  { name: 'Greenland', code: '+299', iso3: 'GRL' },
  { name: 'Grenada', code: '+1-473', iso3: 'GRD' },
  { name: 'Guam', code: '+1-671', iso3: 'GUM' },
  { name: 'Guatemala', code: '+502', iso3: 'GTM' },
  { name: 'Guinea', code: '+224', iso3: 'GIN' },
  { name: 'Guinea-Bissau', code: '+245', iso3: 'GNB' },
  { name: 'Guyana', code: '+592', iso3: 'GUY' },
  { name: 'Haiti', code: '+509', iso3: 'HTI' },
  { name: 'Honduras', code: '+504', iso3: 'HND' },
  { name: 'Hong Kong', code: '+852', iso3: 'HKG' },
  { name: 'Hungary', code: '+36', iso3: 'HUN' },
  { name: 'Iceland', code: '+354', iso3: 'ISL' },
  { name: 'India', code: '+91', iso3: 'IND' },
  { name: 'Indonesia', code: '+62', iso3: 'IDN' },
  { name: 'Iran', code: '+98', iso3: 'IRN' },
  { name: 'Iraq', code: '+964', iso3: 'IRQ' },
  { name: 'Ireland', code: '+353', iso3: 'IRL' },
  { name: 'Israel', code: '+972', iso3: 'ISR' },
  { name: 'Italy', code: '+39', iso3: 'ITA' },
  { name: 'Ivory Coast', code: '+225', iso3: 'CIV' },
  { name: 'Jamaica', code: '+1-876', iso3: 'JAM' },
  { name: 'Japan', code: '+81', iso3: 'JPN' },
  { name: 'Jordan', code: '+962', iso3: 'JOR' },
  { name: 'Kazakhstan', code: '+7', iso3: 'KAZ' },
  { name: 'Kenya', code: '+254', iso3: 'KEN' },
  { name: 'Kiribati', code: '+686', iso3: 'KIR' },
  { name: 'Kosovo', code: '+383', iso3: 'XKX' },
  { name: 'Kuwait', code: '+965', iso3: 'KWT' },
  { name: 'Kyrgyzstan', code: '+996', iso3: 'KGZ' },
  { name: 'Laos', code: '+856', iso3: 'LAO' },
  { name: 'Latvia', code: '+371', iso3: 'LVA' },
  { name: 'Lebanon', code: '+961', iso3: 'LBN' },
  { name: 'Lesotho', code: '+266', iso3: 'LSO' },
  { name: 'Liberia', code: '+231', iso3: 'LBR' },
  { name: 'Libya', code: '+218', iso3: 'LBY' },
  { name: 'Liechtenstein', code: '+423', iso3: 'LIE' },
  { name: 'Lithuania', code: '+370', iso3: 'LTU' },
  { name: 'Luxembourg', code: '+352', iso3: 'LUX' },
  { name: 'Macau', code: '+853', iso3: 'MAC' },
  { name: 'Macedonia', code: '+389', iso3: 'MKD' },
  { name: 'Madagascar', code: '+261', iso3: 'MDG' },
  { name: 'Malawi', code: '+265', iso3: 'MWI' },
  { name: 'Malaysia', code: '+60', iso3: 'MYS' },
  { name: 'Maldives', code: '+960', iso3: 'MDV' },
  { name: 'Mali', code: '+223', iso3: 'MLI' },
  { name: 'Malta', code: '+356', iso3: 'MLT' },
  { name: 'Marshall Islands', code: '+692', iso3: 'MHL' },
  { name: 'Mauritania', code: '+222', iso3: 'MRT' },
  { name: 'Mauritius', code: '+230', iso3: 'MUS' },
  { name: 'Mexico', code: '+52', iso3: 'MEX' },
  { name: 'Micronesia', code: '+691', iso3: 'FSM' },
  { name: 'Moldova', code: '+373', iso3: 'MDA' },
  { name: 'Monaco', code: '+377', iso3: 'MCO' },
  { name: 'Mongolia', code: '+976', iso3: 'MNG' },
  { name: 'Montenegro', code: '+382', iso3: 'MNE' },
  { name: 'Montserrat', code: '+1-664', iso3: 'MSR' },
  { name: 'Morocco', code: '+212', iso3: 'MAR' },
  { name: 'Mozambique', code: '+258', iso3: 'MOZ' },
  { name: 'Myanmar', code: '+95', iso3: 'MMR' },
  { name: 'Namibia', code: '+264', iso3: 'NAM' },
  { name: 'Nauru', code: '+674', iso3: 'NRU' },
  { name: 'Nepal', code: '+977', iso3: 'NPL' },
  { name: 'Netherlands', code: '+31', iso3: 'NLD' },
  { name: 'New Zealand', code: '+64', iso3: 'NZL' },
  { name: 'Nicaragua', code: '+505', iso3: 'NIC' },
  { name: 'Niger', code: '+227', iso3: 'NER' },
  { name: 'Nigeria', code: '+234', iso3: 'NGA' },
  { name: 'North Korea', code: '+850', iso3: 'PRK' },
  { name: 'Norway', code: '+47', iso3: 'NOR' },
  { name: 'Oman', code: '+968', iso3: 'OMN' },
  { name: 'Pakistan', code: '+92', iso3: 'PAK' },
  { name: 'Palau', code: '+680', iso3: 'PLW' },
  { name: 'Palestine', code: '+970', iso3: 'PSE' },
  { name: 'Panama', code: '+507', iso3: 'PAN' },
  { name: 'Papua New Guinea', code: '+675', iso3: 'PNG' },
  { name: 'Paraguay', code: '+595', iso3: 'PRY' },
  { name: 'Peru', code: '+51', iso3: 'PER' },
  { name: 'Philippines', code: '+63', iso3: 'PHL' },
  { name: 'Poland', code: '+48', iso3: 'POL' },
  { name: 'Portugal', code: '+351', iso3: 'PRT' },
  { name: 'Puerto Rico', code: '+1-787', iso3: 'PRI' },
  { name: 'Qatar', code: '+974', iso3: 'QAT' },
  { name: 'Romania', code: '+40', iso3: 'ROU' },
  { name: 'Russia', code: '+7', iso3: 'RUS' },
  { name: 'Rwanda', code: '+250', iso3: 'RWA' },
  { name: 'Saint Kitts and Nevis', code: '+1-869', iso3: 'KNA' },
  { name: 'Saint Lucia', code: '+1-758', iso3: 'LCA' },
  { name: 'Saint Vincent and the Grenadines', code: '+1-784', iso3: 'VCT' },
  { name: 'Samoa', code: '+685', iso3: 'WSM' },
  { name: 'San Marino', code: '+378', iso3: 'SMR' },
  { name: 'Sao Tome and Principe', code: '+239', iso3: 'STP' },
  { name: 'Saudi Arabia', code: '+966', iso3: 'SAU' },
  { name: 'Senegal', code: '+221', iso3: 'SEN' },
  { name: 'Serbia', code: '+381', iso3: 'SRB' },
  { name: 'Seychelles', code: '+248', iso3: 'SYC' },
  { name: 'Sierra Leone', code: '+232', iso3: 'SLE' },
  { name: 'Singapore', code: '+65', iso3: 'SGP' },
  { name: 'Slovakia', code: '+421', iso3: 'SVK' },
  { name: 'Slovenia', code: '+386', iso3: 'SVN' },
  { name: 'Solomon Islands', code: '+677', iso3: 'SLB' },
  { name: 'Somalia', code: '+252', iso3: 'SOM' },
  { name: 'South Africa', code: '+27', iso3: 'ZAF' },
  { name: 'South Korea', code: '+82', iso3: 'KOR' },
  { name: 'South Sudan', code: '+211', iso3: 'SSD' },
  { name: 'Spain', code: '+34', iso3: 'ESP' },
  { name: 'Sri Lanka', code: '+94', iso3: 'LKA' },
  { name: 'Sudan', code: '+249', iso3: 'SDN' },
  { name: 'Suriname', code: '+597', iso3: 'SUR' },
  { name: 'Swaziland', code: '+268', iso3: 'SWZ' },
  { name: 'Sweden', code: '+46', iso3: 'SWE' },
  { name: 'Switzerland', code: '+41', iso3: 'CHE' },
  { name: 'Syria', code: '+963', iso3: 'SYR' },
  { name: 'Taiwan', code: '+886', iso3: 'TWN' },
  { name: 'Tajikistan', code: '+992', iso3: 'TJK' },
  { name: 'Tanzania', code: '+255', iso3: 'TZA' },
  { name: 'Thailand', code: '+66', iso3: 'THA' },
  { name: 'Timor-Leste', code: '+670', iso3: 'TLS' },
  { name: 'Togo', code: '+228', iso3: 'TGO' },
  { name: 'Tonga', code: '+676', iso3: 'TON' },
  { name: 'Trinidad and Tobago', code: '+1-868', iso3: 'TTO' },
  { name: 'Tunisia', code: '+216', iso3: 'TUN' },
  { name: 'Turkey', code: '+90', iso3: 'TUR' },
  { name: 'Turkmenistan', code: '+993', iso3: 'TKM' },
  { name: 'Tuvalu', code: '+688', iso3: 'TUV' },
  { name: 'Uganda', code: '+256', iso3: 'UGA' },
  { name: 'Ukraine', code: '+380', iso3: 'UKR' },
  { name: 'United Arab Emirates', code: '+971', iso3: 'ARE' },
  { name: 'United Kingdom', code: '+44', iso3: 'GBR' },
  { name: 'United States', code: '+1', iso3: 'USA' },
  { name: 'Uruguay', code: '+598', iso3: 'URY' },
  { name: 'Uzbekistan', code: '+998', iso3: 'UZB' },
  { name: 'Vanuatu', code: '+678', iso3: 'VUT' },
  { name: 'Vatican City', code: '+379', iso3: 'VAT' },
  { name: 'Venezuela', code: '+58', iso3: 'VEN' },
  { name: 'Vietnam', code: '+84', iso3: 'VNM' },
  { name: 'Yemen', code: '+967', iso3: 'YEM' },
  { name: 'Zambia', code: '+260', iso3: 'ZMB' },
  { name: 'Zimbabwe', code: '+263', iso3: 'ZWE' }
];

const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

function showLoading() { document.body.style.cursor = 'wait'; }
function hideLoading() { document.body.style.cursor = 'default'; }

function showSection(sectionName) {
  document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
  document.getElementById(`${sectionName}-section`)?.classList.remove('hidden');
  
  switch(sectionName) {
    case 'dashboard': loadDashboard(); break;
    case 'patients': 
      loadPatientCountries(); // Load country filter first
      loadPatients(); 
      break;
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
async function loadPatientCountries() {
  try {
    const res = await axios.get(`${API_BASE}/patients/countries`);
    const countries = res.data.data || [];
    
    const dropdown = document.getElementById('patient-filter-country');
    if (dropdown) {
      dropdown.innerHTML = '<option value="">All Countries</option>' + 
        countries.map(country => `<option value="${country}">${country}</option>`).join('');
    }
  } catch (error) {
    console.error('Load patient countries error:', error);
  }
}

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

// Country search and selection functions
function initCountryDropdown() {
  const dropdown = document.getElementById('country-dropdown');
  const html = countries.map(c => `
    <div class="px-3 py-2 hover:bg-ayurveda-50 cursor-pointer country-option" 
         onclick="selectCountry('${c.name}', '${c.code}', '${c.iso3}')"
         data-country="${c.name.toLowerCase()}">
      <span class="font-medium">${c.name}</span>
      <span class="text-gray-500 text-sm ml-2">${c.code}</span>
    </div>
  `).join('');
  dropdown.innerHTML = html;
}

function showCountryDropdown() {
  document.getElementById('country-dropdown').classList.remove('hidden');
  initCountryDropdown();
}

function hideCountryDropdown() {
  setTimeout(() => {
    document.getElementById('country-dropdown').classList.add('hidden');
  }, 200);
}

function filterCountries() {
  const search = document.getElementById('patient-country-search').value.toLowerCase();
  const options = document.querySelectorAll('.country-option');
  
  options.forEach(option => {
    const countryName = option.dataset.country;
    if (countryName.includes(search)) {
      option.style.display = 'block';
    } else {
      option.style.display = 'none';
    }
  });
}

function selectCountry(name, code, iso3) {
  document.getElementById('patient-country-search').value = name;
  document.getElementById('patient-country').value = name;
  document.getElementById('patient-country-code').value = code;
  document.getElementById('patient-country-iso3').value = iso3;
  document.getElementById('phone-country-code-display').textContent = code;
  hideCountryDropdown();
}

// Dynamic phone number management
let phoneFieldCounter = 0;
function addPhoneField(label = '', number = '') {
  phoneFieldCounter++;
  const html = `
    <div class="flex items-center gap-2 phone-field" data-id="${phoneFieldCounter}">
      <input 
        type="text" 
        placeholder="Label (e.g., Home, Office)" 
        value="${label}"
        class="border rounded px-3 py-2 w-1/3 phone-label"
      >
      <span class="px-3 py-2 bg-gray-100 border rounded font-mono text-sm phone-display-code">${document.getElementById('patient-country-code').value || '+91'}</span>
      <input 
        type="text" 
        placeholder="Phone number" 
        value="${number}"
        class="border rounded px-3 py-2 flex-1 phone-number"
      >
      <button 
        type="button" 
        onclick="removePhoneField(${phoneFieldCounter})" 
        class="text-red-600 hover:text-red-800 px-2"
      >
        <i class="fas fa-times"></i>
      </button>
    </div>
  `;
  document.getElementById('additional-phones-container').insertAdjacentHTML('beforeend', html);
}

function removePhoneField(id) {
  document.querySelector(`.phone-field[data-id="${id}"]`)?.remove();
}

function updateAllPhoneCodeDisplays() {
  const code = document.getElementById('patient-country-code').value;
  document.querySelectorAll('.phone-display-code').forEach(el => {
    el.textContent = code;
  });
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
  
  // Clear additional phones
  document.getElementById('additional-phones-container').innerHTML = '';
  phoneFieldCounter = 0;
  
  // Initialize country dropdown
  initCountryDropdown();
  
  if (patient) {
    document.getElementById('patient-id').value = patient.id;
    document.getElementById('patient-name').value = patient.name || '';
    document.getElementById('patient-age').value = patient.age || '';
    document.getElementById('patient-gender').value = patient.gender || '';
    document.getElementById('patient-weight').value = patient.weight || '';
    document.getElementById('patient-height').value = patient.height || '';
    
    // Set country
    const countryName = patient.country || 'India';
    const countryData = countries.find(c => c.name === countryName) || countries[0];
    document.getElementById('patient-country-search').value = countryName;
    document.getElementById('patient-country').value = countryName;
    document.getElementById('patient-country-code').value = countryData.code;
    document.getElementById('patient-country-iso3').value = countryData.iso3;
    document.getElementById('phone-country-code-display').textContent = countryData.code;
    
    // Set phone
    document.getElementById('patient-phone').value = patient.phone || '';
    document.getElementById('patient-email').value = patient.email || '';
    
    // Load additional phones
    if (patient.additional_phones) {
      try {
        const phones = JSON.parse(patient.additional_phones);
        phones.forEach(p => {
          if (p.label && p.number) {
            addPhoneField(p.label, p.number);
          }
        });
      } catch (e) {
        console.log('No additional phones');
      }
    }
    
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
    
    // Load diseases from JSON array
    if (patient.diseases) {
      try {
        const diseases = JSON.parse(patient.diseases);
        diseases.forEach(d => {
          addDiseaseRow(
            d.present_health_issue || '',
            d.present_medicine || '',
            d.mg_value || '',
            d.attacked_by || ''
          );
        });
      } catch (e) {
        console.log('No diseases to load or invalid JSON');
        // Fallback to old single disease fields if JSON parsing fails
        if (patient.present_health_issue) {
          addDiseaseRow(
            patient.present_health_issue || '',
            patient.present_medicine || '',
            patient.mg_value || '',
            patient.attacked_by || ''
          );
        }
      }
    } else if (patient.present_health_issue) {
      // Fallback to old single disease fields
      addDiseaseRow(
        patient.present_health_issue || '',
        patient.present_medicine || '',
        patient.mg_value || '',
        patient.attacked_by || ''
      );
    }
    
    document.getElementById('patient-medical-history').value = patient.medical_history || '';
  } else {
    form.reset();
    document.getElementById('patient-id').value = '';
    
    // Set default country
    selectCountry('India', '+91', 'IND');
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
    
    // Validate mandatory fields
    const name = document.getElementById('patient-name').value.trim();
    const country = document.getElementById('patient-country').value;
    const countryCode = document.getElementById('patient-country-code').value;
    const countryIso3 = document.getElementById('patient-country-iso3').value;
    const phone = document.getElementById('patient-phone').value.trim();
    
    const missingFields = [];
    if (!name) missingFields.push('Name');
    if (!country) missingFields.push('Country');
    if (!phone) missingFields.push('Primary Phone Number');
    
    if (missingFields.length > 0) {
      hideLoading();
      alert('❌ Missing Required Fields:\n\n' + missingFields.map(f => '• ' + f).join('\n') + '\n\nPlease fill in all required fields marked with *');
      return;
    }
    
    // Collect additional phones with labels
    const additionalPhones = Array.from(document.querySelectorAll('.phone-field')).map(field => ({
      label: field.querySelector('.phone-label').value,
      number: field.querySelector('.phone-number').value
    })).filter(p => p.label && p.number);
    
    // Collect diseases with all 4 fields
    const diseases = Array.from(document.querySelectorAll('.disease-row')).map(row => ({
      present_health_issue: row.querySelector('.disease-health-issue').value,
      present_medicine: row.querySelector('.disease-medicine').value,
      mg_value: row.querySelector('.disease-mg').value,
      attacked_by: row.querySelector('.disease-attacked-by').value
    })).filter(d => d.present_health_issue); // Only include rows with health issue filled
    
    const data = {
      name: name,
      age: parseInt(document.getElementById('patient-age').value) || null,
      gender: document.getElementById('patient-gender').value || null,
      country: country,
      country_code: countryCode,
      country_iso3: countryIso3,
      phone: phone,
      email: document.getElementById('patient-email').value || null,
      weight: parseFloat(document.getElementById('patient-weight').value) || null,
      height: parseFloat(document.getElementById('patient-height').value) || null,
      
      // Detailed address fields
      address_hno: document.getElementById('patient-address-hno').value || null,
      address_street: document.getElementById('patient-address-street').value || null,
      address_apartment: document.getElementById('patient-address-apartment').value || null,
      address_area: document.getElementById('patient-address-area').value || null,
      address_district: document.getElementById('patient-address-district').value || null,
      address_state: document.getElementById('patient-address-state').value || null,
      address_pincode: document.getElementById('patient-address-pincode').value || null,
      address: document.getElementById('patient-address').value || null,
      
      // Referred by
      referred_by_name: document.getElementById('patient-referred-by').value || null,
      referred_by_phone: document.getElementById('patient-referred-by-phone').value || null,
      referred_by_address: document.getElementById('patient-referred-by-address').value || null,
      
      // Medical history
      medical_history: document.getElementById('patient-medical-history').value || null,
      
      // Additional phones as JSON
      additional_phones: additionalPhones.length > 0 ? JSON.stringify(additionalPhones) : null,
      
      // Diseases as JSON array
      diseases: diseases.length > 0 ? JSON.stringify(diseases) : null
    };
    
    if (id) {
      await axios.put(`${API_BASE}/patients/${id}`, data);
      alert('✅ Patient updated successfully!\n\nPatient ID: ' + (await axios.get(`${API_BASE}/patients/${id}`)).data.data.patient_id);
    } else {
      const result = await axios.post(`${API_BASE}/patients`, data);
      const patientId = result.data.data.patient_id;
      alert(`✅ Patient added successfully!\n\nPatient ID: ${patientId}\nName: ${name}\nPhone: ${countryCode} ${phone}`);
    }
    
    closePatientModal();
    loadPatients();
  } catch (error) {
    console.error('Save patient error:', error);
    const errorMsg = error.response?.data?.error || error.message || 'Unknown error';
    alert('❌ Error saving patient:\n\n' + errorMsg + '\n\nPlease check all fields and try again.');
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
    
    // Parse and display diseases from JSON array
    let diseasesText = 'N/A';
    if (patient.diseases) {
      try {
        const diseases = JSON.parse(patient.diseases);
        if (diseases.length > 0) {
          diseasesText = diseases.map(d => 
            `${d.present_health_issue || 'N/A'}: ${d.present_medicine || 'N/A'} (${d.mg_value || ''}) - Attacked: ${d.attacked_by || 'N/A'}`
          ).join('; ');
        }
      } catch (e) {
        // Fallback to old single disease field
        if (patient.present_health_issue) {
          diseasesText = `${patient.present_health_issue}: ${patient.present_medicine || 'N/A'} (${patient.mg_value || ''}) - Attacked: ${patient.attacked_by || 'N/A'}`;
        }
      }
    } else if (patient.present_health_issue) {
      // Fallback to old single disease field
      diseasesText = `${patient.present_health_issue}: ${patient.present_medicine || 'N/A'} (${patient.mg_value || ''}) - Attacked: ${patient.attacked_by || 'N/A'}`;
    }
    
    document.getElementById('display-patient-health-issue').textContent = diseasesText;
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
