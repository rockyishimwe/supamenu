"use client";
import React, { useState } from 'react';
import { 
  Users, Plus, Trash2, ShieldCheck, Mail, Sparkles, Check, 
  ChevronRight, Calendar, UserCheck, Star, Award, X
} from 'lucide-react';
import BackButton from '../../../components/BackButton';
import { useToast } from '../../../lib/useToast';
import { validateForm } from '../../../lib/validation';

const initialStaff = [
  { id: 1, name: 'Alex Morgan', role: 'Staff Waiter', email: 'alex@dineflow.com', shift: 'Morning shift (08:00 - 16:00)', performance: 4.8 },
  { id: 2, name: 'Emma Wilson', role: 'Head Chef', email: 'emma@dineflow.com', shift: 'Evening shift (16:00 - 24:00)', performance: 4.9 },
  { id: 3, name: 'David Lee', role: 'Staff Waiter', email: 'david@dineflow.com', shift: 'Morning shift (08:00 - 16:00)', performance: 4.5 },
  { id: 4, name: 'Sarah Jenkins', role: 'Store Manager', email: 'sarah@dineflow.com', shift: 'Flexible shift', performance: 5.0 }
];

export default function OwnerStaffRoster() {
  const { toast } = useToast();
  const [staffList, setStaffList] = useState(initialStaff);
  const [fieldErrors, setFieldErrors] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(null);
  
  // Form State
  const [name, setName] = useState('');
  const [role, setRole] = useState('Staff Waiter');
  const [email, setEmail] = useState('');
  const [shift, setShift] = useState('Morning shift (08:00 - 16:00)');
  
  const [formSuccess, setFormSuccess] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setFieldErrors({});

    const { valid, errors } = validateForm(
      { name, email },
      { name: ['required'], email: ['required', 'email'] }
    );
    if (!valid) {
      setFieldErrors(errors);
      return;
    }

    const newMember = {
      id: Date.now(),
      name,
      role,
      email,
      shift,
      performance: 5.0
    };

    setStaffList([...staffList, newMember]);
    toast.success('Staff member added successfully!');
    setFormSuccess(true);
    setName('');
    setEmail('');
    
    setTimeout(() => {
      setFormSuccess(false);
      setShowAddForm(false);
    }, 2000);
  };

  const handleDelete = (id) => {
    setConfirmDelete(id);
  };

  const confirmDeleteAction = () => {
    setStaffList(staffList.filter(s => s.id !== confirmDelete));
    toast.success('Staff member removed.');
    setConfirmDelete(null);
  };

  return (
    <>
    <div className="p-8 space-y-8 bg-[#07090e] min-h-screen text-gray-300">
      <BackButton />

      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-[#FF6B00]" /> Staff Waiter Rosters
          </h2>
          <p className="text-[11px] text-gray-500">Manage shift schedules, assign server table zones, and review service ratings.</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2.5 bg-[#FF6B00] hover:bg-[#e05e00] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-[#FF6B00]/10 hover-lift transition-all"
        >
          <Plus className="w-4 h-4" /> Add Waiter Staff
        </button>
      </div>

      {/* Main Splits */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Staff Cards List */}
        <div className="lg:col-span-8 grid sm:grid-cols-2 gap-6">
          {staffList.map(s => (
            <div 
              key={s.id}
              className="bg-[#0f1115] border border-white/5 p-5 rounded-3xl space-y-4 hover:border-white/10 transition-all duration-300 relative group"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-bold text-white uppercase text-xs">
                    {s.name.slice(0, 2)}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white tracking-tight">{s.name}</h3>
                    <p className="text-[9px] text-[#FF6B00] uppercase tracking-wider font-semibold">{s.role}</p>
                  </div>
                </div>
                
                <button 
                  onClick={() => handleDelete(s.id)}
                  className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2.5 pt-3 border-t border-white/5 text-[10px] text-gray-400 font-semibold">
                <p className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-gray-500" /> {s.email}</p>
                <p className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-gray-500" /> {s.shift}</p>
                <p className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" /> {s.performance} / 5.0 Rating</p>
              </div>
            </div>
          ))}
        </div>

        {/* Right Side: Form panel */}
        {showAddForm && (
          <div className="lg:col-span-4 bg-[#0f1115] border border-white/5 p-6 rounded-3xl space-y-6 animate-in fade-in duration-200">
            <div className="space-y-1.5 pb-4 border-b border-white/5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Register Staff</h3>
              <p className="text-[10px] text-gray-500">Provide name, email, credentials and initial shifts.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-400 uppercase">Staff Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required
                  placeholder="e.g. Emma Stone"
                  className="w-full bg-white/5 border border-white/5 p-2.5 rounded-xl text-xs text-white"
                />
                {fieldErrors.name && <p className="text-red-400 text-[10px] mt-1">{fieldErrors.name}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-400 uppercase">Email Address</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required
                  placeholder="e.g. emma.stone@dineflow.com"
                  className="w-full bg-white/5 border border-white/5 p-2.5 rounded-xl text-xs text-white"
                />
                {fieldErrors.email && <p className="text-red-400 text-[10px] mt-1">{fieldErrors.email}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-400 uppercase">Staff Role</label>
                <select 
                  value={role} 
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 p-2.5 rounded-xl text-xs text-white"
                >
                  <option value="Staff Waiter" className="bg-[#0f1115]">Staff Waiter</option>
                  <option value="Head Chef" className="bg-[#0f1115]">Head Chef</option>
                  <option value="Kitchen Crew" className="bg-[#0f1115]">Kitchen Crew</option>
                  <option value="Store Manager" className="bg-[#0f1115]">Store Manager</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-400 uppercase">Shift Timing</label>
                <select 
                  value={shift} 
                  onChange={(e) => setShift(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 p-2.5 rounded-xl text-xs text-white"
                >
                  <option value="Morning shift (08:00 - 16:00)" className="bg-[#0f1115]">Morning shift (08:00 - 16:00)</option>
                  <option value="Evening shift (16:00 - 24:00)" className="bg-[#0f1115]">Evening shift (16:00 - 24:00)</option>
                  <option value="Flexible shift" className="bg-[#0f1115]">Flexible shift</option>
                </select>
              </div>

              {formSuccess && (
                <div className="bg-[#22C55E]/10 border border-[#22C55E]/20 p-3 rounded-xl text-center text-xs text-[#22C55E] flex items-center justify-center gap-1.5 font-semibold">
                  <Check className="w-4 h-4" /> Staff registered successfully!
                </div>
              )}

              <button 
                type="submit"
                className="w-full py-3 bg-[#FF6B00] hover:bg-[#e05e00] text-white font-bold text-xs rounded-xl shadow-lg shadow-[#FF6B00]/15"
              >
                Add Staff Member
              </button>
            </form>
          </div>
        )}

      </div>

    </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setConfirmDelete(null)}>
          <div className="bg-[#0f1115] border border-white/10 rounded-3xl p-6 max-w-sm w-full mx-4 shadow-2xl space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Remove Staff</h3>
              <button onClick={() => setConfirmDelete(null)}><X className="w-4 h-4 text-gray-500" /></button>
            </div>
            <p className="text-xs text-gray-400">Are you sure you want to remove this staff member? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 border border-white/5 hover:bg-white/5 text-xs text-gray-400 rounded-xl">
                Cancel
              </button>
              <button onClick={confirmDeleteAction} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-xl">
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
  </>
  );
}
