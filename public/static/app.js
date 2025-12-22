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

function formatAmount(amount) {
  const num = parseFloat(amount || 0);
  return num.toFixed(2);
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
  
  // Clear the search field to prevent any autocomplete contamination
  const searchField = document.getElementById('patient-search');
  if (searchField && searchField.value === currentUser?.email) {
    searchField.value = '';
  }
  
  // Reload patients list to refresh the view
  loadPatients();
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
      <td class="px-6 py-4 border-b">${apt.purpose || 'N/A'}</td>
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

async function showAppointmentModal(appointment = null) {
  try {
    const modal = document.getElementById('appointment-modal');
    const title = document.getElementById('appointment-modal-title');
    
    if (!modal || !title) {
      console.error('Appointment modal elements not found');
      return;
    }
    
    title.textContent = appointment ? 'Edit Appointment' : 'Add New Appointment';
    
    // Load patients first, then set values
    await loadPatientsForSelect();
    
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

// ==================== EXPORT FUNCTIONS ====================
async function exportToExcel() {
  try {
    showLoading();
    const search = document.getElementById('prescription-search')?.value || '';
    const res = await axios.get(`${API_BASE}/prescriptions?search=${search}`);
    const data = res.data.data || [];
    
    if (data.length === 0) {
      alert('No records to export');
      hideLoading();
      return;
    }
    
    // Prepare CSV data
    const headers = ['Given Date', 'Patient ID', 'Patient Name', 'Problem', 'Entire Course (Months)', 'Currency', 'Total Amount', 'Advance Paid', 'Collected Amount', 'Balance Due', 'Completed Months', 'Next Follow-up'];
    const rows = data.map(hr => {
      const currency = hr.currency === 'USD' ? 'USD' : 'INR';
      return [
        formatDate(hr.given_date || hr.created_at),
        hr.patient_id || '',
        hr.patient_name || '',
        hr.diagnosis || '',
        hr.course || 0,
        currency,
        formatAmount(hr.total_amount || 0),
        formatAmount(hr.total_advance || 0),
        formatAmount(hr.total_collected || 0),
        formatAmount(hr.total_balance || 0),
        hr.active_course_months || 0,
        hr.next_followup_date ? formatDate(hr.next_followup_date) : 'N/A'
      ];
    });
    
    // Create CSV content
    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
      csv += row.map(cell => `"${cell}"`).join(',') + '\n';
    });
    
    // Download CSV file
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `herbs_routes_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    hideLoading();
  } catch (error) {
    console.error('Export to Excel error:', error);
    alert('Error exporting to Excel: ' + (error.response?.data?.error || error.message));
    hideLoading();
  }
}

async function exportToPDF() {
  try {
    showLoading();
    const search = document.getElementById('prescription-search')?.value || '';
    const res = await axios.get(`${API_BASE}/prescriptions?search=${search}`);
    const data = res.data.data || [];
    
    if (data.length === 0) {
      alert('No records to export');
      hideLoading();
      return;
    }
    
    // Create printable HTML
    const printWindow = window.open('', '_blank');
    let totalAmount = 0;
    let totalAdvance = 0;
    let totalCollected = 0;
    let totalBalance = 0;
    
    const tableRows = data.map(hr => {
      const symbol = hr.currency === 'USD' ? '$' : '₹';
      totalAmount += parseFloat(hr.total_amount || 0);
      totalAdvance += parseFloat(hr.total_advance || 0);
      totalCollected += parseFloat(hr.total_collected || 0);
      totalBalance += parseFloat(hr.total_balance || 0);
      
      return `
        <tr>
          <td>${formatDate(hr.given_date || hr.created_at)}</td>
          <td>${hr.patient_id || ''}</td>
          <td>${hr.patient_name || ''}</td>
          <td>${hr.diagnosis || ''}</td>
          <td>${hr.course || 0}</td>
          <td>${symbol}${formatAmount(hr.total_amount || 0)}</td>
          <td>${symbol}${formatAmount(hr.total_advance || 0)}</td>
          <td>${symbol}${formatAmount(hr.total_collected || 0)}</td>
          <td>${symbol}${formatAmount(hr.total_balance || 0)}</td>
          <td>${hr.active_course_months || 0}</td>
          <td>${hr.next_followup_date ? formatDate(hr.next_followup_date) : 'N/A'}</td>
        </tr>
      `;
    }).join('');
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Herbs & Routes Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { text-align: center; color: #16a34a; }
          .report-info { text-align: center; margin-bottom: 20px; color: #666; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #16a34a; color: white; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .summary { margin-top: 20px; padding: 15px; background-color: #f0f9ff; border: 2px solid #16a34a; }
          .summary h3 { margin-top: 0; color: #16a34a; }
          .summary-row { display: flex; justify-content: space-between; margin: 5px 0; }
          @media print {
            body { padding: 10px; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <h1>🌿 TPS DHANVANTRI AYURVEDA - Herbs & Routes Report</h1>
        <div class="report-info">
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <p>Total Records: ${data.length}</p>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Given Date</th>
              <th>Patient ID</th>
              <th>Patient Name</th>
              <th>Problem</th>
              <th>Course (Months)</th>
              <th>Total Amount</th>
              <th>Advance Paid</th>
              <th>Collected</th>
              <th>Balance Due</th>
              <th>Completed</th>
              <th>Next Follow-up</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
        
        <div class="summary">
          <h3>📊 Summary</h3>
          <div class="summary-row"><strong>Total Amount:</strong> <span>₹${formatAmount(totalAmount)}</span></div>
          <div class="summary-row"><strong>Total Advance:</strong> <span>₹${formatAmount(totalAdvance)}</span></div>
          <div class="summary-row"><strong>Total Collected:</strong> <span>₹${formatAmount(totalCollected)}</span></div>
          <div class="summary-row"><strong>Total Balance Due:</strong> <span style="color: ${totalBalance > 0 ? '#dc2626' : '#16a34a'}">₹${formatAmount(totalBalance)}</span></div>
        </div>
        
        <div style="text-align: center; margin-top: 20px;">
          <button onclick="window.print()" style="background: #16a34a; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">
            Print / Save as PDF
          </button>
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.write(html);
    printWindow.document.close();
    
    hideLoading();
  } catch (error) {
    console.error('Export to PDF error:', error);
    alert('Error exporting to PDF: ' + (error.response?.data?.error || error.message));
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
  const html = currentHerbsRoutes.map(hr => {
    // Get currency symbol
    const symbol = hr.currency === 'USD' ? '$' : '₹';
    
    // Format amounts
    const totalAmount = hr.total_amount || 0;
    const dueAmount = hr.total_balance || 0;
    
    // Truncate problem text to 15 characters
    const problem = hr.diagnosis || 'N/A';
    const truncatedProblem = problem.length > 15 ? problem.substring(0, 15) + '...' : problem;
    
    return `
    <tr class="hover:bg-gray-50">
      <td class="px-6 py-4 border-b">${formatDate(hr.given_date || hr.created_at)}</td>
      <td class="px-6 py-4 border-b font-medium text-blue-600">${hr.patient_id || 'N/A'}</td>
      <td class="px-6 py-4 border-b font-medium">${hr.patient_name}</td>
      <td class="px-6 py-4 border-b" title="${problem}">${truncatedProblem}</td>
      <td class="px-6 py-4 border-b text-center">${hr.course || 0}</td>
      <td class="px-6 py-4 border-b">
        <div class="text-sm">
          <div class="font-semibold text-blue-600">${symbol}${totalAmount.toFixed(2)}</div>
          <div class="text-xs text-red-600">Due: ${symbol}${dueAmount.toFixed(2)}</div>
        </div>
      </td>
      <td class="px-6 py-4 border-b text-center">
        <span class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
          ${hr.active_course_months || 0} months
        </span>
      </td>
      <td class="px-6 py-4 border-b">${formatDate(hr.follow_up_date || hr.next_followup_date)}</td>
      <td class="px-6 py-4 border-b whitespace-nowrap">
        <button onclick="viewHerbsRoutes(${hr.id})" class="text-blue-600 hover:text-blue-800 mr-2" title="View">
          <i class="fas fa-eye"></i>
        </button>
        <button onclick="editHerbsRoutes(${hr.id})" class="text-green-600 hover:text-green-800 mr-2" title="Edit">
          <i class="fas fa-edit"></i>
        </button>
        <button onclick="printHerbsRoutes(${hr.id})" class="text-purple-600 hover:text-purple-800 mr-2" title="Print">
          <i class="fas fa-print"></i>
        </button>
        <button onclick="deleteHerbsRoutes(${hr.id})" class="text-red-600 hover:text-red-800" title="Delete">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    </tr>
  `}).join('') || '<tr><td colspan="9" class="px-6 py-4 text-center text-gray-500">No records found</td></tr>';
  
  document.getElementById('prescriptions-table-body').innerHTML = html;
}

function showHerbsRoutesModal() {
  const modal = document.getElementById('prescription-modal');
  document.getElementById('prescription-modal-title').textContent = 'New Herbs & Routes Record';
  document.getElementById('prescription-form').reset();
  document.getElementById('prescription-id').value = '';
  document.getElementById('medicines-list').innerHTML = '';
  medicineCounter = 0;
  courseToMedicineMap = {};
  
  // Reset currency to INR
  const currencySelect = document.getElementById('prescription-currency');
  if (currencySelect) currencySelect.value = 'INR';
  
  // Reset payment summary
  document.getElementById('overall-total-amount').textContent = '₹0.00';
  document.getElementById('overall-advance-paid').textContent = '₹0.00';
  document.getElementById('overall-balance-due').textContent = '₹0.00';
  document.getElementById('overall-active-count').textContent = '0';
  
  // Reset follow-up date
  document.getElementById('prescription-followup').value = '';
  
  addMedicineRow();
  updateAllCurrencyDisplays(); // Update currency displays
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
let courseToMedicineMap = {}; // Track medicines per course

function addMedicineRow() {
  medicineCounter++;
  console.log('addMedicineRow called, medicineCounter:', medicineCounter);
  console.log('Current courseToMedicineMap:', courseToMedicineMap);
  
  const html = `
    <div class="medicine-row border rounded-lg p-4 mb-4 bg-gradient-to-r from-white to-blue-50" data-row="${medicineCounter}">
      <div class="flex justify-between items-center mb-3">
        <div class="flex items-center space-x-4">
          <h4 class="font-semibold text-lg text-ayurveda-700">Course ${medicineCounter}</h4>
          <label class="flex items-center cursor-pointer">
            <input type="checkbox" name="is_active_${medicineCounter}" class="mr-2 w-5 h-5 medicine-active-checkbox" checked onchange="updatePaymentSummary(); calculateSmartFollowUp();">
            <span class="font-medium text-sm text-green-600">Active</span>
          </label>
        </div>
        <button type="button" onclick="removeMedicineRow(${medicineCounter})" class="text-red-600 hover:text-red-800">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <!-- Given Date and Treatment Months at the beginning -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-300">
        <div>
          <label class="block text-sm font-medium mb-1">Given Date *</label>
          <input type="date" name="given_date_${medicineCounter}" class="w-full border rounded px-3 py-2 medicine-given-date" required onchange="calculateSmartFollowUp()">
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Treatment Months *</label>
          <select name="treatment_months_${medicineCounter}" class="w-full border rounded px-3 py-2 medicine-treatment-months" required onchange="calculateSmartFollowUp()">
            <option value="1">1 Month</option>
            <option value="2">2 Months</option>
            <option value="3">3 Months</option>
            <option value="4">4 Months</option>
            <option value="5">5 Months</option>
            <option value="6">6 Months</option>
            <option value="7">7 Months</option>
            <option value="8">8 Months</option>
            <option value="9">9 Months</option>
            <option value="10">10 Months</option>
            <option value="11">11 Months</option>
            <option value="12">12 Months</option>
          </select>
        </div>
      </div>
      
      <!-- Add Medicine button -->
      <div class="mb-4">
        <button type="button" onclick="addMedicineToRow(${medicineCounter})" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">
          <i class="fas fa-plus mr-2"></i>Add Medicine
        </button>
      </div>
      
      <!-- Medicines container -->
      <div id="medicines-container-${medicineCounter}" class="space-y-3 mb-4">
        <!-- Medicines will be added here -->
      </div>
      
      <div class="border-t border-gray-300 pt-4">
        <h5 class="font-medium text-sm text-blue-700 mb-3"><i class="fas fa-money-bill-wave mr-2"></i>Payment Details for this Course</h5>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
          <div>
            <label class="block text-xs font-medium mb-1 course-amount-label">Amount</label>
            <input type="number" step="0.01" name="payment_amount_${medicineCounter}" class="w-full border rounded px-3 py-2 text-sm medicine-payment-amount" placeholder="0.00" oninput="updatePaymentSummary()">
          </div>
          <div>
            <label class="block text-xs font-medium mb-1 course-advance-label">Advance</label>
            <input type="number" step="0.01" name="advance_payment_${medicineCounter}" class="w-full border rounded px-3 py-2 text-sm medicine-advance-payment" placeholder="0.00" oninput="updatePaymentSummary()">
          </div>
          <div>
            <label class="block text-xs font-medium mb-1 course-balance-label">Balance</label>
            <div class="border rounded px-3 py-2 bg-gray-100 text-sm font-bold text-red-600 course-balance-display" data-row="${medicineCounter}">₹0.00</div>
          </div>
          <div>
            <label class="block text-xs font-medium mb-1">Payment Notes</label>
            <input type="text" name="payment_notes_${medicineCounter}" class="w-full border rounded px-3 py-2 text-sm" placeholder="Optional">
          </div>
        </div>
        
        <!-- Payment Collections Section -->
        <div class="mt-4 pt-3 border-t border-gray-200">
          <div class="flex justify-between items-center mb-2">
            <h6 class="font-medium text-xs text-green-700"><i class="fas fa-receipt mr-1"></i>Payment Collections</h6>
            <button type="button" onclick="addPaymentCollection(${medicineCounter})" class="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs">
              <i class="fas fa-plus mr-1"></i>Collect Payment
            </button>
          </div>
          <div id="payment-collections-${medicineCounter}" class="space-y-2">
            <!-- Payment collections will be added here -->
          </div>
        </div>
      </div>
    </div>
  `;
  
  document.getElementById('medicines-list').insertAdjacentHTML('beforeend', html);
  courseToMedicineMap[medicineCounter] = 0; // Initialize medicine counter for this course
  addMedicineToRow(medicineCounter); // Add first medicine automatically
  updatePaymentSummary();
  calculateSmartFollowUp();
}

// Add a medicine to a specific course
function addMedicineToRow(courseId) {
  if (!courseToMedicineMap[courseId]) {
    courseToMedicineMap[courseId] = 0;
  }
  courseToMedicineMap[courseId]++;
  const medId = courseToMedicineMap[courseId];
  
  const html = `
    <div class="medicine-item border border-blue-200 rounded-lg p-3 bg-blue-50" data-course="${courseId}" data-medicine="${medId}">
      <div class="flex justify-between items-center mb-3">
        <h5 class="font-medium text-sm text-blue-800">Medicine ${medId}</h5>
        <button type="button" onclick="removeMedicineFromRow(${courseId}, ${medId})" class="text-red-600 hover:text-red-800 text-sm">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <div>
          <label class="block text-xs font-medium mb-1">Roman ID</label>
          <select name="roman_id_${courseId}_${medId}" class="w-full border rounded px-2 py-2 text-sm">
            <option value="">Select Roman ID</option>
            <option value="I">I</option>
            <option value="II">II</option>
            <option value="III">III</option>
            <option value="IV">IV</option>
            <option value="V">V</option>
            <option value="VI">VI</option>
            <option value="VII">VII</option>
            <option value="VIII">VIII</option>
            <option value="IX">IX</option>
            <option value="X">X</option>
            <option value="XI">XI</option>
            <option value="XII">XII</option>
          </select>
        </div>
        
        <div>
          <label class="block text-xs font-medium mb-1">Medicine Name *</label>
          <input type="text" name="medicine_name_${courseId}_${medId}" class="w-full border rounded px-2 py-2 text-sm" required>
        </div>
      </div>
      
      <div>
        <label class="block text-xs font-medium mb-2">Dosage Schedule</label>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <label class="flex items-center">
            <input type="checkbox" name="morning_before_${courseId}_${medId}" class="mr-1">
            Morning (Before)
          </label>
          <label class="flex items-center">
            <input type="checkbox" name="morning_after_${courseId}_${medId}" class="mr-1">
            Morning (After)
          </label>
          <label class="flex items-center">
            <input type="checkbox" name="afternoon_before_${courseId}_${medId}" class="mr-1">
            Afternoon (Before)
          </label>
          <label class="flex items-center">
            <input type="checkbox" name="afternoon_after_${courseId}_${medId}" class="mr-1">
            Afternoon (After)
          </label>
          <label class="flex items-center">
            <input type="checkbox" name="evening_before_${courseId}_${medId}" class="mr-1">
            Evening (Before)
          </label>
          <label class="flex items-center">
            <input type="checkbox" name="evening_after_${courseId}_${medId}" class="mr-1">
            Evening (After)
          </label>
          <label class="flex items-center">
            <input type="checkbox" name="night_before_${courseId}_${medId}" class="mr-1">
            Night (Before)
          </label>
          <label class="flex items-center">
            <input type="checkbox" name="night_after_${courseId}_${medId}" class="mr-1">
            Night (After)
          </label>
        </div>
      </div>
    </div>
  `;
  
  document.getElementById(`medicines-container-${courseId}`).insertAdjacentHTML('beforeend', html);
}

// Remove a medicine from a course
function removeMedicineFromRow(courseId, medId) {
  const medicine = document.querySelector(`.medicine-item[data-course="${courseId}"][data-medicine="${medId}"]`);
  if (medicine) {
    medicine.remove();
  }
}

function removeMedicineRow(rowId) {
  const row = document.querySelector(`.medicine-row[data-row="${rowId}"]`);
  if (row) {
    row.remove();
    updatePaymentSummary();
    calculateSmartFollowUp();
  }
}

// Update overall payment summary from individual medicine payments
function updatePaymentSummary() {
  // Get global currency
  const currencySelect = document.getElementById('prescription-currency');
  const currency = currencySelect ? currencySelect.value : 'INR';
  const symbol = currency === 'USD' ? '$' : '₹';
  
  let totalAmount = 0;
  let totalAdvance = 0;
  let totalCollected = 0;
  let totalBalance = 0;
  let activeCount = 0;
  
  document.querySelectorAll('.medicine-row').forEach((row) => {
    const rowNum = row.dataset.row;
    
    // Check if medicine is active
    const isActive = row.querySelector(`[name="is_active_${rowNum}"]`).checked;
    if (isActive) activeCount++;
    
    // Get payment values
    const amount = parseFloat(row.querySelector(`[name="payment_amount_${rowNum}"]`).value) || 0;
    const advance = parseFloat(row.querySelector(`[name="advance_payment_${rowNum}"]`).value) || 0;
    
    // Get all collections for this course
    let courseCollected = 0;
    const collectionsContainer = document.getElementById(`payment-collections-${rowNum}`);
    if (collectionsContainer) {
      collectionsContainer.querySelectorAll('[data-collection]').forEach((collectionDiv) => {
        const collectionId = collectionDiv.dataset.collection;
        const collectionAmount = parseFloat(collectionDiv.querySelector(`[name="collection_amount_${collectionId}"]`)?.value) || 0;
        courseCollected += collectionAmount;
      });
    }
    
    const balance = amount - advance - courseCollected;
    
    // Update individual balance display with correct currency
    const balanceDisplay = row.querySelector(`.course-balance-display[data-row="${rowNum}"]`);
    if (balanceDisplay) {
      balanceDisplay.textContent = `${symbol}${balance.toFixed(2)}`;
      balanceDisplay.className = balance > 0 ? 
        'border rounded px-3 py-2 bg-gray-100 text-sm font-bold text-red-600 course-balance-display' : 
        'border rounded px-3 py-2 bg-gray-100 text-sm font-bold text-green-600 course-balance-display';
    }
    
    // Sum totals (all medicines, not just active)
    totalAmount += amount;
    totalAdvance += advance;
    totalCollected += courseCollected;
    totalBalance += balance;
  });
  
  // Update overall summary display with correct currency
  const overallTotal = document.getElementById('overall-total-amount');
  const overallAdvance = document.getElementById('overall-advance-paid');
  const overallBalance = document.getElementById('overall-balance-due');
  const overallActive = document.getElementById('overall-active-count');
  
  if (overallTotal) overallTotal.textContent = `${symbol}${totalAmount.toFixed(2)}`;
  if (overallAdvance) overallAdvance.textContent = `${symbol}${totalAdvance.toFixed(2)}`;
  if (overallBalance) {
    overallBalance.textContent = `${symbol}${totalBalance.toFixed(2)}`;
    overallBalance.className = totalBalance > 0 ?
      'text-3xl font-bold text-red-600' :
      'text-3xl font-bold text-green-600';
  }
  if (overallActive) overallActive.textContent = activeCount;
}

// Update all currency displays when global currency changes
function updateAllCurrencyDisplays() {
  // Get global currency
  const currencySelect = document.getElementById('prescription-currency');
  const currency = currencySelect ? currencySelect.value : 'INR';
  const symbol = currency === 'USD' ? '$' : '₹';
  const currencyName = currency === 'USD' ? 'USD' : 'INR';
  
  // Update all payment field labels
  document.querySelectorAll('.course-amount-label').forEach(label => {
    label.textContent = `Amount (${symbol})`;
  });
  document.querySelectorAll('.course-advance-label').forEach(label => {
    label.textContent = `Advance (${symbol})`;
  });
  document.querySelectorAll('.course-balance-label').forEach(label => {
    label.textContent = `Balance (${symbol})`;
  });
  
  // Update all payment displays
  updatePaymentSummary();
}

// Smart follow-up calculation: Find the latest end date from ACTIVE medicines only
function calculateSmartFollowUp() {
  let latestEndDate = null;
  let hasActiveMedicines = false;
  
  document.querySelectorAll('.medicine-row').forEach((row) => {
    const rowNum = row.dataset.row;
    
    // Check if medicine is active
    const isActive = row.querySelector(`[name="is_active_${rowNum}"]`)?.checked;
    if (!isActive) return; // Skip inactive medicines
    
    hasActiveMedicines = true;
    
    // Get given date and treatment months
    const givenDateInput = row.querySelector(`[name="given_date_${rowNum}"]`);
    const monthsInput = row.querySelector(`[name="treatment_months_${rowNum}"]`);
    
    if (givenDateInput && givenDateInput.value && monthsInput && monthsInput.value) {
      const givenDate = new Date(givenDateInput.value);
      const months = parseInt(monthsInput.value) || 0;
      
      // Calculate end date for this medicine
      const endDate = new Date(givenDate);
      endDate.setMonth(endDate.getMonth() + months);
      
      // Track the latest end date
      if (!latestEndDate || endDate > latestEndDate) {
        latestEndDate = endDate;
      }
    }
  });
  
  // Update follow-up date field
  const followUpInput = document.getElementById('prescription-followup');
  if (followUpInput) {
    if (hasActiveMedicines && latestEndDate) {
      followUpInput.value = latestEndDate.toISOString().split('T')[0];
    } else {
      followUpInput.value = '';
    }
  }
}

// Payment Collection Functions
let paymentCollectionCounter = 0;

function addPaymentCollection(courseId, existingData = null) {
  paymentCollectionCounter++;
  const collectionId = `${courseId}_${paymentCollectionCounter}`;
  
  const html = `
    <div class="payment-collection-item bg-green-50 border border-green-200 rounded p-2" data-collection="${collectionId}" data-course="${courseId}">
      <div class="grid grid-cols-12 gap-2 items-center">
        <div class="col-span-3">
          <label class="block text-xs mb-1">Date *</label>
          <input type="date" name="collection_date_${collectionId}" class="w-full border rounded px-2 py-1 text-xs" value="${existingData?.collection_date || ''}">
        </div>
        <div class="col-span-3">
          <label class="block text-xs mb-1">Amount *</label>
          <input type="number" step="0.01" name="collection_amount_${collectionId}" class="w-full border rounded px-2 py-1 text-xs" placeholder="0.00" value="${existingData?.amount || ''}" oninput="updatePaymentSummary()">
        </div>
        <div class="col-span-2">
          <label class="block text-xs mb-1">Method</label>
          <select name="collection_method_${collectionId}" class="w-full border rounded px-2 py-1 text-xs">
            <option value="Cash" ${existingData?.payment_method === 'Cash' ? 'selected' : ''}>Cash</option>
            <option value="Card" ${existingData?.payment_method === 'Card' ? 'selected' : ''}>Card</option>
            <option value="UPI" ${existingData?.payment_method === 'UPI' ? 'selected' : ''}>UPI</option>
            <option value="Check" ${existingData?.payment_method === 'Check' ? 'selected' : ''}>Check</option>
          </select>
        </div>
        <div class="col-span-3">
          <label class="block text-xs mb-1">Notes</label>
          <input type="text" name="collection_notes_${collectionId}" class="w-full border rounded px-2 py-1 text-xs" placeholder="Optional" value="${existingData?.notes || ''}">
        </div>
        <div class="col-span-1 flex items-end">
          <button type="button" onclick="removePaymentCollection('${collectionId}')" class="text-red-600 hover:text-red-800 text-xs p-1">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
      ${existingData?.id ? `<input type="hidden" name="collection_id_${collectionId}" value="${existingData.id}">` : ''}
    </div>
  `;
  
  document.getElementById(`payment-collections-${courseId}`).insertAdjacentHTML('beforeend', html);
}

function removePaymentCollection(collectionId) {
  const element = document.querySelector(`[data-collection="${collectionId}"]`);
  if (element) {
    element.remove();
  }
}

async function saveHerbsRoutes() {
  try {
    showLoading();
    
    const patientId = parseInt(document.getElementById('prescription-patient').value);
    if (!patientId) {
      alert('Please select a patient');
      hideLoading();
      return;
    }
    
    // Collect medicines with per-medicine dates, months, status, and payment
    const medicines = [];
    document.querySelectorAll('.medicine-row').forEach((courseRow, index) => {
      const courseId = courseRow.dataset.row;
      
      // Get course-level data
      const givenDate = courseRow.querySelector(`[name="given_date_${courseId}"]`)?.value;
      const treatmentMonths = parseInt(courseRow.querySelector(`[name="treatment_months_${courseId}"]`)?.value) || 1;
      const isActive = courseRow.querySelector(`[name="is_active_${courseId}"]`)?.checked ? 1 : 0;
      const paymentAmount = parseFloat(courseRow.querySelector(`[name="payment_amount_${courseId}"]`)?.value) || 0;
      const advancePayment = parseFloat(courseRow.querySelector(`[name="advance_payment_${courseId}"]`)?.value) || 0;
      const balanceDue = paymentAmount - advancePayment;
      const paymentNotes = courseRow.querySelector(`[name="payment_notes_${courseId}"]`)?.value || '';
      
      if (!givenDate && isActive) {
        alert(`Please provide Given Date for Course ${index + 1}`);
        throw new Error('Missing required field: Given Date');
      }
      
      // Collect all medicines in this course
      courseRow.querySelectorAll('.medicine-item').forEach((medItem) => {
        const medCourse = medItem.dataset.course;
        const medId = medItem.dataset.medicine;
        
        const medicineName = medItem.querySelector(`[name="medicine_name_${medCourse}_${medId}"]`)?.value;
        if (!medicineName) return; // Skip empty medicine items
        
        const romanIdValue = medItem.querySelector(`[name="roman_id_${medCourse}_${medId}"]`)?.value;
        
        medicines.push({
          roman_id: romanIdValue || romanNumerals[medicines.length] || `#${medicines.length + 1}`,
          medicine_name: medicineName,
          given_date: givenDate,
          treatment_months: treatmentMonths,
          is_active: isActive,
          payment_amount: paymentAmount,
          advance_payment: advancePayment,
          balance_due: balanceDue,
          payment_notes: paymentNotes,
          course_number: parseInt(courseId),
          morning_before: medItem.querySelector(`[name="morning_before_${medCourse}_${medId}"]`)?.checked ? 1 : 0,
          morning_after: medItem.querySelector(`[name="morning_after_${medCourse}_${medId}"]`)?.checked ? 1 : 0,
          afternoon_before: medItem.querySelector(`[name="afternoon_before_${medCourse}_${medId}"]`)?.checked ? 1 : 0,
          afternoon_after: medItem.querySelector(`[name="afternoon_after_${medCourse}_${medId}"]`)?.checked ? 1 : 0,
          evening_before: medItem.querySelector(`[name="evening_before_${medCourse}_${medId}"]`)?.checked ? 1 : 0,
          evening_after: medItem.querySelector(`[name="evening_after_${medCourse}_${medId}"]`)?.checked ? 1 : 0,
          night_before: medItem.querySelector(`[name="night_before_${medCourse}_${medId}"]`)?.checked ? 1 : 0,
          night_after: medItem.querySelector(`[name="night_after_${medCourse}_${medId}"]`)?.checked ? 1 : 0
        });
      });
    });
    
    // Collect payment collections for all courses
    const paymentCollections = [];
    document.querySelectorAll('.medicine-row').forEach((courseRow) => {
      const courseId = courseRow.dataset.row;
      const collectionContainer = document.getElementById(`payment-collections-${courseId}`);
      
      if (collectionContainer) {
        collectionContainer.querySelectorAll('[data-collection]').forEach((collectionDiv) => {
          const collectionId = collectionDiv.dataset.collection;
          const collectionDate = collectionDiv.querySelector(`[name="collection_date_${collectionId}"]`)?.value;
          const collectionAmount = parseFloat(collectionDiv.querySelector(`[name="collection_amount_${collectionId}"]`)?.value) || 0;
          const collectionMethod = collectionDiv.querySelector(`[name="collection_method_${collectionId}"]`)?.value || 'Cash';
          const collectionNotes = collectionDiv.querySelector(`[name="collection_notes_${collectionId}"]`)?.value || '';
          const existingCollectionId = collectionDiv.querySelector(`[name="collection_id_${collectionId}"]`)?.value;
          
          if (collectionDate && collectionAmount > 0) {
            paymentCollections.push({
              id: existingCollectionId || null,
              course_id: parseInt(courseId),
              collection_date: collectionDate,
              amount: collectionAmount,
              payment_method: collectionMethod,
              notes: collectionNotes
            });
          }
        });
      }
    });
    
    // Allow saving without medicines (they are optional)
    
    // Get follow-up date (auto-calculated from active medicines)
    const followUpDate = document.getElementById('prescription-followup').value;
    
    // Get global currency
    const currency = document.getElementById('prescription-currency').value || 'INR';
    
    const data = {
      patient_id: patientId,
      follow_up_date: followUpDate || null,
      diagnosis: document.getElementById('prescription-problem').value || 'Not specified',
      notes: '',
      course: parseInt(document.getElementById('prescription-course').value) || null,
      currency: currency,
      medicines: medicines,
      payment_collections: paymentCollections
    };
    
    // Check if this is an update (edit mode) or create (new record)
    const prescriptionId = document.getElementById('prescription-id').value;
    let result;
    
    if (prescriptionId) {
      // UPDATE existing record
      result = await axios.put(`${API_BASE}/prescriptions/${prescriptionId}`, data);
    } else {
      // CREATE new record
      result = await axios.post(`${API_BASE}/prescriptions`, data);
    }
    
    // Auto-create reminder for follow-up date (only if we have active medicines)
    if (followUpDate) {
      try {
        const activeMedicines = medicines.filter(m => m.is_active);
        const reminderData = {
          patient_id: patientId,
          reminder_date: followUpDate,
          reminder_type: 'Follow-up',
          notes: `Follow-up for Herbs & Routes treatment (${activeMedicines.length} active medicine${activeMedicines.length > 1 ? 's' : ''})`
        };
        await axios.post(`${API_BASE}/reminders`, reminderData);
        console.log('Reminder created automatically for follow-up date');
      } catch (reminderError) {
        console.error('Error creating reminder:', reminderError);
        // Don't fail the whole operation if reminder creation fails
      }
    }
    
    alert(`Herbs & Routes record created successfully!${followUpDate ? `\nFollow-up date: ${formatDate(followUpDate)}\nReminder has been set automatically.` : ''}`);
    
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

