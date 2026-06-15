"use client";
import { motion } from 'framer-motion';
import { Calendar, Users, MapPin } from 'lucide-react';

const STATUS_STYLES = {
  confirmed: 'bg-emerald-500/15 text-emerald-400',
  completed: 'bg-blue-500/15 text-blue-400',
  cancelled: 'bg-red-500/15 text-red-400',
};

export default function ReservationCard({ reservation, onModify, onCancel }) {
  return (
    <motion.div whileHover={{ scale: 1.01 }} className="glass-panel rounded-[20px] p-4 border border-white/5">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-white">{reservation.restaurantName}</h3>
          <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
            <MapPin className="w-3 h-3" /> Table {reservation.tableNumber || 'TBD'}
          </p>
        </div>
        <span className={`text-[10px] px-2 py-1 rounded-full font-semibold uppercase ${STATUS_STYLES[reservation.status] || STATUS_STYLES.confirmed}`}>
          {reservation.status}
        </span>
      </div>
      <div className="flex gap-4 text-sm text-gray-400">
        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {reservation.reservationDate}</span>
        <span>{reservation.reservationTime}</span>
        <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {reservation.guestsCount}</span>
      </div>
      {reservation.status === 'confirmed' && (
        <div className="flex gap-2 mt-4">
          <button type="button" onClick={() => onModify?.(reservation)} className="flex-1 py-2 text-xs rounded-xl border border-white/10 hover:bg-white/5">Modify</button>
          <button type="button" onClick={() => onCancel?.(reservation)} className="flex-1 py-2 text-xs rounded-xl bg-red-500/15 text-red-400 hover:bg-red-500/25">Cancel</button>
        </div>
      )}
    </motion.div>
  );
}
