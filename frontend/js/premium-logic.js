/** 
 * Smart Parking - Premium Logic (Vanilla JS)
 */

let map;
let markers = [];

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

// Data Mockup
const PARKING_HUBS = [
    { id: 1, name: 'Premium Hub Alpha', price: '$5.00/hr', slots: 12, distance: '0.2 km', lat: 17.3850, lng: 78.4867 },
    { id: 2, name: 'City Center Hub', price: '$3.50/hr', slots: 8, distance: '0.8 km', lat: 17.3950, lng: 78.4967 },
    { id: 3, name: 'Galleria Mall S-1', price: '$4.00/hr', slots: 0, distance: '1.2 km', lat: 17.3750, lng: 78.4767 },
];

const BOOKINGS = [
    { hub: 'Downtown Plaza Hub', addr: '124 Main St, City Center', date: 'Oct 12, 2026', time: '10:00 AM - 02:00 PM', price: '$14.00', status: 'UPCOMING', icon: 'fa-building', slot: 'A-24' },
    { hub: 'Central Mall Parking', addr: 'Sector 5, Cross Road', date: 'Oct 15, 2026', time: '11:00 AM - 01:00 PM', price: '$08.00', status: 'PENDING', icon: 'fa-shopping-cart', slot: 'C-09' },
    { hub: 'Railway Station East', addr: 'Station Rd, East Gate', date: 'Sept 28, 2026', time: '09:00 AM - 06:00 PM', price: '$35.00', status: 'COMPLETED', icon: 'fa-train', slot: 'B-12' },
];

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
            
            // Update Nav UI
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update Content UI
            tabContents.forEach(tab => {
                tab.classList.remove('active');
                if (tab.id === target) tab.classList.add('active');
            });

            // Specific Tab Actions
            if (target === 'map-view') {
                if (!map) initMap();
                else map.invalidateSize();
            }
            if (target === 'my-bookings') renderBookings();
        });
    });

    // Dropdown Toggle
    const userPill = document.getElementById('user-pill');
    const userDropdown = document.getElementById('user-dropdown');

    if (userPill && userDropdown) {
        userPill.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle('active');
        });

        // Close when clicking outside
        window.addEventListener('click', () => {
            userDropdown.classList.remove('active');
        });
    }
}


// 2. Map Logic (Leaflet)
function initMap() {
    if (map) return;
    
    map = L.map('map', {
        zoomControl: false,
        attributionControl: false
    }).setView([17.3850, 78.4867], 13);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19
    }).addTo(map);

    document.getElementById('recenter-btn').onclick = () => map.setView([17.3850, 78.4867], 13);
}

// 3. Search Logic
function handleSearch() {
    const query = mapSearch.value.trim();
    if (!query) return;

    // UI Feedback
    mapLoader.classList.remove('hidden');
    mapLoader.classList.add('flex');
    
    setTimeout(() => {
        mapLoader.classList.add('hidden');
        mapLoader.classList.remove('flex');
        
        showResults(query);
        addMarkers();
    }, 1500);
}

function showResults(city) {
    statsPanel.classList.add('hidden');
    resultsPanel.classList.remove('hidden');
    resultsTitle.innerText = `Parking in ${city}`;
    
    resultsList.innerHTML = PARKING_HUBS.map(hub => `
        <div class="p-5 rounded-2xl border ${hub.slots > 0 ? 'bg-white border-blue-100 shadow-sm' : 'bg-gray-50 border-gray-100 opacity-60'} transition-all cursor-pointer hover:shadow-lg">
            <div class="flex justify-between items-start mb-2">
                <h5 class="font-black text-slate-800 text-sm">${hub.name}</h5>
                <span class="text-xs font-black text-blue-600">${hub.price}</span>
            </div>
            <div class="flex items-center gap-4">
                <span class="text-[10px] font-black px-2 py-0.5 rounded-md ${hub.slots > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}">
                    ${hub.slots > 0 ? hub.slots + ' SLOTS' : 'BOOKED'}
                </span>
                <span class="text-[10px] text-gray-400 font-black uppercase tracking-widest">${hub.distance}</span>
            </div>
        </div>
    `).join('');
}

function addMarkers() {
    // Clear old markers
    markers.forEach(m => map.removeLayer(m));
    markers = [];

    PARKING_HUBS.forEach(hub => {
        const marker = L.circleMarker([hub.lat, hub.lng], {
            radius: 12,
            fillColor: "#3b82f6",
            color: "#fff",
            weight: 3,
            opacity: 1,
            fillOpacity: 0.9
        }).addTo(map);
        
        marker.bindPopup(`<div class="font-['Plus_Jakarta_Sans'] font-bold text-slate-800">${hub.name}</div>`);
        markers.push(marker);
    });

    map.flyTo([PARKING_HUBS[0].lat, PARKING_HUBS[0].lng], 14);
}

// 4. Bookings Rendering
function renderBookings() {
    bookingsList.innerHTML = BOOKINGS.map(b => `
        <div class="bg-white/60 backdrop-blur-xl border border-black/5 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-8 hover:bg-white transition-all duration-300 shadow-sm hover:shadow-xl group">
            <div class="flex items-center gap-8 w-full md:w-auto">
                <div class="w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-2xl ${b.status === 'COMPLETED' ? 'bg-gray-100 text-gray-400' : 'bg-blue-100 text-blue-600'}">
                    <i class="fas ${b.icon}"></i>
                </div>
                <div>
                    <div class="flex items-center gap-3 mb-1">
                        <h4 class="font-black text-xl text-slate-900 leading-none">${b.hub}</h4>
                        <span class="bg-blue-50 text-blue-600 text-[10px] font-black px-2 py-0.5 rounded-lg border border-blue-100 uppercase tracking-tighter">Slot: ${b.slot}</span>
                    </div>
                    <p class="text-gray-400 font-semibold text-sm flex items-center gap-1.5 mb-2">
                        <i class="fas fa-location-dot text-[10px]"></i> ${b.addr}
                    </p>
                    <div class="flex items-center gap-4">
                        <p class="text-xs font-extrabold text-slate-600 flex items-center gap-1.5">
                            <i class="fas fa-calendar text-[10px] text-blue-500"></i> ${b.date}
                        </p>
                        <p class="text-xs font-extrabold text-slate-600 flex items-center gap-1.5">
                            <i class="fas fa-clock text-[10px] text-blue-500"></i> ${b.time}
                        </p>
                    </div>
                </div>
            </div>

            <div class="flex items-center gap-10 w-full md:w-auto justify-between md:justify-end">
                <div class="text-right">
                    <p class="text-2xl font-black text-slate-900 mb-1">${b.price}</p>
                    <span class="status-badge ${b.status === 'COMPLETED' ? 'status-completed' : 'status-upcoming'}">
                        ${b.status}
                    </span>
                </div>
                <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button class="w-12 h-12 bg-gray-50 text-slate-500 rounded-2xl hover:bg-slate-900 hover:text-white transition-all">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Event Listeners
if (searchBtn) searchBtn.addEventListener('click', handleSearch);
if (mapSearch) {
    mapSearch.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
}
if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
        resultsPanel.classList.add('hidden');
        statsPanel.classList.remove('hidden');
        mapSearch.value = '';
        markers.forEach(m => map.removeLayer(m));
        markers = [];
        map.setView([17.3850, 78.4867], 13);
    });
}

// App Start
window.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initMap(); // Default tab
});
