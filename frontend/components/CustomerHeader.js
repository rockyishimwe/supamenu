"use client";
import React, { useState } from 'react';
import { useDineFlow } from '../app/context';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  MapPin, Search, Heart, ShoppingCart, Bell, X, Plus, Minus, Trash2, ShieldCheck, Wallet, ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DEFAULTS } from '../lib/constants';

export default function CustomerHeader() {
  const { cart, updateCartQty, removeFromCart, checkout, currentUser, activeRole, setActiveRole } = useDineFlow();
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * (DEFAULTS.TAX_RATE / 100);
  const serviceCharge = subtotal * (DEFAULTS.SERVICE_CHARGE / 100);
  const total = subtotal + tax + serviceCharge;

  const handleCheckout = async () => {
    setErrorMsg("");
    const res = await checkout('wallet');
    if (res.success) {
      setCheckoutSuccess(true);
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#FF6B00', '#ffffff', '#22C55E']
      });
      setTimeout(() => {
        setCheckoutSuccess(false);
        setCartOpen(false);
        router.push('/customer/profile?tab=orders');
      }, 2500);
    } else {
      setErrorMsg(res.message || "Failed to complete checkout.");
    }
  };

  return (
    <>
      <header className="h-20 bg-panel/80 backdrop-blur-md border-b border-[#1f2228] flex items-center justify-between px-8 fixed top-0 right-0 left-64 z-20">
        {/* Left: Location & Search */}
        <div className="flex items-center gap-6 flex-1 max-w-xl">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/5 border border-white/5 text-sm hover:bg-white/10 transition-all duration-200 cursor-pointer">
            <MapPin className="text-[#FF6B00] w-4.5 h-4.5" />
            <span className="font-medium text-white text-xs">New York, USA</span>
          </div>

          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4.5 h-4.5" />
            <input 
              type="text" 
              placeholder="Search for restaurants, cuisines, dishes..." 
              className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-white/5 border border-white/5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B00] focus:bg-white/10 transition-all duration-300"
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200 relative">
            <Bell className="w-4.5 h-4.5" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#FF6B00]"></span>
          </button>

          {/* Cart Trigger */}
          <button 
            onClick={() => setCartOpen(true)}
            className="h-10 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center gap-2 text-gray-400 hover:text-white transition-all duration-200 relative"
          >
            <ShoppingCart className="w-4.5 h-4.5 text-[#FF6B00]" />
            <span className="text-xs font-semibold text-white">{cartCount}</span>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1.5 rounded-full bg-[#FF6B00] text-[10px] font-bold text-white flex items-center justify-center shadow-lg shadow-[#FF6B00]/20 animate-bounce">
                {cartCount}
              </span>
            )}
          </button>

          {/* Portal Switcher dropdown (Customer, Staff, Owner) */}
          <div className="flex items-center gap-2 pl-4 border-l border-[#1f2228]">
            <select
              value={activeRole}
              onChange={(e) => {
                const newRole = e.target.value;
                setActiveRole(newRole);
                if (newRole === 'customer') router.push('/customer');
                else if (newRole === 'staff') router.push('/staff');
                else if (newRole === 'owner') router.push('/owner');
              }}
              className="bg-white/5 border border-white/5 text-xs text-gray-300 px-3 py-2 rounded-xl focus:outline-none focus:border-[#FF6B00] font-medium"
            >
              <option value="customer" className="bg-panel">Customer Portal</option>
              <option value="staff" className="bg-panel">Staff Portal</option>
              <option value="owner" className="bg-panel">Owner Dashboard</option>
            </select>
          </div>
        </div>
      </header>

      {/* Cart Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setCartOpen(false)}
          ></div>

          {/* Panel */}
          <div className="absolute inset-y-0 right-0 max-w-md w-full bg-panel border-l border-[#1f2228] shadow-2xl flex flex-col justify-between p-6">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-6 border-b border-[#1f2228]">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="text-[#FF6B00] w-5 h-5" />
                  <h2 className="text-lg font-bold text-white">Your Cart</h2>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-400 font-semibold">{cartCount} items</span>
                </div>
                <button 
                  onClick={() => setCartOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-all duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Cart List */}
              <div className="overflow-y-auto max-h-[50vh] mt-6 space-y-4 pr-1">
                {cart.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <ShoppingCart className="w-12 h-12 mx-auto text-gray-600 mb-3" />
                    <p className="text-sm">Your cart is empty.</p>
                    <p className="text-xs mt-1">Browse restaurants to add delicious items!</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item._id} className="flex gap-4 p-3 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all duration-200">
                      <Image 
                        src={item.image} 
                        alt={item.name} 
                        width={64}
                        height={64}
                        className="rounded-xl object-cover"
                      />
                      <div className="flex-1 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-xs font-semibold text-white truncate max-w-[150px]">{item.name}</h4>
                            <p className="text-[10px] text-gray-500 mt-0.5">{item.category}</p>
                          </div>
                          <span className="text-xs font-bold text-white">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <div className="flex items-center gap-2 bg-white/5 rounded-xl border border-white/5 px-2 py-1">
                            <button 
                              onClick={() => updateCartQty(item._id, item.quantity - 1)}
                              className="text-gray-400 hover:text-white p-0.5"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs text-white font-medium min-w-[14px] text-center">{item.quantity}</span>
                            <button 
                              onClick={() => updateCartQty(item._id, item.quantity + 1)}
                              className="text-gray-400 hover:text-white p-0.5"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <button 
                            onClick={() => removeFromCart(item._id)}
                            className="text-gray-500 hover:text-red-500 transition-all duration-150 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Footer Calculation */}
            {cart.length > 0 && (
              <div className="border-t border-[#1f2228] pt-6 space-y-4 bg-panel">
                {checkoutSuccess ? (
                  <div className="bg-[#22C55E]/10 border border-[#22C55E]/20 p-6 rounded-2xl text-center space-y-2 animate-pulse">
                    <ShieldCheck className="w-10 h-10 text-[#22C55E] mx-auto" />
                    <h3 className="text-[#22C55E] font-bold text-sm">Order Placed Successfully!</h3>
                    <p className="text-[11px] text-gray-400">Your order has been sent to the kitchen. Redirecting to tracking...</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>Taxes (8.5%)</span>
                        <span>${tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>Service Charges (10%)</span>
                        <span>${serviceCharge.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-dashed border-[#1f2228]">
                        <span>Total Due</span>
                        <span className="text-[#FF6B00]">${total.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Pay with wallet warning / details */}
                    {currentUser && (
                      <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 text-[11px]">
                        <div className="flex items-center gap-2 text-gray-400">
                          <Wallet className="w-4 h-4 text-[#FF6B00]" />
                          <span>DineFlow Wallet Balance:</span>
                        </div>
                        <span className="font-semibold text-white">${currentUser.walletBalance.toFixed(2)}</span>
                      </div>
                    )}

                    {errorMsg && (
                      <p className="text-red-500 text-[11px] text-center font-medium bg-red-500/5 p-2 rounded-xl border border-red-500/10">{errorMsg}</p>
                    )}

                    <button 
                      onClick={handleCheckout}
                      disabled={currentUser && currentUser.walletBalance < total}
                      className="w-full bg-[#FF6B00] disabled:bg-gray-700 disabled:cursor-not-allowed hover:bg-[#e05e00] text-white py-3.5 px-6 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 hover-lift shadow-lg shadow-[#FF6B00]/15"
                    >
                      {currentUser && currentUser.walletBalance < total ? 'Insufficient Wallet Balance' : 'Pay & Confirm Order'}
                      <ArrowRight className="w-4.5 h-4.5" />
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
