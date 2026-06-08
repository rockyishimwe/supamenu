"use client";
import React, { useState } from 'react';
import { useDineFlow } from '../context';
import { Sparkles, Star, Plus } from 'lucide-react';
import Image from 'next/image';
import WelcomeBanner from '../../components/customer/WelcomeBanner';
import RestaurantCard from '../../components/customer/RestaurantCard';
import QuickBookingForm from '../../components/customer/QuickBookingForm';

export default function CustomerDashboard() {
  const { restaurants, menuItems, addToCart, createReservation, currentUser } = useDineFlow();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // List of all categories derived from menu
  const categories = ['All', ...new Set(menuItems.map((item) => item.category))];

  // Filter restaurants based on category/search
  const filteredRestaurants = restaurants.filter((res) => {
    const matchesSearch =
      res.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.cuisines.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory =
      selectedCategory === 'All' ||
      res.categories.includes(selectedCategory) ||
      menuItems.some((item) => item.restaurantId === res._id && item.category === selectedCategory);
    return matchesSearch && matchesCategory;
  });

  // Filter menu items
  const filteredMenuItems = menuItems.filter((item) => {
    return selectedCategory === 'All' || item.category === selectedCategory;
  });

  return (
    <div className="p-8 space-y-8 bg-surface min-h-screen text-gray-300">
      {/* 1. Welcome Card / Wallet status */}
      <WelcomeBanner currentUser={currentUser} />

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
                  : 'bg-panel border-white/5 text-gray-400 hover:text-white hover:border-white/10'
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
                <RestaurantCard key={res._id} restaurant={res} />
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
                  className="p-4 bg-panel border border-white/5 rounded-3xl flex gap-4 hover:border-white/10 transition-all duration-300"
                >
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={96}
                    height={96}
                    className="rounded-2xl object-cover"
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
        <QuickBookingForm restaurants={restaurants} createReservation={createReservation} />
      </div>
    </div>
  );
}
