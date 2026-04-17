const ADMIN_API = CONFIG.API_BASE;

let adminHubs = [];
let adminBookings = [];

function switchTab(tabName) {
    document.querySelectorAll('.admin-section').forEach(s => {
        s.classList.remove('block');
        s.classList.add('hidden');
    });
    document.getElementById(`section-${tabName}`).classList.remove('hidden');
    document.getElementById(`section-${tabName}`).classList.add('block');

    document.querySelectorAll('.nav-link').forEach(n => {
        n.classList.remove('bg-blue-600', 'text-white');
        n.classList.add('text-slate-400');
    });
    
    const active = document.getElementById(`nav-${tabName}`);
    active.classList.add('bg-blue-600', 'text-white');
    active.classList.remove('text-slate-400');

    const titles = {
        'dashboard': { t: 'System Overview', d: 'Manage global parking infrastructure and user activity.' },
        'hubs': { t: 'Manage Hubs', d: 'Create, update, and monitor global parking locations.' },
        'bookings': { t: 'Customer Bookings', d: 'Review, accept, or decline reservations instantly.' }
    };
    
    document.getElementById('section-title').innerText = titles[tabName].t;
    document.getElementById('section-desc').innerText = titles[tabName].d;

    if (tabName === 'hubs') renderHubs();
    if (tabName === 'bookings') renderBookings();
    if (tabName === 'dashboard') loadStats();
}

function loadStats() {
    const hubCount = document.getElementById('stats-hubs');
    if (hubCount) hubCount.innerText = adminHubs.length || '0';
    
    const bkCount = document.getElementById('stats-bookings');
    if (bkCount) bkCount.innerText = adminBookings.length || '0';
    
    let rev = 0;
    adminBookings.forEach(b => {
        if (b.paymentStatus === 'Confirmed' || b.paymentStatus === 'Paid') {
            rev += (b.totalAmount || 0);
        }
    });
    const revCount = document.getElementById('stats-revenue');
    if (revCount) revCount.innerText = `$${rev.toFixed(2)}`;
}

async function fetchHubs() {
    try {
        const res = await fetch(`${ADMIN_API}/parking`);
        adminHubs = await res.json();
        renderHubs();
        loadStats();
    } catch (e) {
        console.error(e);
    }
}

function renderHubs() {
    const tbody = document.getElementById('hubs-table-body');
    if (!tbody) return;
    tbody.innerHTML = adminHubs.map(h => `
        <tr class="hover:bg-slate-50 transition-colors">
            <td class="p-5">${h.name}</td>
            <td class="p-5">${h.location}</td>
            <td class="p-5">${h.availableSlots || h.totalSlots}/${h.totalSlots}</td>
            <td class="p-5">$${(h.pricePerHour || 0).toFixed(2)}</td>
            <td class="p-5 text-right">
                <button onclick="deleteHub('${h._id}')" class="text-red-500 hover:text-red-700 font-black cursor-pointer"><i class="fas fa-trash-alt"></i></button>
            </td>
        </tr>
    `).join('');
}

async function fetchBookings() {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${ADMIN_API}/booking/admin/all`, { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();
        adminBookings = data.bookings || [];
        renderBookings();
        loadStats();
    } catch (e) {
        console.error(e);
    }
}

function renderBookings() {
    const tbody = document.getElementById('bookings-table-body');
    if (!tbody) return;
    tbody.innerHTML = adminBookings.map(b => {
        let statusBadge = '';
        if (b.paymentStatus === 'Confirmed') statusBadge = '<span class="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-black">Confirmed</span>';
        else if (b.paymentStatus === 'Rejected') statusBadge = '<span class="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-black">Rejected</span>';
        else statusBadge = `<span class="px-3 py-1 bg-orange-100 text-orange-700 rounded-lg text-xs font-black uppercase tracking-wider">${b.paymentStatus}</span>`;

        return `
            <tr class="hover:bg-slate-50 transition-colors">
                <td class="p-5">${b.userId ? b.userId.name : 'Unknown User'}<br><span class="text-xs text-slate-400 font-semibold">${b.userId ? b.userId.email : ''}</span></td>
                <td class="p-5">${b.parkingHubName}<br><span class="text-xs text-slate-400 font-semibold">Slot: ${b.slot}</span></td>
                <td class="p-5">$${(b.totalAmount || 0).toFixed(2)}</td>
                <td class="p-5">${statusBadge}</td>
                <td class="p-5 text-right">
                    ${!['Confirmed','Rejected'].includes(b.paymentStatus) ? `
                    <button onclick="updateBooking('${b._id}', 'accept')" class="text-emerald-500 hover:text-emerald-700 font-black mr-3 cursor-pointer"><i class="fas fa-check-circle text-lg"></i></button>
                    <button onclick="updateBooking('${b._id}', 'decline')" class="text-red-500 hover:text-red-700 font-black cursor-pointer"><i class="fas fa-times-circle text-lg"></i></button>
                    ` : '<span class="text-[10px] font-black text-gray-300 uppercase tracking-widest">Handled</span>'}
                </td>
            </tr>
        `;
    }).join('');
}

async function updateBooking(id, action) {
    const token = localStorage.getItem('token');
    try {
        await fetch(`${ADMIN_API}/booking/admin/update`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookingId: id, action })
        });
        fetchBookings(); // reload list
    } catch (e) {
        console.error(e);
        alert("Failed to update booking status");
    }
}

async function deleteHub(id) {
    if (!confirm("Are you sure you want to delete this hub?")) return;
    const token = localStorage.getItem('token');
    try {
        await fetch(`${ADMIN_API}/parking/admin/delete/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchHubs(); // reload list
    } catch (e) {
        console.error(e);
        alert("Failed to delete hub");
    }
}

function toggleHubModal() {
    const m = document.getElementById('add-hub-modal');
    if (m) m.classList.toggle('hidden');
}

const addHubForm = document.getElementById('add-hub-form');
if (addHubForm) {
    addHubForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const name = document.getElementById('hub-name').value;
        const location = document.getElementById('hub-loc').value;
        const totalSlots = document.getElementById('hub-slots').value;
        const pricePerHour = document.getElementById('hub-price').value;

        try {
            await fetch(`${ADMIN_API}/parking/admin/create`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, location, totalSlots, pricePerHour })
            });
            toggleHubModal();
            addHubForm.reset();
            fetchHubs();
        } catch (err) {
            console.error(err);
            alert("Failed to add hub");
        }
    });
}

// Initial fetch
window.addEventListener('DOMContentLoaded', () => {
    fetchHubs();
    fetchBookings();
});
