"use client";
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Star, Clock, ChevronRight } from 'lucide-react';
import { hoverLift } from '../PageTransition';

export default function RestaurantCard({ restaurant }) {
  return (
    <motion.div variants={hoverLift} className="bg-panel border border-white/5 rounded-3xl overflow-hidden hover:border-white/10 group flex flex-col justify-between">
      <div className="relative h-44 overflow-hidden">
        <motion.div 
          className="absolute inset-0" 
          initial={{ scale: 1 }}
          whileHover={{ scale: 1.08, transition: { duration: 0.5, ease: 'easeOut' } }}
        >
          <Image
            src={restaurant.coverImage}
            alt={restaurant.name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </motion.div>
        <div className="absolute top-4 right-4 px-2.5 py-1 rounded-xl bg-panel/80 backdrop-blur-md border border-white/10 flex items-center gap-1 text-[11px] font-bold text-white">
          <Star className="w-3.5 h-3.5 fill-[#FF6B00] text-[#FF6B00]" />
          {restaurant.rating}
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div className="space-y-1">
          <h4 className="text-md font-bold text-white tracking-tight">{restaurant.name}</h4>
          <p className="text-xs text-gray-500 truncate">{restaurant.description}</p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {restaurant.cuisines.map((cuisine) => (
            <span key={cuisine} className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-gray-400 font-semibold">{cuisine}</span>
          ))}
        </div>

        <div className="flex justify-between items-center pt-3 border-t border-white/5 text-[11px] text-gray-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[#FF6B00]" /> {restaurant.openingHours}
          </span>
          <Link
            href={`/customer/restaurant/${restaurant._id}`}
            className="text-white hover:text-[#FF6B00] font-bold flex items-center gap-1 transition-colors"
          >
            Order / Book <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
