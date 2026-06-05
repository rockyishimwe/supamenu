"use client";
import { useState } from 'react';
import { useDineFlow } from '../../context';
import TableCard from '../../../components/TableCard';
import TableContextPanel from '../../../components/TableContextPanel';
import FloorPlan from '../../../components/FloorPlan';
import BackButton from '../../../components/BackButton';

export default function StaffTablesPage() {
  const { tables, selectedTableId, setSelectedTableId } = useDineFlow();
  const [filter, setFilter] = useState('all');
  const displayTables = tables.slice(0, 15);
  const filtered = filter === 'all' ? displayTables : displayTables.filter((t) => t.status === filter);
  const selectedTable = displayTables.find((t) => t._id === selectedTableId);

  return (
    <div className="space-y-6">
      <BackButton />
      <h1 className="text-2xl font-bold font-display text-white">Tables</h1>
      <div className="flex gap-2 flex-wrap">
        {['all', 'available', 'occupied', 'reserved', 'cleaning'].map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize ${
              filter === f ? 'bg-primary text-white' : 'bg-white/5 text-gray-400'
            }`}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <FloorPlan tables={filtered} selectedTableId={selectedTableId} onTableSelect={(t) => setSelectedTableId(t._id)} />
        </div>
        <div className="lg:col-span-5 space-y-4">
          <TableContextPanel table={selectedTable} onClose={() => setSelectedTableId(null)} />
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((t) => (
              <TableCard key={t._id} table={t} selected={selectedTableId === t._id} onClick={() => setSelectedTableId(t._id)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
