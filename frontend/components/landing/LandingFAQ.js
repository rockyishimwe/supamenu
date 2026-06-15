'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { fadeUpItem } from '../PageTransition';

const faqs = [
  { q: 'How does table tracking work for staff?', a: 'Staff can view a real-time layout grid of the dining floor. Tables change color based on their status: green for available, red for occupied, yellow for waiting on orders, and gray when being cleaned.' },
  { q: 'Can we run this offline in our restaurant?', a: 'Yes! DineFlow has a robust local-fallback capability that caches data in the browser or locally, allowing billing and kitchen orders to sync immediately once connection is restored.' },
  { q: 'What payment methods are supported?', a: 'We support major credit cards, Mobile Money options (e.g. M-Pesa, Orange Money), and a built-in pre-funded customer Wallet for one-tap payments.' },
  { q: 'Is there a setup wizard for new owners?', a: 'Absolutely. When you register as an owner, you will be guided through a 3-step wizard to upload your menu, define your initial table count, and establish your hours.' },
];

export default function LandingFAQ({ activeFaq, setActiveFaq }) {
  return (
    <motion.section
      id="faq"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto px-8 py-24 space-y-12"
    >
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-white text-center">Frequently Asked Questions</h2>
        <p className="text-gray-400 text-sm max-w-md mx-auto">Got questions? We have answers to help you get started with DineFlow.</p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <motion.div
            key={idx}
            variants={fadeUpItem}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="bg-panel border border-white/5 rounded-2xl overflow-hidden cursor-pointer"
            onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
          >
            <div className="p-5 flex items-center justify-between text-xs font-semibold text-white">
              <span>{faq.q}</span>
              <motion.span animate={{ rotate: activeFaq === idx ? 180 : 0 }} transition={{ duration: 0.2 }} className="inline-flex">
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </motion.span>
            </div>
            <AnimatePresence>
              {activeFaq === idx && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="p-5 pt-0 text-[11px] text-gray-400 leading-relaxed border-t border-white/5">{faq.a}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
