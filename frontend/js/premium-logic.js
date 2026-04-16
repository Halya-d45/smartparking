/** 
 * Smart Parking - Premium Logic (Vanilla JS)
 */

let map;
let markers = [];
let currentHubs = [];

// DOM Elements
const navButtons = document.querySelectorAll('.nav-link');
const tabContents = document.querySelectorAll('.tab-content');
const mapSearch = document.getElementById('map-search');
const searchBtn = document.getElementById('search-btn');
const clearSearchBtn = document.getElementById('clear-search');
const mapLoader = document.getElementById('map-loader');
const statsPanel = document.getElementById('stats-panel');
const resultsPanel = document.getElementById('results-panel');
const resultsList = document.getElementById('results-list');
const resultsTitle = document.getElementById('results-title');
const bookingsList = document.getElementById('bookings-list');

// Configuration
const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5000/api' 
    : 'https://backend-api-uhdp.onrender.com/api';

// Data Mockup (Static Fallback)
const PARKING_HUBS = [
    { id: 1, name: 'Premium Hub Alpha', price: '$5.00/hr', slots: 12, distance: '0.2 km', lat: 17.3850, lng: 78.4867, addr: 'Banjara Hills, Road No 12' },
    { id: 2, name: 'City Center Hub', price: '$3.50/hr', slots: 8, distance: '0.8 km', lat: 17.3950, lng: 78.4967, addr: 'Abids, Main Commercial St' },
    { id: 3, name: 'Galleria Mall S-1', price: '$4.00/hr', slots: 0, distance: '1.2 km', lat: 17.3750, lng: 78.4767, addr: 'Panjagutta X-Road' },
    { id: 4, name: 'Metro Parking East', price: '$2.00/hr', slots: 45, distance: '1.5 km', lat: 17.4050, lng: 78.4667, addr: 'Secunderabad Station' },
    { id: 5, name: 'Park Avenue Plaza', price: '$6.00/hr', slots: 5, distance: '0.5 km', lat: 17.4150, lng: 78.5067, addr: 'Somajiguda, Opp Metro' },
    { id: 6, name: 'Airlift Smart Hub', price: '$8.00/hr', slots: 20, distance: '2.4 km', lat: 17.4350, lng: 78.4467, addr: 'Madhapur High-tech City' },
];

let userBookings = [];
let savedSlots = [];

// 1. Tab Switching Logic
function setActiveTab(tabId) {
    const btn = document.querySelector(`.nav-link[data-tab="${tabId}"]`);
    if (btn) btn.click();
    
    // Close dropdown regardless
    const dropdown = document.getElementById('user-dropdown');
    if (dropdown) dropdown.classList.remove('active');
}

function initTabs() {
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.tab;
            
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            tabContents.forEach(tab => {
                tab.classList.remove('active');
                if (tab.id === target) tab.classList.add('active');
            });

            if (target === 'map-view') {
                if (!map) initMap();
                setTimeout(() => map.invalidateSize(), 300);
            }
            if (target === 'my-bookings') fetchBookings();
            if (target === 'saved-slots') fetchSavedSlots();
            if (target === 'profile') {
                fetchProfile();
                fetchBookings(); // Ensure Recent Glance is updated
            }
        });
    });
    fetchProfile();
    fetchBookings(); // Initial load for glance

    const userPill = document.getElementById('user-pill');
    const userDropdown = document.getElementById('user-dropdown');
    if (userPill && userDropdown) {
        userPill.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle('active');
        });
        window.addEventListener('click', () => userDropdown.classList.remove('active'));
    }
}

function getLocalKey(base) {
    let userStr = localStorage.getItem('user');
    let userId = 'guest';
    if (userStr) {
        try { userId = JSON.parse(userStr).id || 'guest'; } catch(e){}
    }
    return `${base}_${userId}`;
}

