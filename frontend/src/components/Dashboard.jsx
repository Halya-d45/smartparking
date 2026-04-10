import React, { useState } from 'react';
import SearchInput from './SearchInput';

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('Map View');
    const [stats] = useState({ activeBookings: 124, totalSlots: 500 });
    const [isSearching, setIsSearching] = useState(false);
    const [hasResults, setHasResults] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const NavItem = ({ label, icon }) => (
        <button
            onClick={() => setActiveTab(label)}
            className={`nav-link ${activeTab === label ? 'active' : ''}`}
        >
            <i className={`fas ${icon}`}></i>
            <span>{label}</span>
        </button>
    );

    const MapViewContent = () => {
        const handleSearch = (q) => {
            setSearchQuery(q);
            setIsSearching(true);
            setHasResults(false);
            
            // Simulate API logic to find slots
            setTimeout(() => {
                setIsSearching(false);
                setHasResults(true);
            }, 1800);
        };

        const parkingHubs = [
            { id: 1, name: 'Premium Hub Alpha', price: '$5.00/hr', slots: 12, distance: '0.2 km', rating: 4.8 },
            { id: 2, name: 'City Center Parking', price: '$3.50/hr', slots: 8, distance: '0.8 km', rating: 4.5 },
            { id: 3, name: 'Galleria Mall S-1', price: '$4.00/hr', slots: 0, distance: '1.2 km', rating: 4.2 },
        ];

        return (
            <div className="animate-slide-up">
                <div className="flex flex-col lg:flex-row gap-8 mb-8">
                    {/* Search Sidebar */}
                    <div className="w-full lg:w-1/3 flex flex-col gap-6">
                        <div className="stats-card !min-h-0 py-6">
                            <h3 className="stats-card-title !mb-4">Search Location</h3>
                            <SearchInput onSearch={handleSearch} />
                        </div>

                        <div className="stats-card !min-h-0 py-6 overflow-hidden">
                            <h3 className="stats-card-title !mb-4">
                                {hasResults ? `Parking in ${searchQuery}` : 'Quick Stats'}
                            </h3>
                            
                            {hasResults ? (
                                <div className="space-y-4 animate-slide-up">
                                    {parkingHubs.map(hub => (
                                        <div key={hub.id} className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${hub.slots > 0 ? 'bg-white border-blue-100 shadow-sm hover:shadow-lg hover:shadow-blue-500/5' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                                            <div className="flex justify-between items-start mb-2">
                                                <h5 className="font-bold text-slate-800 text-sm">{hub.name}</h5>
                                                <span className="text-xs font-black text-blue-600">{hub.price}</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${hub.slots > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                                    {hub.slots > 0 ? `${hub.slots} Slots Available` : 'Fully Booked'}
                                                </span>
                                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{hub.distance}</span>
                                            </div>
                                        </div>
                                    ))}
                                    <button onClick={() => setHasResults(false)} className="w-full py-2 text-xs font-bold text-gray-400 hover:text-slate-800 transition-colors uppercase tracking-widest mt-2 border-t border-gray-100 pt-4">
                                        Clear Results
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div>
                                        <div className="flex justify-between items-end mb-2">
                                            <p className="text-3xl font-extrabold text-slate-800">{stats.totalSlots}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Slots</p>
                                        </div>
                                        <div className="w-full bg-[#e8e2d6] h-1.5 rounded-full overflow-hidden">
                                            <div className="bg-gradient-to-r from-blue-400 to-cyan-400 h-full w-[70%] rounded-full"></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-end">
                                            <p className="text-3xl font-extrabold text-blue-600">{stats.activeBookings}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Available Now</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Interactive Map Area */}
                    <div className="flex-1 relative bg-white/40 backdrop-blur-sm border border-black/5 rounded-[2.5rem] h-[600px] overflow-hidden group">
                        {/* Mock Map Background */}
                        <div className="absolute inset-0 bg-[#f0ede4] opacity-50 flex items-center justify-center">
                            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#1a1a1a 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
                            
                            {isSearching ? (
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                    <p className="text-blue-600 font-black tracking-tight text-xl">Scanning City Hubs...</p>
                                </div>
                            ) : hasResults ? (
                                <div className="absolute inset-0 animate-fade-in">
                                    {/* Mock Map Features/Markers */}
                                    <div className="absolute top-[20%] left-[30%] group/pin cursor-pointer">
                                        <div className="relative">
                                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-blue-500/30 group-hover/pin:scale-125 transition-transform duration-300 border-2 border-white">
                                                <i className="fas fa-parking text-sm"></i>
                                            </div>
                                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover/pin:opacity-100 transition-opacity whitespace-nowrap">
                                                Alpha Hub • 12 Slots
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute top-[50%] left-[60%] group/pin cursor-pointer">
                                        <div className="relative">
                                            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-indigo-500/30 group-hover/pin:scale-125 transition-transform duration-300 border-2 border-white">
                                                <i className="fas fa-parking text-sm"></i>
                                            </div>
                                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover/pin:opacity-100 transition-opacity whitespace-nowrap">
                                                City Center • 8 Slots
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute top-[40%] left-[45%] group/pin cursor-pointer">
                                        <div className="relative">
                                            <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center text-white shadow-xl group-hover/pin:scale-125 transition-transform duration-300 border-2 border-white">
                                                <i className="fas fa-parking text-sm"></i>
                                            </div>
                                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover/pin:opacity-100 transition-opacity whitespace-nowrap">
                                                Galleria • Full
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center group-hover:scale-110 transition-transform duration-500">
                                    <div className="w-20 h-20 bg-white rounded-full shadow-2xl flex items-center justify-center mb-4 mx-auto border-4 border-blue-50/50">
                                        <i className="fas fa-map-marked-alt text-3xl text-blue-500"></i>
                                    </div>
                                    <p className="text-slate-400 font-extrabold text-sm uppercase tracking-widest">Interactive Map Ready</p>
                                    <p className="text-xs text-gray-400 mt-2">Search a city above to view real-time parking availability</p>
                                </div>
                            )}
                        </div>

                        {/* Floating Controls */}
                        <div className="absolute top-6 right-6 flex flex-col gap-2">
                            <button className="w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center text-slate-800 hover:bg-slate-50 transition-colors">
                                <i className="fas fa-plus"></i>
                            </button>
                            <button className="w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center text-slate-800 hover:bg-slate-50 transition-colors">
                                <i className="fas fa-minus"></i>
                            </button>
                            <button className="w-12 h-12 bg-blue-600 rounded-2xl shadow-xl flex items-center justify-center text-white hover:bg-blue-700 transition-colors mt-4 shadow-blue-500/20">
                                <i className="fas fa-location-arrow"></i>
                            </button>
                        </div>
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
                    <div key={i} className="bg-white/60 backdrop-blur-xl border border-black/5 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-8 hover:bg-white transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 group">
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
                        <div className="item-card">
                            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-500">
                                <i className="fas fa-car"></i>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800">Tesla Model 3</h4>
                                <p className="text-xs text-gray-400 font-bold mt-0.5">CA • 9XDL204</p>
                            </div>
                        </div>
                        <div className="item-card">
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
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm">
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
                        <button onClick={() => setActiveTab('My Bookings')} className="w-full py-3 mt-2 text-blue-500 font-bold text-sm bg-blue-50 hover:bg-blue-100 rounded-2xl transition-colors">
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
            {/* Modern Top Nav */}
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

            {/* Main Content Area */}
            <div className="pt-32 px-8 max-w-[1600px] mx-auto">
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