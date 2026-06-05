"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDineFlow } from '../../context';
import PaymentModal from '../../../components/PaymentModal';
import BackButton from '../../../components/BackButton';
import { Minus, Plus, Trash2 } from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const { cart, removeFromCart, updateCartQty, checkout } = useDineFlow();
  const [showPay, setShowPay] = useState(false);

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const tax = subtotal * 0.085;
  const service = subtotal * 0.1;
  const total = subtotal + tax + service;

  const handleCheckout = async (method) => {
    const result = await checkout(method);
    if (result.success) {
      router.push(`/customer/order-tracking?id=${result.order._id}`);
    }
    return result;
  };

  if (!cart.length) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <BackButton />
        <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Your cart is empty</p>
        <a href="/customer" className="text-primary font-semibold">Browse restaurants</a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <BackButton />
      <h1 className="text-2xl font-bold font-display text-white">Your Cart</h1>
      <div className="space-y-3">
        {cart.map((item) => (
          <div key={item._id} className="glass-panel rounded-[20px] p-4 flex gap-4 items-center border border-white/5">
            <img src={item.image} alt="" className="w-16 h-16 rounded-xl object-cover" />
            <div className="flex-1">
              <h3 className="font-semibold text-white">{item.name}</h3>
              <p className="text-primary font-bold">${item.price?.toFixed(2)}</p>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => updateCartQty(item._id, item.quantity - 1)} className="p-1.5 rounded-lg bg-white/5"><Minus className="w-4 h-4" /></button>
              <span className="w-6 text-center">{item.quantity}</span>
              <button type="button" onClick={() => updateCartQty(item._id, item.quantity + 1)} className="p-1.5 rounded-lg bg-white/5"><Plus className="w-4 h-4" /></button>
            </div>
            <button type="button" onClick={() => removeFromCart(item._id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
      <div className="glass-panel rounded-[20px] p-6 border border-white/5 space-y-2 text-sm">
        <div className="flex justify-between text-gray-400"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
        <div className="flex justify-between text-gray-400"><span>Tax</span><span>${tax.toFixed(2)}</span></div>
        <div className="flex justify-between text-gray-400"><span>Service</span><span>${service.toFixed(2)}</span></div>
        <div className="flex justify-between text-white font-bold text-lg pt-2 border-t border-white/10"><span>Total</span><span className="text-primary">${total.toFixed(2)}</span></div>
      </div>
      <button type="button" onClick={() => setShowPay(true)} className="w-full py-4 rounded-[20px] bg-primary text-white font-bold text-lg">
        Proceed to Checkout
      </button>
      <PaymentModal open={showPay} onClose={() => setShowPay(false)} total={total} onConfirm={handleCheckout} />
    </div>
  );
}
