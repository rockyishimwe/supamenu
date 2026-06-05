"use client";
import React, { useState } from 'react';
import { useDineFlow } from '../../context';
import { 
  LayoutGrid, Plus, Trash2, ShieldCheck, MapPin, 
  Sparkles, CheckCircle2, ChevronRight, Award, Compass, AlertCircle
} from 'lucide-react';

export default function OwnerTablesBuilder() {
  const { tables, addTable, deleteTable } = useDineFlow();
  
  // Form State
  const [tableNumber, setTableNumber] = useState('');
  const [capacity, setCapacity] = useState('4');
  const [location, setLocation] = useState('Main Floor');
  const [shape, setShape] = useState('square');
  const [coordX, setCoordX] = useState('30');
  const [coordY, setCoordY] = useState('30');
  
  const [formSuccess, setFormSuccess] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tableNumber) return;

    await addTable({
      tableNumber,
      capacity,
      location,
      shape,
      x: coordX,
      y: coordY
    });

    setFormSuccess(true);
    setTableNumber('');
    setTimeout(() => {
      setFormSuccess(false);
      setShowAddForm(false);
    }, 2000);
  };

  return (
    <div className="p-8 space-y-8 bg-[#07090e] min-h-screen text-gray-300">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-[#FF6B00]" /> Floor Tables Builder
          </h2>
          <p className="text-[11px] text-gray-500">Configure visual coordinate seating plans, define capacities, and map stages.</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2.5 bg-[#FF6B00] hover:bg-[#e05e00] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-[#FF6B00]/10 hover-lift transition-all"
        >
          <Plus className="w-4 h-4" /> Add Table Seating
        </button>
      </div>

      {/* Main Splits */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Layout Grid Map */}
        <div className="lg:col-span-8 space-y-6">
          <div className="border border-white/5 bg-[#0f1115]/50 backdrop-blur-md rounded-3xl p-6 relative overflow-hidden h-[340px] flex items-center justify-center">
            <div className="absolute inset-0 bg-[radial-gradient(#1f2228_1px,transparent_1px)] [background-size:20px_20px] opacity-15"></div>
            
            {/* Visual tables mapping based on Coordinates */}
            {tables.map((t, idx) => {
              // Standard fallback coordinates to spread out on floor
              const coordinates = [
                { x: '15%', y: '20%' }, { x: '35%', y: '20%' }, { x: '55%', y: '20%' }, { x: '75%', y: '20%' },
                { x: '15%', y: '50%' }, { x: '35%', y: '50%' }, { x: '55%', y: '50%' }, { x: '75%', y: '50%' },
                { x: '15%', y: '80%' }, { x: '35%', y: '80%' }, { x: '55%', y: '80%' }, { x: '75%', y: '80%' },
              ];
              // Use coordinates if present, else fallback
              const posX = t.x ? `${t.x}%` : (coordinates[idx]?.x || '50%');
              const posY = t.y ? `${t.y}%` : (coordinates[idx]?.y || '50%');

              return (
                <div
                  key={t._id}
                  style={{ left: posX, top: posY }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center font-bold text-[10px] text-white"
                >
                  T{t.tableNumber}
                  <span className="text-[7.5px] font-semibold text-gray-500">{t.capacity} Seats</span>
                </div>
              );
            })}
          </div>

          {/* List/Tables deletions */}
          <div className="bg-[#0f1115] border border-white/5 p-6 rounded-3xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Active Floor Seating Inventory</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              {tables.map(t => (
                <div key={t._id} className="flex justify-between items-center p-3 bg-white/2 border border-white/5 rounded-2xl text-xs">
                  <div>
                    <p className="font-bold text-white">Table {t.tableNumber}</p>
                    <p className="text-[9px] text-gray-500 uppercase tracking-widest">{t.location} • {t.capacity} Person Shape: {t.shape}</p>
                  </div>
                  <button 
                    onClick={() => deleteTable(t._id)}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/10 rounded-xl transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Form panel */}
        {showAddForm && (
          <div className="lg:col-span-4 bg-[#0f1115] border border-white/5 p-6 rounded-3xl space-y-6 animate-in fade-in duration-200">
            <div className="space-y-1.5 pb-4 border-b border-white/5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Configure Seating Table</h3>
              <p className="text-[10px] text-gray-500">Add grid coordinates to place on floor plan map.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase">Table #</label>
                  <input 
                    type="number" 
                    value={tableNumber} 
                    onChange={(e) => setTableNumber(e.target.value)} 
                    required
                    placeholder="e.g. 16"
                    className="w-full bg-white/5 border border-white/5 p-2.5 rounded-xl text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase">Capacity</label>
                  <input 
                    type="number" 
                    value={capacity} 
                    onChange={(e) => setCapacity(e.target.value)} 
                    required
                    className="w-full bg-white/5 border border-white/5 p-2.5 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase">Map X (%)</label>
                  <input 
                    type="number" 
                    min="5"
                    max="95"
                    value={coordX} 
                    onChange={(e) => setCoordX(e.target.value)} 
                    required
                    className="w-full bg-white/5 border border-white/5 p-2.5 rounded-xl text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase">Map Y (%)</label>
                  <input 
                    type="number" 
                    min="5"
                    max="95"
                    value={coordY} 
                    onChange={(e) => setCoordY(e.target.value)} 
                    required
                    className="w-full bg-white/5 border border-white/5 p-2.5 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase">Shape</label>
                  <select 
                    value={shape} 
                    onChange={(e) => setShape(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 p-2.5 rounded-xl text-xs text-white"
                  >
                    <option value="square" className="bg-[#0f1115]">Square</option>
                    <option value="round" className="bg-[#0f1115]">Round</option>
                    <option value="rectangle" className="bg-[#0f1115]">Rectangle</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase">Zone Area</label>
                  <select 
                    value={location} 
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 p-2.5 rounded-xl text-xs text-white"
                  >
                    <option value="Main Floor" className="bg-[#0f1115]">Main Floor</option>
                    <option value="Patio Deck" className="bg-[#0f1115]">Patio Deck</option>
                    <option value="Bar Section" className="bg-[#0f1115]">Bar Section</option>
                  </select>
                </div>
              </div>

              {formSuccess && (
                <div className="bg-[#22C55E]/10 border border-[#22C55E]/20 p-3 rounded-xl text-center text-xs text-[#22C55E] flex items-center justify-center gap-1.5 font-semibold">
                  <CheckCircle2 className="w-4 h-4" /> Table added successfully!
                </div>
              )}

              <button 
                type="submit"
                className="w-full py-3 bg-[#FF6B00] hover:bg-[#e05e00] text-white font-bold text-xs rounded-xl shadow-lg shadow-[#FF6B00]/15"
              >
                Add Seating Table
              </button>
            </form>
          </div>
        )}

      </div>

    </div>
  );
}