async function editHerbsRoutes(id) {
  console.log('editHerbsRoutes called with id:', id);
  try {
    showLoading();
    const res = await axios.get(`${API_BASE}/prescriptions/${id}`);
    const hr = res.data.data;
    
    console.log('Edit data:', hr); // Debug
    
    // Load patients list first
    await loadPatientsForHerbsRoutes();
    
    // Populate the modal with existing data
    document.getElementById('prescription-modal-title').textContent = 'Edit Herbs & Routes Record';
    document.getElementById('prescription-id').value = id;
    document.getElementById('prescription-currency').value = hr.currency || 'INR';
    document.getElementById('prescription-course').value = hr.course || 1;
    document.getElementById('prescription-followup').value = hr.follow_up_date || '';
    document.getElementById('prescription-problem').value = hr.diagnosis || '';
    
    // Set patient - hr.patient_db_id is the FK (database ID)
    const patientSelect = document.getElementById('prescription-patient');
    patientSelect.value = hr.patient_db_id || hr.patient_fk;
    
    // Manually trigger change event to display patient info
    const event = new Event('change');
    patientSelect.dispatchEvent(event);
    
    // Wait a bit for patient info to load
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Clear existing medicines list
    document.getElementById('medicines-list').innerHTML = '';
    medicineCounter = 0;
    courseToMedicineMap = {};
    
    // Add medicines from database
    if (hr.medicines && hr.medicines.length > 0) {
      // Group medicines by course - use same logic as VIEW (given_date, treatment_months, payment details)
      const courseGroups = {};
      hr.medicines.forEach(med => {
        // Create unique key for each course based on its characteristics
        const courseKey = `${med.given_date}_${med.treatment_months}_${med.payment_amount}_${med.advance_payment}`;
        if (!courseGroups[courseKey]) {
          courseGroups[courseKey] = [];
        }
        courseGroups[courseKey].push(med);
      });
      
      // Create a course for each group
      Object.keys(courseGroups).forEach(courseKey => {
        const meds = courseGroups[courseKey];
        const firstMed = meds[0];
        
        // Add course row
        medicineCounter++;
        const courseId = medicineCounter;
        
        // Create course HTML
        const courseHtml = `
          <div class="medicine-row border rounded-lg p-4 mb-4 bg-gradient-to-r from-white to-blue-50" data-row="${courseId}">
            <div class="flex justify-between items-center mb-3">
              <div class="flex items-center space-x-4">
                <h4 class="font-semibold text-lg text-ayurveda-700">Course ${courseId}</h4>
                <label class="flex items-center cursor-pointer">
                  <input type="checkbox" name="is_active_${courseId}" class="mr-2 w-5 h-5 medicine-active-checkbox" ${firstMed.is_active ? 'checked' : ''} onchange="updatePaymentSummary(); calculateSmartFollowUp();">
                  <span class="font-medium text-sm text-green-600">Active</span>
                </label>
              </div>
              <button type="button" onclick="removeMedicineRow(${courseId})" class="text-red-600 hover:text-red-800">
                <i class="fas fa-times"></i>
              </button>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-300">
              <div>
                <label class="block text-sm font-medium mb-1">Given Date *</label>
                <input type="date" name="given_date_${courseId}" class="w-full border rounded px-3 py-2 medicine-given-date" required value="${firstMed.given_date || ''}" onchange="calculateSmartFollowUp()">
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Treatment Months *</label>
                <select name="treatment_months_${courseId}" class="w-full border rounded px-3 py-2 medicine-treatment-months" required onchange="calculateSmartFollowUp()">
                  ${[1,2,3,4,5,6,7,8,9,10,11,12].map(m => `<option value="${m}" ${firstMed.treatment_months == m ? 'selected' : ''}>${m} Month${m > 1 ? 's' : ''}</option>`).join('')}
                </select>
              </div>
            </div>
            
            <div class="mb-4">
              <button type="button" onclick="addMedicineToRow(${courseId})" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">
                <i class="fas fa-plus mr-2"></i>Add Medicine
              </button>
            </div>
            
            <div id="medicines-container-${courseId}" class="space-y-3 mb-4"></div>
            
            <div class="border-t border-gray-300 pt-4">
              <h5 class="font-medium text-sm text-blue-700 mb-3"><i class="fas fa-money-bill-wave mr-2"></i>Payment Details for this Course</h5>
              <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                <div>
                  <label class="block text-xs font-medium mb-1 course-amount-label">Amount</label>
                  <input type="number" step="0.01" name="payment_amount_${courseId}" class="w-full border rounded px-3 py-2 text-sm medicine-payment-amount" placeholder="0.00" value="${firstMed.payment_amount || ''}" oninput="updatePaymentSummary()">
                </div>
                <div>
                  <label class="block text-xs font-medium mb-1 course-advance-label">Advance</label>
                  <input type="number" step="0.01" name="advance_payment_${courseId}" class="w-full border rounded px-3 py-2 text-sm medicine-advance-payment" placeholder="0.00" value="${firstMed.advance_payment || ''}" oninput="updatePaymentSummary()">
                </div>
                <div>
                  <label class="block text-xs font-medium mb-1 course-balance-label">Balance</label>
                  <div class="border rounded px-3 py-2 bg-gray-100 text-sm font-bold text-red-600 course-balance-display" data-row="${courseId}">₹0.00</div>
                </div>
                <div>
                  <label class="block text-xs font-medium mb-1">Payment Notes</label>
                  <input type="text" name="payment_notes_${courseId}" class="w-full border rounded px-3 py-2 text-sm" placeholder="Optional" value="${firstMed.payment_notes || ''}">
                </div>
              </div>
              
              <!-- Payment Collections Section -->
              <div class="mt-4 pt-3 border-t border-gray-200">
                <div class="flex justify-between items-center mb-2">
                  <h6 class="font-medium text-xs text-green-700"><i class="fas fa-receipt mr-1"></i>Payment Collections</h6>
                  <button type="button" onclick="addPaymentCollection(${courseId})" class="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs">
                    <i class="fas fa-plus mr-1"></i>Collect Payment
                  </button>
                </div>
                <div id="payment-collections-${courseId}" class="space-y-2">
                  <!-- Payment collections will be loaded here -->
                </div>
              </div>
            </div>
          </div>
        `;
        
        document.getElementById('medicines-list').insertAdjacentHTML('beforeend', courseHtml);
        courseToMedicineMap[courseId] = 0;
        
        // Add medicines to this course
        meds.forEach(med => {
          courseToMedicineMap[courseId]++;
          const medId = courseToMedicineMap[courseId];
          
          const medHtml = `
            <div class="medicine-item border border-blue-200 rounded-lg p-3 bg-blue-50" data-course="${courseId}" data-medicine="${medId}">
              <div class="flex justify-between items-center mb-3">
                <h5 class="font-medium text-sm text-blue-800">Medicine ${medId}</h5>
                <button type="button" onclick="removeMedicineFromRow(${courseId}, ${medId})" class="text-red-600 hover:text-red-800 text-sm">
                  <i class="fas fa-times"></i>
                </button>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div>
                  <label class="block text-xs font-medium mb-1">Roman ID</label>
                  <select name="roman_id_${courseId}_${medId}" class="w-full border rounded px-2 py-2 text-sm">
                    <option value="">Select Roman ID</option>
                    ${['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'].map(r => `<option value="${r}" ${med.roman_id == r ? 'selected' : ''}>${r}</option>`).join('')}
                  </select>
                </div>
                
                <div>
                  <label class="block text-xs font-medium mb-1">Medicine Name *</label>
                  <input type="text" name="medicine_name_${courseId}_${medId}" class="w-full border rounded px-2 py-2 text-sm" required value="${med.medicine_name || ''}">
                </div>
              </div>
              
              <div>
                <label class="block text-xs font-medium mb-2">Dosage Schedule</label>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  <label class="flex items-center">
                    <input type="checkbox" name="morning_before_${courseId}_${medId}" class="mr-1" ${med.morning_before ? 'checked' : ''}>
                    Morning (Before)
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" name="morning_after_${courseId}_${medId}" class="mr-1" ${med.morning_after ? 'checked' : ''}>
                    Morning (After)
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" name="afternoon_before_${courseId}_${medId}" class="mr-1" ${med.afternoon_before ? 'checked' : ''}>
                    Afternoon (Before)
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" name="afternoon_after_${courseId}_${medId}" class="mr-1" ${med.afternoon_after ? 'checked' : ''}>
                    Afternoon (After)
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" name="evening_before_${courseId}_${medId}" class="mr-1" ${med.evening_before ? 'checked' : ''}>
                    Evening (Before)
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" name="evening_after_${courseId}_${medId}" class="mr-1" ${med.evening_after ? 'checked' : ''}>
                    Evening (After)
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" name="night_before_${courseId}_${medId}" class="mr-1" ${med.night_before ? 'checked' : ''}>
                    Night (Before)
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" name="night_after_${courseId}_${medId}" class="mr-1" ${med.night_after ? 'checked' : ''}>
                    Night (After)
                  </label>
                </div>
              </div>
            </div>
          `;
          
          document.getElementById(`medicines-container-${courseId}`).insertAdjacentHTML('beforeend', medHtml);
        });
      });
      
      // Load payment collections for each course
      if (hr.payment_collections && hr.payment_collections.length > 0) {
        // Group collections by course_id from the collection data
        const collectionsByCourse = {};
        hr.payment_collections.forEach(collection => {
          const key = collection.course_id;
          if (!collectionsByCourse[key]) {
            collectionsByCourse[key] = [];
          }
          collectionsByCourse[key].push(collection);
        });
        
        // Now match with actual course rows in DOM
        document.querySelectorAll('.medicine-row').forEach(courseRow => {
          const courseId = courseRow.dataset.row;
          const collections = collectionsByCourse[courseId];
          
          if (collections && collections.length > 0) {
            collections.forEach(collection => {
              addPaymentCollection(courseId, collection);
            });
          }
        });
      }
    } else {
      // No medicines, add one empty course
      addMedicineRow();
    }
    
    // Update currency displays and payment summary
    updateAllCurrencyDisplays();
    updatePaymentSummary();
    calculateSmartFollowUp();
    
    // Show modal
    document.getElementById('prescription-modal').classList.remove('hidden');
  } catch (error) {
    console.error('Edit error:', error);
    alert('Error loading record for editing: ' + (error.message || error));
  } finally {
    hideLoading();
  }
}

