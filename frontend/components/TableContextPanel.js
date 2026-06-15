"use client";
import { useDineFlow } from '../app/context';

const STATUSES = ['available', 'occupied', 'reserved', 'cleaning'];

export default function TableContextPanel({ table, onClose }) {
  const { updateTableStatus } = useDineFlow();
  if (!table) return null;

  const handleStatus = async (status) => {
    const details = { status };
    if (status === 'available') {
      details.currentGuestName = '';
      details.currentOrderTotal = 0;
      details.currentDuration = 0;
    }
    await updateTableStatus(table._id, details);
  };

  return (
    <div className="glass-panel rounded-[20px] p-5 border border-white/5 space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-bold text-white">Table {table.tableNumber}</h3>
          <p className="text-xs text-gray-500 capitalize">{table.status} · {table.capacity} seats</p>
        </div>
        {onClose && (
          <button type="button" onClick={onClose} className="text-gray-500 hover:text-white text-sm">✕</button>
        )}
      </div>
      {table.currentGuestName && (
        <div className="text-sm space-y-1 text-gray-400">
          <p>Guest: <span className="text-white">{table.currentGuestName}</span></p>
          {table.assignedServer && <p>Server: {table.assignedServer}</p>}
          {table.currentOrderTotal > 0 && <p>Order: ${table.currentOrderTotal?.toFixed(2)}</p>}
          {table.currentDuration > 0 && <p>Duration: {table.currentDuration} min</p>}
        </div>
      )}
      <div>
        <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">Update Status</p>
        <div className="grid grid-cols-2 gap-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => handleStatus(s)}
              className={`py-2 text-xs rounded-xl capitalize font-semibold border ${
                table.status === s ? 'border-primary bg-primary/15 text-primary' : 'border-white/10 hover:bg-white/5'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      <button type="button" className="w-full py-2.5 rounded-xl bg-primary text-white text-sm font-semibold">
        Quick Order Entry
      </button>
    </div>
  );
}
