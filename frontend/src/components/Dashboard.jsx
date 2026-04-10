import React, { useState, useEffect } from 'react';
import SearchInput from './SearchInput';

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('Map View');
    const [stats, setStats] = useState({ activeBookings: 124, totalSlots: 500 });

    const NavItem = ({ label, icon }) => (
        <button
            onClick={() => setActiveTab(label)}
            className={`nav-link ${activeTab === label ? 'active' : ''}`}
        >
            <i className={`fas ${icon}`}></i>
            <span>{label}</span>
        </button>
    );

    const MapViewContent = () => (
        <div className="animate-slide-up">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                {/* Total Slots Card */}
                <div className="stats-card">
                    <div>
                        <h3 className="stats-card-title">Total Slots</h3>
                        <p className="stats-card-value font-['Plus_Jakarta_Sans']">{stats.totalSlots}</p>
                    </div>
                    <div className="w-full bg-[#e8e2d6] h-1.5 rounded-full overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-400 to-cyan-400 h-full w-[70%] rounded-full shadow-[0_0_10px_rgba(34,211,238,0.5)]"></div>
                    </div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-4">System Capacity</p>
                </div>

                {/* Available Now Card */}
                <div className="stats-card">
                    <div>
                        <h3 className="stats-card-title">Available Now</h3>
                        <p className="stats-card-value">{stats.activeBookings}</p>
                    </div>
                </div>
            </div>

            {/* Placeholder for Map or other content */}
            <div className="bg-white/40 backdrop-blur-sm border border-black/5 rounded-[2.5rem] h-[500px] flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-400 font-medium">Map content for {activeTab} will appear here</p>
                </div>
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

                {/* Recent Bookings */}
                <div className="lg:col-span-3">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-500">
                            <i className="fas fa-calendar-check"></i>
                        </div>
                        <h2 className="text-xl font-bold text-slate-800">Recent Bookings</h2>
                    </div>
                    <div className="space-y-4 bg-white/40 backdrop-blur-lg rounded-[2.5rem] p-6 border border-black/5">
                        {[
                            { date: '12 OCT', hub: 'Downtown Plaza Hub', addr: '124 Main St, City Center', price: '$14.00', status: 'COMPLETED' },
                            { date: '28 SEP', hub: 'Airport Terminal A', addr: 'Level 2, Spot 42', price: '$35.00', status: 'UPCOMING' },
                            { date: '15 SEP', hub: 'Tech District Garage', addr: '800 Innovation Way', price: '$22.50', status: 'COMPLETED' },
                        ].map((booking, i) => (
                            <div key={i} className="flex items-center justify-between p-4 hover:bg-white/60 rounded-3xl transition-all duration-200">
                                <div className="flex items-center gap-6">
                                    <div className="text-center w-12 border-r border-gray-100 pr-6">
                                        <p className="text-sm font-bold text-blue-500">{booking.date.split(' ')[0]}</p>
                                        <p className="text-[10px] font-extrabold text-gray-300">{booking.date.split(' ')[1]}</p>
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-slate-800">{booking.hub}</h5>
                                        <p className="text-[11px] text-gray-400 flex items-center gap-1">
                                            <i className="fas fa-location-dot text-[9px]"></i> {booking.addr}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-extrabold text-slate-800 mb-1">{booking.price}</p>
                                    <span className={`status-badge ${booking.status === 'COMPLETED' ? 'status-completed' : 'status-upcoming'}`}>
                                        {booking.status}
                                    </span>
                                </div>
                            </div>
                        ))}
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
                {activeTab === 'Profile' && <ProfileContent />}
                {activeTab === 'Saved Slots' && <SavedSlotsContent />}
                {(activeTab === 'My Bookings' || activeTab === 'Payments') && (
                    <div className="animate-slide-up text-center py-32">
                        <h2 className="text-2xl font-bold text-gray-400 italic">Coming soon: {activeTab} Screen</h2>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;