async function viewHerbsRoutes(id) {
  console.log('viewHerbsRoutes called with id:', id);
  try {
    showLoading();
    const res = await axios.get(`${API_BASE}/prescriptions/${id}`);
    const hr = res.data.data;
    
    // Populate summary modal - check if elements exist before setting
    const setTextIfExists = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text || 'N/A';
    };
    
    setTextIfExists('summary-patient-name', hr.patient_name);
    setTextIfExists('summary-patient-id', hr.patient_identifier || hr.patient_id);
    
    // Age/Gender combined
    const ageGenderEl = document.getElementById('summary-patient-age-gender');
    if (ageGenderEl) {
      ageGenderEl.textContent = `${hr.age || 'N/A'} / ${hr.gender || 'N/A'}`;
    }
    
    setTextIfExists('summary-patient-phone', hr.patient_phone);
    setTextIfExists('summary-patient-country', hr.country);
    
    // Weight/Height combined
    const weightHeightEl = document.getElementById('summary-patient-weight-height');
    if (weightHeightEl) {
      weightHeightEl.textContent = `${hr.weight || 'N/A'} kg / ${hr.height || 'N/A'} cm`;
    }
    
    // Build address from components
    const addressParts = [
      hr.address_hno,
      hr.address_street,
      hr.address_apartment,
      hr.address_area,
      hr.address_district,
      hr.address_state,
      hr.address_pincode
    ].filter(p => p); // Remove null/undefined/empty
    const fullAddress = addressParts.length > 0 ? addressParts.join(', ') : 'N/A';
    setTextIfExists('summary-patient-address', fullAddress);
    
    // Display health issues from diseases JSON array
    let healthIssueText = 'N/A';
    if (hr.diseases && Array.isArray(hr.diseases) && hr.diseases.length > 0) {
      healthIssueText = hr.diseases.map(d => {
        const parts = [];
        if (d.present_health_issue) parts.push(d.present_health_issue);
        if (d.present_medicine) parts.push(`(${d.present_medicine})`);
        if (d.mg_value) parts.push(`${d.mg_value}mg`);
        if (d.attacked_by) parts.push(`- ${d.attacked_by}`);
        return parts.join(' ');
      }).join('; ');
    } else if (hr.present_health_issue) {
      healthIssueText = hr.present_health_issue;
    }
    setTextIfExists('summary-patient-health-issue', healthIssueText);
    
    // Treatment details
    setTextIfExists('summary-given-date', formatDate(hr.created_at));
    setTextIfExists('summary-treatment-months', 'See individual medicines');
    setTextIfExists('summary-followup-date', formatDate(hr.next_followup_date));
    setTextIfExists('summary-course', hr.course);
    setTextIfExists('summary-diagnosis', hr.diagnosis);
    
    // Show medicines grouped by course with payment details
    const medicinesListEl = document.getElementById('summary-medicines-list');
    if (medicinesListEl && hr.medicines && hr.medicines.length > 0) {
      // Group medicines by course - use combination of given_date, treatment_months, and payment_amount to identify unique courses
      const courseGroups = {};
      hr.medicines.forEach(med => {
        // Create unique key for each course based on its characteristics
        const courseKey = `${med.given_date}_${med.treatment_months}_${med.payment_amount}_${med.advance_payment}`;
        if (!courseGroups[courseKey]) {
          courseGroups[courseKey] = [];
        }
        courseGroups[courseKey].push(med);
      });
      
      let courseDisplayNum = 0;
      const coursesHtml = Object.keys(courseGroups).map(courseKey => {
        courseDisplayNum++;
        const meds = courseGroups[courseKey];
        const firstMed = meds[0];
        const actualCourseId = firstMed.course_number || courseDisplayNum;
        
        // Calculate course totals
        const courseAmount = parseFloat(firstMed.payment_amount || 0);
        const courseAdvance = parseFloat(firstMed.advance_payment || 0);
        const courseBalance = courseAmount - courseAdvance;
        const symbol = hr.currency === 'USD' ? '$' : '₹';
        
        const medicinesHtml = meds.map((med, index) => {
          // Build dosage schedule badges
          const dosages = [];
          if (med.morning_before) dosages.push('<span class="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Morning (Before)</span>');
          if (med.morning_after) dosages.push('<span class="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Morning (After)</span>');
          if (med.afternoon_before) dosages.push('<span class="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Afternoon (Before)</span>');
          if (med.afternoon_after) dosages.push('<span class="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Afternoon (After)</span>');
          if (med.evening_before) dosages.push('<span class="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">Evening (Before)</span>');
          if (med.evening_after) dosages.push('<span class="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">Evening (After)</span>');
          if (med.night_before) dosages.push('<span class="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">Night (Before)</span>');
          if (med.night_after) dosages.push('<span class="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">Night (After)</span>');
          
          return `
            <div class="p-3 border border-blue-200 rounded-lg bg-blue-50 mb-2">
              <div class="flex justify-between items-start mb-2">
                <h6 class="font-semibold text-blue-700 text-sm">
                  ${med.roman_id ? `<span class="mr-2">${med.roman_id}.</span>` : ''}
                  ${med.medicine_name}
                </h6>
                <span class="px-2 py-1 rounded text-xs ${med.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'}">
                  ${med.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div class="flex flex-wrap gap-1 mb-2">
                ${dosages.join('') || '<span class="text-gray-500 text-xs">No dosage schedule specified</span>'}
              </div>
            </div>
          `;
        }).join('');
        
        return `
          <div class="mb-4 p-4 border-2 border-ayurveda-300 rounded-lg bg-gradient-to-r from-white to-green-50">
            <div class="flex justify-between items-center mb-3 pb-2 border-b border-ayurveda-300">
              <h5 class="font-bold text-lg text-ayurveda-700">
                <i class="fas fa-leaf mr-2"></i>Course ${courseDisplayNum}
              </h5>
              <div class="text-sm text-gray-600">
                <strong>Duration:</strong> ${firstMed.treatment_months || 0} months | 
                <strong>Given Date:</strong> ${formatDate(firstMed.given_date)}
              </div>
            </div>
            
            ${medicinesHtml}
            
            <div class="mt-3 pt-3 border-t border-gray-300 bg-white rounded p-3">
              <h6 class="font-semibold text-sm text-green-700 mb-2">
                <i class="fas fa-money-bill-wave mr-1"></i>Payment Details - Course ${courseDisplayNum}
              </h6>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <div><span class="font-medium">Amount:</span> <span class="font-bold text-blue-600">${symbol}${courseAmount.toFixed(2)}</span></div>
                <div><span class="font-medium">Advance:</span> <span class="font-bold text-green-600">${symbol}${courseAdvance.toFixed(2)}</span></div>
                <div><span class="font-medium">Balance:</span> <span class="font-bold ${courseBalance > 0 ? 'text-red-600' : 'text-green-600'}">${symbol}${courseBalance.toFixed(2)}</span></div>
                <div class="col-span-2 md:col-span-1"><span class="font-medium">Status:</span> <span class="${courseBalance > 0 ? 'text-red-600' : 'text-green-600'}">${courseBalance > 0 ? 'Due' : 'Paid'}</span></div>
              </div>
              ${firstMed.payment_notes ? `<div class="mt-2 text-xs text-gray-600"><strong>Notes:</strong> ${firstMed.payment_notes}</div>` : ''}
              
              <!-- Payment Collections for this Course -->
              ${(() => {
                if (hr.payment_collections && hr.payment_collections.length > 0) {
                  const courseCollections = hr.payment_collections.filter(c => parseInt(c.course_id) === parseInt(actualCourseId));
                  if (courseCollections.length > 0) {
                    const collectionsHtml = courseCollections.map(collection => `
                      <div class="flex items-center gap-2 text-xs p-2 bg-green-50 border border-green-200 rounded">
                        <i class="fas fa-check-circle text-green-600"></i>
                        <span class="font-medium">${formatDate(collection.collection_date)}</span>
                        <span class="font-bold text-green-700">${symbol}${parseFloat(collection.amount).toFixed(2)}</span>
                        <span class="text-gray-600">(${collection.payment_method})</span>
                        ${collection.notes ? `<span class="text-gray-500">- ${collection.notes}</span>` : ''}
                      </div>
                    `).join('');
                    
                    const totalCollected = courseCollections.reduce((sum, c) => sum + parseFloat(c.amount || 0), 0);
                    
                    return `
                      <div class="mt-3 pt-2 border-t border-green-200">
                        <h6 class="font-semibold text-xs text-green-700 mb-2">
                          <i class="fas fa-receipt mr-1"></i>Payment Collections (Total Collected: ${symbol}${totalCollected.toFixed(2)})
                        </h6>
                        <div class="space-y-1">
                          ${collectionsHtml}
                        </div>
                      </div>
                    `;
                  }
                }
                return '';
              })()}
            </div>
          </div>
        `;
      }).join('');
      
      medicinesListEl.innerHTML = coursesHtml;
    } else if (medicinesListEl) {
      medicinesListEl.innerHTML = '<p class="text-gray-500 text-center py-4">No medicines prescribed</p>';
    }
    
    // Calculate and show payment summary
    const currency = hr.currency || 'INR';
    const symbol = currency === 'USD' ? '$' : '₹';
    let totalAmount = 0;
    let totalAdvance = 0;
    let totalCollected = 0;
    
    if (hr.medicines && hr.medicines.length > 0) {
      hr.medicines.forEach(med => {
        totalAmount += parseFloat(med.payment_amount || 0);
        totalAdvance += parseFloat(med.advance_payment || 0);
      });
    }
    
    // Add collected amounts from payment collections
    if (hr.payment_collections && hr.payment_collections.length > 0) {
      hr.payment_collections.forEach(collection => {
        totalCollected += parseFloat(collection.amount || 0);
      });
    }
    
    const totalBalance = totalAmount - totalAdvance - totalCollected;
    
    setTextIfExists('summary-total-amount', `${symbol}${totalAmount.toFixed(2)}`);
    setTextIfExists('summary-advance-paid', `${symbol}${totalAdvance.toFixed(2)}`);
    setTextIfExists('summary-balance-due', `${symbol}${totalBalance.toFixed(2)}`);
    
    // Show collected amount
    const collectionsInfoEl = document.getElementById('summary-collections-info');
    if (collectionsInfoEl) {
      collectionsInfoEl.innerHTML = totalCollected > 0 
        ? `<div class="text-green-600 font-bold">Total Collected: ${symbol}${totalCollected.toFixed(2)}</div>` 
        : '';
    }
    
    setTextIfExists('summary-payment-notes', 'N/A');
    setTextIfExists('summary-followup-reminder', formatDate(hr.next_followup_date) || 'Not set');
    
    // Show the modal
    document.getElementById('prescription-summary-modal').classList.remove('hidden');
  } catch (error) {
    console.error('View error:', error);
    alert('Error loading record details: ' + (error.response?.data?.error || error.message));
  } finally {
    hideLoading();
  }
}

