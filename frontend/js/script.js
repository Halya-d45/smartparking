// Initialize Map
var map = L.map('map').setView(CONFIG.DEFAULT_CENTER, CONFIG.DEFAULT_ZOOM);

// Premium Map Layer
L.tileLayer(CONFIG.MAP_STYLE, {
    attribution: '&copy; OpenStreetMap &copy; CARTO'
}).addTo(map);

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
            findParking(lat, lon);
        } else {
            alert("Place not found");
        }
    } catch (err) {
        console.error(err);
    }
}

async function findParking(lat, lon) {
    const listContainer = document.getElementById("parkingList");
    listContainer.innerHTML = '<div class="loader">Scanning 5km radius for slots...</div>';

    // Advanced Overpass Query: Node, Way, Relation + 5km radius
    let query = `
        [out:json];
        (
          node["amenity"="parking"](around:5000,${lat},${lon});
          way["amenity"="parking"](around:5000,${lat},${lon});
          relation["amenity"="parking"](around:5000,${lat},${lon});
        );
        out center;
    `;

    try {
        let response = await fetch("https://overpass-api.de/api/interpreter", {
            method: "POST",
            body: query
        });
        let data = await response.json();

        // Sync with our Backend
        let syncRes = await fetch(`${CONFIG.API_BASE}/parking/sync`, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                elements: data.elements,
                city: place // Pass the searched city name
            })
        });
        let syncedData = await syncRes.json();

        renderParking(syncedData);
    } catch (err) {
        console.error(err);
        listContainer.innerHTML = '<p class="error">Failed to fetch parking data. Please try again.</p>';
    }
}

function renderParking(parkingLots) {
    const listContainer = document.getElementById("parkingList");
    listContainer.innerHTML = "";
    
    // Clear existing markers
    map.eachLayer((layer) => {
        if (layer instanceof L.Marker) map.removeLayer(layer);
    });

    if (parkingLots.length === 0) {
        listContainer.innerHTML = '<p class="empty-state">No parking slots found in this area. Try a different city or location.</p>';
        return;
    }

    parkingLots.forEach(p => {
        // Add to Sidebar
        const item = document.createElement("div");
        item.className = "parking-item glass-card mb-4 animate-fade";
        item.innerHTML = `
            <div class="parking-info">
                <h4>${p.name || 'Unnamed Parking'}</h4>
                <p><i class="fas fa-map-marker-alt"></i> ${p.location}</p>
                <div class="parking-meta">
                    <span class="slots-count">${p.availableSlots}/${p.totalSlots} available</span>
                    <span class="price">$${p.pricePerHour}/hr</span>
                </div>
                <button class="btn-premium btn-sm" onclick="showDetails('${p.overpassId}')">Select Slot</button>
            </div>
        `;
        listContainer.appendChild(item);

        // Add Marker to Map
        const markerIcon = L.divIcon({
            className: 'custom-marker',
            html: `<div class="marker-pin ${p.availableSlots > 0 ? 'available' : 'full'}">
                    <i class="fas fa-parking"></i>
                   </div>`,
            iconSize: [30, 30]
        });

        L.marker([p.latitude, p.longitude], { icon: markerIcon })
            .addTo(map)
            .bindPopup(`
                <div class="map-popup">
                    <h4>${p.name || 'Unnamed Parking'}</h4>
                    <p>${p.availableSlots} slots available</p>
                    <p><strong>$${p.pricePerHour}/hr</strong></p>
                    <button class="btn-premium btn-sm" onclick="showDetails('${p.overpassId}')">Book Now</button>
                </div>
            `);
    });
}

function showDetails(id) {
    window.location.href = `parking-details.html?id=${id}`;
}

// Support for Enter key in search
document.getElementById("placeSearch")?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") searchPlace();
});