"use client";
import { useState } from 'react';
import { Calendar, Clock, Users } from 'lucide-react';
import ConfettiSuccess from '../ConfettiSuccess';

export default function QuickBooking({ restaurants, currentUser, createReservation }) {
  const [resRestaurantId, setResRestaurantId] = useState('');
  const [resGuests, setResGuests] = useState(2);
  const [resDate, setResDate] = useState(new Date().toISOString().split('T')[0]);
  const [resTime, setResTime] = useState('19:00');
  const [resSuccess, setResSuccess] = useState(false);
  const [resLoading, setResLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResLoading(true);
    const selectedRes = restaurants.find((r) => r._id === resRestaurantId);
    const res = await createReservation({
      restaurantId: resRestaurantId,
      restaurantName: selectedRes?.name || 'Restaurant',
      guestsCount: parseInt(resGuests),
      reservationDate: resDate,
      reservationTime: resTime,
      notes: 'Quick reservation from dashboard',
      tableNumber: Math.floor(Math.random() * 5) + 1,
    });
    setResLoading(false);
    if (res.success) {
      setResSuccess(true);
      setTimeout(() => setResSuccess(false), 3000);
    }
  };

  return (
    <div className="lg:col-span-4 bg-panel border border-white/5 p-6 rounded-3xl space-y-6 sticky top-28 z-10">
      <div className="space-y-1.5 pb-4 border-b border-white/5">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
          <Calendar className="w-4.5 h-4.5 text-[#FF6B00]" /> Visual Table Booking
        </h3>
        <p className="text-[10px] text-gray-500">Instantly reserve your table.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold text-gray-400 uppercase">Restaurant</label>
          <select value={resRestaurantId} onChange={(e) => setResRestaurantId(e.target.value)}
            className="w-full bg-white/5 border border-white/5 text-xs text-white p-3 rounded-xl">
            <option value="">Select...</option>
            {restaurants.map((r) => (
              <option key={r._id} value={r._id} className="bg-panel">{r.name}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold text-gray-400 uppercase">Guests</label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
              <input type="number" min="1" max="10" value={resGuests}
                onChange={(e) => setResGuests(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/5 text-xs text-white" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold text-gray-400 uppercase">Time</label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
              <input type="time" value={resTime} onChange={(e) => setResTime(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/5 text-xs text-white" />
            </div>
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold text-gray-400 uppercase">Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
            <input type="date" value={resDate} onChange={(e) => setResDate(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/5 text-xs text-white" />
          </div>
        </div>
        <ConfettiSuccess show={resSuccess} message="Reservation Confirmed!" />
        <button type="submit" disabled={resLoading}
          className="w-full py-3.5 bg-[#FF6B00] hover:bg-[#e05e00] text-white font-bold text-xs rounded-xl">
          {resLoading ? 'Reserving...' : 'Confirm Table Reservation'}
        </button>
      </form>
    </div>
  );
}
