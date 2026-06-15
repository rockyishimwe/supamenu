'use client';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { CheckCircle2, XCircleIcon, Users, Store, Building2 } from 'lucide-react';
import * as PricingCard from '@/components/ui/pricing-card';
import { staggerContainer, fadeUpItem } from '../PageTransition';

const plans = [
  {
    name: 'Diner',
    description: 'Perfect for food lovers exploring new restaurants.',
    price: 'Free',
    period: 'forever',
    badge: 'For Diners',
    icon: Users,
    gradient: 'from-gray-500 to-gray-600',
    shadow: 'rgba(107,114,128,0.3)',
    features: [
      'Browse & search restaurants',
      'Reserve tables online',
      'Order food for pickup',
      'Track order status',
      'View dining history',
    ],
    lockedFeatures: [
      'Restaurant dashboard',
      'Menu management',
      'Staff & table management',
    ],
  },
  {
    name: 'Pro',
    description: 'Everything a growing restaurant needs to thrive.',
    price: '$29',
    period: '/ month',
    badge: 'For Restaurants',
    icon: Store,
    gradient: 'from-[#FF6B00] to-orange-600',
    shadow: 'rgba(255,107,0,0.3)',
    popular: true,
    features: [
      'Restaurant dashboard & analytics',
      'Menu & category management',
      'Table & reservation management',
      'Staff accounts & roles',
      'Order management system',
      'Customer insights',
    ],
    lockedFeatures: [
      'Multi-location management',
      'Priority API access',
    ],
  },
  {
    name: 'Enterprise',
    description: 'For restaurant chains and large-scale operations.',
    price: '$99',
    period: '/ month',
    badge: 'For Chains',
    icon: Building2,
    gradient: 'from-amber-500 to-yellow-600',
    shadow: 'rgba(245,158,11,0.3)',
    features: [
      'Everything in Pro',
      'Unlimited locations',
      'Custom integrations',
      'Dedicated account manager',
      'Priority support 24/7',
      'White-label options',
    ],
    lockedFeatures: [],
  },
];

export default function PricingSection() {
  const router = useRouter();

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto px-8 py-20"
    >
      {/* Section header */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        className="text-center space-y-4 mb-14"
      >
        <motion.h2
          variants={fadeUpItem}
          className="text-3xl md:text-4xl font-bold text-body"
        >
          Simple, Transparent Pricing
        </motion.h2>
        <motion.p
          variants={fadeUpItem}
          className="text-muted text-lg max-w-2xl mx-auto"
        >
          Choose the plan that fits your needs. No hidden fees. Upgrade anytime.
        </motion.p>
      </motion.div>

      {/* Pricing cards */}
      <div className="flex flex-wrap justify-center gap-6 lg:gap-8">
        {plans.map((plan, i) => {
          const Icon = plan.icon;
          return (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className={cn(
                'relative',
                plan.popular ? '-mt-4 md:-mt-6' : '',
              )}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <span className="px-4 py-1 rounded-full bg-gradient-to-r from-[#FF6B00] to-orange-500 text-xs font-bold text-white shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}

              <PricingCard.Card
                className={cn(
                  plan.popular ? 'border-[#FF6B00]/30 shadow-lg shadow-[#FF6B00]/10' : '',
                )}
              >
                <PricingCard.Header>
                  <PricingCard.Plan>
                    <PricingCard.PlanName>
                      <Icon className="text-[#FF6B00]" aria-hidden="true" />
                      <span className="text-muted">{plan.name}</span>
                    </PricingCard.PlanName>
                    <PricingCard.Badge>{plan.badge}</PricingCard.Badge>
                  </PricingCard.Plan>
                  <PricingCard.Description>
                    {plan.description}
                  </PricingCard.Description>
                  <PricingCard.Price>
                    <PricingCard.MainPrice>{plan.price}</PricingCard.MainPrice>
                    {plan.period && <PricingCard.Period>{plan.period}</PricingCard.Period>}
                  </PricingCard.Price>
                  <button
                    onClick={() => router.push('/register')}
                    className={cn(
                      'w-full font-semibold text-white py-2.5 rounded-lg transition-all',
                      'bg-gradient-to-b shadow-lg hover:scale-[1.02] active:scale-[0.98]',
                      `from-orange-500 to-orange-600 shadow-[0_10px_25px_rgba(255,115,0,0.3)]`,
                    )}
                  >
                    Get Started
                  </button>
                </PricingCard.Header>

                <PricingCard.Body>
                  {plan.features.length > 0 && (
                    <PricingCard.List>
                      {plan.features.map((item) => (
                        <PricingCard.ListItem key={item}>
                          <span className="mt-0.5">
                            <CheckCircle2 className="h-4 w-4 text-green-500" aria-hidden="true" />
                          </span>
                          <span>{item}</span>
                        </PricingCard.ListItem>
                      ))}
                    </PricingCard.List>
                  )}

                  {plan.lockedFeatures.length > 0 && (
                    <>
                      <PricingCard.Separator>
                        {plan.name === 'Diner' ? 'Upgrade to access' : 'Enterprise only'}
                      </PricingCard.Separator>
                      <PricingCard.List>
                        {plan.lockedFeatures.map((item) => (
                          <PricingCard.ListItem key={item} className="opacity-60">
                            <span className="mt-0.5">
                              <XCircleIcon className="h-4 w-4 text-red-400" aria-hidden="true" />
                            </span>
                            <span>{item}</span>
                          </PricingCard.ListItem>
                        ))}
                      </PricingCard.List>
                    </>
                  )}
                </PricingCard.Body>
              </PricingCard.Card>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}
