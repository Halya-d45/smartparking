const CONFIG = {
    // Dynamic API URL based on environment
    API_BASE: window.location.hostname === 'localhost' 
        ? 'http://localhost:5000/api' 
        : window.location.origin + '/api',
    
    // Default Map Settings
    DEFAULT_CENTER: [16.3067, 80.4365], // [lat, lng]
    DEFAULT_ZOOM: 13
};