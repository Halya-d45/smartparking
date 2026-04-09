import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Custom hook for geolocation
const useGeolocation = (options = {}) => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported');
      return;
    }

    setLoading(true);
    setError(null);

    // Check cache first
    const cached = localStorage.getItem('lastLocation');
    if (cached) {
      const locationData = JSON.parse(cached);
      const now = Date.now();
      if (now - locationData.timestamp < 5 * 60 * 1000) { // 5 minutes
        setLocation(locationData);
        setLoading(false);
        return;
      }
    }

    const geoOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 5 * 60 * 1000,
      ...options
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const locationData = {
          latitude,
          longitude,
          city: 'Current Location',
          timestamp: Date.now()
        };
        
        setLocation(locationData);
        localStorage.setItem('lastLocation', JSON.stringify(locationData));
        setLoading(false);
      },
      (err) => {
        let errorMessage = 'Unable to retrieve location';
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = 'Location access denied';
            break;
          case err.POSITION_UNAVAILABLE:
            errorMessage = 'Location unavailable';
            break;
          case err.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        setError(errorMessage);
        setLoading(false);
      },
      geoOptions
    );
  }, [options]);

  return { location, error, loading, getLocation };
};

// Optimized parking data fetching with caching
const useParkingData = (location, radius = 3000) => {
  const [parkingData, setParkingData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!location) return;

    const cacheKey = `parking_${location.latitude.toFixed(3)}_${location.longitude.toFixed(3)}`;
    const cached = localStorage.getItem(cacheKey);
    
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < 10 * 60 * 1000) { // 10 minutes
        setParkingData(data);
        return;
      }
    }

    const fetchParking = async () => {
      setLoading(true);
      setError(null);

      try {
        // Overpass API query
        const query = `[out:json][timeout:25];(
          node["amenity"="parking"](around:${radius},${location.latitude},${location.longitude});
          way["amenity"="parking"](around:${radius},${location.latitude},${location.longitude});
          relation["amenity"="parking"](around:${radius},${location.latitude},${location.longitude});
        );out center;`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        const response = await fetch(
          `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`,
          { signal: controller.signal }
        );
        
        clearTimeout(timeoutId);
        const data = await response.json();

        if (!data.elements?.length) {
          setParkingData([]);
          return;
        }

        // Sync with backend
        const syncResponse = await fetch('/api/parking/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            elements: data.elements, 
            city: location.city 
          })
        });

        if (!syncResponse.ok) throw new Error('Backend sync failed');

        const processedData = await syncResponse.json();
        
        // Cache results
        localStorage.setItem(cacheKey, JSON.stringify({
          data: processedData,
          timestamp: Date.now()
        }));

        setParkingData(processedData);
      } catch (err) {
        if (err.name === 'AbortError') {
          setError('Request timed out');
        } else {
          setError('Failed to fetch parking data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchParking();
  }, [location, radius]);

  return { parkingData, loading, error };
};

// Toast notification component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast toast-${type}`}>
      <i className={`fas fa-${type === 'success' ? 'check-circle' : 
                           type === 'error' ? 'exclamation-circle' : 'info-circle'}`}></i>
      {message}
    </div>
  );
};

// Main Map Component
const ParkingMap = () => {
  const [toasts, setToasts] = useState([]);
  const { location, error: locationError, loading: locationLoading, getLocation } = useGeolocation();
  const { parkingData, loading: parkingLoading, error: parkingError } = useParkingData(location);
  const [mapCenter, setMapCenter] = useState([16.3067, 80.4365]);

  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const handleLocateMe = async () => {
    try {
      await getLocation();
      addToast('Location found successfully!', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  useEffect(() => {
    if (location) {
      setMapCenter([location.latitude, location.longitude]);
    }
  }, [location]);

  useEffect(() => {
    if (locationError) addToast(locationError, 'error');
  }, [locationError]);

  useEffect(() => {
    if (parkingError) addToast(parkingError, 'error');
  }, [parkingError]);

  return (
    <div className="map-container">
      <div className="map-controls">
        <button 
          className="btn-locate" 
          onClick={handleLocateMe}
          disabled={locationLoading}
        >
          {locationLoading ? (
            <>
              <i className="fas fa-spinner fa-spin"></i> Locating...
            </>
          ) : (
            <>
              <i className="fas fa-location-arrow"></i> Locate Me
            </>
          )}
        </button>
      </div>

      <MapContainer center={mapCenter} zoom={13} style={{ height: '500px' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© OpenStreetMap'
        />
        
        {parkingData.map(parking => (
          <Marker 
            key={parking.id} 
            position={[parking.latitude, parking.longitude]}
          >
            <Popup>
              <div className="map-popup">
                <h4>{parking.name}</h4>
                <p>{parking.availableSlots} slots available</p>
                <button className="btn-book">Book Now</button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {parkingLoading && (
        <div className="loading-overlay">
          <div className="loader">
            <i className="fas fa-search"></i>
            Finding parking spots...
          </div>
        </div>
      )}

      {toasts.map(toast => (
        <Toast 
          key={toast.id}
          message={toast.message} 
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

export default ParkingMap;