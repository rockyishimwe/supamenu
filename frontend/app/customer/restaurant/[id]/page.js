"use client";
import React, { useState, useEffect } from 'react';
import { useDineFlow } from '../../../context';
import { useRouter } from 'next/navigation';
import { 
  Star, Clock, MapPin, Globe, Phone, ChevronLeft, Plus, CheckCircle, 
  Sparkles, Heart, Flame, ShieldAlert, Award, Calendar, Users
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function RestaurantDetails({ params }) {
  const router = useRouter();
  const { restaurants, menuItems, tables, createReservation, addToCart } = useDineFlow();
  
  // Resolve params asynchronously to be safe on all Next.js versions
  const [resolvedParams, setResolvedParams] = useState(null);
  useEffect(() => {
    Promise.resolve(params).then(setResolvedParams);
  }, [params]);

  const [activeTab, setActiveTab] = useState('All');
  
  // Seating & Reservation Selection State
  const [selectedTable, setSelectedTable] = useState(null);
  const [bookingDate, setBookingDate] = useState('2026-06-05');
  const [bookingTime, setBookingTime] = useState('19:00');
  const [bookingGuests, setBookingGuests] = useState(2);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");

  if (!resolvedParams) {
    return (
      <div className="min-h-screen bg-[#07090e] flex items-center justify-center text-gray-500 text-xs">
        Loading details...
      </div>
    );
  }

  const id = resolvedParams.id;
  const restaurant = restaurants.find(r => r._id === id) || restaurants[0];

  // Get menu items for this restaurant
  const restaurantMenu = menuItems.filter(item => item.restaurantId === id);

  // Filter menu items by active tab category
  const filteredMenu = activeTab === 'All'
    ? restaurantMenu
    : restaurantMenu.filter(item => item.category === activeTab);

  // Get active tables layout for this restaurant (mock)
  const restaurantTables = tables.filter(t => t.restaurantId === id || !t.restaurantId); // fallback to default tables

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!selectedTable) {
      setBookingError("Please select a table from the floor plan layout below.");
      return;
    }
    
    setBookingError("");
    setBookingLoading(true);

    const res = await createReservation({
      restaurantId: restaurant._id,
      restaurantName: restaurant.name,
      guestsCount: parseInt(bookingGuests),
      reservationDate: bookingDate,
      reservationTime: bookingTime,
      tableNumber: selectedTable.tableNumber,
      notes: `Visual table booking for Table ${selectedTable.tableNumber}`
    });

    setBookingLoading(true);
    if (res.success) {
      setBookingSuccess(true);
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#FF6B00', '#ffffff', '#22C55E']
      });
      setTimeout(() => {
        setBookingSuccess(false);
        router.push('/customer/reservations');
      }, 2000);
    } else {
      setBookingError("Failed to book reservation. Please try again.");
    }
    setBookingLoading(false);
  };

  return (
    <div className="bg-[#07090e] text-gray-300 min-h-screen">
      
      {/* Cover Image and Header Info */}
      <div className="relative h-80 overflow-hidden">
        <img 
          src={restaurant.coverImage} 
          alt={restaurant.name} 
          className="w-full h-full object-cover brightness-[0.4]"
        />
        
        {/* Floating Back Button */}
        <button 
          onClick={() => router.back()}
          className="absolute top-6 left-6 w-10 h-10 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-white hover:bg-black transition-all z-10"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Floating Favorite */}
        <button className="absolute top-6 right-6 w-10 h-10 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-white hover:text-red-500 transition-all z-10">
          <Heart className="w-5 h-5" />
        </button>

        {/* Overlay Details */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#07090e] to-transparent pt-32 pb-8 px-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img 
                src={restaurant.logo} 
                alt="Logo" 
                className="w-16 h-16 rounded-2xl object-cover border border-white/10 bg-[#0f1115]"
              />
              <div>
                <h1 className="text-3xl font-extrabold text-white tracking-tight">{restaurant.name}</h1>
                <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-gray-400 font-medium">
                  <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-[#FF6B00] text-[#FF6B00]" /> {restaurant.rating} ({restaurant.reviewsCount} reviews)</span>
                  <span>•</span>
                  <span>{restaurant.cuisines.join(', ')}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-xs font-medium text-gray-400">
            <span className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 border border-white/5"><Clock className="w-4 h-4 text-[#FF6B00]" /> {restaurant.openingHours}</span>
            <span className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 border border-white/5"><Phone className="w-4 h-4 text-[#FF6B00]" /> {restaurant.contactNumber}</span>
          </div>
        </div>
      </div>

      {/* Main Splits */}
      <div className="max-w-7xl mx-auto px-8 py-8 grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Menu browser */}
        <div className="lg:col-span-8 space-y-8">
          
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#1f2228] pb-4">
              <h2 className="text-lg font-bold text-white tracking-tight">Order Gourmet Food</h2>
              <span className="text-xs text-gray-500 font-mono">DIGITAL BILLING & PRE-ORDERING</span>
            </div>

            {/* Menu Category tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {['All', ...restaurant.categories].map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveTab(cat)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border whitespace-nowrap ${
                    activeTab === cat 
                      ? 'bg-[#FF6B00] border-[#FF6B00] text-white shadow-md shadow-[#FF6B00]/15' 
                      : 'bg-white/5 border-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Menu Grid */}
            <div className="grid md:grid-cols-2 gap-6 pt-2">
              {filteredMenu.length === 0 ? (
                <div className="col-span-2 text-center py-12 bg-white/2 border border-dashed border-white/5 rounded-3xl text-gray-500">
                  <p className="text-xs">No food items listed in this category yet.</p>
                </div>
              ) : (
                filteredMenu.map(item => (
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
                          <h3 className="text-xs font-bold text-white truncate max-w-[130px]">{item.name}</h3>
                          <span className="text-xs font-bold text-[#FF6B00]">${item.price}</span>
                        </div>
                        <p className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed">{item.description}</p>
                      </div>

                      <div className="flex justify-between items-center mt-2">
                        {/* Nutrition indicator */}
                        <div className="flex gap-1.5 text-[8px] text-gray-500">
                          {item.nutrition && (
                            <>
                              <span>{item.nutrition.calories}</span>
                              <span>•</span>
                              <span>{item.nutrition.protein} Protein</span>
                            </>
                          )}
                        </div>

                        <button 
                          onClick={() => addToCart(item, 1)}
                          className="px-3 py-1.5 rounded-lg bg-[#FF6B00] hover:bg-[#e05e00] text-white text-[10px] font-bold flex items-center gap-1 shadow-md shadow-[#FF6B00]/10 hover-lift transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Interactive Seating Layout grid */}
          <div className="space-y-6 pt-4">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#FF6B00]" /> Seating Floor Plan
              </h2>
              <p className="text-[11px] text-gray-500">Pick a table coordinates layout from the live visual map below.</p>
            </div>

            {/* Floor Map Simulation Canvas */}
            <div className="border border-white/5 bg-[#0f1115]/50 backdrop-blur-md rounded-3xl p-6 relative overflow-hidden h-[300px] flex items-center justify-center">
              <div className="absolute inset-0 bg-[radial-gradient(#1f2228_1px,transparent_1px)] [background-size:20px_20px] opacity-15"></div>
              
              {/* Floor Plan Border */}
              <div className="absolute inset-6 border border-dashed border-white/5 rounded-2xl flex items-center justify-center">
                <span className="text-[9px] text-gray-600 font-mono tracking-widest uppercase">Stage / Entrance Main Gate</span>
              </div>

              {/* Seating tables placement */}
              {restaurantTables.map((t, idx) => {
                // Mock coordinate mappings to fit container
                const coordinates = [
                  { x: '15%', y: '20%' }, { x: '35%', y: '20%' }, { x: '55%', y: '20%' }, { x: '75%', y: '20%' },
                  { x: '15%', y: '50%' }, { x: '35%', y: '50%' }, { x: '55%', y: '50%' }, { x: '75%', y: '50%' },
                  { x: '15%', y: '80%' }, { x: '35%', y: '80%' }, { x: '55%', y: '80%' }, { x: '75%', y: '80%' },
                ];
                const coord = coordinates[idx] || { x: `${(idx * 15) % 80 + 10}%`, y: `${Math.floor(idx / 5) * 25 + 20}%` };

                const isSelected = selectedTable?._id === t._id;
                const isOccupied = t.status === 'occupied';
                const isReserved = t.status === 'reserved';

                return (
                  <button
                    key={t._id}
                    disabled={isOccupied || isReserved}
                    onClick={() => setSelectedTable(t)}
                    style={{ left: coord.x, top: coord.y }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-xl flex flex-col items-center justify-center border font-bold text-[10px] transition-all duration-200 ${
                      isSelected
                        ? 'bg-[#FF6B00] border-white text-white scale-110 shadow-lg shadow-[#FF6B00]/20'
                        : isOccupied 
                        ? 'bg-red-500/10 border-red-500/20 text-red-400 cursor-not-allowed'
                        : isReserved
                        ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400 cursor-not-allowed'
                        : 'bg-white/5 border-white/5 text-gray-400 hover:border-white/10 hover:text-white'
                    }`}
                  >
                    T{t.tableNumber}
                    <span className="text-[7px] font-medium opacity-60">{t.capacity}P</span>
                  </button>
                );
              })}
            </div>

            {/* Map Legend */}
            <div className="flex justify-center gap-6 text-[10px] text-gray-500 font-semibold uppercase">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-white/5 border border-white/10"></span> Available</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-[#FF6B00]"></span> Selected</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-red-500/20 border border-red-500/30"></span> Occupied</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-yellow-500/20 border border-yellow-500/30"></span> Reserved</span>
            </div>
          </div>

        </div>

        {/* Right Side: Reservation Booking Widget */}
        <div className="lg:col-span-4 bg-[#0f1115] border border-white/5 p-6 rounded-3xl space-y-6 sticky top-28 z-10">
          <div className="space-y-1.5 pb-4 border-b border-white/5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Calendar className="w-4.5 h-4.5 text-[#FF6B00]" /> Seating Reservation
            </h3>
            <p className="text-[10px] text-gray-500">Pick details and select your table to book.</p>
          </div>

          <form onSubmit={handleBooking} className="space-y-4">
            
            {/* Table status display */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-gray-400 uppercase">Selected Table</label>
              <div className="w-full bg-white/5 border border-white/5 p-3.5 rounded-xl text-xs font-semibold text-white flex justify-between items-center">
                <span>{selectedTable ? `Table Number ${selectedTable.tableNumber}` : 'None Selected'}</span>
                {selectedTable && (
                  <span className="text-[#FF6B00] bg-[#FF6B00]/10 px-2 py-0.5 rounded-md text-[9px] font-bold">
                    Capacity: {selectedTable.capacity} Persons
                  </span>
                )}
              </div>
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
                    value={bookingGuests}
                    onChange={(e) => setBookingGuests(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/5 text-xs text-white focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>
              </div>

              {/* Time */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-gray-400 uppercase">Time Slot</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                  <input 
                    type="time" 
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
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
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/5 text-xs text-white focus:outline-none focus:border-[#FF6B00]"
                />
              </div>
            </div>

            {bookingError && (
              <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-center text-[10px] text-red-400 flex items-center justify-center gap-1.5 font-semibold">
                <ShieldAlert className="w-3.5 h-3.5" /> {bookingError}
              </div>
            )}

            {bookingSuccess && (
              <div className="bg-[#22C55E]/10 border border-[#22C55E]/20 p-4 rounded-xl text-center text-xs text-[#22C55E] flex items-center justify-center gap-1.5 font-semibold">
                <CheckCircle className="w-4 h-4" /> Seating Reserved Successfully!
              </div>
            )}

            <button 
              type="submit"
              disabled={bookingLoading}
              className="w-full py-3.5 bg-[#FF6B00] hover:bg-[#e05e00] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 hover-lift shadow-lg shadow-[#FF6B00]/15"
            >
              {bookingLoading ? 'Processing...' : 'Reserve Selected Seating'}
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