// 2. Data Fetching
async function fetchBookings() {
    bookingsList.innerHTML = '<div class="text-center py-20 text-gray-400 font-bold animate-pulse">Syncing with database...</div>';
    const token = localStorage.getItem('token');
    let localMockBookings = JSON.parse(localStorage.getItem(getLocalKey('local_mock_bookings')) || '[]');
    try {
        if (!token) throw new Error();
        const res = await fetch(`${API_BASE}/booking`, { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();
        
        const bookingsFromDB = (data.bookings || []).map(b => ({
            id: b._id || b.id || "N/A",
            hub: b.parkingHubName || "Public Hub",
            addr: b.location || "City Center",
            price: `$${(b.totalAmount || 0).toFixed(2)}`,
            slot: b.slot,
            status: b.isPaid ? 'CONFIRMED' : (b.status || 'PENDING'),
            date: new Date(b.createdAt).toLocaleDateString()
        }));

        userBookings = [...bookingsFromDB, ...localMockBookings];
        renderBookings(userBookings);
        renderRecentGlance(userBookings.slice(0, 3));
    } catch (err) {
        userBookings = localMockBookings;
        renderBookings(userBookings);
        renderRecentGlance(userBookings.slice(0, 3));
    }
}

async function fetchProfile() {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
        const res = await fetch(`${API_BASE}/user/profile`, { headers: { 'Authorization': `Bearer ${token}` } });
        const user = await res.json();
        if (user.name) {
            document.getElementById('profile-name-span').innerText = user.name;
            document.getElementById('nav-user-name').innerText = user.name;
            document.getElementById('edit-name').value = user.name;
            if (user.phone) document.getElementById('edit-phone').value = user.phone;
        }
        renderVehicles(user.vehicles || []);
    } catch (e) { console.error(e); }
}

function renderVehicles(vehicles) {
    const list = document.getElementById('vehicles-list');
    if (!list) return;
    if (vehicles.length === 0) {
        list.innerHTML = `<div class="text-center py-10 text-gray-400 font-bold border-2 border-dashed border-gray-100 rounded-[2rem]">No vehicles added yet</div>`;
        return;
    }
    list.innerHTML = vehicles.map(v => `
        <div class="item-card group hover:scale-[1.02] transition-transform">
            <div class="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
                <i class="fas ${v.type === 'truck' ? 'fa-truck' : 'fa-car'}"></i>
            </div>
            <div>
                <h4 class="text-lg font-black text-slate-900">${v.model}</h4>
                <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">${v.plate}</p>
            </div>
        </div>
    `).join('');
}

function renderRecentGlance(bookings) {
    const list = document.getElementById('recent-glance-list');
    if (!list) return;
    if (bookings.length === 0) {
        list.innerHTML = `<div class="text-center py-10 text-gray-400 font-bold">No recent activity</div>`;
        return;
    }
    list.innerHTML = bookings.map(b => `
        <div class="flex items-center justify-between p-5 bg-white/60 hover:bg-white rounded-[2rem] transition-all cursor-pointer border border-transparent hover:border-blue-100">
             <div class="flex items-center gap-6">
                 <div class="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400"><i class="fas fa-building text-sm"></i></div>
                 <div>
                    <h5 class="text-md font-black text-slate-900">${b.hub}</h5>
                    <p class="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">${b.addr}</p>
                 </div>
             </div>
             <div class="text-right">
                 <p class="text-lg font-black text-slate-800">${b.price}</p>
                 <span class="text-[8px] font-black uppercase tracking-widest text-blue-500">${b.status}</span>
             </div>
        </div>
    `).join('');
}

// Form Handlers
document.getElementById('add-vehicle-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const model = document.getElementById('veh-model').value;
    const plate = document.getElementById('veh-plate').value;
    try {
        const res = await fetch(`${API_BASE}/user/vehicles`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ model, plate })
        });
        if (res.ok) {
            showToast("Vehicle added to your fleet!", "success");
            document.getElementById('add-vehicle-modal').classList.add('hidden');
            fetchProfile();
        }
    } catch (e) { showToast("Failed to sync vehicle", "error"); }
});

document.getElementById('edit-profile-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const name = document.getElementById('edit-name').value;
    const phone = document.getElementById('edit-phone').value;
    try {
        const res = await fetch(`${API_BASE}/user/profile`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ name, phone })
        });
        if (res.ok) {
            showToast("Profile updated successfully", "success");
            document.getElementById('edit-profile-modal').classList.add('hidden');
            fetchProfile();
        }
    } catch (e) { showToast("Update failed", "error"); }
});

