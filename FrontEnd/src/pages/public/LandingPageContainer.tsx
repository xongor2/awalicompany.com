import React, { useState } from 'react';
import { PublicHeader } from '../../components/public/PublicHeader';
import { HeroSection } from '../../components/public/HeroSection';
import { ServicesSection } from '../../components/public/ServicesSection';
import { EnterpriseStatsBar } from '../../components/public/EnterpriseStatsBar';
import { FeaturedPropertiesSection } from '../../components/public/FeaturedPropertiesSection';
import { MethodologySection } from '../../components/public/MethodologySection';
import { LatestInsightsSection } from '../../components/public/LatestInsightsSection';
import { CTASection } from '../../components/public/CTASection';
import { RealEstatePage } from './RealEstatePage';
import { ContactPage } from './ContactPage';
import { ServicesPage } from './ServicesPage';
import { HealthPage } from './HealthPage';
import { OurStoryPage } from './OurStoryPage';
import { AgenciesPage } from './AgenciesPage';
import { PlaceholderPage } from '../../components/public/PlaceholderPage';
import { PublicFooter } from '../../components/public/PublicFooter';
import { Property } from '../../types';

export interface LandingPageContainerProps {
  onOpenPortal: () => void;
  onNavigateCMSBlog?: () => void;
}

export type PublicPageKey =
  | 'home'
  | 'consulting'
  | 'health'
  | 'education'
  | 'real-estate'
  | 'agencies'
  | 'service'
  | 'our-story'
  | 'blog'
  | 'contact';

export const LandingPageContainer: React.FC<LandingPageContainerProps> = ({
  onOpenPortal,
  onNavigateCMSBlog,
}) => {
  const [currentPage, setCurrentPage] = useState<PublicPageKey>('home');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const handleNavigate = (page: string) => {
    setSelectedProperty(null);
    // If 'service' is requested anywhere, map it seamlessly to consulting
    if (page === 'service') {
      setCurrentPage('consulting');
    } else {
      setCurrentPage(page as PublicPageKey);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectFeaturedProperty = (prop: Property) => {
    setSelectedProperty(prop);
    setCurrentPage('real-estate');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FC] dark:bg-[#0B1030] text-[#171A2B] dark:text-white transition-colors">
      {/* Public Header with Logo, Navigation Links, Sub-menu, and Portal Shortcut */}
      <PublicHeader
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onOpenPortal={onOpenPortal}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        {currentPage === 'home' ? (
          <>
            <HeroSection onNavigate={handleNavigate} />
            <EnterpriseStatsBar />
            <ServicesSection onNavigate={handleNavigate} />
            <FeaturedPropertiesSection
              onNavigate={handleNavigate}
              onSelectProperty={handleSelectFeaturedProperty}
            />
            <MethodologySection onNavigate={handleNavigate} />
            <CTASection onNavigate={handleNavigate} />
            <LatestInsightsSection
              onNavigate={handleNavigate}
              onNavigateCMSBlog={onNavigateCMSBlog}
            />
          </>
        ) : currentPage === 'consulting' ? (
          <ServicesPage
            initialCategory="Consulting"
            onNavigateHome={() => handleNavigate('home')}
            onNavigate={handleNavigate}
            onOpenPortal={onOpenPortal}
          />
        ) : currentPage === 'health' ? (
          <HealthPage
            onNavigateHome={() => handleNavigate('home')}
            onNavigate={handleNavigate}
            onOpenPortal={onOpenPortal}
          />
        ) : currentPage === 'education' ? (
          <ServicesPage
            initialCategory="Education"
            onNavigateHome={() => handleNavigate('home')}
            onNavigate={handleNavigate}
            onOpenPortal={onOpenPortal}
          />
        ) : currentPage === 'real-estate' ? (
          <RealEstatePage
            onNavigateHome={() => handleNavigate('home')}
            onNavigate={handleNavigate}
            selectedProperty={selectedProperty}
            onClearSelectedProperty={() => setSelectedProperty(null)}
          />
        ) : currentPage === 'agencies' ? (
          <AgenciesPage
            onNavigateHome={() => handleNavigate('home')}
            onNavigate={handleNavigate}
            onOpenPortal={onOpenPortal}
          />
        ) : currentPage === 'contact' ? (
          <ContactPage
            onNavigateHome={() => handleNavigate('home')}
            onNavigate={handleNavigate}
          />
        ) : currentPage === 'our-story' ? (
          <OurStoryPage
            onNavigateHome={() => handleNavigate('home')}
            onNavigate={handleNavigate}
          />
        ) : (
          <PlaceholderPage
            pageKey={currentPage}
            onNavigateHome={() => handleNavigate('home')}
            onNavigateCMSBlog={onNavigateCMSBlog}
          />
        )}
      </main>

      {/* Public Footer matching image.png exactly */}
      <PublicFooter onNavigate={handleNavigate} />
    </div>
  );
};
