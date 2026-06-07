"use client";
import React, { useState } from 'react';
import { useDineFlow } from '../../context';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Search, Star, Navigation, MapPin, SlidersHorizontal, 
  Compass, Clock, StarHalf, Phone, ChevronRight, Crosshair
} from 'lucide-react';
import FilterModal from '../../../components/FilterModal';
import BackButton from '../../../components/BackButton';

export default function CustomerExplore() {
  const { restaurants, menuItems } = useDineFlow();
  const [searchQuery, setSearchQuery] = useState('');
  const [cuisineFilter, setCuisineFilter] = useState('All');
  const [ratingFilter, setRatingFilter] = useState(0);
  const [priceMinFilter, setPriceMinFilter] = useState(null);
  const [priceMaxFilter, setPriceMaxFilter] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMapPin, setSelectedMapPin] = useState(null);

  // List of all cuisines
  const allCuisines = ['All', ...new Set(restaurants.flatMap(r => r.cuisines))];

  // Filter restaurants
  const filteredRestaurants = restaurants.filter(res => {
    const matchesSearch = res.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCuisine = cuisineFilter === 'All' || res.cuisines.includes(cuisineFilter);
    const matchesRating = res.rating >= ratingFilter;
    
    // Check if restaurant has any menu items within the price range
    const matchesPrice = (() => {
      if (!priceMinFilter && !priceMaxFilter) return true;
      const prices = menuItems
        .filter((m) => String(m.restaurantId) === String(res._id))
        .map((m) => m.price);
      if (!prices.length) return true;
      const min = priceMinFilter ?? 0;
      const max = priceMaxFilter ?? Infinity;
      return prices.some((p) => p >= min && p <= max);
    })();

    return matchesSearch && matchesCuisine && matchesRating && matchesPrice;
  });

  return (
    <div className="grid lg:grid-cols-12 min-h-[calc(100vh-5rem)] bg-surface">
      
      {/* Left Column: Search Filters & List */}
      <div className="lg:col-span-6 p-6 border-r border-[#1f2228] flex flex-col overflow-y-auto max-h-[calc(100vh-5rem)] scrollbar-thin space-y-6">
        <BackButton />

        {/* Header Title */}
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Compass className="w-5 h-5 text-[#FF6B00]" /> Explore Restaurants
            </h2>
            <p className="text-[11px] text-gray-500">Find and reserve the perfect table visually in real-time.</p>
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 ${
              showFilters || cuisineFilter !== 'All' || ratingFilter > 0 || priceMinFilter !== null || priceMaxFilter !== null
                ? 'border-[#FF6B00] bg-[#FF6B00]/5 text-[#FF6B00]' 
                : 'border-white/5 bg-white/2 hover:border-white/10 text-gray-400 hover:text-white'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </button>
        </div>

        {/* Local Search Input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4.5 h-4.5" />
          <input 
            type="text" 
            placeholder="Search restaurants by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/5 border border-white/5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B00] focus:bg-white/10 transition-all duration-300"
          />
        </div>

        {/* Collapsible Filter Panel */}
        {showFilters && (
          <div className="p-4 bg-white/2 border border-white/5 rounded-2xl space-y-4 animate-in fade-in duration-200">
            {/* Cuisine */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Cuisine Type</label>
              <div className="flex flex-wrap gap-1.5">
                {allCuisines.map(cuisine => (
                  <button
                    key={cuisine}
                    onClick={() => setCuisineFilter(cuisine)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all duration-150 border ${
                      cuisineFilter === cuisine 
                        ? 'bg-[#FF6B00] border-[#FF6B00] text-white' 
                        : 'bg-panel border-white/5 text-gray-400 hover:text-white'
                    }`}
                  >
                    {cuisine}
                  </button>
                ))}
              </div>
            </div>

            {/* Ratings & Price */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Minimum Rating</label>
                <div className="flex gap-1.5">
                  {[0, 3, 4, 4.5].map(rating => (
                    <button
                      key={rating}
                      onClick={() => setRatingFilter(rating)}
                      className={`flex-1 py-1.5 rounded-xl text-[10px] font-bold border transition-all duration-150 ${
                        ratingFilter === rating
                          ? 'bg-[#FF6B00] border-[#FF6B00] text-white'
                          : 'bg-panel border-white/5 text-gray-400 hover:text-white'
                      }`}
                    >
                      {rating === 0 ? 'All' : `${rating}+ ⭐`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Price Range</label>
                <div className="flex gap-1.5">
                  {['All', '$5–$15', '$15–$25', '$25+'].map(price => {
                    const isActive = price === 'All'
                      ? (!priceMinFilter && !priceMaxFilter)
                      : (price === '$5–$15' && priceMinFilter === 5 && priceMaxFilter === 15)
                      || (price === '$15–$25' && priceMinFilter === 15 && priceMaxFilter === 25)
                      || (price === '$25+' && priceMinFilter === 25 && !priceMaxFilter);
                    return (
                      <button
                        key={price}
                        onClick={() => {
                          if (price === 'All') {
                            setPriceMinFilter(null);
                            setPriceMaxFilter(null);
                          } else if (price === '$5–$15') {
                            setPriceMinFilter(5);
                            setPriceMaxFilter(15);
                          } else if (price === '$15–$25') {
                            setPriceMinFilter(15);
                            setPriceMaxFilter(25);
                          } else {
                            setPriceMinFilter(25);
                            setPriceMaxFilter(null);
                          }
                        }}
                        className={`flex-1 py-1.5 rounded-xl text-[10px] font-bold border transition-all duration-150 ${
                          isActive
                            ? 'bg-[#FF6B00] border-[#FF6B00] text-white'
                            : 'bg-panel border-white/5 text-gray-400 hover:text-white'
                        }`}
                      >
                        {price}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Restaurants List */}
        <div className="space-y-4">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{filteredRestaurants.length} Restaurants Found</p>
          
          {filteredRestaurants.length === 0 ? (
            <div className="text-center py-12 bg-white/2 border border-dashed border-white/5 rounded-3xl text-gray-500">
              <Compass className="w-10 h-10 mx-auto text-gray-600 mb-2 animate-pulse" />
              <p className="text-xs font-semibold">No restaurants match your filters.</p>
              <p className="text-[10px] mt-1">Try clearing your filters or typing something else.</p>
            </div>
          ) : (
            filteredRestaurants.map(res => (
              <div
                key={res._id}
                onMouseEnter={() => setSelectedMapPin(res._id)}
                className={`p-4 bg-panel border rounded-3xl flex gap-4 hover:border-white/10 transition-all duration-300 group cursor-pointer ${
                  selectedMapPin === res._id ? 'border-[#FF6B00]' : 'border-white/5'
                }`}
              >
                <Image 
                  src={res.coverImage} 
                  alt={res.name}
                  width={96}
                  height={96}
                  className="rounded-2xl object-cover" 
                />
                
                <div className="flex-1 flex flex-col justify-between py-0.5">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="text-xs font-bold text-white group-hover:text-[#FF6B00] transition-colors">{res.name}</h3>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-white">
                        <Star className="w-3 h-3 fill-[#FF6B00] text-[#FF6B00]" />
                        {res.rating}
                      </div>
                    </div>
                    <p className="text-[10px] text-gray-500 line-clamp-1 mt-0.5">{res.description}</p>
                    <p className="text-[9px] text-gray-400 mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#FF6B00]" /> {res.address}
                    </p>
                  </div>

                  <div className="flex justify-between items-center pt-2 mt-2 border-t border-white/5 text-[9px] text-gray-500">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-[#FF6B00]" /> {res.openingHours}</span>
                    <Link 
                      href={`/customer/restaurant/${res._id}`}
                      className="text-white hover:underline font-bold flex items-center gap-0.5"
                    >
                      Book Table <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* Right Column: Simulated Map */}
      <div className="hidden lg:col-span-6 bg-surface p-6 relative overflow-hidden flex items-center justify-center min-h-[calc(100vh-5rem)]">
        
        {/* Dark Grid Background representing map */}
        <div className="absolute inset-0 bg-[radial-gradient(#1f2228_1px,transparent_1px)] [background-size:24px_24px] opacity-25"></div>
        <div className="absolute top-1/4 -right-1/4 w-[150%] h-1/2 bg-[#FF6B00]/5 filter blur-3xl rounded-full"></div>
        
        {/* Map UI overlays */}
        <div className="absolute top-6 left-6 z-10 p-3 bg-panel/80 backdrop-blur-md border border-white/10 rounded-2xl flex items-center gap-3 shadow-xl">
          <div className="w-8 h-8 rounded-lg bg-[#FF6B00]/10 flex items-center justify-center text-[#FF6B00]">
            <MapPin className="w-4.5 h-4.5" />
          </div>
          <div>
            <p className="text-[10px] text-white font-bold">New York Center Map</p>
            <p className="text-[8px] text-gray-500 uppercase tracking-widest font-semibold">Simulated GPS Live Seating</p>
          </div>
        </div>

        <button className="absolute bottom-6 right-6 z-10 w-10 h-10 rounded-full bg-panel border border-white/10 flex items-center justify-center text-gray-400 hover:text-white shadow-xl hover-lift">
          <Crosshair className="w-5 h-5 text-[#FF6B00]" />
        </button>

        {/* Map Pins Simulation Container */}
        <div className="relative w-full h-[400px] border border-white/5 rounded-3xl bg-panel/40 backdrop-blur-sm overflow-hidden flex items-center justify-center">
          
          {/* Simulated Roads/Landmarks */}
          <div className="absolute inset-0 border border-white/5 rounded-3xl bg-[radial-gradient(#1b1e22_1.5px,transparent_1.5px)] [background-size:16px_16px] opacity-10"></div>
          <div className="absolute w-[2px] h-full bg-white/2 left-1/3"></div>
          <div className="absolute w-[2px] h-full bg-white/2 left-2/3"></div>
          <div className="absolute h-[2px] w-full bg-white/2 top-1/3"></div>
          <div className="absolute h-[2px] w-full bg-white/2 top-2/3"></div>

          {/* Central User Location Pin */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
            <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center shadow-lg shadow-blue-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
            </div>
            <span className="text-[8px] font-bold text-blue-400 uppercase tracking-wider mt-1 px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">You</span>
          </div>

          {/* Map pins representing restaurants */}
          {restaurants.map((res, idx) => {
            // Define custom fixed coordinates for pins based on index
            const coordinates = [
              { x: '25%', y: '30%' }, // Garden Bistro
              { x: '75%', y: '25%' }, // Sakura Sushi
              { x: '18%', y: '75%' }, // Burger House
              { x: '82%', y: '68%' }  // Spice Route
            ];
            const coord = coordinates[idx] || { x: '50%', y: '50%' };
            const isHovered = selectedMapPin === res._id;

            return (
              <div 
                key={res._id}
                style={{ left: coord.x, top: coord.y }}
                onMouseEnter={() => setSelectedMapPin(res._id)}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center group cursor-pointer"
              >
                {/* Tooltip on hover */}
                {isHovered && (
                  <div className="absolute bottom-11 p-2 bg-panel border border-[#FF6B00] rounded-xl text-center whitespace-nowrap shadow-2xl animate-bounce">
                    <p className="text-[10px] text-white font-bold">{res.name}</p>
                    <div className="flex items-center justify-center gap-1 mt-0.5 text-[8px] font-semibold text-[#FF6B00]">
                      <Star className="w-2.5 h-2.5 fill-[#FF6B00]" /> {res.rating}
                    </div>
                  </div>
                )}
                
                {/* Pin Head */}
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 shadow-xl ${
                  isHovered
                    ? 'bg-[#FF6B00] border-white scale-110 shadow-[#FF6B00]/25' 
                    : 'bg-panel border-white/20 hover:border-white'
                }`}>
                  <Compass className={`w-4 h-4 ${isHovered ? 'text-white' : 'text-gray-400'}`} />
                </div>
                
                {/* Pin Tail */}
                <div className={`w-0.5 h-2 ${isHovered ? 'bg-[#FF6B00]' : 'bg-white/20'}`}></div>
              </div>
            );
          })}
        </div>

      </div>

      <FilterModal
        open={showFilters}
        onClose={() => setShowFilters(false)}
        priceRange={{ min: priceMinFilter ?? undefined, max: priceMaxFilter ?? undefined }}
        onApply={({ rating, cuisines, minPrice, maxPrice }) => {
          setRatingFilter(rating);
          if (cuisines?.[0]) {
            setCuisineFilter(cuisines[0]);
          } else {
            setCuisineFilter('All');
          }
          setPriceMinFilter(minPrice);
          setPriceMaxFilter(maxPrice);
        }}
      />
    </div>
  );
}
