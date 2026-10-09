import React, { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Building2,
  Users,
  User,
  LogOut,
  Newspaper,
  ShieldCheck,
  KeyRound,
  HeartPulse,
  Handshake,
  GraduationCap,
  ChevronDown,
  Globe2,
  MapPin,
  Settings,
  Megaphone,
  X
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import { Avatar } from '../ui/Avatar';
import { useAuth } from '../../context/AuthContext';

export type NavSection = 'dashboard' | 'health' | 'education' | 'properties' | 'property-form' | 'countries' | 'cities' | 'services' | 'agencies' | 'settings' | 'blogs' | 'quick-popup' | 'users' | 'roles' | 'profile';

interface SidebarProps {
  currentSection: NavSection;
  onNavigate: (section: NavSection) => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentSection,
  onNavigate,
  isMobileOpen,
  onMobileClose
}) => {
  const { user, logout } = useAuth();
  const isPropertySection = currentSection === 'properties' || currentSection === 'property-form' || currentSection === 'countries' || currentSection === 'cities';
  const isSettingsSection = currentSection === 'settings' || currentSection === 'blogs' || currentSection === 'quick-popup' || currentSection === 'users' || currentSection === 'roles' || currentSection === 'profile';
  const [isPropertiesExpanded, setIsPropertiesExpanded] = useState(isPropertySection);
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(isSettingsSection);

  useEffect(() => {
    if (isPropertySection) setIsPropertiesExpanded(true);
  }, [isPropertySection]);

  useEffect(() => {
    if (isSettingsSection) setIsSettingsExpanded(true);
  }, [isSettingsSection]);

  const navItems = [
    { id: 'dashboard' as NavSection, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'health' as NavSection, label: 'Health', icon: HeartPulse },
    { id: 'education' as NavSection, label: 'Education', icon: GraduationCap },
    { id: 'properties' as NavSection, label: 'Properties', icon: Building2 },
    { id: 'services' as NavSection, label: 'Consulting', icon: Handshake },
    { id: 'agencies' as NavSection, label: 'Agencies', icon: ShieldCheck },
    { id: 'settings' as NavSection, label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (id: NavSection) => {
    onNavigate(id);
    onMobileClose();
  };

  const content = (
    <div className="flex flex-col h-full bg-white dark:bg-[#0B1030] text-white border-r border-[#252B5C] select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-[#252B5C]/60 flex items-center justify-between">
        <BrandLogo variant="sidebar" />
        <button
          onClick={onMobileClose}
          className="md:hidden p-1.5 rounded-lg text-[#8A90A2] hover:text-white hover:bg-[#252B5C] transition-colors"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isPropertiesItem = item.id === 'properties';
          const isSettingsItem = item.id === 'settings';
          const isActive = isPropertiesItem
            ? isPropertySection
            : isSettingsItem
              ? isSettingsSection
              : currentSection === item.id;

          if (isPropertiesItem) {
            return (
              <div key={item.id}>
                <div className={`flex items-center rounded-lg transition-all ${isActive ? 'bg-[#FF7817] shadow-md' : 'hover:bg-[#FFF1E6] dark:hover:bg-[#252B5C]/50'}`}>
                  <button
                    onClick={() => {
                      setIsPropertiesExpanded(true);
                      handleNavClick('properties');
                    }}
                    className={`flex min-w-0 flex-1 items-center gap-3.5 px-3.5 py-3 text-sm font-medium cursor-pointer ${isActive ? 'text-white font-semibold' : 'text-[#171A2B] hover:text-[#E66606] dark:text-[#D9DDE8] dark:hover:text-white'}`}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-[#5F667A] dark:text-[#8A90A2]'}`} />
                    <span>{item.label}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPropertiesExpanded(open => !open)}
                    className={`mr-1 rounded-md p-2 transition-colors cursor-pointer ${isActive ? 'text-white hover:bg-white/15' : 'text-[#5F667A] hover:text-[#E66606] dark:text-[#8A90A2] dark:hover:text-white'}`}
                    aria-label={`${isPropertiesExpanded ? 'Collapse' : 'Expand'} property pages`}
                    aria-expanded={isPropertiesExpanded}
                  >
                    <ChevronDown className={`h-4 w-4 transition-transform ${isPropertiesExpanded ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {isPropertiesExpanded && (
                  <div className="ml-5 mt-1.5 space-y-1 border-l border-[#3A4070] pl-3">
                    {[
                      { id: 'countries' as NavSection, label: 'Countries', icon: Globe2 },
                      { id: 'cities' as NavSection, label: 'Cities', icon: MapPin },
                    ].map(child => {
                      const ChildIcon = child.icon;
                      const isChildActive = currentSection === child.id;
                      return (
                        <button
                          key={child.id}
                          onClick={() => handleNavClick(child.id)}
                          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors cursor-pointer ${isChildActive ? 'bg-[#FF7817]/15 font-semibold text-[#E66606] dark:text-[#FF9A52]' : 'text-[#171A2B] hover:bg-[#FFF1E6] hover:text-[#E66606] dark:text-[#AEB4C7] dark:hover:bg-[#252B5C]/50 dark:hover:text-white'}`}
                        >
                          <ChildIcon className="h-4 w-4" />
                          <span>{child.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          if (isSettingsItem) {
            const settingsChildren = [
              { id: 'blogs' as NavSection, label: 'Blogs', icon: Newspaper },
              ...(user?.role === 'Admin'
                ? [{ id: 'quick-popup' as NavSection, label: 'Quick Pop Up', icon: Megaphone }]
                : []),
              { id: 'users' as NavSection, label: 'Users', icon: Users },
              ...(user?.role === 'Admin'
                ? [{ id: 'roles' as NavSection, label: 'Roles', icon: KeyRound }]
                : []),
              { id: 'profile' as NavSection, label: 'Profile', icon: User },
            ];

            return (
              <div key={item.id}>
                <div className={`flex items-center rounded-lg transition-all ${isActive ? 'bg-[#FF7817] shadow-md' : 'hover:bg-[#FFF1E6] dark:hover:bg-[#252B5C]/50'}`}>
                  <button
                    onClick={() => {
                      setIsSettingsExpanded(true);
                      handleNavClick('settings');
                    }}
                    className={`flex min-w-0 flex-1 items-center gap-3.5 px-3.5 py-3 text-sm font-medium cursor-pointer ${isActive ? 'text-white font-semibold' : 'text-[#171A2B] hover:text-[#E66606] dark:text-[#D9DDE8] dark:hover:text-white'}`}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-[#5F667A] dark:text-[#8A90A2]'}`} />
                    <span>{item.label}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSettingsExpanded(open => !open)}
                    className={`mr-1 rounded-md p-2 transition-colors cursor-pointer ${isActive ? 'text-white hover:bg-white/15' : 'text-[#5F667A] hover:text-[#E66606] dark:text-[#8A90A2] dark:hover:text-white'}`}
                    aria-label={`${isSettingsExpanded ? 'Collapse' : 'Expand'} settings pages`}
                    aria-expanded={isSettingsExpanded}
                  >
                    <ChevronDown className={`h-4 w-4 transition-transform ${isSettingsExpanded ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {isSettingsExpanded && (
                  <div className="ml-5 mt-1.5 space-y-1 border-l border-[#3A4070] pl-3">
                    {settingsChildren.map(child => {
                      const ChildIcon = child.icon;
                      const isChildActive = currentSection === child.id;
                      return (
                        <button
                          key={child.id}
                          onClick={() => handleNavClick(child.id)}
                          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors cursor-pointer ${isChildActive ? 'bg-[#FF7817]/15 font-semibold text-[#E66606] dark:text-[#FF9A52]' : 'text-[#171A2B] hover:bg-[#FFF1E6] hover:text-[#E66606] dark:text-[#AEB4C7] dark:hover:bg-[#252B5C]/50 dark:hover:text-white'}`}
                        >
                          <ChildIcon className="h-4 w-4" />
                          <span>{child.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#FF7817] text-white font-semibold shadow-md'
                  : 'text-[#171A2B] hover:bg-[#FFF1E6] hover:text-[#E66606] dark:text-[#D9DDE8] dark:hover:bg-[#252B5C]/50 dark:hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[#5F667A] dark:text-[#8A90A2]'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Branding & Current User */}
      <div className="p-4 border-t border-[#252B5C]/60 space-y-4">
        {/* User Card */}
        <div className="flex items-center gap-3 p-2 rounded-lg bg-white border border-[#D9DDE8] dark:bg-[#252B5C]/40 dark:border-[#252B5C]/50">
          <Avatar src={user?.profile_image} name={user?.name || 'Ahmed Ali'} size="md" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-[#171A2B] dark:text-white truncate">
              {user?.name || 'Ahmed Ali'}
            </p>
            <p className="text-[10px] text-[#5F667A] dark:text-[#8A90A2] truncate">
              {user?.role || 'Administrator'}
            </p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={() => logout()}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-[#171A2B] hover:text-rose-600 hover:bg-rose-50 dark:text-[#D9DDE8] dark:hover:text-rose-300 dark:hover:bg-rose-950/20 rounded-lg transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex flex-col w-[260px] shrink-0 sticky top-0 h-screen z-30">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-[#0B1030]/70 backdrop-blur-xs transition-opacity"
            onClick={onMobileClose}
          />
          <div className="fixed inset-y-0 left-0 w-[280px] max-w-[85vw] shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
