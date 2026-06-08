"use client";
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Calendar, Clock, Users } from 'lucide-react';

const ConfettiSuccess = dynamic(() => import('../ConfettiSuccess'), {
  ssr: false,
  loading: () => null,
});

export default function QuickBookingForm({ restaurants, createReservation }) {
  const [resRestaurantId, setResRestaurantId] = useState(
    () => restaurants[0]?._id || ''
  );
  const [resGuests, setResGuests] = useState(2);
  const [resDate, setResDate] = useState('2026-06-05');
  const [resTime, setResTime] = useState('19:00');
  const [resSuccess, setResSuccess] = useState(false);
  const [resLoading, setResLoading] = useState(false);

  const handleQuickReserve = async (e) => {
    e.preventDefault();
    setResLoading(true);
    const selectedRes = restaurants.find((r) => r._id === resRestaurantId);
    const res = await createReservation({
      restaurantId: resRestaurantId,
      restaurantName: selectedRes?.name || 'The Garden Bistro',
      guestsCount: parseInt(resGuests),
      reservationDate: resDate,
      reservationTime: resTime,
      notes: 'Quick reservation from dashboard',
      tableNumber: Math.floor(Math.random() * 5) + 1,
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
    <div className="lg:col-span-4 bg-panel border border-white/5 p-6 rounded-3xl space-y-6 sticky top-28 z-10">
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
            {restaurants.map((r) => (
              <option key={r._id} value={r._id} className="bg-panel text-white">
                {r.name}
              </option>
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
  );
}
