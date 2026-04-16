/* eslint-disable no-undef */
/* global L, CONFIG, map, showToast, bootstrap */

// Initialize Variables
var map;
var markers = [];
var currentSavedIds = new Set();
var lastFetchedParking = []; 
var searchMarker = null;

// Location state
let lastKnownLocation = null;
let locationCacheExpiry = 5 * 60 * 1000; 

// 1. Initialize Dashboard
async function initDashboard() {
    initMap();
    await loadSavedIds();
    locateNow();
}

function initMap() {
    if (!document.getElementById('map')) return;
    map = L.map('map').setView([16.3067, 80.4365], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(map);
}

// 2. Search Logic
async function searchPlace() {
    const query = document.getElementById("placeSearch").value.trim();
    if (!query) return showToast("Please enter a location", "info");

    const searchBtn = document.querySelector(".search-btn-gradient");
    if (searchBtn) searchBtn.disabled = true;

    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
        const data = await response.json();

        if (data && data.length > 0) {
            const { lat, lon, display_name } = data[0];
            const latitude = parseFloat(lat);
            const longitude = parseFloat(lon);

            map.setView([latitude, longitude], 15);
            if (searchMarker) map.removeLayer(searchMarker);
            searchMarker = L.marker([latitude, longitude]).addTo(map)
                .bindPopup(`<b>Search Result:</b><br>${query}`).openPopup();

            await findParking(latitude, longitude, display_name);
            showToast(`Found: ${query}`, "success");
        } else {
            showToast("Location not found", "error");
        }
    } catch (err) {
        showToast("Search service unavailable", "error");
    } finally {
        if (searchBtn) searchBtn.disabled = false;
    }
}

// 3. Geolocation Logic (Rectified)
async function locateNow() {
    const locateBtn = document.getElementById('locate-btn');
    const originalText = locateBtn ? locateBtn.innerHTML : '';

    if (locateBtn) {
        locateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        locateBtn.disabled = true;
    }

    try {
        const pos = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { 
                enableHighAccuracy: true, 
                timeout: 5000 
            });
        });

        const { latitude, longitude } = pos.coords;
        map.setView([latitude, longitude], 14);
        saveLocationToCache(latitude, longitude);
        await findParking(latitude, longitude, 'Your Location');
        showToast('Location updated', 'success');

    } catch (error) {
        console.warn("Location access denied or timed out");
        showToast("Using default location", "warning");
    } finally {
        if (locateBtn) {
            locateBtn.innerHTML = originalText;
            locateBtn.disabled = false;
        }
    }
}

// 4. Find and Render Parking
async function findParking(lat, lon, city) {
    const listContainer = document.getElementById("parkingList");
    if (!listContainer) return;
    
    listContainer.innerHTML = '<div class="loader"><i class="fas fa-spinner fa-spin"></i> Scanning...</div>';

    const query = `[out:json][timeout:30];(node["amenity"="parking"](around:5000,${lat},${lon});way["amenity"="parking"](around:5000,${lat},${lon}););out center;`;
    
    try {
        const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
        const data = await response.json();

        if (!data.elements || data.elements.length === 0) {
            listContainer.innerHTML = '<p class="text-center p-4">No parking found.</p>';
            return;
        }

        lastFetchedParking = data.elements.slice(0, 20).map(p => ({
            overpassId: p.id.toString(),
            name: p.tags?.name || "Unnamed Hub",
            location: city,
            latitude: p.lat || p.center.lat,
            longitude: p.lon || p.center.lon,
            pricePerHour: 20,
            availableSlots: Math.floor(Math.random() * 10),
            totalSlots: 20
        }));

        renderParking(lastFetchedParking);
    } catch (err) {
        listContainer.innerHTML = '<p class="text-danger p-4">Error loading data.</p>';
    }
}

function renderParking(parkingLots) {
    const listContainer = document.getElementById("parkingList");
    listContainer.innerHTML = "";
    markers.forEach(m => m.remove());
    markers = [];

    parkingLots.forEach(p => {
        const item = document.createElement("div");
        item.className = "parking-card-modern";
        item.innerHTML = `
            <div class="card-header"><h4>${p.name}</h4></div>
            <p><i class="fas fa-map-marker-alt"></i> ${p.location.substring(0, 25)}...</p>
            <button class="btn-premium btn-sm w-100 mt-2" onclick="showDetails('${p.overpassId}')">Select Hub</button>
        `;
        listContainer.appendChild(item);
        const marker = L.marker([p.latitude, p.longitude]).addTo(map);
        markers.push(marker);
    });
}

// 5. Utilities
function saveLocationToCache(lat, lon) {
    localStorage.setItem('last_lat', lat);
    localStorage.setItem('last_lng', lon);
    localStorage.setItem('lastLocation', JSON.stringify({ lat, lon, timestamp: Date.now() }));
}

async function loadSavedIds() {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
        const res = await fetch(`${CONFIG.API_BASE}/saved`, { headers: { 'Authorization': `Bearer ${token}` } });
        const saved = await res.json();
        currentSavedIds = new Set(saved.map(s => s.parkingId));
    } catch (err) { console.error(err); }
}

function showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `custom-toast toast-${type}`;
    toast.style.position = "fixed";
    toast.style.bottom = "20px";
    toast.style.right = "20px";
    toast.style.background = "#333";
    toast.style.color = "#fff";
    toast.style.padding = "10px 20px";
    toast.style.borderRadius = "5px";
    toast.style.zIndex = "1000";
    toast.innerText = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function showDetails(id) { window.location.href = `parking-details.html?id=${id}`; }
function updateRecentHubs() {}

initDashboard();