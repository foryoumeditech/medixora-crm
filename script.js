// Local Storage Key
const STORAGE_KEY = 'medixora_crm_leads';

// Initial dummy data if empty
let leads = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [
    { id: 1, name: "Dr. A. K. Verma", mobile: "9811223344", status: "Interested", interest: 5, remarks: "Looking for PicoSpectra P Q-Switch Laser" },
    { id: 2, name: "Aura Skin Clinic", mobile: "9722334455", status: "Demo Planned", interest: 4, remarks: "Sonolift Pro 10D HIFU demo scheduled" }
];

// DOM Elements
const loginSection = document.getElementById('login-section');
const dashboardSection = document.getElementById('dashboard-section');
const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout-btn');
const leadTableBody = document.getElementById('lead-table-body');
const leadModal = document.getElementById('lead-modal');
const addLeadBtn = document.getElementById('add-lead-btn');
const closeModalBtn = document.getElementById('close-modal-btn');
const leadForm = document.getElementById('lead-form');
const searchInput = document.getElementById('search-input');
const filterStatus = document.getElementById('filter-status');
const exportExcelBtn = document.getElementById('export-excel-btn');

// Stats Elements
const totalLeadsEl = document.getElementById('total-leads');
const interestedLeadsEl = document.getElementById('interested-leads');
const demosDoneEl = document.getElementById('demos-done');
const closedDealsEl = document.getElementById('closed-deals');

// Handle Login (Demo Credentials: admin / 1234)
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value.trim();

    if (user === 'admin' && pass === '1234') {
        loginSection.classList.add('hidden');
        dashboardSection.classList.remove('hidden');
        renderLeads();
    } else {
        alert('गलत यूजरनेम या पासवर्ड! (Username: admin, Password: 1234)');
    }
});

// Logout
logoutBtn.addEventListener('click', () => {
    dashboardSection.classList.add('hidden');
    loginSection.classList.remove('hidden');
    loginForm.reset();
});

// Open Modal for Add
addLeadBtn.addEventListener('click', () => {
    document.getElementById('modal-title').innerText = 'Add New Lead';
    leadForm.reset();
    document.getElementById('lead-id').value = '';
    leadModal.classList.remove('hidden');
});

// Close Modal
closeModalBtn.addEventListener('click', () => {
    leadModal.classList.add('hidden');
});

// Save Lead (Add or Update)
leadForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('lead-id').value;
    const name = document.getElementById('client-name').value;
    const mobile = document.getElementById('client-mobile').value;
    const status = document.getElementById('lead-status').value;
    const interest = parseInt(document.getElementById('interest-rating').value);
    const remarks = document.getElementById('remarks').value;

    if (id) {
        // Update existing
        leads = leads.map(lead => lead.id == id ? { id: Number(id), name, mobile, status, interest, remarks } : lead);
    } else {
        // Add new
        const newLead = {
            id: Date.now(),
            name,
            mobile,
            status,
            interest,
            remarks
        };
        leads.push(newLead);
    }

    saveAndRefresh();
    leadModal.classList.add('hidden');
});

// Save to LocalStorage and Update UI
function saveAndRefresh() {
 localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
 fetch('https://script.google.com/macros/s/AKfycbwLKILfCaVVJHcR_YGpJsOYAkjndq38pBO_Es8kzf89bf8bSG8EvXGZ2kM5x--OYqrw/exec', {
 method: 'POST',
 mode: 'no-cors',
 headers: {
 'Content-Type': 'application/json'
 },
 body: JSON.stringify(leads)
 });
 renderLeads();
}

// Get Badge Class based on Status
function getStatusBadge(status) {
    switch (status) {
        case 'Demo Planned': return 'badge-demo-planned';
        case 'Demo Done': return 'badge-demo-done';
        case 'Interested': return 'badge-interested';
        case 'Not Interested': return 'badge-not-interested';
        case 'Closed': return 'badge-closed';
        default: return '';
    }
}

// Render Leads Table & Update Stats
function renderLeads() {
    const searchText = searchInput.value.toLowerCase();
    const statusFilter = filterStatus.value;

    // Filter leads
    const filteredLeads = leads.filter(lead => {
        const matchesSearch = lead.name.toLowerCase().includes(searchText) || lead.mobile.includes(searchText);
        const matchesStatus = statusFilter === "" || lead.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Update Stats Counters
    totalLeadsEl.innerText = leads.length;
    interestedLeadsEl.innerText = leads.filter(l => l.status === 'Interested').length;
    demosDoneEl.innerText = leads.filter(l => l.status === 'Demo Done').length;
    closedDealsEl.innerText = leads.filter(l => l.status === 'Closed').length;

    // Render Table Rows
    leadTableBody.innerHTML = '';
    if (filteredLeads.length === 0) {
        leadTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">कोई डेटा नहीं मिला</td></tr>`;
        return;
    }

    filteredLeads.forEach(lead => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${lead.name}</strong></td>
            <td>${lead.mobile}</td>
            <td><span class="badge ${getStatusBadge(lead.status)}">${lead.status}</span></td>
            <td>⭐ ${lead.interest}/5</td>
            <td>${lead.remarks || '-'}</td>
            <td>
                <button onclick="editLead(${lead.id})" style="background:var(--accent-blue); color:#000; padding:5px 10px; margin-right:5px;">Edit</button>
                <button onclick="deleteLead(${lead.id})" style="background:var(--danger-red); color:white; padding:5px 10px;">Delete</button>
            </td>
        `;
        leadTableBody.appendChild(tr);
    });
}

// Edit Lead
window.editLead = function(id) {
    const lead = leads.find(l => l.id === id);
    if (!lead) return;

    document.getElementById('modal-title').innerText = 'Edit Lead';
    document.getElementById('lead-id').value = lead.id;
    document.getElementById('client-name').value = lead.name;
    document.getElementById('client-mobile').value = lead.mobile;
    document.getElementById('lead-status').value = lead.status;
    document.getElementById('interest-rating').value = lead.interest;
    document.getElementById('remarks').value = lead.remarks;

    leadModal.classList.remove('hidden');
}

// Delete Lead
window.deleteLead = function(id) {
    if (confirm('क्या आप वाकई इस लीड को डिलीट करना चाहते हैं?')) {
        leads = leads.filter(l => l.id !== id);
        saveAndRefresh();
    }
}

// Search and Filter Event Listeners
searchInput.addEventListener('input', renderLeads);
filterStatus.addEventListener('change', renderLeads);

// Advanced Export to Excel (CSV)
exportExcelBtn.addEventListener('click', function() {
    if (leads.length === 0) {
        alert("Export करने के लिए कोई डेटा उपलब्ध नहीं है!");
        return;
    }

    let csvContent = [];
    let headers = ["Client Name", "Mobile Number", "Status", "Interest Level", "Remarks"];
    csvContent.push(headers.join(","));

    leads.forEach(lead => {
        let name = `"${lead.name}"`;
        let mobile = `"${lead.mobile}"`;
        let status = `"${lead.status}"`;
        let interest = `"${lead.interest}/5"`;
        let remarks = `"${(lead.remarks || '').replace(/"/g, '""')}"`;

        csvContent.push([name, mobile, status, interest, remarks].join(","));
    });

    let csvString = csvContent.join("\n");
    let blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    let url = URL.createObjectURL(blob);
    
    let a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'Medixora_CRM_Leads_Report.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
});
