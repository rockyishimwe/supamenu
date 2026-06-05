"use client";
import React, { useState } from 'react';
import { useDineFlow } from '../context';
import Link from 'next/link';
import { 
  Sparkles, Star, Clock, Plus, Award, Wallet, Calendar, Users, ChevronRight
} from 'lucide-react';
import ConfettiSuccess from '../../components/ConfettiSuccess';

export default function CustomerDashboard() {
  const { restaurants, menuItems, addToCart, currentUser, createReservation } = useDineFlow();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Reservation Form State
  const [resRestaurantId, setResRestaurantId] = useState('res-garden');
  const [resGuests, setResGuests] = useState(2);
  const [resDate, setResDate] = useState('2026-06-05');
  const [resTime, setResTime] = useState('19:00');
  const [resSuccess, setResSuccess] = useState(false);
  const [resLoading, setResLoading] = useState(false);

  // List of all categories derived from menu
  const categories = ['All', ...new Set(menuItems.map(item => item.category))];

  // Filter restaurants based on category/search
  const filteredRestaurants = restaurants.filter(res => {
    const matchesSearch = res.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.cuisines.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || 
      res.categories.includes(selectedCategory) ||
      menuItems.some(item => item.restaurantId === res._id && item.category === selectedCategory);
    return matchesSearch && matchesCategory;
  });

  // Filter menu items
  const filteredMenuItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesCategory;
  });

  const handleQuickReserve = async (e) => {
    e.preventDefault();
    setResLoading(true);
    const selectedRes = restaurants.find(r => r._id === resRestaurantId);
    const res = await createReservation({
      restaurantId: resRestaurantId,
      restaurantName: selectedRes?.name || "The Garden Bistro",
      guestsCount: parseInt(resGuests),
      reservationDate: resDate,
      reservationTime: resTime,
      notes: 'Quick reservation from dashboard',
      tableNumber: Math.floor(Math.random() * 5) + 1
    });

    setResLoading(false);
    if (res.success) {
      setResSuccess(true);
      setTimeout(() => {
        setResSuccess(false);
      }, 3000);
    }
  };

  return (
    <div className="p-8 space-y-8 bg-[#07090e] min-h-screen text-gray-300">
      
      {/* 1. Welcome Card / Wallet status */}
      <div className="grid md:grid-cols-12 gap-6 items-stretch">
        <div className="md:col-span-8 bg-gradient-to-br from-[#0f1115] to-[#07090e] border border-white/5 p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF6B00]/5 rounded-full filter blur-3xl"></div>
          
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF6B00]/10 border border-[#FF6B00]/20 text-[10px] uppercase font-bold tracking-wider text-[#FF6B00]">
              <Sparkles className="w-3 h-3" /> Dining Ecosystem Active
            </div>
            
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Hello, <span className="text-[#FF6B00]">{currentUser?.name || 'Sarah Jenkins'}</span>
              </h2>
              <p className="text-xs text-gray-400 max-w-md leading-relaxed">
                Discover the best gourmet restaurants near you, reserve your favorite table visually, and enjoy a premium contactless ordering experience.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 pt-6 border-t border-white/5 mt-6 items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#FF6B00]">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 font-semibold uppercase">Loyalty Status</p>
                <p className="text-xs text-white font-bold">{currentUser?.customerDetails?.loyaltyTier || 'Gold Member'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#FF6B00]">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 font-semibold uppercase">Loyalty Points</p>
                <p className="text-xs text-white font-bold">{currentUser?.customerDetails?.points || '350'} pts</p>
              </div>
            </div>
          </div>
        </div>

        {/* Wallet Widget */}
        <div className="md:col-span-4 bg-[#0f1115] border border-white/5 p-6 rounded-3xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full filter blur-2xl"></div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-gray-400">DineFlow Pay Wallet</span>
              <Wallet className="w-5 h-5 text-gray-500" />
            </div>
            
            <div className="space-y-1">
              <p className="text-3xl font-extrabold text-white tracking-tight">
                ${currentUser?.walletBalance !== undefined ? currentUser.walletBalance.toFixed(2) : '128.50'}
              </p>
              <p className="text-[10px] text-gray-500">Secure one-tap QR billing payments</p>
            </div>
          </div>

          <div className="pt-4">
            <Link 
              href="/customer/profile?tab=wallet" 
              className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-center text-xs text-white font-semibold transition-all duration-200 block"
            >
              Top Up Wallet
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Categories Scroll */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Browse Categories</h3>
          <span className="text-xs text-[#FF6B00] font-medium hover:underline cursor-pointer">View All</span>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap border transition-all duration-200 ${
                selectedCategory === cat
                  ? 'bg-[#FF6B00] border-[#FF6B00] text-white shadow-md shadow-[#FF6B00]/15'
                  : 'bg-[#0f1115] border-white/5 text-gray-400 hover:text-white hover:border-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Main content splits */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Restaurants & Dishes list */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Popular Restaurants */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Popular Restaurants</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {filteredRestaurants.slice(0, 4).map((res) => (
                <div 
                  key={res._id}
                  className="bg-[#0f1115] border border-white/5 rounded-3xl overflow-hidden hover:border-white/10 transition-all duration-300 group flex flex-col justify-between"
                >
                  <div className="relative h-44 overflow-hidden">
                    <img 
                      src={res.coverImage} 
                      alt={res.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute top-4 right-4 px-2.5 py-1 rounded-xl bg-[#0f1115]/80 backdrop-blur-md border border-white/10 flex items-center gap-1 text-[11px] font-bold text-white">
                      <Star className="w-3.5 h-3.5 fill-[#FF6B00] text-[#FF6B00]" />
                      {res.rating}
                    </div>
                  </div>
                  
                  <div className="p-5 space-y-4">
                    <div className="space-y-1">
                      <h4 className="text-md font-bold text-white tracking-tight">{res.name}</h4>
                      <p className="text-xs text-gray-500 truncate">{res.description}</p>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {res.cuisines.map((cuisine) => (
                        <span key={cuisine} className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-gray-400 font-semibold">{cuisine}</span>
                      ))}
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-white/5 text-[11px] text-gray-400">
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-[#FF6B00]" /> {res.openingHours}</span>
                      <Link 
                        href={`/customer/restaurant/${res._id}`}
                        className="text-white hover:text-[#FF6B00] font-bold flex items-center gap-1 transition-colors"
                      >
                        Order / Book <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Dishes */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Recommended Dishes</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {filteredMenuItems.map((item) => (
                <div 
                  key={item._id}
                  className="p-4 bg-[#0f1115] border border-white/5 rounded-3xl flex gap-4 hover:border-white/10 transition-all duration-300"
                >
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-24 h-24 rounded-2xl object-cover"
                  />
                  <div className="flex-1 flex flex-col justify-between py-0.5">
                    <div className="space-y-1">
                      <div className="flex justify-between items-start">
                        <h4 className="text-xs font-bold text-white truncate max-w-[150px]">{item.name}</h4>
                        <span className="text-xs font-bold text-[#FF6B00]">${item.price}</span>
                      </div>
                      <p className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed">{item.description}</p>
                    </div>

                    <div className="flex justify-between items-center mt-2">
                      <span className="flex items-center gap-1 text-[10px] font-medium text-gray-400">
                        <Star className="w-3 h-3 fill-[#FF6B00] text-[#FF6B00]" /> {item.rating} ({item.reviewsCount})
                      </span>
                      <button 
                        onClick={() => addToCart(item, 1)}
                        className="w-8 h-8 rounded-xl bg-[#FF6B00] hover:bg-[#e05e00] text-white flex items-center justify-center shadow-md shadow-[#FF6B00]/10 hover-lift transition-all"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Side: Quick Booking Widget */}
        <div className="lg:col-span-4 bg-[#0f1115] border border-white/5 p-6 rounded-3xl space-y-6 sticky top-28 z-10">
          <div className="space-y-1.5 pb-4 border-b border-white/5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Calendar className="w-4.5 h-4.5 text-[#FF6B00]" /> Visual Table Booking
            </h3>
            <p className="text-[10px] text-gray-500">Instantly reserve your table. Zero queues.</p>
          </div>

          <form onSubmit={handleQuickReserve} className="space-y-4">
            
            {/* Restaurant */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-gray-400 uppercase">Select Restaurant</label>
              <select 
                value={resRestaurantId}
                onChange={(e) => setResRestaurantId(e.target.value)}
                className="w-full bg-white/5 border border-white/5 text-xs text-white p-3 rounded-xl focus:outline-none focus:border-[#FF6B00] font-medium"
              >
                {restaurants.map(r => (
                  <option key={r._id} value={r._id} className="bg-[#0f1115] text-white">{r.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Guests */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-gray-400 uppercase">Guests</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                  <input 
                    type="number"
                    min="1"
                    max="10"
                    value={resGuests}
                    onChange={(e) => setResGuests(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/5 text-xs text-white focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>
              </div>

              {/* Time */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-gray-400 uppercase">Time</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                  <input 
                    type="time" 
                    value={resTime}
                    onChange={(e) => setResTime(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/5 text-xs text-white focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>
              </div>
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-gray-400 uppercase">Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                <input 
                  type="date" 
                  value={resDate}
                  onChange={(e) => setResDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/5 text-xs text-white focus:outline-none focus:border-[#FF6B00]"
                />
              </div>
            </div>

            <ConfettiSuccess show={resSuccess} message="Reservation Confirmed!" />

            <button 
              type="submit"
              disabled={resLoading}
              className="w-full py-3.5 bg-[#FF6B00] hover:bg-[#e05e00] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 hover-lift shadow-lg shadow-[#FF6B00]/15"
            >
              {resLoading ? 'Reserving...' : 'Confirm Table Reservation'}
            </button>
          </form>
        </div>
      </div>
      
    </div>
  );
}
