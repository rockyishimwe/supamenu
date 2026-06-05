"use client";
import { useDineFlow } from '../../context';

export default function StaffProfilePage() {
  const { currentUser } = useDineFlow();

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold font-display text-white">Staff Profile</h1>
      <div className="glass-panel rounded-[20px] p-6 border border-white/5 flex items-center gap-4">
        <img src={currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} alt="" className="w-20 h-20 rounded-full object-cover" />
        <div>
          <h2 className="text-xl font-bold text-white">{currentUser?.name || 'Alex Morgan'}</h2>
          <p className="text-gray-500 text-sm">{currentUser?.email}</p>
          <p className="text-primary text-xs font-semibold mt-1 uppercase">{currentUser?.staffDetails?.role || 'Server'}</p>
        </div>
      </div>
      <div className="glass-panel rounded-[20px] p-6 border border-white/5 space-y-4">
        <h3 className="font-semibold text-white">Account Settings</h3>
        <div>
          <label className="text-xs text-gray-500">Display Name</label>
          <input defaultValue={currentUser?.name} className="w-full glass-input mt-1 px-4 py-2.5" />
        </div>
        <div>
          <label className="text-xs text-gray-500">Email</label>
          <input defaultValue={currentUser?.email} className="w-full glass-input mt-1 px-4 py-2.5" />
        </div>
        <button type="button" className="w-full py-3 rounded-[20px] bg-primary text-white font-semibold">Save Changes</button>
      </div>
    </div>
  );
}
