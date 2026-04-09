import React, { useState, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Custom hook for location search
const useLocationSearch = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const searchLocation = useCallback(async (query) => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setSearchResults([]);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const searchParams = new URLSearchParams({
        format: 'json',
        q: query.trim(),
        limit: 5,
        addressdetails: 1,
        extratags: 1,
        namedetails: 1
      });

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?${searchParams}`,
        {
          signal: controller.signal,
          headers: {
            'User-Agent': 'SmartParking/1.0'
          }
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Geocoding service error: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.length > 0) {
        // Sort by importance and relevance
        const sortedResults = data.sort((a, b) => {
          // Prefer higher importance
          const importanceDiff = (b.importance || 0) - (a.importance || 0);
          if (importanceDiff !== 0) return importanceDiff;

          // Prefer exact matches
          const aExact = a.display_name?.toLowerCase().includes(query.toLowerCase()) ? 1 : 0;
          const bExact = b.display_name?.toLowerCase().includes(query.toLowerCase()) ? 1 : 0;
          return bExact - aExact;
        });

        setSearchResults(sortedResults);
      } else {
        setError('No locations found. Try a different search term.');
      }
    } catch (err) {
      console.error('Search error:', err);
      if (err.name === 'AbortError') {
        setError('Search timed out. Please check your connection.');
      } else {
        setError('Failed to search location. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const selectLocation = useCallback((location) => {
    setSelectedLocation({
      lat: parseFloat(location.lat),
      lng: parseFloat(location.lon),
      name: location.display_name || location.name,
      details: location
    });
    setSearchResults([]);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedLocation(null);
    setSearchResults([]);
    setError(null);
  }, []);

  return {
    searchResults,
    loading,
    error,
    selectedLocation,
    searchLocation,
    selectLocation,
    clearSelection
  };
};

// Search marker component
const SearchMarker = ({ position, name, details }) => {
  const map = useMap();

  React.useEffect(() => {
    if (position) {
      map.setView(position, 15);
    }
  }, [position, map]);

  if (!position) return null;

  return (
    <Marker
      position={position}
      icon={L.divIcon({
        className: 'search-marker',
        html: '<div class="search-marker-icon"><i class="fas fa-map-marker-alt"></i></div>',
        iconSize: [40, 40],
        iconAnchor: [20, 40]
      })}
    >
      <Popup>
        <div className="search-popup">
          <h4><i className="fas fa-search-location"></i> {name}</h4>
          <p style={{ fontSize: '12px', margin: '5px 0', color: '#666' }}>
            {details?.address?.city || details?.address?.town || 'Location'}
          </p>
          <div style={{ fontSize: '11px', color: '#888' }}>
            <i className="fas fa-map-marker-alt"></i> {position[0].toFixed(6)}, {position[1].toFixed(6)}
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

// Main search component
const LocationSearch = ({ onLocationSelect, onParkingSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  const {
    searchResults,
    loading,
    error,
    selectedLocation,
    searchLocation,
    selectLocation,
    clearSelection
  } = useLocationSearch();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    await searchLocation(searchQuery);
    setShowResults(true);
  };

  const handleLocationSelect = (location) => {
    selectLocation(location);
    setShowResults(false);
    setSearchQuery(location.display_name || location.name);

    // Notify parent components
    if (onLocationSelect) {
      onLocationSelect({
        lat: parseFloat(location.lat),
        lng: parseFloat(location.lon),
        name: location.display_name || location.name
      });
    }

    // Trigger parking search
    if (onParkingSearch) {
      onParkingSearch(parseFloat(location.lat), parseFloat(location.lon), location.display_name || location.name);
    }
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
    if (error) setError(null);
  };

  const handleInputFocus = () => {
    setShowResults(true);
  };

  const handleClear = () => {
    setSearchQuery('');
    clearSelection();
    setShowResults(false);
    searchRef.current?.focus();
  };

  return (
    <div className="location-search-container">
      <form onSubmit={handleSearch} className="search-form">
        <div className="search-input-wrapper">
          <i className="fas fa-search search-icon"></i>
          <input
            ref={searchRef}
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            placeholder="Search for a location (e.g., Vijayawada, Hyderabad)"
            className="search-input"
            autoComplete="off"
          />
          {searchQuery && (
            <button type="button" onClick={handleClear} className="clear-button">
              <i className="fas fa-times"></i>
            </button>
          )}
          <button type="submit" className="search-button" disabled={loading}>
            {loading ? (
              <i className="fas fa-spinner fa-spin"></i>
            ) : (
              <i className="fas fa-search"></i>
            )}
          </button>
        </div>
      </form>

      {showResults && (searchResults.length > 0 || error) && (
        <div className="search-results-dropdown">
          {loading && (
            <div className="search-loading">
              <i className="fas fa-spinner fa-spin"></i> Searching...
            </div>
          )}

          {error && (
            <div className="search-error">
              <i className="fas fa-exclamation-triangle"></i> {error}
            </div>
          )}

          {searchResults.map((result, index) => (
            <div
              key={result.place_id || index}
              className="search-result-item"
              onClick={() => handleLocationSelect(result)}
            >
              <div className="result-icon">
                <i className="fas fa-map-marker-alt"></i>
              </div>
              <div className="result-details">
                <div className="result-name">
                  {result.name || result.display_name.split(',')[0]}
                </div>
                <div className="result-address">
                  {result.display_name}
                </div>
                {result.importance && (
                  <div className="result-importance">
                    Relevance: {Math.round(result.importance * 100)}%
                  </div>
                )}
              </div>
            </div>
          ))}

          {searchResults.length === 0 && !loading && !error && searchQuery && (
            <div className="no-results">
              <i className="fas fa-search-minus"></i>
              <p>No locations found for "{searchQuery}"</p>
              <small>Try: City names, landmarks, or more specific locations</small>
            </div>
          )}
        </div>
      )}

      {selectedLocation && (
        <SearchMarker
          position={[selectedLocation.lat, selectedLocation.lng]}
          name={selectedLocation.name}
          details={selectedLocation.details}
        />
      )}
    </div>
  );
};

// Optimized Map Component with Search
const ParkingMapWithSearch = ({ onParkingData }) => {
  const [parkingSpots, setParkingSpots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState([16.3067, 80.4365]);

  const handleLocationSelect = useCallback((location) => {
    setMapCenter([location.lat, location.lng]);
  }, []);

  const handleParkingSearch = useCallback(async (lat, lng, locationName) => {
    setLoading(true);
    try {
      // Your parking search logic here
      // This is a placeholder - replace with your actual parking API call
      const mockParkingData = [
        {
          id: 1,
          name: 'Central Parking',
          lat: lat + 0.001,
          lng: lng + 0.001,
          available: 15,
          total: 50
        },
        {
          id: 2,
          name: 'Downtown Parking',
          lat: lat - 0.001,
          lng: lng - 0.001,
          available: 8,
          total: 30
        }
      ];

      setParkingSpots(mockParkingData);
      if (onParkingData) {
        onParkingData(mockParkingData);
      }
    } catch (error) {
      console.error('Parking search error:', error);
    } finally {
      setLoading(false);
    }
  }, [onParkingData]);

  return (
    <div className="map-container">
      <LocationSearch
        onLocationSelect={handleLocationSelect}
        onParkingSearch={handleParkingSearch}
      />

      <MapContainer center={mapCenter} zoom={13} style={{ height: '500px' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© OpenStreetMap'
        />

        {parkingSpots.map(spot => (
          <Marker key={spot.id} position={[spot.lat, spot.lng]}>
            <Popup>
              <div className="parking-popup">
                <h4>{spot.name}</h4>
                <p>{spot.available} of {spot.total} spots available</p>
                <button className="btn-book">Book Now</button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {loading && (
        <div className="map-loading-overlay">
          <div className="loader">
            <i className="fas fa-search"></i> Finding parking spots...
          </div>
        </div>
      )}
    </div>
  );
};

export default ParkingMapWithSearch;