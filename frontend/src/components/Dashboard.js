import React, { useState, useEffect } from 'react';
import SearchInput from './SearchInput';

const Dashboard = () => {
    const [stats, setStats] = useState({ activeBookings: 0, savedPlaces: 0 });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${process.env.REACT_APP_API_BASE}/saved/stats`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const stats = await res.json();
            setStats(stats);
        } catch (err) {
            console.error("Stats Error:", err);
        }
    };

    const handleSearch = async (query) => {
        setIsLoading(true);
        try {
            // Your search logic here
            console.log('Searching for:', query);
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            {/* Fixed Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-xl border-b border-gray-800/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-18">
                        {/* Logo */}
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                                <i className="fas fa-parking text-white text-xl"></i>
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                                Smart Parking
                            </span>
                        </div>

                        {/* Navigation */}
                        <div className="hidden md:flex space-x-8">
                            <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center space-x-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                </svg>
                                <span>Map View</span>
                            </a>
                            <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center space-x-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span>My Bookings</span>
                            </a>
                            <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center space-x-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                                <span>Saved Slots</span>
                            </a>
                        </div>

                        {/* Logout Button */}
                        <button className="flex items-center space-x-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 rounded-lg transition-all duration-200 border border-red-600/30 hover:border-red-500/50">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content - Scrollable */}
            <div className="pt-18"> {/* Account for fixed navbar */}
                {/* Search Header */}
                <header className="bg-gradient-to-br from-gray-900 to-gray-800 border-b border-gray-800/50 py-8">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Search */}
                        <div className="max-w-2xl mx-auto mb-6">
                            <SearchInput onSearch={handleSearch} />
                        </div>

                        {/* Stats */}
                        <div className="flex justify-center space-x-8">
                            <div className="flex items-center space-x-3 bg-gray-800/50 backdrop-blur-sm rounded-2xl px-6 py-4 border border-gray-700/50">
                                <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">{stats.activeBookings}</p>
                                    <p className="text-gray-400 text-sm">Active Bookings</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 bg-gray-800/50 backdrop-blur-sm rounded-2xl px-6 py-4 border border-gray-700/50">
                                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">{stats.savedPlaces}</p>
                                    <p className="text-gray-400 text-sm">Saved Locations</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content Grid */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Map Section */}
                        <section className="lg:col-span-3">
                            <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl overflow-hidden shadow-2xl">
                                <div
                                    id="map"
                                    className="w-full h-96 lg:h-[600px] rounded-2xl"
                                    style={{ minHeight: '400px' }}
                                >
                                    {/* Map will be initialized here */}
                                    <div className="w-full h-full bg-gray-800 rounded-2xl flex items-center justify-center">
                                        <div className="text-center">
                                            <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                            </svg>
                                            <p className="text-gray-400">Interactive Map</p>
                                            <p className="text-sm text-gray-500 mt-2">Search for a location above to view parking spots</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Map Controls */}
                                <div className="absolute top-4 right-4 z-10 flex flex-col space-y-2">
                                    <button className="w-11 h-11 bg-gray-900/80 backdrop-blur-sm border border-gray-700/50 rounded-xl text-gray-400 hover:text-white hover:border-gray-600 transition-all duration-200 flex items-center justify-center">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </button>
                                    <button className="w-11 h-11 bg-gray-900/80 backdrop-blur-sm border border-gray-700/50 rounded-xl text-gray-400 hover:text-white hover:border-gray-600 transition-all duration-200 flex items-center justify-center">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12a9 9 0 0118 0c0 1.01-.13 1.99-.37 2.93L21 20H3l.37-5.07c-.24-.94-.37-1.92-.37-2.93z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </section>

                        {/* Sidebar */}
                        <aside className="lg:col-span-1">
                            <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6 shadow-2xl max-h-96 lg:max-h-[600px] overflow-y-auto">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                                        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span>Nearby Hubs</span>
                                    </h3>
                                    <span className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                                        Scanning...
                                    </span>
                                </div>

                                {/* Parking Spots */}
                                <div className="space-y-4">
                                    {/* Empty State */}
                                    <div className="text-center py-8">
                                        <svg className="w-12 h-12 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 11H4m6 0v6m0-6h6" />
                                        </svg>
                                        <h4 className="text-gray-300 font-medium mb-2">Discover Parking Hubs</h4>
                                        <p className="text-gray-500 text-sm">Search for a location above to find premium parking slots near you</p>
                                    </div>
                                </div>
                            </div>
                        </aside>
                    </div>
                </main>
            </div>

            {/* Loading Overlay */}
            {isLoading && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="bg-gray-900/90 border border-gray-700 rounded-2xl p-6 flex items-center space-x-4">
                        <svg className="w-6 h-6 text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="text-white font-medium">Finding parking spots...</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;