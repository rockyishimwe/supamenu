"use client";
import { useDineFlow } from '../app/context';

export default function MiniCalendar() {
  const { reservations } = useDineFlow();
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const bookedDays = new Set(
    reservations
      .filter((r) => r.status === 'confirmed')
      .map((r) => parseInt(r.reservationDate?.split('-')[2], 10))
      .filter(Boolean)
  );

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="glass-panel rounded-[20px] p-4 border border-white/5">
      <h3 className="text-sm font-bold text-white mb-3">
        {today.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
      </h3>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-gray-500 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <span key={d}>{d[0]}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {cells.map((d, i) => (
          <span
            key={i}
            className={`py-1.5 rounded-lg ${
              d === today.getDate() ? 'bg-primary text-white font-bold' :
              d && bookedDays.has(d) ? 'bg-primary/20 text-primary font-semibold' :
              d ? 'text-gray-400' : ''
            }`}
          >
            {d || ''}
          </span>
        ))}
      </div>
    </div>
  );
}