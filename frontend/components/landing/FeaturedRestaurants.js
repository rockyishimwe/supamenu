'use client';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import TiltCard from '../TiltCard';
import { staggerContainer, fadeUpItem } from '../PageTransition';

const restaurants = [
  { id: 1, name: 'The Garden Bistro', cuisine: 'Italian • Continental', rating: 4.6, image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&q=80', tags: ['Fine Dining', 'Romantic', 'Wine Bar'] },
  { id: 2, name: 'Sakura Sushi', cuisine: 'Japanese • Sushi', rating: 4.7, image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500&q=80', tags: ['Authentic', 'Omakase', 'Fresh Fish'] },
  { id: 3, name: 'Spice Route', cuisine: 'Indian • Thai', rating: 4.5, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&q=80', tags: ['Spicy', 'Vegetarian Friendly', 'Street Food'] },
  { id: 4, name: 'La Taquería', cuisine: 'Mexican • Latin', rating: 4.4, image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=500&q=80', tags: ['Tacos', 'Margaritas', 'Live Music'] },
  { id: 5, name: 'Green Leaf', cuisine: 'Vegan • Organic', rating: 4.8, image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=500&q=80', tags: ['Plant-Based', 'Gluten-Free', 'Superfoods'] },
  { id: 6, name: 'Blue Marlin', cuisine: 'Seafood • Grill', rating: 4.6, image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&q=80', tags: ['Fresh Catch', 'Ocean View', 'Seafood Platter'] },
];

export default function FeaturedRestaurants() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto px-8 py-20"
    >
      <div className="text-center space-y-6">
        <h2 className="text-3xl font-bold text-white">Featured Restaurants</h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Explore top-rated dining spots near you, each offering unique culinary experiences
        </p>
      </div>
      <motion.div
        variants={staggerContainer}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {restaurants.map((restaurant) => (
          <motion.div key={restaurant.id} variants={fadeUpItem} className="relative">
            <TiltCard className="bg-panel border border-white/5 rounded-3xl overflow-hidden hover:border-white/10 transition-all">
              <div className="relative">
                <div className="relative">
                  <Image src={restaurant.image} alt={restaurant.name} width={500} height={192} className="w-full h-48 object-cover" />
                  <div className="absolute top-3 left-3 bg-black/60 text-white text-xs font-semibold px-2 py-1 rounded-full">
                    <span className="text-[#FF6B00]">★</span> {restaurant.rating}
                  </div>
                </div>
                <div className="p-5 space-y-3">
                  <h3 className="font-bold text-white text-lg">{restaurant.name}</h3>
                  <p className="text-gray-400 text-sm">{restaurant.cuisine}</p>
                  <div className="flex flex-wrap gap-2">
                    {restaurant.tags.map((tag, tagIndex) => (
                      <span key={tagIndex} className="px-2 py-0.5 text-xs font-medium rounded-full bg-white/10 border border-white/5">{tag}</span>
                    ))}
                  </div>
                  <Link href="/customer/explore" className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[#FF6B00] hover:text-white transition-colors">
                    Explore Menu <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </TiltCard>
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );
}
