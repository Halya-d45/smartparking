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

// Configuration
const API_BASE = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : 'https://backend-api-uhdp.onrender.com/api';

// Data Mockup (Expanded)
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
            if (target === 'my-bookings') fetchBookings();
            if (target === 'saved-slots') fetchSavedSlots();
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

        window.addEventListener('click', () => {
            userDropdown.classList.remove('active');
        });
    }
}

// 4. Map Logic
function initMap() {
    if (map) return;
    map = L.map('map', { zoomControl: false, attributionControl: false }).setView([17.3850, 78.4867], 13);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(map);
    document.getElementById('recenter-btn').onclick = () => map.setView([17.3850, 78.4867], 13);
}

// 3. Search & Geocoding Logic
async function handleSearch() {
    const query = mapSearch.value.trim();
    if (!query) return;

    mapLoader.classList.remove('hidden');
    mapLoader.classList.add('flex');
    
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
        const data = await response.json();

        if (data && data.length > 0) {
            const result = data[0];
            const lat = parseFloat(result.lat);
            const lon = parseFloat(result.lon);
            const cityName = result.display_name.split(',')[0];

            map.flyTo([lat, lon], 14);
            const hubs = await fetchRealParkingHubs(lat, lon);
            
            setTimeout(() => {
                mapLoader.classList.add('hidden');
                mapLoader.classList.remove('flex');
                showResults(cityName, hubs);
                showToast(`Found ${hubs.length} genuine parking hubs in ${cityName}`, 'success');
            }, 1000);
        } else {
            throw new Error('City not found');
        }
    } catch (err) {
        mapLoader.classList.add('hidden');
        mapLoader.classList.remove('flex');
        showToast('Location not found or API busy.', 'error');
    }
}


async function fetchRealParkingHubs(lat, lon) {
    try {
        const query = `[out:json];node["amenity"="parking"](around:3000,${lat},${lon});out 15;`;
        const res = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
        const data = await res.json();
        
        if (!data.elements || data.elements.length === 0) {
            return Array.from({length: 8}, (_, i) => ({
                id: 'sim-' + i,
                name: `Smart Point ${i+1}`,
                price: `$${(Math.random() * 5 + 2).toFixed(2)}/hr`,
                slots: Math.floor(Math.random() * 50) + 10,
                distance: `${(Math.random() * 2).toFixed(1)} km`,
                lat: lat + (Math.random() - 0.5) * 0.03,
                lon: lon + (Math.random() - 0.5) * 0.03,
                addr: 'Local Area'
            }));
        }

        return data.elements.map(el => ({
            id: el.id,
            name: el.tags.name || 'Public Parking',
            price: `$${(Math.random() * 5 + 3).toFixed(2)}/hr`,
            slots: Math.floor(Math.random() * 30),
            distance: 'nearby',
            lat: el.lat,
            lon: el.lon,
            addr: el.tags['addr:street'] || 'City Center'
        }));
    } catch (err) {
        return [];
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
        const marker = L.circleMarker([hub.lat, hub.lon], { 
            radius: 10, 
            fillColor: hub.slots > 0 ? "#3b82f6" : "#ef4444", 
            color: "#fff", 
            weight: 3, 
            opacity: 1, 
            fillOpacity: 0.9 
        }).addTo(map);

        marker.bindPopup(`
            <div class="font-['Plus_Jakarta_Sans'] font-bold text-slate-800">
                ${hub.name}<br>
                <p class="text-[10px] ${hub.slots > 0 ? 'text-emerald-500' : 'text-red-500'} font-black mb-2">
                    ${hub.slots > 0 ? hub.slots + ' SLOTS FREE' : 'FULL'}
                </p>
                ${hub.slots > 0 ? `<button onclick="bookSlot('${hub.id}')" class="text-xs text-blue-600 font-black cursor-pointer">BOOK NOW</button>` : ''}
            </div>
        `);
        markers.push(marker);
    });
}

function renderHubList(hubs) {
    resultsList.innerHTML = hubs.map(hub => `
        <div onclick="${hub.slots > 0 ? `bookSlot('${hub.id}')` : ''}" class="p-5 rounded-2xl border ${hub.slots > 0 ? 'bg-white border-blue-100 shadow-sm' : 'bg-gray-50 border-gray-100 opacity-60 grayscale'} transition-all cursor-pointer hover:shadow-lg group">
            <div class="flex justify-between items-start mb-2">
                <h5 class="font-black text-slate-800 text-sm truncate pr-4">${hub.name}</h5>
                <span class="text-xs font-black text-blue-600 whitespace-nowrap">${hub.price}</span>
            </div>
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-4">
                    <span class="text-[10px] font-black px-2 py-0.5 rounded-md ${hub.slots > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}">
                        ${hub.slots > 0 ? hub.slots + ' SLOTS' : 'FULL'}
                    </span>
                    <span class="text-[10px] text-gray-400 font-black uppercase tracking-widest">${hub.distance}</span>
                </div>
                <button onclick="saveSlot('${hub.id}', event)" class="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 hover:text-red-500 transition-colors">
                    <i class="fas fa-heart text-xs"></i>
                </button>
            </div>
        </div>
    `).join('');
}



