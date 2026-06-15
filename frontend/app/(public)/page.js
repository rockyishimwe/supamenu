'use client';
import { useState, useEffect } from 'react';
import { useThemeStore } from '../../lib/useTheme';
import LandingNavbar from '../../components/landing/LandingNavbar';
import LandingHero from '../../components/landing/LandingHero';
import FeaturedRestaurants from '../../components/landing/FeaturedRestaurants';
import StatsBar from '../../components/landing/StatsBar';
import ExperienceTabs from '../../components/landing/ExperienceTabs';
import FeatureGrid from '../../components/landing/FeatureGrid';
import PricingSection from '../../components/landing/PricingSection';
import LandingFAQ from '../../components/landing/LandingFAQ';
import LandingFooter from '../../components/landing/LandingFooter';

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState('customer');
  const [activeFaq, setActiveFaq] = useState(null);
  const { theme, toggleTheme, isClient, initTheme } = useThemeStore();

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return (
    <div className="min-h-screen bg-surface text-body">
      <LandingNavbar isClient={isClient} theme={theme} toggleTheme={toggleTheme} />
      <LandingHero />
      <FeaturedRestaurants />
      <PricingSection />
      <StatsBar />
      <ExperienceTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <FeatureGrid />
      <LandingFAQ activeFaq={activeFaq} setActiveFaq={setActiveFaq} />
      <LandingFooter />
    </div>
  );
}
