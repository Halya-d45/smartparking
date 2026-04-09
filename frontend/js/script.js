/* eslint-disable no-undef */
/* global L, map, showToast, bootstrap */
// Initialize Map
var map;
var markers = [];

// Geolocation and caching state
let lastKnownLocation = null;
let locationCacheExpiry = 5 * 60 * 1000; // 5 minutes
let isLocating = false;
let locationTimeout = null;

function initMap() {
    map = L.map('map').setView([16.3067, 80.4365], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(map);
    console.log("Map Initialized with Leaflet");
    
    // Add city labels
    addCityLabels();
    
    // Load cached location on map init
    loadCachedLocation();
}

function addCityLabels() {
    const cities = [
        { name: 'Mallavaram', lat: 16.35, lng: 80.45 },
        { name: 'Adavi Takkelapadu', lat: 16.32, lng: 80.42 },
        { name: 'Gorantla', lat: 16.28, lng: 80.43 },
        { name: 'Venigandla', lat: 16.30, lng: 80.44 },
        { name: 'Gollapalem', lat: 16.31, lng: 80.43 }
    ];

    cities.forEach(city => {
        L.marker([city.lat, city.lng], {
            icon: L.divIcon({
                className: 'city-label',
                html: `<div class="city-label-text">${city.name}</div>`,
                iconSize: [100, 20],
                iconAnchor: [50, 10]
            })
        }).addTo(map);
    });
}

// Global state
let currentSavedIds = new Set();
let lastFetchedParking = []; // Global cache for current results
let searchMarker = null; // Marker for searched location

async function initDashboard() {
    initMap();
    await loadSavedIds();
    updateRecentHubs();
}

// Cache management functions
function loadCachedLocation() {
    try {
        const cached = localStorage.getItem('lastLocation');
        if (cached) {
            const locationData = JSON.parse(cached);
            const now = Date.now();
            
            if (now - locationData.timestamp < locationCacheExpiry) {
                lastKnownLocation = locationData;
                console.log('Loaded cached location:', locationData);
                return locationData;
            } else {
                localStorage.removeItem('lastLocation');
            }
        }
    } catch (err) {
        console.error('Error loading cached location:', err);
    }
    return null;
}

function saveLocationToCache(lat, lon, city = 'Current Location') {
    const locationData = {
        latitude: lat,
        longitude: lon,
        city: city,
        timestamp: Date.now()
    };
    lastKnownLocation = locationData;
    localStorage.setItem('lastLocation', JSON.stringify(locationData));
}

// Optimized geolocation with timeout and error handling
function getCurrentLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by this browser'));
            return;
        }

        // Check for cached location first
        const cached = loadCachedLocation();
        if (cached) {
            resolve(cached);
            return;
        }

        const options = {
            enableHighAccuracy: true,
            timeout: 10000, // 10 seconds timeout
            maximumAge: 5 * 60 * 1000 // Accept cached position up to 5 minutes old
        };

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                saveLocationToCache(latitude, longitude);
                resolve({ latitude, longitude, city: 'Current Location' });
            },
            (error) => {
                let errorMessage = 'Unable to retrieve your location';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'Location access denied. Please enable location permissions.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Location information is unavailable.';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'Location request timed out. Please try again.';
                        break;
                }
                reject(new Error(errorMessage));
            },
            options
        );
    });
}

async function locateNow() {
    showToast('Locating...', 'info'); // Provide immediate feedback

    // 1. Browser Geolocation API
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;

            try {
                // 2. Update map view
                map.setView([latitude, longitude], 14);

                // 3. Fetch parking hubs nearby
                await findParking(latitude, longitude);

                // 4. Success feedback
                showToast('Location found successfully!', 'success');
                
                // Cache the location for next time
                localStorage.setItem('last_lat', latitude);
                localStorage.setItem('last_lng', longitude);

            } catch (error) {
                console.error('Error updating map/parking:', error);
                showToast('Failed to load nearby parking.', 'error');
            }
        },
        (error) => {
            console.error('Location error:', error);
            
            // 5. Fallback to cached location if GPS fails
            const cachedLat = localStorage.getItem('last_lat');
            const cachedLng = localStorage.getItem('last_lng');

            if (cachedLat && cachedLng) {
                showToast('Using last known location', 'warning');
                map.setView([cachedLat, cachedLng], 14);
                findParking(cachedLat, cachedLng);
            } else {
                showToast('Location access denied or unavailable.', 'error');
            }
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
}
      /* global L, map, showToast, loadCachedLocation, findParking, showLocationFallback */

