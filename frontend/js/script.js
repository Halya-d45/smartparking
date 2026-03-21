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
    listContainer.innerHTML = "";
    
    map.eachLayer((layer) => {
        if (layer instanceof L.Marker) map.removeLayer(layer);
    });

    if (parkingLots.length === 0) {
        listContainer.innerHTML = '<p class="empty-state">No parking slots found.</p>';
        return;
    }

    parkingLots.forEach(p => {
        const isSaved = currentSavedIds.has(p.overpassId);

        const item = document.createElement("div");
        item.className = "parking-item glass-card mb-4 animate-fade";
        item.innerHTML = `
            <div class="parking-info">
                <div class="item-header">
                    <h4>${p.name || 'Unnamed Parking'}</h4>
                    <button class="save-btn ${isSaved ? 'active' : ''}" data-id="${p.overpassId}" onclick="handleSaveClick(this)">
                        <i class="${isSaved ? 'fas' : 'far'} fa-heart"></i>
                    </button>
                </div>
                <p><i class="fas fa-map-marker-alt"></i> ${p.location}</p>
                <div class="parking-meta">
                    <span class="slots-count">${p.availableSlots}/${p.totalSlots} available</span>
                    <span class="price">$${p.pricePerHour}/hr</span>
                </div>
                <button class="btn-premium btn-sm w-100 mt-2" onclick="showDetails('${p.overpassId}')">Select Slot</button>
            </div>
        `;
        listContainer.appendChild(item);

        const markerIcon = L.divIcon({
            className: 'custom-marker',
            html: `<div class="marker-pin ${p.availableSlots > 0 ? 'available' : 'full'}"><i class="fas fa-parking"></i></div>`,
            iconSize: [30, 30]
        });

        L.marker([p.latitude, p.longitude], { icon: markerIcon })
            .addTo(map)
            .bindPopup(`
                <div class="map-popup">
                    <h4>${p.name || 'Unnamed Parking'}</h4>
                    <p>${p.availableSlots} slots available</p>
                    <button class="btn-premium btn-sm" onclick="showDetails('${p.overpassId}')">Book Now</button>
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
    if (!token) {
        alert("Please login to save parking slots!");
        window.location.href = "login.html";
        return;
    }

    try {
        const res = await fetch(`${CONFIG.API_BASE}/saved/toggle`, {
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

        if (res.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "login.html";
            return;
        }

        const data = await res.json();
        
        if (data.saved) {
            btn.classList.add("active");
            btn.querySelector("i").className = "fas fa-heart";
            currentSavedIds.add(id);
        } else if (data.saved === false) {
            btn.classList.remove("active");
            btn.querySelector("i").className = "far fa-heart";
            currentSavedIds.delete(id);
        }
        
        if (typeof loadStats === "function") loadStats();
        
    } catch (err) {
        console.error("Toggle Save Error:", err);
        alert("Network error. Please check your connection.");
    }
}

function showDetails(id) {
    window.location.href = `parking-details.html?id=${id}`;
}

document.getElementById("placeSearch")?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") searchPlace();
});

initDashboard();