async function fetchSavedSlots() {
    const savedContainer = document.querySelector('#saved-slots div');
    if (!savedContainer) return;
    const token = localStorage.getItem('token');
    let localSaved = JSON.parse(localStorage.getItem(getLocalKey('local_saved_hubs')) || '[]');

    try {
        if (!token) throw new Error();
        const res = await fetch(`${API_BASE}/saved`, { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();
        
        // Map backend fields to frontend format
        const savedFromDB = (data.saved || []).map(s => ({
            id: s.parkingId,
            name: s.name,
            addr: s.location,
            lat: s.latitude,
            lng: s.longitude
        }));

        // Merge backend and frontend mock saves without duplicates
        const combined = [...savedFromDB];
        localSaved.forEach(ls => {
            if (!combined.some(s => s.id == ls.id || s.name === ls.name)) {
                combined.push(ls);
            }
        });
        
        let deletedSaved = JSON.parse(localStorage.getItem(getLocalKey('deleted_saved_hubs')) || '[]');
        renderSaved(combined.filter(h => !deletedSaved.includes(h.id.toString())));
    } catch (err) {
        // Fallback demo data
        const mockFallback = [PARKING_HUBS[0], PARKING_HUBS[1]];
        const combined = [...mockFallback];
        localSaved.forEach(ls => {
            if (!combined.some(s => s.id == ls.id || s.name === ls.name)) {
                combined.push(ls);
            }
        });
        
        let deletedSaved = JSON.parse(localStorage.getItem(getLocalKey('deleted_saved_hubs')) || '[]');
        renderSaved(combined.filter(h => !deletedSaved.includes(h.id.toString())));
    }
}

// 3. User Actions
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icon = type === 'success' ? 'fa-check-circle' : (type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle');
    toast.innerHTML = `<i class="fas ${icon} ${type === 'success' ? 'text-emerald-500' : (type === 'error' ? 'text-red-500' : 'text-blue-500')}"></i><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 500); }, 4000);
}

function bookSlot(hubId) {
    const hub = currentHubs.find(h => h.id == hubId) || PARKING_HUBS.find(h => h.id == hubId);
    if (!hub) {
        showToast("Hub details not found", "error");
        return;
    }
    localStorage.setItem('last_booking_hub_id', hub.id);
    localStorage.setItem('last_booking_hub', hub.name || 'Public Parking');
    localStorage.setItem('last_booking_price', hub.price || '$5.00/hr');
    localStorage.setItem('last_booking_id', hub.id);
    localStorage.setItem('last_booking_addr', hub.addr || 'City Center');
    showToast(`Redirecting to Secure Checkout...`, 'info');
    setTimeout(() => window.location.href = 'booking-confirm.html', 800);
}

async function saveSlot(hubId, e) {
    e.stopPropagation();
    const btn = e.currentTarget;
    const icon = btn.querySelector('i');
    const token = localStorage.getItem('token');

    if (!token) {
        showToast("Please login to save places", "error");
        return;
    }

    try {
        const hub = currentHubs.find(h => h.id == hubId) || PARKING_HUBS.find(h => h.id == hubId);
        if (!hub) {
            showToast("Hub details missing", "error");
            return;
        }

        const res = await fetch(`${API_BASE}/saved/toggle`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ 
                parkingId: String(hubId),
                name: hub.name,
                location: hub.addr || "City Center",
                latitude: hub.lat,
                longitude: hub.lng
            })
        });

        if (res.ok) {
            const isSaved = icon.classList.contains('fas');
            icon.classList.toggle('fas');
            icon.classList.toggle('far');
            icon.classList.toggle('text-red-500');
            showToast(isSaved ? "Removed from favorites" : "Saved to favorites", 'success');
        } else {
            showToast("Sync Error: " + res.status, "error");
        }
    } catch (err) {
        console.error(err);
        showToast("Database connection error", "error");
    }
}

// 4. Map & Search Logic
function initMap() {
    if (map) return;
    console.log("Initializing map...");
    map = L.map('map', { zoomControl: false, attributionControl: false, fadeAnimation: true }).setView([17.3850, 78.4867], 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        crossOrigin: true,
        zIndex: 1
    }).addTo(map);

    document.getElementById('recenter-btn').onclick = () => map.setView([17.3850, 78.4867], 13);
    
    // Safety check for tile display
    setTimeout(() => {
        map.invalidateSize();
    }, 500);
}

async function handleSearch() {
    const query = mapSearch.value.trim();
    if (!query) return;
    mapLoader.classList.remove('hidden');
    mapLoader.classList.add('flex');
    hideSuggestions();

    try {
        // Try Nominatim with case-insensitivity (native)
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
        const data = await response.json();
        
        if (data && data.length > 0) {
            const result = data[0];
            const lat = parseFloat(result.lat);
            const lon = parseFloat(result.lon);
            const cityName = result.display_name.split(',')[0];
            
            map.flyTo([lat, lon], 14);
            currentHubs = await fetchRealParkingHubs(lat, lon, cityName);
            
            setTimeout(() => {
                mapLoader.classList.add('hidden');
                mapLoader.classList.remove('flex');
                showResults(cityName, currentHubs);
                showToast(`Found ${currentHubs.length} hubs in ${cityName}`, 'success');
            }, 1000);
        } else {
            // Fallback: If map search yields nothing, search our database directly by name
            const res = await fetch(`${API_BASE}/parking/suggestions?q=${encodeURIComponent(query)}`);
            const dbData = await res.json();
            if (dbData.length > 0) {
                const p = dbData[0];
                selectSuggestion(p.name, p.latitude, p.longitude, p.location);
            } else {
                throw new Error("Location not found");
            }
        }
    } catch (err) {
        mapLoader.classList.add('hidden');
        mapLoader.classList.remove('flex');
        showToast('Location not found.', 'error');
    }
}

// Search Suggestions Logic
if (mapSearch) {
    mapSearch.addEventListener('input', debounce(() => fetchSuggestions(), 300));
}

async function fetchSuggestions() {
    const query = mapSearch.value.trim();
    const list = document.getElementById('suggestions-list');
    const dropdown = document.getElementById('search-suggestions');
    
    if (query.length < 2) {
        hideSuggestions();
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/parking/suggestions?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        
        if (!data || data.length === 0) {
            hideSuggestions();
            return;
        }

        list.innerHTML = data.map(s => `
            <button onclick="selectSuggestion('${s.name.replace(/'/g, "\\'")}', ${s.latitude}, ${s.longitude}, '${s.location.replace(/'/g, "\\'")}')" class="w-full text-left px-4 py-3 hover:bg-blue-50 dark:hover:bg-white/5 transition-all mb-1 border-b border-gray-50 dark:border-white/5 last:border-0">
                <p class="text-sm font-black text-slate-800 dark:text-white">${s.name}</p>
                <p class="text-[10px] text-gray-400 font-bold uppercase">${s.location}</p>
            </button>
        `).join('');
        
        dropdown.classList.remove('hidden');
    } catch (e) { console.error(e); }
}

function selectSuggestion(name, lat, lon, location) {
    mapSearch.value = name;
    hideSuggestions();
    
    mapLoader.classList.remove('hidden');
    mapLoader.classList.add('flex');
    
    map.flyTo([lat, lon], 14);
    
    // Trigger the discovery flow
    setTimeout(async () => {
        currentHubs = await fetchRealParkingHubs(lat, lon, location.split(',')[0]);
        mapLoader.classList.add('hidden');
        mapLoader.classList.remove('flex');
        showResults(name, currentHubs);
        showToast(`Navigated to ${name}`, 'success');
    }, 1000);
}

function hideSuggestions() {
    const dropdown = document.getElementById('search-suggestions');
    if (dropdown) dropdown.classList.add('hidden');
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

async function fetchRealParkingHubs(lat, lon, city) {
    try {
        console.log(`Searching DB for ${city} at ${lat}, ${lon}...`);
        const res = await fetch(`${API_BASE}/parking/discover`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lat, lon, city })
        });
        
        if (!res.ok) throw new Error(`Backend returned ${res.status}`);
        
        const data = await res.json();
        console.log(`Received ${data.length} hubs from server.`);
        
        if (!data || data.length === 0) return PARKING_HUBS;
        
        return data.map(p => ({
            id: p.overpassId || p._id,
            name: p.name,
            price: `$${p.pricePerHour.toFixed(2)}/hr`,
            slots: p.availableSlots,
            lat: p.latitude,
            lng: p.longitude,
            addr: p.location
        }));
    } catch (err) { 
        console.error("Discovery API Error:", err);
        return PARKING_HUBS; 
    }
}

function showResults(city, hubs) {
    statsPanel.classList.add('hidden');
    resultsPanel.classList.remove('hidden');
    resultsTitle.innerText = `Parking in ${city}`;
    renderHubList(hubs);
    updateMapMarkers(hubs);
}

function updateMapMarkers(hubs) {
    markers.forEach(m => map.removeLayer(m));
    markers = [];
    hubs.forEach(hub => {
        const marker = L.circleMarker([hub.lat, hub.lng], { radius: 10, fillColor: "#3b82f6", color: "#fff", weight: 3, opacity: 1, fillOpacity: 0.9 }).addTo(map);
        marker.bindPopup(`
            <div class="font-['Plus_Jakarta_Sans'] font-bold text-slate-800">
                ${hub.name}<br>
                <p class="text-[10px] text-gray-400 font-bold mb-2">FREE SLOTS: ${hub.slots || 0}</p>
                <button onclick="bookSlot('${hub.id}')" class="text-xs text-blue-600 font-black cursor-pointer">BOOK NOW</button>
            </div>
        `);
        markers.push(marker);
    });
}

function renderHubList(hubs) {
    resultsList.innerHTML = hubs.map(hub => `
        <div onclick="bookSlot('${hub.id}')" class="p-5 rounded-2xl border bg-white border-blue-100 shadow-sm transition-all cursor-pointer hover:shadow-lg group">
            <div class="flex justify-between items-start mb-2">
                <h5 class="font-black text-slate-800 text-sm truncate pr-4">${hub.name}</h5>
                <span class="text-xs font-black text-blue-600 whitespace-nowrap">${hub.price}</span>
            </div>
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-4">
                    <span class="text-[10px] font-black px-2 py-0.5 rounded-md bg-green-100 text-green-600">${hub.slots || 0} SLOTS</span>
                </div>
                <button onclick="saveSlot('${hub.id}', event)" class="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 hover:text-red-500 transition-colors">
                    <i class="fas fa-heart text-xs"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function renderBookings(data) {
    if (!data || data.length === 0) {
        bookingsList.innerHTML = `
            <div class="glass-card !bg-white/10 p-12 flex flex-col items-center justify-center text-center">
                <i class="fas fa-wallet text-6xl text-slate-200 mb-6"></i>
                <h3 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">No Bookings Yet</h3>
                <p class="text-gray-400 font-bold mt-2">When you confirm a spot at a hub, your reservations will appear right here.</p>
            </div>
        `;
        return;
    }

    bookingsList.innerHTML = data.map(b => `
        <div class="booking-row-item !p-8 flex flex-col md:flex-row items-center justify-between rounded-[2.5rem] hover:!bg-white/30 transition-all shadow-sm group">
            <div class="flex items-center gap-8">
                <div class="w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-2xl bg-blue-100 dark:bg-blue-600/20 text-blue-600">
                    <i class="fas ${b.icon || 'fa-building'}"></i>
                </div>
                <div>
                    <h4 class="font-black text-xl text-slate-900 dark:text-white">${b.hub || b.parkingHubName}</h4>
                    <p class="text-gray-400 font-semibold text-sm">${b.addr || b.location}</p>
                    <div class="flex items-center gap-3 mt-4">
                        <button onclick="downloadReceipt('${b.id}')" class="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 dark:bg-blue-500/10 px-4 py-2 rounded-xl hover:bg-blue-600 hover:text-white transition-all">
                            <i class="fas fa-file-invoice mr-1"></i> Receipt
                        </button>
                        <span class="text-[10px] font-bold text-gray-300 uppercase">ID: ${b.id.substring(0,6)}</span>
                    </div>
                </div>
            </div>
            <div class="text-right flex flex-col items-end">
                <p class="text-2xl font-black text-slate-900 dark:text-white mb-1">${b.price}</p>
                <span class="status-badge status-upcoming">${b.status || 'CONFIRMED'}</span>
                <p class="text-[10px] font-bold text-gray-400 mt-2">Slot: ${b.slot || 'N/A'}</p>
            </div>
        </div>
    `).join('');
}

function downloadReceipt(bookingId) {
    const booking = userBookings.find(b => b.id === bookingId);
    if (!booking) return;

    const receiptContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>SmartPark Receipt - ${booking.id}</title>
            <style>
                body { font-family: sans-serif; padding: 40px; color: #333; }
                .receipt-box { max-width: 600px; margin: auto; border: 1px solid #eee; padding: 30px; border-radius: 10px; }
                .header { text-align: center; margin-bottom: 40px; }
                .logo { font-size: 24px; font-weight: bold; color: #3b82f6; }
                .row { display: flex; justify-content: space-between; margin-bottom: 15px; border-bottom: 1px solid #f9f9f9; padding-bottom: 10px; }
                .label { color: #999; font-weight: bold; font-size: 12px; text-transform: uppercase; }
                .value { font-weight: bold; }
                .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #ccc; }
                @media print { .no-print { display: none; } }
            </style>
        </head>
        <body>
            <div class="receipt-box">
                <div class="header">
                    <div class="logo">SmartPark Premium Hub</div>
                    <p>Official Booking Receipt</p>
                </div>
                <div class="row">
                    <span class="label">Booking ID</span>
                    <span class="value">${booking.id}</span>
                </div>
                <div class="row">
                    <span class="label">Date</span>
                    <span class="value">${new Date().toLocaleDateString()}</span>
                </div>
                <div class="row">
                    <span class="label">Parking Hub</span>
                    <span class="value">${booking.hub}</span>
                </div>
                <div class="row">
                    <span class="label">Location</span>
                    <span class="value">${booking.addr}</span>
                </div>
                <div class="row">
                    <span class="label">Assigned Slot</span>
                    <span class="value">${booking.slot || 'A-1'}</span>
                </div>
                <div class="row">
                    <span class="label">Total Amount</span>
                    <span class="value" style="font-size: 20px; color: #000;">${booking.price}</span>
                </div>
                <div class="footer">
                    Thank you for choosing SmartPark. Have a safe drive!
                </div>
                <div class="no-print" style="margin-top: 20px; text-align: center;">
                    <button onclick="window.print()" style="padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">Click to Print / Save as PDF</button>
                </div>
            </div>
            <script>window.onload = () => { setTimeout(() => window.print(), 500); }</script>
        </body>
        </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(receiptContent);
    printWindow.document.close();
}

async function removeSavedSlot(hubId, hubName, e) {
    if (e) e.stopPropagation();
    
    // Remove from local storage array
    let localSaved = JSON.parse(localStorage.getItem(getLocalKey('local_saved_hubs')) || '[]');
    localSaved = localSaved.filter(h => h.id != hubId && h.name !== hubName);
    localStorage.setItem(getLocalKey('local_saved_hubs'), JSON.stringify(localSaved));

    // Track as permanently deleted local override
    let deletedSaved = JSON.parse(localStorage.getItem(getLocalKey('deleted_saved_hubs')) || '[]');
    if (!deletedSaved.includes(hubId.toString())) {
        deletedSaved.push(hubId.toString());
        localStorage.setItem(getLocalKey('deleted_saved_hubs'), JSON.stringify(deletedSaved));
    }

    // Try removing from backend if token exists
    const token = localStorage.getItem('token');
    if (token) {
        try {
            await fetch(`${API_BASE}/saved/toggle`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ parkingId: hubId, name: hubName, location: "City Center Hub" })
            });
        } catch(err) {}
    }

    showToast("Removed from Saved Places", "success");
    fetchSavedSlots(); // Refresh the UI
}

function renderSaved(data) {
    const container = document.getElementById('saved-slots');
    
    if (!data || data.length === 0) {
        container.innerHTML = `
            <h1 class="text-4xl font-black text-slate-900 mb-2 tracking-tighter">Your <span class="text-primary">Saved Places</span></h1>
            <p class="text-gray-500 font-medium mb-12">You haven't saved any places yet. Go explore the map!</p>
        `;
        return;
    }

    container.innerHTML = `
        <h1 class="text-4xl font-black text-slate-900 mb-2 tracking-tighter">Your <span class="text-primary">Saved Places</span></h1>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            ${data.map(hub => `
                <div onclick="bookSlot('${hub.id}')" class="stats-card !p-8 transition-all cursor-pointer hover:shadow-2xl relative group">
                    <button onclick="removeSavedSlot('${hub.id}', '${hub.name}', event)" class="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-red-50 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all shadow-sm z-10" title="Remove">
                        <i class="fas fa-trash-alt text-xs"></i>
                    </button>
                    <h3 class="text-xl font-black text-slate-900 mb-2 pr-8">${hub.name}</h3>
                    <p class="text-gray-400 font-bold text-xs mb-6">${hub.addr || 'City Center'}</p>
                    <button class="w-full py-3 bg-slate-900 text-white font-black text-xs rounded-xl hover:bg-blue-600 transition-colors">Book Again</button>
                </div>
            `).join('')}
        </div>
    `;
}

// 5. Initialize
if (searchBtn) searchBtn.addEventListener('click', handleSearch);
if (mapSearch) mapSearch.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleSearch(); });
if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
        resultsPanel.classList.add('hidden');
        statsPanel.classList.remove('hidden');
        mapSearch.value = '';
        markers.forEach(m => map.removeLayer(m));
        map.setView([17.3850, 78.4867], 13);
    });
}