function closeSummaryModal() {
  document.getElementById('prescription-summary-modal').classList.add('hidden');
}

function printSummary() {
  window.print();
}

async function printHerbsRoutes(id) {
  console.log('printHerbsRoutes called with id:', id);
  try {
    // Load the data and show in summary modal, then print
    await viewHerbsRoutes(id);
    setTimeout(() => {
      window.print();
    }, 500);
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
    
    // Load admin profile
    if (currentUser) {
      document.getElementById('profile-name').value = currentUser.name || '';
      document.getElementById('profile-email').value = currentUser.email || '';
      document.getElementById('profile-picture').value = currentUser.profile_picture || '';
      
      // Update profile picture preview
      const previewDiv = document.getElementById('profile-picture-preview');
      if (currentUser.profile_picture) {
        previewDiv.innerHTML = `<img src="${currentUser.profile_picture}" alt="Profile" class="w-full h-full object-cover">`;
      } else {
        previewDiv.innerHTML = '<i class="fas fa-user text-4xl text-gray-400"></i>';
      }
    }
    
    // Load clinic settings
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

async function updateProfile() {
  try {
    showLoading();
    
    const name = document.getElementById('profile-name')?.value.trim();
    const profile_picture = document.getElementById('profile-picture')?.value.trim();
    
    if (!name) {
      alert('Name is required');
      hideLoading();
      return;
    }
    
    const res = await axios.put(`${API_BASE}/admin/profile`, {
      name,
      profile_picture
    });
    
    if (res.data.success) {
      // Update currentUser
      currentUser.name = name;
      if (profile_picture) {
        currentUser.profile_picture = profile_picture;
      }
      updateUserUI();
      alert('Profile updated successfully!');
    } else {
      alert('Error: ' + (res.data.error || 'Failed to update profile'));
    }
  } catch (error) {
    console.error('Update profile error:', error);
    alert('Error updating profile: ' + (error.response?.data?.error || error.message));
  } finally {
    hideLoading();
  }
}

async function changePassword() {
  try {
    showLoading();
    
    const currentPassword = document.getElementById('current-password')?.value;
    const newPassword = document.getElementById('new-password')?.value;
    const confirmPassword = document.getElementById('confirm-password')?.value;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert('All password fields are required');
      hideLoading();
      return;
    }
    
    if (newPassword.length < 6) {
      alert('New password must be at least 6 characters');
      hideLoading();
      return;
    }
    
    if (newPassword !== confirmPassword) {
      alert('New password and confirm password do not match');
      hideLoading();
      return;
    }
    
    const res = await axios.put(`${API_BASE}/admin/change-password`, {
      currentPassword,
      newPassword
    });
    
    if (res.data.success) {
      // Clear password fields
      document.getElementById('current-password').value = '';
      document.getElementById('new-password').value = '';
      document.getElementById('confirm-password').value = '';
      alert('Password changed successfully!');
    } else {
      alert('Error: ' + (res.data.error || 'Failed to change password'));
    }
  } catch (error) {
    console.error('Change password error:', error);
    alert('Error changing password: ' + (error.response?.data?.error || error.message));
  } finally {
    hideLoading();
  }
}

function handleProfilePictureUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  // Validate file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  if (!validTypes.includes(file.type)) {
    alert('Please upload a valid image file (JPG, PNG, or GIF)');
    event.target.value = '';
    return;
  }
  
  // Validate file size (2MB max)
  const maxSize = 2 * 1024 * 1024; // 2MB in bytes
  if (file.size > maxSize) {
    alert('File size must be less than 2MB');
    event.target.value = '';
    return;
  }
  
  // Read file and convert to base64
  const reader = new FileReader();
  reader.onload = function(e) {
    const base64Image = e.target.result;
    
    // Update hidden input
    document.getElementById('profile-picture').value = base64Image;
    
    // Update preview
    const previewDiv = document.getElementById('profile-picture-preview');
    previewDiv.innerHTML = `<img src="${base64Image}" alt="Profile Preview" class="w-full h-full object-cover">`;
  };
  
  reader.onerror = function() {
    alert('Error reading file. Please try again.');
    event.target.value = '';
  };
  
  reader.readAsDataURL(file);
}

function removeProfilePicture() {
  // Clear the hidden input
  document.getElementById('profile-picture').value = '';
  
  // Clear the file input
  document.getElementById('profile-picture-upload').value = '';
  
  // Reset preview to default icon
  const previewDiv = document.getElementById('profile-picture-preview');
  previewDiv.innerHTML = '<i class="fas fa-user text-4xl text-gray-400"></i>';
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
  // Check authentication first
  const isAuthenticated = await checkAuth();
  if (isAuthenticated) {
    loadDashboard();
  }
});