async function locateNow() {
    // 1. Initial State Check
    let isLocating = true;
    const locateBtn = document.getElementById('locate-btn'); // Ensure this ID exists in HTML
    const originalText = locateBtn ? locateBtn.innerHTML : 'Locate Now';

    if (locateBtn) {
        locateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Locating...';
        locateBtn.disabled = true;
    }

    let locationTimeout = null;

    try {
        // 2. Setup Location Promises (The "Race" Strategy)
        const locationPromise = new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                (pos) => resolve({
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude,
                    city: 'Nearby' // Fallback city name
                }),
                (err) => reject(new Error("Permission denied or GPS off")),
                { enableHighAccuracy: true, timeout: 5000 }
            );
        });

        const timeoutPromise = new Promise((_, reject) => {
            locationTimeout = setTimeout(() => {
                reject(new Error("Location request timed out"));
            }, 6000); // 6 second total timeout
        });

        // 3. The Race
        const location = await Promise.race([locationPromise, timeoutPromise]);
        
        // 4. Success Path
        if (locationTimeout) {
            clearTimeout(locationTimeout);
            locationTimeout = null;
        }
        
        // Update map and find parking
        map.setView([location.latitude, location.longitude], 14);
        await findParking(location.latitude, location.longitude, location.city);
        
        showToast('Location found successfully!', 'success');
        
    } catch (error) {
        // 5. Error Path
        console.error('Location error:', error);
        
        const cached = loadCachedLocation();
        if (cached) {
            showToast('Using last known location', 'warning');
            map.setView([cached.latitude, cached.longitude], 14);
            await findParking(cached.latitude, cached.longitude, cached.city);
        } else {
            showToast(error.message || 'Could not find location', 'error');
            if (typeof showLocationFallback === 'function') {
                showLocationFallback();
            }
        }
    } finally {
        // 6. Cleanup Path (Always runs)
        isLocating = false;
        if (locateBtn) {
            locateBtn.innerHTML = originalText;
            locateBtn.disabled = false;
        }
    }
}

// Fallback UI for location errors
function showLocationFallback() {
    const listContainer = document.getElementById("parkingList");
    listContainer.innerHTML = `
        <div class="location-fallback">
            <i class="fas fa-map-marker-alt"></i>
            <h4>Location Access Needed</h4>
            <p>Please enable location permissions or search for a place manually.</p>
            <button class="btn-premium btn-sm" onclick="requestLocationPermission()">
                <i class="fas fa-location-arrow"></i> Try Again
            </button>
        </div>
    `;
}

// Request location permission explicitly
function requestLocationPermission() {
    if (navigator.permissions) {
        navigator.permissions.query({ name: 'geolocation' }).then(result => {
            if (result.state === 'denied') {
                showToast('Location permission denied. Please enable it in browser settings.', 'error');
            } else {
                locateNow();
            }
        });
    } else {
        locateNow();
    }
}