// Profile Logic
function initProfile() {
    let userStr = localStorage.getItem('user');
    let user = userStr ? JSON.parse(userStr) : { name: "Guest", email: "guest@example.com", phone: "" };
    
    // Update Header Pill
    const navName = document.getElementById('nav-user-name');
    const navInitials = document.getElementById('nav-user-initials');
    if (navName) navName.innerText = user.name.split(' ')[0] || "User";
    if (navInitials) navInitials.innerText = (user.name.substring(0, 2) || "US").toUpperCase();
    
    // Update Profile Page Text
    const profileNameSpan = document.getElementById('profile-name-span');
    if (profileNameSpan) profileNameSpan.innerText = user.name.split(' ')[0] || "Guest";
    
    // Pre-fill Edit Modal
    const editName = document.getElementById('edit-name');
    const editEmail = document.getElementById('edit-email');
    const editPhone = document.getElementById('edit-phone');
    if (editName) editName.value = user.name || "";
    if (editEmail) editEmail.value = user.email || "";
    if (editPhone) editPhone.value = user.phone || "";
}

const editProfileForm = document.getElementById('edit-profile-form');
if (editProfileForm) {
    editProfileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        let userStr = localStorage.getItem('user');
        let user = userStr ? JSON.parse(userStr) : {};
        
        user.name = document.getElementById('edit-name').value;
        user.email = document.getElementById('edit-email').value;
        user.phone = document.getElementById('edit-phone').value;
        
        localStorage.setItem('user', JSON.stringify(user));
        
        document.getElementById('edit-profile-modal').classList.add('hidden');
        showToast("Profile updated successfully!", "success");
        initProfile(); // visually refresh globally
    });
}

// UI Enhancements: Top Nav & Mobile Bottom Bar
function initUI() {
    const themeToggle = document.getElementById('theme-toggle');

    // Theme Logic
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') document.documentElement.classList.add('dark');

    if (themeToggle) {
        themeToggle.onclick = () => {
            const isDark = document.documentElement.classList.toggle('dark');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            
            // Force a repaint for complex overlays
            document.body.style.opacity = '0.99';
            setTimeout(() => {
                document.body.style.opacity = '1';
                if (map) map.invalidateSize();
            }, 50);

            showToast(`Theme: ${isDark ? 'Cyber Night' : 'Premium Day'}`, 'info');
        };
    }
}


window.addEventListener('DOMContentLoaded', () => { 
    initTabs(); 
    initMap(); 
    initProfile(); 
    initUI();
});
