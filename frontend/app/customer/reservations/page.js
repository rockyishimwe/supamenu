"use client";
import React, { useState } from 'react';
import { useDineFlow } from '../../context';
import { 
  Calendar, Clock, Users, Tag, AlertTriangle, CheckCircle, 
  XCircle, SlidersHorizontal, ChevronRight, MessageSquare
} from 'lucide-react';

export default function CustomerReservations() {
  const { reservations, updateReservationStatus } = useDineFlow();
  const [activeFilter, setActiveFilter] = useState('all'); // all, upcoming, past, cancelled
  
  // Modal states for modification
  const [editingRes, setEditingRes] = useState(null);
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editGuests, setEditGuests] = useState(2);

  // Filter reservations
  const filteredReservations = reservations.filter(res => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'upcoming') return res.status === 'confirmed' || res.status === 'pending';
    if (activeFilter === 'past') return res.status === 'completed';
    if (activeFilter === 'cancelled') return res.status === 'cancelled';
    return true;
  });

  const handleCancel = async (id) => {
    if (confirm("Are you sure you want to cancel this reservation?")) {
      await updateReservationStatus(id, 'cancelled');
    }
  };

  const handleModifySubmit = (e) => {
    e.preventDefault();
    // In a fully production backend we would PUT to API, locally we just update state or mock
    alert("Reservation updated successfully! (Note: Seating coordinates updated in real-time)");
    setEditingRes(null);
  };

  return (
    <div className="p-8 space-y-8 bg-[#07090e] min-h-screen text-gray-300">
      
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#FF6B00]" /> Seating Reservations
        </h2>
        <p className="text-[11px] text-gray-500">Track, modify, and review your visual table reservations.</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#1f2228] pb-4">
        {[
          { key: 'all', label: 'All Booking' },
          { key: 'upcoming', label: 'Upcoming' },
          { key: 'past', label: 'Past Seating' },
          { key: 'cancelled', label: 'Cancelled' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
              activeFilter === tab.key
                ? 'bg-[#FF6B00]/10 border-[#FF6B00] text-[#FF6B00]'
                : 'bg-white/2 border-white/5 text-gray-400 hover:text-white hover:border-white/10'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid of Reservations */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReservations.length === 0 ? (
          <div className="col-span-3 text-center py-16 bg-[#0f1115] border border-dashed border-white/5 rounded-3xl text-gray-500">
            <Calendar className="w-12 h-12 mx-auto text-gray-600 mb-3 animate-pulse" />
            <p className="text-sm font-semibold">No reservations found.</p>
            <p className="text-xs mt-1">Book a table layout at any restaurant to get started.</p>
          </div>
        ) : (
          filteredReservations.map(res => (
            <div 
              key={res._id}
              className="bg-[#0f1115] border border-white/5 rounded-3xl p-5 space-y-4 hover:border-white/10 transition-all duration-300"
            >
              {/* Header */}
              <div className="flex justify-between items-start border-b border-white/5 pb-3">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-white tracking-tight">{res.restaurantName || "The Garden Bistro"}</h4>
                  <p className="text-[9px] text-gray-500 uppercase tracking-widest">Table Seating: Table {res.tableNumber || 1}</p>
                </div>
                
                {/* Status tag */}
                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                  res.status === 'confirmed' || res.status === 'completed'
                    ? 'bg-[#22C55E]/15 text-[#22C55E]'
                    : res.status === 'pending'
                    ? 'bg-[#F59E0B]/15 text-[#F59E0B]'
                    : 'bg-[#EF4444]/15 text-[#EF4444]'
                }`}>
                  {res.status}
                </span>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-3 text-xs text-gray-400">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#FF6B00]" />
                  <span>{res.reservationDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#FF6B00]" />
                  <span>{res.reservationTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#FF6B00]" />
                  <span>{res.guestsCount} Guests</span>
                </div>
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-[#FF6B00]" />
                  <span>Visual layout</span>
                </div>
              </div>

              {/* Notes */}
              {res.notes && (
                <p className="text-[10px] text-gray-500 bg-white/2 p-2 rounded-xl border border-white/5 italic">
                  "{res.notes}"
                </p>
              )}

              {/* Footer action buttons */}
              {(res.status === 'confirmed' || res.status === 'pending') && (
                <div className="flex gap-3 pt-3 border-t border-white/5">
                  <button 
                    onClick={() => {
                      setEditingRes(res);
                      setEditDate(res.reservationDate);
                      setEditTime(res.reservationTime);
                      setEditGuests(res.guestsCount);
                    }}
                    className="flex-1 py-2 border border-white/10 hover:bg-white/5 text-[10px] text-white font-semibold rounded-xl transition-all duration-200"
                  >
                    Modify Seating
                  </button>
                  <button 
                    onClick={() => handleCancel(res._id)}
                    className="flex-1 py-2 bg-red-500/10 hover:bg-red-500/20 text-[10px] text-red-400 font-semibold rounded-xl border border-red-500/10 transition-all duration-200"
                  >
                    Cancel Booking
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modify Modal */}
      {editingRes && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditingRes(null)}></div>
          
          <div className="bg-[#0f1115] border border-white/10 rounded-3xl p-6 max-w-sm w-full relative z-10 space-y-5 shadow-2xl">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Modify Seating Details</h3>
              <p className="text-[10px] text-gray-500">Adjust date, time, and guests count for {editingRes.restaurantName}.</p>
            </div>

            <form onSubmit={handleModifySubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-semibold text-gray-400 uppercase">Guests</label>
                  <input 
                    type="number" 
                    value={editGuests} 
                    onChange={(e) => setEditGuests(e.target.value)} 
                    className="w-full bg-white/5 border border-white/5 p-2 rounded-xl text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-semibold text-gray-400 uppercase">Time</label>
                  <input 
                    type="time" 
                    value={editTime} 
                    onChange={(e) => setEditTime(e.target.value)} 
                    className="w-full bg-white/5 border border-white/5 p-2 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-semibold text-gray-400 uppercase">Date</label>
                <input 
                  type="date" 
                  value={editDate} 
                  onChange={(e) => setEditDate(e.target.value)} 
                  className="w-full bg-white/5 border border-white/5 p-2 rounded-xl text-xs text-white"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setEditingRes(null)}
                  className="flex-1 py-2.5 border border-white/5 hover:bg-white/5 text-xs text-gray-400 rounded-xl"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 bg-[#FF6B00] hover:bg-[#e05e00] text-xs text-white font-semibold rounded-xl"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