// Toast notification system
function showToast(message, type = 'info') {
    // Remove existing toasts
    const existingToasts = document.querySelectorAll('.toast-notification');
    existingToasts.forEach(toast => toast.remove());
    
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        ${message}
    `;
    
    document.body.appendChild(toast);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.remove();
        }
    }, 3000);
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
    let place = document.getElementById("placeSearch").value.trim();
    if (!place) {
        // If no place entered, use geolocation
        await locateNow();
        return;
    }

    const listContainer = document.getElementById("parkingList");
    const searchBtn = document.querySelector('button[onclick="searchPlace()"]') ||
                     document.querySelector('.btn-glow');

    // Show loading state
    listContainer.innerHTML = '<div class="loader"><i class="fas fa-search"></i>Searching for location...</div>';
    if (searchBtn) {
        searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Searching...';
        searchBtn.disabled = true;
    }

    try {
        // Enhanced geocoding with better parameters
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

        // Use more specific search parameters for better accuracy
        const searchParams = new URLSearchParams({
            format: 'json',
            q: place,
            limit: 5, // Get multiple results to choose the best one
            addressdetails: 1,
            extratags: 1,
            namedetails: 1
        });

        // Add country bias if possible (you can make this configurable)
        // searchParams.append('countrycodes', 'IN'); // For India bias

        let response = await fetch(
            `https://nominatim.openstreetmap.org/search?${searchParams}`,
            {
                signal: controller.signal,
                headers: {
                    'User-Agent': 'SmartParking/1.0' // Good practice for Nominatim
                }
            }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`Geocoding service error: ${response.status}`);
        }

        let data = await response.json();

        if (data && data.length > 0) {
            // Select the best result - prefer places with higher importance or more complete addresses
            let bestResult = data[0];

            // If we have multiple results, try to find the most relevant one
            if (data.length > 1) {
                // Prefer results with higher importance scores
                const sortedByImportance = data.sort((a, b) => (b.importance || 0) - (a.importance || 0));
                bestResult = sortedByImportance[0];

                // Alternatively, prefer results that match the search query more closely
                const exactMatch = data.find(result =>
                    result.display_name?.toLowerCase().includes(place.toLowerCase()) ||
                    result.name?.toLowerCase() === place.toLowerCase()
                );
                if (exactMatch) bestResult = exactMatch;
            }

            const lat = parseFloat(bestResult.lat);
            const lon = parseFloat(bestResult.lon);
            const displayName = bestResult.display_name || bestResult.name || place;

            // Remove existing search marker
            if (searchMarker) {
                map.removeLayer(searchMarker);
            }

            // Create and add search marker
            searchMarker = L.marker([lat, lon], {
                icon: L.divIcon({
                    className: 'search-marker',
                    html: '<div class="search-marker-icon"><i class="fas fa-map-marker-alt"></i></div>',
                    iconSize: [40, 40],
                    iconAnchor: [20, 40]
                })
            }).addTo(map);

            // Add popup to search marker
            searchMarker.bindPopup(`
                <div class="search-popup glass-card" style="padding: 12px; color: black; max-width: 200px;">
                    <h4 style="margin-bottom: 5px; font-size: 16px;"><i class="fas fa-search-location"></i> ${place}</h4>
                    <p style="font-size: 12px; margin-bottom: 8px; color: #666;">${displayName}</p>
                    <div style="font-size: 11px; color: #888;">
                        <i class="fas fa-map-marker-alt"></i> ${lat.toFixed(6)}, ${lon.toFixed(6)}
                    </div>
                </div>
            `).openPopup();

            // Center map on searched location with appropriate zoom
            map.setView([lat, lon], 15); // Higher zoom for searched locations

            // Save to cache
            saveLocationToCache(lat, lon, displayName);

            // Find parking spots around this location
            await findParking(lat, lon, displayName);

            // Success feedback
            showToast(`Found location: ${displayName}`, 'success');

        } else {
            // No results found
            listContainer.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-search-minus"></i>
                    <h4>Location Not Found</h4>
                    <p>"${place}" could not be found. Try:</p>
                    <ul style="text-align: left; font-size: 13px; margin-top: 10px;">
                        <li>• More specific location (e.g., "Vijayawada, Andhra Pradesh")</li>
                        <li>• Check spelling</li>
                        <li>• Use nearby landmarks</li>
                    </ul>
                </div>
            `;
            showToast('Location not found. Please try a different search.', 'warning');
        }

    } catch (err) {
        console.error('Search error:', err);

        let errorMessage = 'Search failed. Please try again.';
        let errorType = 'error';

        if (err.name === 'AbortError') {
            errorMessage = 'Search timed out. Please check your connection and try again.';
        } else if (err.message.includes('Geocoding service error')) {
            errorMessage = 'Geocoding service is temporarily unavailable.';
        }

        listContainer.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h4>Search Error</h4>
                <p>${errorMessage}</p>
                <button class="btn-premium btn-sm" onclick="searchPlace()" style="margin-top: 10px;">
                    <i class="fas fa-redo"></i> Try Again
                </button>
            </div>
        `;

        showToast(errorMessage, errorType);
    } finally {
        // Reset button state
        if (searchBtn) {
            searchBtn.innerHTML = 'Search';
            searchBtn.disabled = false;
        }
    }
}

