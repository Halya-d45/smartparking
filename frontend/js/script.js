// Initialize Map
var map = L.map('map').setView(CONFIG.DEFAULT_CENTER, CONFIG.DEFAULT_ZOOM);

// Premium Map Layer
L.tileLayer(CONFIG.MAP_STYLE, {
    attribution: '&copy; OpenStreetMap &copy; CARTO'
}).addTo(map);

// Global state
let currentSavedIds = new Set();
let lastFetchedParking = []; // Global cache for current results

async function initDashboard() {
    await loadSavedIds();
}

async function loadSavedIds() {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
        const res = await fetch(`${CONFIG.API_BASE}/saved`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const saved = await res.json();
        currentSavedIds = new Set(saved.map(s => s.parkingId));
    } catch (err) {
        console.error("Load Saved Error:", err);
    }
}

async function searchPlace() {
    let place = document.getElementById("placeSearch").value;
    if (!place) return;

    try {
        let response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${place}`);
        let data = await response.json();

        if (data && data.length > 0) {
            let lat = data[0].lat;
            let lon = data[0].lon;
            map.setView([lat, lon], 14);
            findParking(lat, lon, place);
        } else {
            alert("Place not found");
        }
    } catch (err) {
        console.error(err);
    }
}

async function findParking(lat, lon, city) {
    const listContainer = document.getElementById("parkingList");
    listContainer.innerHTML = '<div class="loader">Scanning for slots...</div>';

    let query = `[out:json][timeout:30];(node["amenity"="parking"](around:5000,${lat},${lon});way["amenity"="parking"](around:5000,${lat},${lon});relation["amenity"="parking"](around:5000,${lat},${lon});node["parking"](around:5000,${lat},${lon}););out center;`;

    try {
        let response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
        let data = await response.json();

        if (!data.elements || data.elements.length === 0) {
            listContainer.innerHTML = '<p class="empty-state">No parking slots found.</p>';
            return;
        }

        let syncRes = await fetch(`${CONFIG.API_BASE}/parking/sync`, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ elements: data.elements, city: city })
        });
        lastFetchedParking = await syncRes.json();

        renderParking(lastFetchedParking);
    } catch (err) {
        console.error(err);
        listContainer.innerHTML = '<p class="error">Failed to fetch parking data.</p>';
    }
}

function renderParking(parkingLots) {
    const listContainer = document.getElementById("parkingList");
    const countLabel = document.getElementById("hubCount");
    listContainer.innerHTML = "";
    
    if (countLabel) countLabel.innerText = `${parkingLots.length} Hubs Detected`;

    map.eachLayer((layer) => {
        if (layer instanceof L.Marker) map.removeLayer(layer);
    });

    if (parkingLots.length === 0) {
        listContainer.innerHTML = '<div class="empty-state-v2"><i class="fas fa-search-location"></i><p>No parking slots found.</p></div>';
        return;
    }

    parkingLots.forEach(p => {
        const isSaved = currentSavedIds.has(p.overpassId);
        const availabilityPercent = Math.min(100, (p.availableSlots / p.totalSlots) * 100);

        const item = document.createElement("div");
        item.className = "parking-card-premium animate-fade";
        item.innerHTML = `
            <div class="card-header">
                <h4>${p.name || 'Unnamed Parking'}</h4>
                <button class="save-btn ${isSaved ? 'active' : ''}" data-id="${p.overpassId}" onclick="handleSaveClick(this)">
                    <i class="${isSaved ? 'fas' : 'far'} fa-heart"></i>
                </button>
            </div>
            <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 12px;">
                <i class="fas fa-map-marker-alt"></i> ${p.location}
            </p>
            <div class="availability-bar">
                <div class="progress-fill" style="width: ${availabilityPercent}%"></div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px;">
                <span class="price-tag">$${p.pricePerHour}/hr</span>
                <span style="font-size: 12px; color: ${p.availableSlots > 0 ? 'var(--success)' : 'var(--error)'}; font-weight: 700;">
                    ${p.availableSlots} slots free
                </span>
            </div>
            <button class="btn-premium btn-sm w-100 mt-4 btn-glow" onclick="showDetails('${p.overpassId}')">Select Hub</button>
        `;
        listContainer.appendChild(item);

        const markerIcon = L.divIcon({
            className: 'custom-marker',
            html: `<div class="marker-pin ${p.availableSlots > 0 ? 'available' : 'full'} ${p.availableSlots > 10 ? 'pulse' : ''}"><i class="fas fa-parking"></i></div>`,
            iconSize: [36, 36],
            iconAnchor: [18, 36]
        });

        L.marker([p.latitude, p.longitude], { icon: markerIcon })
            .addTo(map)
            .bindPopup(`
                <div class="map-popup glass-card" style="padding: 15px;">
                    <h4 style="margin-bottom: 8px;">${p.name || 'Unnamed Parking'}</h4>
                    <p style="font-size: 13px; margin-bottom: 12px;">${p.availableSlots} slots available</p>
                    <button class="btn-premium btn-sm" onclick="showDetails('${p.overpassId}')">Book Hub</button>
                </div>
            `);
    });
}

async function handleSaveClick(btn) {
    const id = btn.getAttribute("data-id");
    const parking = lastFetchedParking.find(p => p.overpassId === id);
    if (!parking) return;

    await toggleSave(id, parking.name, parking.location, parking.latitude, parking.longitude, btn);
}

async function toggleSave(id, name, location, lat, lon, btn) {
    const token = localStorage.getItem("token");
    
    // Optimistic UI Update
    const isSaving = !currentSavedIds.has(id);
    
    if (isSaving) {
        currentSavedIds.add(id);
        btn.classList.add("active");
        btn.querySelector("i").className = "fas fa-heart";
    } else {
        currentSavedIds.delete(id);
        btn.classList.remove("active");
        btn.querySelector("i").className = "far fa-heart";
    }
    
    // Local Persistence (Guest Mode)
    let localSaved = JSON.parse(localStorage.getItem("guest_saved") || "[]");
    if (isSaving) {
        if (!localSaved.find(s => s.parkingId === id)) {
            localSaved.push({ parkingId: id, name, location, latitude: lat, longitude: lon });
        }
    } else {
        localSaved = localSaved.filter(s => s.parkingId !== id);
    }
    localStorage.setItem("guest_saved", JSON.stringify(localSaved));

    // Silent Server Sync
    if (token) {
        try {
            await fetch(`${CONFIG.API_BASE}/saved/toggle`, {
                method: "POST",
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    parkingId: id, 
                    name: (name || 'Unnamed Parking').trim(), 
                    location: (location || 'Unknown Location').trim(), 
                    latitude: parseFloat(lat), 
                    longitude: parseFloat(lon) 
                })
            });
        } catch (err) {
            console.warn("Sync failed, but saved locally:", err);
        }
    }
    
    if (typeof loadStats === "function") loadStats();
}

function showDetails(id) {
    const parking = lastFetchedParking.find(p => p.overpassId === id);
    if (parking) recordVisit(id, parking.name || 'Unnamed Hub');
    window.location.href = `parking-details.html?id=${id}`;
}

document.getElementById("placeSearch")?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") searchPlace();
});

function updateRecentHubs() {
    const recent = JSON.parse(localStorage.getItem("recent_visits") || "[]").slice(0, 3);
    const container = document.getElementById("recentHubs");
    if (!container) return;

    if (recent.length === 0) {
        container.style.display = 'none';
        return;
    }

    container.style.display = 'block';
    container.innerHTML = `
        <p style="font-size: 11px; color: var(--text-muted); text-transform: uppercase; margin-bottom: 12px; font-weight: 700;">Quick Access</p>
        <div style="display: flex; gap: 10px; overflow-x: auto; padding-bottom: 5px;">
            ${recent.map(r => `
                <div class="glass-card recent-hub-chip" onclick="showDetails('${r.id}')">
                    <i class="fas fa-history"></i> ${r.name}
                </div>
            `).join('')}
        </div>
    `;
}

// Update visit on detail page or select
function recordVisit(id, name) {
    let recent = JSON.parse(localStorage.getItem("recent_visits") || "[]");
    recent = recent.filter(r => r.id !== id);
    recent.unshift({ id, name });
    localStorage.setItem("recent_visits", JSON.stringify(recent.slice(0, 5)));
    updateRecentHubs();
}

initDashboard();