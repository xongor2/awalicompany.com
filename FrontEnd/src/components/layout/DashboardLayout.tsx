import React, { useState } from 'react';
import { Sidebar, NavSection } from './Sidebar';
import { Navbar } from './Navbar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentSection: NavSection;
  onNavigate: (section: NavSection) => void;
  globalSearch?: string;
  onGlobalSearchChange?: (val: string) => void;
  onSearch?: (val: string) => void;
  onOpenAddProperty?: () => void;
  onGoToWebsite?: () => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  currentSection,
  onNavigate,
  globalSearch = '',
  onGlobalSearchChange,
  onSearch,
  onOpenAddProperty,
  onGoToWebsite,
}) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [internalSearch, setInternalSearch] = useState(globalSearch);

  const handleSearchChange = (val: string) => {
    setInternalSearch(val);
    if (onGlobalSearchChange) onGlobalSearchChange(val);
    if (onSearch) onSearch(val);
  };

  return (
    <div className="flex min-h-screen bg-[#F8F9FC] dark:bg-[#0B1030] text-[#171A2B] dark:text-white transition-colors">
      {/* Sidebar Navigation */}
      <Sidebar
        currentSection={currentSection}
        onNavigate={onNavigate}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          onMenuClick={() => setIsMobileSidebarOpen(true)}
          currentSection={currentSection}
          onNavigate={onNavigate}
          globalSearch={internalSearch}
          onGlobalSearchChange={handleSearchChange}
          onGoToWebsite={onGoToWebsite}
        />

        {/* Content Container */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