async function findParking(lat, lon, city) {
    const listContainer = document.getElementById("parkingList");
    const cacheKey = `parking_${lat.toFixed(3)}_${lon.toFixed(3)}`;
    const cachedData = localStorage.getItem(cacheKey);
    const now = Date.now();
    
    // Check cache first (cache for 10 minutes)
    if (cachedData) {
        try {
            const { data, timestamp } = JSON.parse(cachedData);
            if (now - timestamp < 10 * 60 * 1000) {
                console.log('Using cached parking data');
                lastFetchedParking = data;
                renderParking(data);
                return;
            }
        } catch (err) {
            console.error('Cache parse error:', err);
        }
    }

    listContainer.innerHTML = '<div class="loader"><i class="fas fa-search"></i> Scanning for parking slots...</div>';

    // Optimized Overpass query with better filtering
    const radius = 3000; // 3km radius for better performance
    let query = `[out:json][timeout:25];(
        node["amenity"="parking"](around:${radius},${lat},${lon});
        way["amenity"="parking"](around:${radius},${lat},${lon});
        relation["amenity"="parking"](around:${radius},${lat},${lon});
        node["parking"](around:${radius},${lat},${lon});
    );out center;`;

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        let response = await fetch(
            `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`,
            { signal: controller.signal }
        );
        
        clearTimeout(timeoutId);
        let data = await response.json();

        if (!data.elements || data.elements.length === 0) {
            listContainer.innerHTML = '<div class="empty-state-v2"><i class="fas fa-parking"></i><p>No parking slots found in this area.</p><small>Try searching a different location.</small></div>';
            return;
        }

        // Sync with backend with error handling
        let syncRes;
        try {
            syncRes = await fetch(`${CONFIG.API_BASE}/parking/sync`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ elements: data.elements, city: city })
            });
        } catch (syncErr) {
            console.warn('Backend sync failed, using raw data:', syncErr);
            // Fallback: create basic parking objects from Overpass data
            lastFetchedParking = data.elements.map((el, index) => ({
                overpassId: el.id || `temp_${index}`,
                name: el.tags?.name || 'Unnamed Parking',
                location: city,
                latitude: el.lat || el.center?.lat,
                longitude: el.lon || el.center?.lon,
                availableSlots: Math.floor(Math.random() * 20) + 5, // Mock data
                totalSlots: Math.floor(Math.random() * 50) + 20,
                pricePerHour: (Math.random() * 5 + 1).toFixed(2)
            }));
            renderParking(lastFetchedParking);
            return;
        }

        if (!syncRes.ok) {
            throw new Error(`Backend sync failed: ${syncRes.status}`);
        }

        lastFetchedParking = await syncRes.json();
        
        // Cache the results
        localStorage.setItem(cacheKey, JSON.stringify({
            data: lastFetchedParking,
            timestamp: now
        }));

        renderParking(lastFetchedParking);
        
    } catch (err) {
        console.error('Parking search error:', err);
        if (err.name === 'AbortError') {
            listContainer.innerHTML = '<div class="error-state"><i class="fas fa-clock"></i><p>Search timed out. Please try again.</p></div>';
        } else {
            listContainer.innerHTML = '<div class="error-state"><i class="fas fa-exclamation-triangle"></i><p>Failed to fetch parking data. Please check your connection.</p></div>';
        }
    }
}

