"use client";
import { useState, useEffect } from 'react';
import { useStore } from '../../../lib/store';
import BackButton from '../../../components/BackButton';
import Avatar from '../../../components/Avatar';
import { useToast } from '../../../lib/useToast';

export default function OwnerProfilePage() {
  const { currentUser, token, updateProfile, restaurants } = useStore();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [restaurantAddress, setRestaurantAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const myRestaurant = currentUser?.ownerDetails?.restaurantId
    ? restaurants.find((r) => r._id === currentUser.ownerDetails.restaurantId)
    : null;

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setEmail(currentUser.email || '');
    }
    if (myRestaurant) {
      setRestaurantName(myRestaurant.name || '');
      setRestaurantAddress(myRestaurant.address || '');
    }
  }, [currentUser, myRestaurant]);

  const handleSave = async () => {
    if (!name || !email) {
      toast.error('Name and email are required.');
      return;
    }
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await updateProfile({ name, email });
      if (res.success) {
        toast.success('Profile saved successfully!');
        setMessage({ type: 'success', text: 'Profile updated.' });
      } else {
        toast.error(res.message || 'Failed to update profile.');
        setMessage({ type: 'error', text: res.message });
      }
    } catch {
      toast.error('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <BackButton />
      <h1 className="text-2xl font-bold font-display text-white">Owner Profile</h1>

      {/* Profile card */}
      <div className="glass-panel rounded-[20px] p-6 border border-white/5 flex items-center gap-4">
        <Avatar src={currentUser?.avatar} name={currentUser?.name} size="lg" />
        <div>
          <h2 className="text-xl font-bold text-white">{currentUser?.name || 'Owner'}</h2>
          <p className="text-gray-500 text-sm">{currentUser?.email}</p>
          <p className="text-primary text-xs font-semibold mt-1 uppercase">Owner</p>
        </div>
      </div>

      {/* Account settings */}
      <div className="glass-panel rounded-[20px] p-6 border border-white/5 space-y-4">
        <h3 className="font-semibold text-white">Account Settings</h3>

        {message.text && (
          <div className={`p-3 rounded-lg text-sm ${
            message.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
          }`}>
            {message.text}
          </div>
        )}

        <div>
          <label className="text-xs text-gray-500">Display Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)}
            className="w-full glass-input mt-1 px-4 py-2.5" />
        </div>
        <div>
          <label className="text-xs text-gray-500">Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full glass-input mt-1 px-4 py-2.5" />
        </div>
        <button onClick={handleSave} disabled={loading}
          className="w-full py-3 rounded-[20px] bg-primary text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-55">
          {loading ? 'Saving Changes...' : 'Save Changes'}
        </button>
      </div>

      {/* Restaurant Info */}
      {myRestaurant && (
        <div className="glass-panel rounded-[20px] p-6 border border-white/5 space-y-4">
          <h3 className="font-semibold text-white">Your Restaurant</h3>
          <div>
            <label className="text-xs text-gray-500">Restaurant Name</label>
            <input value={restaurantName} onChange={(e) => setRestaurantName(e.target.value)}
              className="w-full glass-input mt-1 px-4 py-2.5" />
          </div>
          <div>
            <label className="text-xs text-gray-500">Address</label>
            <input value={restaurantAddress} onChange={(e) => setRestaurantAddress(e.target.value)}
              className="w-full glass-input mt-1 px-4 py-2.5" />
          </div>
          {myRestaurant.inviteCode && (
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 text-center space-y-1">
              <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">Staff Invite Code</p>
              <p className="text-2xl font-mono font-extrabold tracking-[0.2em] text-primary">{myRestaurant.inviteCode}</p>
              <p className="text-[10px] text-gray-500">Share this code with staff to join your restaurant.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
