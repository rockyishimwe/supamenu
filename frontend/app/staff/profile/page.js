"use client";
import { useState, useEffect } from 'react';
import { useStore } from '../../../lib/store';
import { useToast } from '../../../lib/useToast';
import BackButton from '../../../components/BackButton';
import Avatar from '../../../components/Avatar';

export default function StaffProfilePage() {
  const { currentUser, token, updateProfile } = useStore();
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setEmail(currentUser.email || '');
    }
  }, [currentUser]);

  const handleSave = async () => {
    if (!name || !email) {
      showToast('All fields are required.', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await updateProfile({ name, email }, token);
      if (res.success) {
        showToast('Profile saved successfully!', 'success');
      } else {
        showToast(res.message || 'Failed to update profile.', 'error');
      }
    } catch (err) {
      showToast('An unexpected error occurred.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <BackButton />
      <h1 className="text-2xl font-bold font-display text-white">Staff Profile</h1>
      <div className="glass-panel rounded-[20px] p-6 border border-white/5 flex items-center gap-4">
        <Avatar src={currentUser?.avatar} name={currentUser?.name} size="lg" />
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
          <input 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            className="w-full glass-input mt-1 px-4 py-2.5" 
          />
        </div>
        <div>
          <label className="text-xs text-gray-500">Email</label>
          <input 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            className="w-full glass-input mt-1 px-4 py-2.5" 
          />
        </div>
        <button 
          onClick={handleSave} 
          disabled={loading}
          type="button" 
          className="w-full py-3 rounded-[20px] bg-primary text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-55"
        >
          {loading ? 'Saving Changes...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
