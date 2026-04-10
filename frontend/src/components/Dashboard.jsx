import React, { useState, useEffect, useRef } from 'react';
import SearchInput from './SearchInput';

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('Map View');
    const [stats] = useState({ activeBookings: 124, totalSlots: 500 });
    const [isSearching, setIsSearching] = useState(false);
    const [hasResults, setHasResults] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedHub, setSelectedHub] = useState(null);
    const mapRef = useRef(null);
    const leafletMap = useRef(null);

    const NavItem = ({ label, icon }) => (
        <button
            onClick={() => setActiveTab(label)}
            className={`nav-link ${activeTab === label ? 'active' : ''}`}
        >
            <i className={`fas ${icon}`}></i>
            <span>{label}</span>
        </button>
    );

    // Initialize Leaflet Map
    useEffect(() => {
        if (activeTab === 'Map View' && mapRef.current && !leafletMap.current) {
            const L = window.L;
            if (!L) return;

            leafletMap.current = L.map(mapRef.current, {
                zoomControl: false,
                attributionControl: false
            }).setView([16.3067, 80.4365], 13); // Default to Guntur as per screenshot

            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                maxZoom: 19
            }).addTo(leafletMap.current);
        }

        return () => {
            if (leafletMap.current) {
                leafletMap.current.remove();
                leafletMap.current = null;
            }
        };
    }, [activeTab]);

    const MapViewContent = () => {
        const handleSearch = (q) => {
            setSearchQuery(q);
            setIsSearching(true);
            setHasResults(false);
            
            setTimeout(() => {
                setIsSearching(false);
                setHasResults(true);
                
                if (leafletMap.current) {
                    const L = window.L;
                    // Mock coordinates around Guntur
                    const hubs = [
                        { lat: 16.3067, lng: 80.4365, id: 1, name: 'Central Mall Parking', price: '$2.50/hr', slots: 24, total: 50, addr: 'Downtown Area, Main Street' },
                        { lat: 16.3167, lng: 80.4465, id: 2, name: 'Railway Station Hub', price: '$1.50/hr', slots: 10, total: 30, addr: 'Station Rd, Gate 1' },
                        { lat: 16.2967, lng: 80.4265, id: 3, name: 'Market Square S-2', price: '$2.00/hr', slots: 0, total: 20, addr: 'Guntur South Market' }
                    ];

                    setSelectedHub(hubs[0]);

                    hubs.forEach(h => {
                        const icon = L.divIcon({
                            className: 'custom-div-icon',
                            html: `<div class="marker-pin-wrapper">
                                    <div class="marker-pin">
                                        <i class="fas fa-parking"></i>
                                    </div>
                                    <div class="marker-pulse"></div>
                                   </div>`,
                            iconSize: [40, 40],
                            iconAnchor: [20, 20]
                        });

                        const marker = L.marker([h.lat, h.lng], { icon }).addTo(leafletMap.current);
                        marker.on('click', () => setSelectedHub(h));
                        marker.bindPopup(`<b>${h.name}</b>`);
                    });

                    leafletMap.current.flyTo([hubs[0].lat, hubs[0].lng], 14);
                }
            }, 1500);
        };

        return (
            <div className="animate-slide-up flex flex-col h-[calc(100vh-140px)]">
                <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
                    {/* LEFT: Map Area */}
                    <div className="flex-1 relative bg-white/40 backdrop-blur-sm border border-black/5 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/5">
                        <div ref={mapRef} className="absolute inset-0 z-0 h-full w-full"></div>
                        
                        {/* Overlay when searching */}
                        {isSearching && (
                            <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-md flex flex-col items-center justify-center gap-4">
                                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-blue-600 font-black tracking-tight text-xl">Searching Hubs...</p>
                            </div>
                        )}

                        {/* Search Overlay over Map */}
                        {!hasResults && !isSearching && (
                            <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10 w-full max-w-md">
                                <SearchInput onSearch={handleSearch} />
                            </div>
                        )}

                        {/* Floating Controls */}
                        <div className="absolute top-6 left-6 z-20 flex flex-col gap-2">
                            <button 
                                onClick={() => leafletMap.current?.zoomIn()}
                                className="w-10 h-10 bg-white rounded-xl shadow-xl flex items-center justify-center text-slate-800 hover:bg-slate-50 transition-colors border border-black/5"
                            >
                                <i className="fas fa-plus text-xs"></i>
                            </button>
                            <button 
                                onClick={() => leafletMap.current?.zoomOut()}
                                className="w-10 h-10 bg-white rounded-xl shadow-xl flex items-center justify-center text-slate-800 hover:bg-slate-50 transition-colors border border-black/5"
                            >
                                <i className="fas fa-minus text-xs"></i>
                            </button>
                        </div>
                        <div className="absolute top-6 right-6 z-20 flex flex-col gap-2">
                             <button className="w-10 h-10 bg-slate-800 text-white rounded-xl shadow-xl flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity">
                                <i className="fas fa-crosshairs text-xs"></i>
                            </button>
                            <button className="w-10 h-10 bg-slate-800 text-white rounded-xl shadow-xl flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity">
                                <i className="fas fa-home text-xs"></i>
                            </button>
                        </div>
                    </div>

                    {/* RIGHT: High-Contrast Dark Sidebar */}
                    <div className="w-full lg:w-[400px] bg-[#0f172a] rounded-[2.5rem] p-8 flex flex-col gap-8 shadow-2xl overflow-y-auto custom-scrollbar">
                        {/* Nearby Hubs Header */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="text-blue-500 text-xl">
                                    <i className="fas fa-location-dot"></i>
                                </div>
                                <h3 className="text-white font-extrabold text-lg">Nearby Hubs</h3>
                            </div>
                            <span className="bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-lg shadow-blue-600/20">
                                8 Hubs Detected
                            </span>
                        </div>

                        {/* Recent Hubs List */}
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-gray-400 text-xs font-bold uppercase tracking-widest">Recent Hubs</h4>
                                <span className="text-gray-600 text-[10px] font-bold">3</span>
                            </div>
                            <div className="space-y-3">
                                <div onClick={() => handleSearch('Central Mall')} className="bg-[#1e293b] p-4 rounded-2xl flex items-center justify-between group cursor-pointer hover:bg-[#2e3a4e] transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500 border border-blue-500/20">
                                            <i className="fas fa-clock-rotate-left text-xs"></i>
                                        </div>
                                        <div>
                                            <p className="text-white text-sm font-bold">Central Mall Parking</p>
                                            <p className="text-gray-500 text-[10px] font-medium">Recently visited</p>
                                        </div>
                                    </div>
                                    <i className="fas fa-chevron-right text-gray-600 text-[10px] group-hover:text-blue-500 transition-colors"></i>
                                </div>
                                <div onClick={() => handleSearch('Railway Station')} className="bg-[#1e293b] p-4 rounded-2xl flex items-center justify-between group cursor-pointer hover:bg-[#2e3a4e] transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500 border border-blue-500/20">
                                            <i className="fas fa-clock-rotate-left text-xs"></i>
                                        </div>
                                        <div>
                                            <p className="text-white text-sm font-bold">Railway Station Hub</p>
                                            <p className="text-gray-500 text-[10px] font-medium">Recently visited</p>
                                        </div>
                                    </div>
                                    <i className="fas fa-chevron-right text-gray-600 text-[10px] group-hover:text-blue-500 transition-colors"></i>
                                </div>
                            </div>
                        </div>

                        {/* Selected Hub Detail Card */}
                        {selectedHub ? (
                            <div className="bg-[#1e293b]/50 border border-white/5 rounded-[2rem] p-6 mt-auto animate-slide-up">
                                <div className="flex justify-between items-start mb-6">
                                    <h2 className="text-white text-xl font-black">{selectedHub.name}</h2>
                                    <button className="text-gray-500 hover:text-white transition-colors">
                                        <i className="far fa-heart"></i>
                                    </button>
                                </div>
                                
                                <div className="flex items-start gap-2 mb-8">
                                    <i className="fas fa-location-dot text-blue-500 text-sm mt-0.5"></i>
                                    <p className="text-gray-400 text-xs font-medium leading-relaxed">{selectedHub.addr}</p>
                                </div>

                                <div className="flex items-center justify-between mb-8">
                                    <span className="text-green-500 text-2xl font-black">{selectedHub.price}</span>
                                    <div className="text-right">
                                        <p className="text-gray-500 text-[10px] font-bold uppercase">{selectedHub.slots} available</p>
                                        <p className="text-green-500 text-xs font-black">{selectedHub.total} total</p>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="w-full bg-slate-900 h-2 rounded-full mb-8 overflow-hidden">
                                    <div 
                                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-400" 
                                        style={{ width: `${(selectedHub.slots / selectedHub.total) * 100}%` }}
                                    ></div>
                                </div>

                                <button className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-black text-sm rounded-2xl shadow-xl shadow-blue-900/40 flex items-center justify-center gap-3 transition-all active:scale-95 group">
                                    Select Hub
                                    <i className="fas fa-arrow-right transition-transform group-hover:translate-x-1"></i>
                                </button>
                            </div>
                        ) : (
                            <div className="mt-auto py-10 text-center border-t border-white/5">
                                <p className="text-gray-600 text-xs font-bold uppercase tracking-widest italic">Pick a hub on the map</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const MyBookingsContent = () => (
        <div className="animate-slide-up max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800 mb-1">My <span className="text-primary">Bookings</span></h1>
                    <p className="text-gray-400 font-medium">View and manage your current and past parking reservations.</p>
                </div>
                <div className="flex bg-[#f2ede4] rounded-2xl p-1 gap-1 border border-black/5">
                    <button className="px-6 py-2 bg-white rounded-xl shadow-sm text-sm font-bold text-slate-800">All</button>
                    <button className="px-6 py-2 text-sm font-bold text-gray-500 hover:text-slate-800 transition-colors">Upcoming</button>
                    <button className="px-6 py-2 text-sm font-bold text-gray-500 hover:text-slate-800 transition-colors">History</button>
                </div>
            </div>

            <div className="space-y-4">
                {[
                    { hub: 'Downtown Plaza Hub', addr: '124 Main St, City Center', date: 'Oct 12, 2026', time: '10:00 AM - 02:00 PM', price: '$14.00', status: 'UPCOMING', icon: 'fa-building', slot: 'A-24' },
                    { hub: 'Central Mall Parking', addr: 'Sector 5, Cross Road', date: 'Oct 15, 2026', time: '11:00 AM - 01:00 PM', price: '$08.00', status: 'PENDING', icon: 'fa-shopping-cart', slot: 'C-09' },
                    { hub: 'Railway Station East', addr: 'Station Rd, East Gate', date: 'Sept 28, 2026', time: '09:00 AM - 06:00 PM', price: '$35.00', status: 'COMPLETED', icon: 'fa-train', slot: 'B-12' },
                ].map((booking, i) => (
                    <div key={i} className="bg-white/60 backdrop-blur-xl border border-black/5 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-8 hover:bg-white transition-all duration-300 shadow-sm hover:shadow-xl group border-transparent">
                        <div className="flex items-center gap-8 w-full md:w-auto">
                            <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-2xl ${booking.status === 'COMPLETED' ? 'bg-gray-100 text-gray-400' : 'bg-blue-100 text-blue-600'}`}>
                                <i className={`fas ${booking.icon}`}></i>
                            </div>
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h4 className="font-extrabold text-xl text-slate-900 leading-none">{booking.hub}</h4>
                                    <span className="bg-blue-50 text-blue-600 text-[10px] font-extrabold px-2 py-0.5 rounded-lg border border-blue-100 uppercase tracking-tighter">Slot: {booking.slot}</span>
                                </div>
                                <p className="text-gray-400 font-medium text-sm flex items-center gap-1.5 mb-2">
                                    <i className="fas fa-location-dot text-[10px]"></i> {booking.addr}
                                </p>
                                <div className="flex items-center gap-4">
                                    <p className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                                        <i className="fas fa-calendar text-[10px] text-blue-500"></i> {booking.date}
                                    </p>
                                    <p className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                                        <i className="fas fa-clock text-[10px] text-blue-500"></i> {booking.time}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-10 w-full md:w-auto justify-between md:justify-end">
                            <div className="text-right">
                                <p className="text-2xl font-black text-slate-900 mb-1">{booking.price}</p>
                                <span className={`status-badge ${booking.status === 'COMPLETED' ? 'status-completed' : 'status-upcoming'}`}>
                                    {booking.status}
                                </span>
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                {booking.status !== 'COMPLETED' && (
                                    <button className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all duration-200">
                                        <i className="fas fa-times"></i>
                                    </button>
                                )}
                                <button className="w-12 h-12 bg-gray-50 text-slate-500 rounded-2xl hover:bg-slate-900 hover:text-white transition-all duration-200">
                                    <i className="fas fa-chevron-right"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const ProfileContent = () => (
        <div className="animate-slide-up max-w-5xl mx-auto">
            {/* Profile Header */}
            <div className="profile-section-card mb-12 flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-extrabold text-slate-900 mb-2">Welcome back, Mike.</h1>
                    <p className="text-gray-500 font-medium text-lg">Manage your vehicles, track your bookings, and control your profile.</p>
                </div>
                <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                    <i className="fas fa-user text-3xl"></i>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* My Vehicles */}
                <div className="lg:col-span-2">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-500">
                            <i className="fas fa-car-side"></i>
                        </div>
                        <h2 className="text-xl font-bold text-slate-800">My Vehicles</h2>
                    </div>
                    <div className="space-y-4">
                        <div className="item-card border-transparent">
                            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-500">
                                <i className="fas fa-car"></i>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800">Tesla Model 3</h4>
                                <p className="text-xs text-gray-400 font-bold mt-0.5">CA • 9XDL204</p>
                            </div>
                        </div>
                        <div className="item-card border-transparent">
                            <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-500">
                                <i className="fas fa-truck-pickup"></i>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800">Ford F-150</h4>
                                <p className="text-xs text-gray-400 font-bold mt-0.5">TX • M29 BKW</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Bookings Glance */}
                <div className="lg:col-span-3">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-500">
                            <i className="fas fa-history"></i>
                        </div>
                        <h2 className="text-xl font-bold text-slate-800">Recent Glance</h2>
                    </div>
                    <div className="space-y-4 bg-white/40 backdrop-blur-lg rounded-[2.5rem] p-6 border border-black/5">
                        {[
                            { hub: 'Downtown Plaza Hub', price: '$14.00', status: 'COMPLETED' },
                            { hub: 'Airport Terminal A', price: '$35.00', status: 'UPCOMING' },
                        ].map((booking, i) => (
                            <div key={i} className="flex items-center justify-between p-4 hover:bg-white/60 rounded-3xl transition-all duration-200">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm border border-black/5">
                                        <i className="fas fa-building text-xs"></i>
                                    </div>
                                    <h5 className="font-bold text-slate-800">{booking.hub}</h5>
                                </div>
                                <div className="text-right">
                                    <p className="font-extrabold text-slate-800">{booking.price}</p>
                                    <span className={`text-[10px] font-black ${booking.status === 'COMPLETED' ? 'text-green-500' : 'text-blue-500'}`}>
                                        {booking.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                        <button onClick={() => setActiveTab('My Bookings')} className="w-full py-3 mt-2 text-blue-500 font-bold text-sm bg-blue-50 hover:bg-blue-100 rounded-2xl transition-all">
                            View All Bookings
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const SavedSlotsContent = () => (
        <div className="animate-slide-up">
            <h1 className="text-3xl font-extrabold text-slate-800 mb-2">Your <span className="text-primary tracking-tight">Saved Places</span></h1>
            <p className="text-gray-400 font-medium mb-12">Quick access to your most used parking spots.</p>
            
            <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-200 rounded-[2.5rem]">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400 font-medium tracking-tight">Loading your favorites...</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen pb-12">
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/60 backdrop-blur-2xl border-b border-black/5 h-20 flex items-center">
                <div className="max-w-[1600px] mx-auto w-full px-8 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30">
                            <i className="fas fa-parking text-white text-lg"></i>
                        </div>
                        <div>
                            <h1 className="text-lg font-extrabold text-blue-600 leading-tight">Smart Parking</h1>
                            <p className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-gray-400 -mt-1">System</p>
                        </div>
                    </div>

                    <div className="hidden lg:flex items-center bg-[#f0ede4] rounded-full p-1.5 shadow-inner">
                        <NavItem label="Map View" icon="fa-map" />
                        <NavItem label="My Bookings" icon="fa-calendar-alt" />
                        <NavItem label="Saved Slots" icon="fa-heart" />
                        <NavItem label="Payments" icon="fa-credit-card" />
                        <NavItem label="Profile" icon="fa-user" />
                    </div>

                    <div className="flex items-center space-x-6">
                        <button className="relative p-2 text-gray-400 hover:text-slate-800 transition-colors">
                            <i className="fas fa-bell text-xl"></i>
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        <div className="bg-[#1e293b] rounded-full pl-2 pr-4 py-1.5 flex items-center space-x-3 cursor-pointer hover:scale-105 transition-transform duration-200 shadow-xl shadow-slate-900/20">
                            <div className="w-8 h-8 rounded-full bg-slate-400 border border-slate-600 flex items-center justify-center text-slate-800 text-xs font-bold">SM</div>
                            <div className="flex items-center space-x-2">
                                <span className="text-xs font-extrabold text-white">User</span>
                                <i className="fas fa-chevron-down text-[10px] text-gray-400"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="pt-32 px-8 max-w-[1700px] mx-auto">
                {activeTab === 'Map View' && <MapViewContent />}
                {activeTab === 'My Bookings' && <MyBookingsContent />}
                {activeTab === 'Profile' && <ProfileContent />}
                {activeTab === 'Saved Slots' && <SavedSlotsContent />}
                {activeTab === 'Payments' && (
                    <div className="animate-slide-up text-center py-32">
                        <h2 className="text-2xl font-bold text-gray-400 italic">Coming soon: {activeTab} Screen</h2>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;