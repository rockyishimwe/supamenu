"use client";
import { motion } from 'framer-motion';

const STATUS_COLORS = {
  available: { fill: 'rgba(34,197,94,0.2)', stroke: '#22c55e' },
  occupied: { fill: 'rgba(239,68,68,0.2)', stroke: '#ef4444' },
  reserved: { fill: 'rgba(245,158,11,0.2)', stroke: '#f59e0b' },
  cleaning: { fill: 'rgba(59,130,246,0.2)', stroke: '#3b82f6' },
};

function SimpleTableList({ tables, selectedTableId, onTableSelect }) {
  return (
    <div className="flex flex-col gap-2 md:hidden">
      {tables.map((table) => {
        const colors = STATUS_COLORS[table.status] || STATUS_COLORS.available;
        const isSelected = selectedTableId === table._id;
        return (
          <button
            key={table._id}
            onClick={() => onTableSelect?.(table)}
            className={`flex items-center justify-between px-4 py-3 rounded-2xl border text-sm transition-all ${
              isSelected ? 'border-primary bg-primary/10' : 'border-white/5 bg-white/2 hover:border-white/10'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white" style={{ background: colors.stroke + '20', border: `1px solid ${colors.stroke}` }}>
                {table.tableNumber}
              </span>
              <div className="text-left">
                <p className="text-sm font-medium text-white">Table {table.tableNumber}</p>
                <p className="text-[10px] text-gray-500">{table.capacity} seats</p>
              </div>
            </div>
            <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full`} style={{ color: colors.stroke, background: colors.fill }}>
              {table.status}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default function FloorPlan({ tables = [], selectedTableId, onTableSelect, restaurantId }) {
  const filtered = restaurantId
    ? tables.filter((t) => t.restaurantId === restaurantId || !t.restaurantId?.startsWith?.('res-'))
    : tables.filter((t) => !t.restaurantId || t.restaurantId === 'res-garden' || String(t.restaurantId).includes('garden'));

  const displayTables = filtered.length ? filtered : tables.slice(0, 15);

  return (
    <>
      {/* Desktop SVG floor plan */}
      <div className="hidden md:block relative w-full h-[340px] rounded-[20px] border border-white/5 bg-panel/50 backdrop-blur-md overflow-x-auto overflow-y-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#1f2228_1px,transparent_1px)] [background-size:20px_20px] opacity-20" />
        <div className="min-w-[600px] h-full">
          <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            {displayTables.map((table) => {
              const colors = STATUS_COLORS[table.status] || STATUS_COLORS.available;
              const isSelected = selectedTableId === table._id;
              const w = (table.width || 72) / 10;
              const h = (table.height || 72) / 10;
              const isRound = table.shape === 'round';

              return (
                <motion.g
                  key={table._id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => onTableSelect?.(table)}
                  animate={isSelected ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                >
                  {isRound ? (
                    <circle
                      cx={table.x}
                      cy={table.y}
                      r={w / 2}
                      fill={colors.fill}
                      stroke={colors.stroke}
                      strokeWidth={isSelected ? 0.6 : 0.35}
                    />
                  ) : (
                    <rect
                      x={table.x - w / 2}
                      y={table.y - h / 2}
                      width={w}
                      height={h}
                      rx={table.shape === 'rectangle' ? 0.8 : 1.2}
                      fill={colors.fill}
                      stroke={colors.stroke}
                      strokeWidth={isSelected ? 0.6 : 0.35}
                    />
                  )}
                  <text
                    x={table.x}
                    y={table.y - 0.5}
                    textAnchor="middle"
                    fill="white"
                    fontSize="3.2"
                    fontWeight="bold"
                  >
                    {table.tableNumber}
                  </text>
                  <text
                    x={table.x}
                    y={table.y + 2.5}
                    textAnchor="middle"
                    fill="#9ca3af"
                    fontSize="2"
                  >
                    {table.capacity}s
                  </text>
                </motion.g>
              );
            })}
          </svg>
        </div>
        <div className="absolute bottom-3 left-3 flex flex-wrap gap-2 text-[9px]">
          {Object.entries(STATUS_COLORS).map(([status, c]) => (
            <span key={status} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/40">
              <span className="w-2 h-2 rounded-full" style={{ background: c.stroke }} />
              {status}
            </span>
          ))}
        </div>
      </div>

      {/* Mobile simplified list view */}
      <div className="md:hidden">
        <SimpleTableList tables={displayTables} selectedTableId={selectedTableId} onTableSelect={onTableSelect} />
      </div>
    </>
  );
}
