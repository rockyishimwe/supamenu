"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useDineFlow } from '../../context';
import Image from 'next/image';
import PaymentModal from '../../../components/PaymentModal';
import BackButton from '../../../components/BackButton';
import AnimatedButton from '../../../components/AnimatedButton';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { DEFAULTS } from '../../../lib/constants';
import { staggerContainer, fadeUpItem } from '../../../components/PageTransition';

export default function CartPage() {
  const router = useRouter();
  const { cart, removeFromCart, updateCartQty, checkout } = useDineFlow();
  const [showPay, setShowPay] = useState(false);

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const tax = subtotal * (DEFAULTS.TAX_RATE / 100);
  const service = subtotal * (DEFAULTS.SERVICE_CHARGE / 100);
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto py-8"
      >
        <BackButton />
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="text-center py-16 space-y-4"
        >
          <ShoppingBag className="w-16 h-16 mx-auto text-gray-600" />
          <p className="text-gray-500 text-lg">Your cart is empty</p>
          <a href="/customer/explore" className="text-primary font-semibold hover:underline">
            Browse restaurants →
          </a>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <BackButton />
      <h1 className="text-2xl font-bold font-display text-white">Your Cart</h1>
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="space-y-3"
      >
        <AnimatePresence mode="popLayout">
        {cart.map((item) => (
          <motion.div
            key={item._id}
            variants={fadeUpItem}
            layout
            exit={{ opacity: 0, x: 100, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="glass-panel rounded-[20px] p-4 flex gap-4 items-center border border-white/5"
          >
            <Image src={item.image} alt="" width={64} height={64} className="rounded-xl object-cover" />
            <div className="flex-1">
              <h3 className="font-semibold text-white">{item.name}</h3>
              <p className="text-primary font-bold">${item.price?.toFixed(2)}</p>
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                type="button"
                onClick={() => updateCartQty(item._id, item.quantity - 1)}
                whileTap={{ scale: 0.9 }}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10"
              >
                <Minus className="w-4 h-4" />
              </motion.button>
              <motion.span
                key={item.quantity}
                initial={{ scale: 1.3 }}
                animate={{ scale: 1 }}
                className="w-6 text-center font-semibold"
              >
                {item.quantity}
              </motion.span>
              <motion.button
                type="button"
                onClick={() => updateCartQty(item._id, item.quantity + 1)}
                whileTap={{ scale: 0.9 }}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10"
              >
                <Plus className="w-4 h-4" />
              </motion.button>
            </div>
            <motion.button
              type="button"
              onClick={() => removeFromCart(item._id)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"
            >
              <Trash2 className="w-4 h-4" />
            </motion.button>
          </motion.div>
        ))}
        </AnimatePresence>
      </motion.div>
      <div className="glass-panel rounded-[20px] p-6 border border-white/5 space-y-2 text-sm">
        <div className="flex justify-between text-gray-400"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
        <div className="flex justify-between text-gray-400"><span>Tax</span><span>${tax.toFixed(2)}</span></div>
        <div className="flex justify-between text-gray-400"><span>Service</span><span>${service.toFixed(2)}</span></div>
        <div className="flex justify-between text-white font-bold text-lg pt-2 border-t border-white/10"><span>Total</span><span className="text-primary">${total.toFixed(2)}</span></div>
      </div>
      <AnimatedButton
        onClick={() => setShowPay(true)}
        variant="default"
        size="lg"
        className="w-full"
      >
        Proceed to Checkout — ${total.toFixed(2)}
      </AnimatedButton>
      <PaymentModal open={showPay} onClose={() => setShowPay(false)} total={total} onConfirm={handleCheckout} />
    </div>
  );
}
