"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useDineFlow } from '../context';
import { Sparkles, Star, Plus } from 'lucide-react';
import Image from 'next/image';
import WelcomeBanner from '../../components/customer/WelcomeBanner';
import RestaurantCard from '../../components/customer/RestaurantCard';
import QuickBookingForm from '../../components/customer/QuickBookingForm';
import { staggerContainer, fadeUpItem } from '../../components/PageTransition';

export default function CustomerDashboard() {
  const { restaurants, menuItems, addToCart, createReservation, currentUser } = useDineFlow();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['All', ...new Set(menuItems.map((item) => item.category))];

  const filteredRestaurants = restaurants.filter((res) => {
    const matchesSearch =
      res.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.cuisines.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory =
      selectedCategory === 'All' ||
      res.categories?.includes(selectedCategory) ||
      menuItems.some((item) => item.restaurantId === res._id && item.category === selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const filteredMenuItems = menuItems.filter((item) => {
    return selectedCategory === 'All' || item.category === selectedCategory;
  });

  return (
    <div className="p-8 space-y-8 bg-surface min-h-screen text-gray-300">
      {/* Background decoration */}
      <div className="fixed inset-0 bg-dots-pattern opacity-15 pointer-events-none" />
      <div className="fixed top-0 right-0 w-96 h-96 bg-[#FF6B00]/3 blur-3xl rounded-full pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-80 h-80 bg-blue-500/3 blur-3xl rounded-full pointer-events-none" />

      <div className="relative z-10">
        {/* 1. Welcome Card / Wallet status */}
        <WelcomeBanner currentUser={currentUser} />

        {/* 2. Categories Scroll */}
        <div className="space-y-4 mt-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="flex items-center justify-between"
          >
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Browse Categories</h3>
            <span className="text-xs text-[#FF6B00] font-medium hover:underline cursor-pointer">View All</span>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin"
          >
            {categories.map((cat) => (
              <motion.button
                key={cat}
                variants={fadeUpItem}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap border transition-all duration-200 hover-lift ${
                  selectedCategory === cat
                    ? 'bg-[#FF6B00] border-[#FF6B00] text-white shadow-md shadow-[#FF6B00]/15'
                    : 'bg-panel border-white/5 text-gray-400 hover:text-white hover:border-white/10'
                }`}
              >
                {cat}
              </motion.button>
            ))}
          </motion.div>
        </div>

        {/* 3. Main content splits */}
        <div className="grid lg:grid-cols-12 gap-8 items-start mt-8">
          {/* Left Side: Restaurants & Dishes list */}
          <div className="lg:col-span-8 space-y-8">
            {/* Popular Restaurants */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.1 }}
              className="space-y-4"
            >
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Popular Restaurants</h3>
              <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="grid md:grid-cols-2 gap-6"
              >
                {filteredRestaurants.slice(0, 4).map((res) => (
                  <motion.div key={res._id} variants={fadeUpItem}>
                    <RestaurantCard restaurant={res} />
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Recommended Dishes */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.15 }}
              className="space-y-4"
            >
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Recommended Dishes</h3>
              <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="grid md:grid-cols-2 gap-6"
              >
                {filteredMenuItems.map((item) => (
                  <motion.div
                    key={item._id}
                    variants={fadeUpItem}
                    className="p-4 bg-panel border border-white/5 rounded-3xl flex gap-4 hover:border-white/10 transition-all duration-300 card-shine"
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
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>

          {/* Right Side: Quick Booking Widget */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
            className="lg:col-span-4"
          >
            <QuickBookingForm restaurants={restaurants} createReservation={createReservation} />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
