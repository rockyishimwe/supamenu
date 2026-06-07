"use client";
import { useState, useEffect } from 'react';
import { useStore } from '../../../lib/store';
import BackButton from '../../../components/BackButton';
import Avatar from '../../../components/Avatar';

export default function StaffProfilePage() {
  const { currentUser, token, updateProfile } = useStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setEmail(currentUser.email || '');
    }
  }, [currentUser]);

  const handleSave = async () => {
    if (!name || !email) {
      setMessage({ type: 'error', text: 'All fields are required.' });
      return;
    }
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await updateProfile({ name, email });
      if (res.success) {
        setMessage({ type: 'success', text: 'Profile saved successfully!' });
      } else {
        setMessage({ type: 'error', text: res.message || 'Failed to update profile.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'An unexpected error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <BackButton />
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
        
        {message.text && (
          <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
            {message.text}
          </div>
        )}

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