function renderParking(parkingLots) {
    const listContainer = document.getElementById("parkingList");
    const countLabel = document.getElementById("hubCount");
    listContainer.innerHTML = "";

    if (countLabel) countLabel.innerText = `${parkingLots.length} Hubs Detected`;

    // Clear existing markers
    if (markers.length > 0) {
        markers.forEach(m => m.remove());
        markers = [];
    }

    if (parkingLots.length === 0) {
        listContainer.innerHTML = `
            <div class="empty-state-modern">
                <div class="empty-icon">
                    <i class="fas fa-parking"></i>
                </div>
                <h4>No Parking Hubs Found</h4>
                <p>Try searching for a different location or expanding your search area.</p>
            </div>
        `;
        return;
    }

    parkingLots.forEach(p => {
        const isSaved = currentSavedIds.has(p.overpassId);
        const availabilityPercent = Math.min(100, (p.availableSlots / p.totalSlots) * 100);

        const item = document.createElement("div");
        item.className = "parking-card-modern";
        item.innerHTML = `
            <div class="parking-card-header">
                <h4 class="parking-name">${p.name || 'Unnamed Parking Hub'}</h4>
                <button class="save-btn-modern ${isSaved ? 'active' : ''}" data-id="${p.overpassId}" onclick="handleSaveClick(this)">
                    <i class="${isSaved ? 'fas' : 'far'} fa-heart"></i>
                </button>
            </div>
            <div class="parking-address">
                <i class="fas fa-map-marker-alt"></i>
                <span>${p.location || 'Location not specified'}</span>
            </div>
            <div class="parking-details">
                <div class="price-info">$${p.pricePerHour}/hr</div>
                <div class="availability-info">
                    <div class="availability-text">${p.availableSlots} available</div>
                    <div class="availability-number">${p.totalSlots} total</div>
                </div>
            </div>
            <div class="availability-bar">
                <div class="availability-fill" style="width: ${availabilityPercent}%"></div>
            </div>
            <button class="select-hub-btn" onclick="showDetails('${p.overpassId}')">
                <span>Select Hub</span>
                <i class="fas fa-arrow-right"></i>
            </button>
        `;
        listContainer.appendChild(item);

        // Enhanced marker for Leaflet with custom icon
        const customIcon = L.divIcon({
            className: 'custom-marker',
            html: `
                <div class="marker-pin">
                    <div class="marker-icon">
                        <i class="fas fa-parking"></i>
                    </div>
                    <div class="marker-pulse"></div>
                </div>
            `,
            iconSize: [40, 40],
            iconAnchor: [20, 40]
        });

        const marker = L.marker([p.latitude, p.longitude], { icon: customIcon })
            .addTo(map)
            .bindPopup(`
                <div class="map-popup-modern">
                    <div class="popup-header">
                        <h4>${p.name || 'Unnamed Parking'}</h4>
                        <div class="popup-price">$${p.pricePerHour}/hr</div>
                    </div>
                    <div class="popup-details">
                        <div class="popup-availability">
                            <i class="fas fa-car"></i>
                            <span>${p.availableSlots} of ${p.totalSlots} slots free</span>
                        </div>
                        <div class="popup-address">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${p.location || 'Location not available'}</span>
                        </div>
                    </div>
                    <button class="popup-book-btn" onclick="showDetails('${p.overpassId}')">
                        Book Now
                    </button>
                </div>
            `);
        markers.push(marker);
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

// Handle search key press (for HTML onkeypress attribute)
function handleSearchKeyPress(event) {
    if (event.key === "Enter") {
        searchPlace();
    }
}

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
        <div class="recent-header">
            <h5>Recent Hubs</h5>
            <div class="recent-badge">${recent.length}</div>
        </div>
        <div class="recent-list">
            ${recent.map(r => `
                <div class="recent-item" onclick="showDetails('${r.id}')">
                    <div class="recent-icon">
                        <i class="fas fa-history"></i>
                    </div>
                    <div class="recent-content">
                        <div class="recent-name">${r.name}</div>
                        <div class="recent-time">Recently visited</div>
                    </div>
                    <div class="recent-arrow">
                        <i class="fas fa-chevron-right"></i>
                    </div>
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