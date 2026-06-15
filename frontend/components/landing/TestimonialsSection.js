'use client';
import { AnimatedTestimonials } from '@/components/ui/animated-testimonials';

const testimonials = [
  {
    id: 1,
    name: 'Marco Rossi',
    role: 'Owner',
    company: 'La Trattoria',
    content:
      'DineFlow transformed how we manage reservations. Our no-show rate dropped by 80%, and the table management system is incredibly intuitive. Our staff learned it in one shift.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
  },
  {
    id: 2,
    name: 'Sarah Chen',
    role: 'Head Chef',
    company: 'Sakura Sushi Bar',
    content:
      'The order management system is a game-changer. Kitchen tickets appear instantly, modifications are handled seamlessly, and the real-time inventory tracking has cut our food waste by 30%.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
  },
  {
    id: 3,
    name: 'James Okonkwo',
    role: 'General Manager',
    company: 'The Grand Bistro',
    content:
      'Having customer, staff, and owner dashboards in one platform is brilliant. I can monitor all three locations from my phone, and the analytics give me insights I never had before.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
  },
  {
    id: 4,
    name: 'Elena Vasquez',
    role: 'Restaurant Owner',
    company: 'Casa de Flores',
    content:
      'The online ordering and table reservation features helped us increase revenue by 25% in just two months. Our customers love the seamless experience, and we love the simplicity.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80',
  },
];

export default function TestimonialsSection() {
  return (
    <AnimatedTestimonials
      title="Trusted by Restaurant Owners"
      subtitle="Hear from real restaurant owners, chefs, and managers who use DineFlow to grow their business every day."
      badgeText="Real success stories"
      testimonials={testimonials}
      autoRotateInterval={5000}
      trustedCompanies={[
        'La Trattoria',
        'Sakura Sushi',
        'The Grand Bistro',
        'Casa de Flores',
      ]}
      trustedCompaniesTitle="Featured on these restaurant menus"
    />
  );
}
