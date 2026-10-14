import React, { useState, useRef, useEffect } from 'react';
import { Menu, Bell, User as UserIcon, LogOut, Settings, Globe, ChevronDown, Check } from 'lucide-react';
import { SearchInput } from '../ui/SearchInput';
import { ThemeToggle } from '../common/ThemeToggle';
import { Avatar } from '../ui/Avatar';
import { useAuth } from '../../context/AuthContext';
import { useLanguage, LanguageCode } from '../../context/LanguageContext';
import { LanguageFlag, LANGUAGES } from '../public/PublicHeader';
import { NavSection } from './Sidebar';

interface NavbarProps {
  onMenuClick: () => void;
  currentSection: NavSection;
  onNavigate: (section: NavSection) => void;
  globalSearch: string;
  onGlobalSearchChange: (val: string) => void;
  onGoToWebsite?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onMenuClick,
  currentSection,
  onNavigate,
  globalSearch,
  onGlobalSearchChange,
  onGoToWebsite,
}) => {
  const { user, logout } = useAuth();
  const { language, setLanguage } = useLanguage();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [hasNotifications] = useState(true);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const languageRef = useRef<HTMLDivElement>(null);
  const selectedLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageRef.current && !languageRef.current.contains(event.target as Node)) {
        setIsLanguageOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sectionTitles: Record<NavSection, string> = {
    dashboard: 'Dashboard',
    health: 'Health',
    education: 'Education',
    properties: 'Properties',
    'property-form': 'Property Form',
    countries: 'Countries',
    cities: 'Cities',
    services: 'Consulting',
    quotations: 'Quotations',
    agencies: 'Agencies',
    payments: 'Payments',
    customers: 'Customers',
    commissions: 'Commissions',
    invoices: 'Invoices',
    settings: 'Settings',
    blogs: 'Blogs',
    'quick-popup': 'Quick Pop Up',
    users: 'Users',
    roles: 'Roles',
    profile: 'User Profile'
  };

  return (
    <header className="sticky top-0 z-20 h-[72px] bg-white dark:bg-[#0B1030] border-b border-[#D9DDE8] dark:border-[#252B5C] px-4 md:px-8 flex items-center justify-between transition-colors">
      {/* Left: Mobile trigger & Breadcrumb */}
      <div className="flex items-center gap-3 md:gap-4">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg text-[#5F667A] hover:text-[#171A2B] hover:bg-[#EEF0F5] dark:text-[#D9DDE8] dark:hover:text-white dark:hover:bg-[#252B5C] transition-colors"
          aria-label="Open mobile menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col">
          <span className="font-heading text-base md:text-lg font-bold text-[#171A2B] dark:text-white">
            {sectionTitles[currentSection]}
          </span>
          <div className="flex items-center gap-1.5 text-xs text-[#8A90A2]">
            <span>Home</span>
            <span>&gt;</span>
            <span className="capitalize">{sectionTitles[currentSection]}</span>
          </div>
        </div>
      </div>

      {/* Center: Global Search Bar */}
      <div className="hidden lg:flex items-center justify-center flex-1 max-w-md mx-6">
        <SearchInput
          value={globalSearch}
          onChange={onGlobalSearchChange}
          placeholder="Search properties, users, services..."
          width="w-full"
        />
      </div>

      {/* Right: Theme Toggle, Notifications, Profile Dropdown */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Language Translator Dropdown */}
        <div className="relative" ref={languageRef}>
          <button
            type="button"
            onClick={() => setIsLanguageOpen(prev => !prev)}
            className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-[#151A46] dark:text-[#D9DDE8] bg-[#EEF0F5] dark:bg-[#151A46] hover:bg-[#E3E7F0] dark:hover:bg-[#1C2258] border border-[#D9DDE8] dark:border-[#252B5C] transition-colors cursor-pointer shadow-2xs"
            aria-expanded={isLanguageOpen}
            aria-label="Select Language"
            title="Translate / Change Language"
          >
            <LanguageFlag code={selectedLang.code} className="w-4 h-3" />
            <span className="hidden sm:inline font-medium">{selectedLang.name}</span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-[#5F667A] dark:text-[#8A90A2] transition-transform duration-200 ${
                isLanguageOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {isLanguageOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-[#0E1335] rounded-xl shadow-2xl border border-[#D9DDE8] dark:border-[#252B5C] py-1.5 z-50 animate-in fade-in duration-150">
              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Select Language
              </div>
              {LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    setLanguage(lang.code as LanguageCode);
                    setIsLanguageOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors text-left cursor-pointer ${
                    selectedLang.code === lang.code
                      ? 'bg-[#FF7817]/10 text-[#FF7817] font-bold'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-[#EEF0F5] dark:hover:bg-white/5 font-medium'
                  }`}
                >
                  <div className="inline-flex items-center gap-2.5">
                    <LanguageFlag code={lang.code} className="w-4 h-3" />
                    <span>{lang.name}</span>
                  </div>
                  {selectedLang.code === lang.code && (
                    <Check className="w-3.5 h-3.5 text-[#FF7817]" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {onGoToWebsite && (
          <button
            onClick={onGoToWebsite}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#151A46] dark:text-[#D9DDE8] bg-[#EEF0F5] dark:bg-[#151A46] hover:bg-[#FF7817]/10 hover:text-[#FF7817] hover:border-[#FF7817]/40 border border-[#D9DDE8] dark:border-[#252B5C] transition-all cursor-pointer shadow-2xs"
            title="Switch to Public Landing Website"
          >
            <Globe className="w-3.5 h-3.5 text-[#FF7817]" />
            <span className="hidden sm:inline">Public Site</span>
          </button>
        )}

        <ThemeToggle />

        {/* Notification Bell */}
        <button
          className="relative p-2 rounded-lg text-[#5F667A] hover:text-[#171A2B] hover:bg-[#EEF0F5] dark:text-[#D9DDE8] dark:hover:text-white dark:hover:bg-[#252B5C] transition-colors"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          {hasNotifications && (
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#FF7817]" />
          )}
        </button>

        <div className="h-6 w-px bg-[#D9DDE8] dark:bg-[#252B5C] mx-1 hidden sm:block" />

        {/* Current User Quick Capsule / Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2.5 p-1 sm:px-2 sm:py-1 rounded-lg hover:bg-[#EEF0F5] dark:hover:bg-[#252B5C] transition-colors"
          >
            <Avatar src={user?.profile_image} name={user?.name || 'Ahmed Ali'} size="sm" />
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-[#171A2B] dark:text-white leading-tight">
                {user?.name || 'Ahmed Ali'}
              </span>
              <span className="text-[10px] text-[#8A90A2] leading-tight">
                {user?.role || 'Administrator'}
              </span>
            </div>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-52 rounded-xl bg-white dark:bg-[#151A46] border border-[#D9DDE8] dark:border-[#252B5C] shadow-xl py-1.5 z-30 animate-in fade-in zoom-in-95">
              <div className="px-4 py-2.5 border-b border-[#D9DDE8] dark:border-[#252B5C]">
                <p className="text-xs font-semibold text-[#171A2B] dark:text-white">{user?.name}</p>
                <p className="text-[11px] text-[#8A90A2] truncate">{user?.email}</p>
              </div>

              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  onNavigate('profile');
                }}
                className="w-full px-4 py-2 text-xs text-left text-[#171A2B] dark:text-[#D9DDE8] hover:bg-[#EEF0F5] dark:hover:bg-[#252B5C] flex items-center gap-2.5 transition-colors"
              >
                <UserIcon className="w-4 h-4 text-[#8A90A2]" />
                <span>My Profile</span>
              </button>

              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  onNavigate('profile');
                }}
                className="w-full px-4 py-2 text-xs text-left text-[#171A2B] dark:text-[#D9DDE8] hover:bg-[#EEF0F5] dark:hover:bg-[#252B5C] flex items-center gap-2.5 transition-colors"
              >
                <Settings className="w-4 h-4 text-[#8A90A2]" />
                <span>Security & Settings</span>
              </button>

              <div className="my-1 border-t border-[#D9DDE8] dark:border-[#252B5C]" />

              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  logout();
                }}
                className="w-full px-4 py-2 text-xs text-left text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2.5 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