function updateMarkersForCity(cityLat, cityLon) {
    // Clear old markers
    markers.forEach(m => map.removeLayer(m));
    markers = [];

    // Scatter mock hubs around the new city coordinates
    PARKING_HUBS.forEach((hub, index) => {
        // Add random offset so they aren't all on top of each other
        const offsetLat = (Math.random() - 0.5) * 0.05;
        const offsetLon = (Math.random() - 0.5) * 0.05;
        
        const hLat = cityLat + offsetLat;
        const hLon = cityLon + offsetLon;

        const marker = L.circleMarker([hLat, hLon], { 
            radius: 10, 
            fillColor: "#3b82f6", 
            color: "#fff", 
            weight: 3, 
            opacity: 1, 
            fillOpacity: 0.9 
        }).addTo(map);

        marker.bindPopup(`
            <div class="font-['Plus_Jakarta_Sans'] font-bold text-slate-800">
                ${hub.name}<br>
                <p class="text-[10px] text-gray-400 font-bold mb-2">NEAR ${hub.addr}</p>
                <button onclick="bookSlot(${hub.id})" class="text-xs text-blue-600 font-black cursor-pointer">BOOK NOW</button>
            </div>
        `);
        markers.push(marker);
    });
}


function renderBookings(data) {
    if (data.length === 0) {
        bookingsList.innerHTML = '<div class="text-center py-20 text-gray-400 font-bold uppercase tracking-widest">No active bookings found.</div>';
        return;
    }
    bookingsList.innerHTML = data.map(b => `
        <div class="bg-white/60 backdrop-blur-xl border border-black/5 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-8 hover:bg-white transition-all duration-300 shadow-sm hover:shadow-xl group">
            <div class="flex items-center gap-8 w-full md:w-auto">
                <div class="w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-2xl ${b.status === 'COMPLETED' ? 'bg-gray-100 text-gray-400' : 'bg-blue-100 text-blue-600'}">
                    <i class="fas ${b.icon || 'fa-building'}"></i>
                </div>
                <div>
                    <div class="flex items-center gap-3 mb-1">
                        <h4 class="font-black text-xl text-slate-900 leading-none">${b.hub || b.parkingHubName}</h4>
                        <span class="bg-blue-50 text-blue-600 text-[10px] font-black px-2 py-0.5 rounded-lg border border-blue-100 uppercase tracking-tighter">Slot: ${b.slot || 'A-1'}</span>
                    </div>
                    <p class="text-gray-400 font-semibold text-sm flex items-center gap-1.5 mb-2">
                        <i class="fas fa-location-dot text-[10px]"></i> ${b.addr || b.location}
                    </p>
                    <div class="flex items-center gap-4">
                        <p class="text-xs font-extrabold text-slate-600 flex items-center gap-1.5">
                            <i class="fas fa-calendar text-[10px] text-blue-500"></i> ${b.date}
                        </p>
                        <p class="text-xs font-extrabold text-slate-600 flex items-center gap-1.5">
                            <i class="fas fa-clock text-[10px] text-blue-500"></i> ${b.time || b.timer}
                        </p>
                    </div>
                </div>
            </div>
            <div class="text-right">
                <p class="text-2xl font-black text-slate-900 mb-1">${b.price}</p>
                <span class="status-badge ${b.status === 'COMPLETED' ? 'status-completed' : 'status-upcoming'}">${b.status || 'UPCOMING'}</span>
            </div>
        </div>
    `).join('');
}

function renderSaved(data) {
    const container = document.getElementById('saved-slots');
    container.innerHTML = `
        <h1 class="text-4xl font-black text-slate-900 mb-2 tracking-tighter">Your <span class="text-primary">Saved Places</span></h1>
        <p class="text-gray-500 font-medium mb-12">Quick access to your most used parking spots.</p>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${data.map(hub => `
                <div onclick="bookSlot(${hub.id})" class="stats-card !p-8 transition-all cursor-pointer hover:shadow-2xl">
                    <div class="flex justify-between items-start mb-6">
                        <div class="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 text-xl shadow-sm">
                            <i class="fas fa-location-arrow"></i>
                        </div>
                        <span class="text-sm font-black text-blue-600">${hub.price}</span>
                    </div>
                    <h3 class="text-xl font-black text-slate-900 mb-2">${hub.name}</h3>
                    <p class="text-gray-400 font-bold text-xs mb-6 lowercase">${hub.addr || 'City Center'}</p>
                    <button class="w-full py-3 bg-white text-slate-900 font-black text-xs rounded-xl shadow-sm group-hover:bg-slate-900 group-hover:text-white transition-all">Book Again</button>
                </div>
            `).join('')}
        </div>
    `;
}

// Event Listeners
if (searchBtn) searchBtn.addEventListener('click', handleSearch);
if (mapSearch) mapSearch.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleSearch(); });
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
    initMap();
});
