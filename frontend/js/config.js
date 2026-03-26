const CONFIG = {
    // Dynamic API URL based on environment
    API_BASE: window.location.hostname === 'localhost' 
        ? 'http://localhost:5000/api' 
        : 'https://backend-api-uhdp.onrender.com/api',
    
    // Default Map Settings
    MAP_STYLE: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    DEFAULT_CENTER: [16.3067, 80.4365],
    DEFAULT_ZOOM: 13
};