import React from 'react';
import { ArrowLeft, Clock, FileText, ChevronRight } from 'lucide-react';

export interface PlaceholderPageProps {
  pageKey: string;
  onNavigateHome: () => void;
  onNavigateCMSBlog?: () => void;
}

const PAGE_META: Record<string, { title: string; subtitle: string; category: string }> = {
  'home': {
    title: 'Home',
    subtitle: 'Welcome to AW Ali Company. Empowering global trade, education, and strategic investments.',
    category: 'Home Page',
  },
  'real-estate': {
    title: 'Real Estate',
    subtitle: 'Property developments, commercial complexes, and real estate investments.',
    category: 'Core Sector',
  },
  'consulting': {
    title: 'Consulting',
    subtitle: 'Strategic advisory, business development, and organizational growth services.',
    category: 'Corporate Advisory',
  },
  'education': {
    title: 'Education',
    subtitle: 'Training programs, capacity building, and specialized professional education.',
    category: 'Academy & Training',
  },
  'service': {
    title: 'Special Services',
    subtitle: 'Cross industry services, import and export operations, logistics, and trading.',
    category: 'Commercial Solutions',
  },
  'our-story': {
    title: 'Our Story',
    subtitle: 'The history, mission, leadership, and long term vision of AW Ali Company.',
    category: 'About us',
  },
  'blog': {
    title: 'Company Blog',
    subtitle: 'News, industry insights, market reports, and updates from AW Ali Company.',
    category: 'About us',
  },
  'contact': {
    title: 'Contact Us',
    subtitle: 'Get in touch with our global offices, advisory teams, and support divisions.',
    category: 'About us',
  },
};

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({
  pageKey,
  onNavigateHome,
  onNavigateCMSBlog,
}) => {
  const meta = PAGE_META[pageKey] || {
    title: pageKey.charAt(0).toUpperCase() + pageKey.slice(1).replace('-', ' '),
    subtitle: 'AW Ali Company official page division.',
    category: 'Division',
  };

  const isHome = pageKey === 'home';

  return (
    <div className="w-full min-h-[60vh] bg-[#F8F9FC] dark:bg-[#0B1030] text-[#171A2B] dark:text-white py-14 px-6 sm:px-10 lg:px-16 transition-colors">
      <div className="max-w-[1200px] mx-auto space-y-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs font-semibold text-[#8A90A2]">
          {isHome ? (
            <span className="text-[#FF7817]">Home</span>
          ) : (
            <>
              <button
                type="button"
                onClick={onNavigateHome}
                className="hover:text-[#FF7817] transition-colors cursor-pointer"
              >
                Home
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-[#8A90A2]" />
              <span>{meta.category}</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#8A90A2]" />
              <span className="text-[#FF7817]">{meta.title}</span>
            </>
          )}
        </div>

        {/* Page Header */}
        <div className="border-b border-[#D9DDE8] dark:border-[#202754] pb-6">
          <span className="text-xs font-bold text-[#FF7817] uppercase tracking-wider">
            {meta.category}
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#171A2B] dark:text-white mt-1">
            {meta.title}
          </h1>
          <p className="text-sm sm:text-base text-[#5F667A] dark:text-[#AAB2CA] mt-2 max-w-2xl">
            {meta.subtitle}
          </p>
        </div>

        {/* Content Container */}
        <div className="p-12 sm:p-16 rounded-2xl border-2 border-dashed border-[#D9DDE8] dark:border-[#202754] bg-white dark:bg-[#111638] text-center space-y-5 shadow-2xs">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#FF7817]/10 flex items-center justify-center text-[#FF7817]">
            <Clock className="w-7 h-7" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h3 className="font-heading text-xl font-bold text-[#171A2B] dark:text-white">
              {isHome ? 'Welcome to Our Official Platform' : `${meta.title} Section`}
            </h3>
            <p className="text-sm text-[#5F667A] dark:text-[#AAB2CA] leading-relaxed">
              {isHome
                ? 'Explore our diverse solutions across global trade, educational advisory, and real estate development.'
                : 'This division is being actively curated with specialized programs and advisory services.'}
            </p>
          </div>

          {!isHome && (
            <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
              <button
                type="button"
                onClick={onNavigateHome}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-[#151A46] dark:bg-white/10 hover:bg-[#FF7817] dark:hover:bg-[#FF7817] rounded-xl transition-all cursor-pointer shadow-xs"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Home</span>
              </button>

              {pageKey === 'blog' && onNavigateCMSBlog && (
                <button
                  type="button"
                  onClick={onNavigateCMSBlog}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-[#FF7817] bg-[#FF7817]/10 hover:bg-[#FF7817] hover:text-white border border-[#FF7817]/30 rounded-xl transition-all cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>View CMS Blog Articles</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
