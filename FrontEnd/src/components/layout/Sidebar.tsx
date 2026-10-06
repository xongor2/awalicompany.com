import React from 'react';
import {
  LayoutDashboard,
  Building2,
  BriefcaseBusiness,
  Users,
  User,
  LogOut,
  Newspaper,
  ShieldCheck,
  KeyRound,
  HeartPulse,
  Handshake,
  X
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import { Avatar } from '../ui/Avatar';
import { useAuth } from '../../context/AuthContext';

export type NavSection = 'dashboard' | 'consulting' | 'health' | 'properties' | 'services' | 'agencies' | 'blogs' | 'users' | 'roles' | 'profile';

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

  const navItems = [
    { id: 'dashboard' as NavSection, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'consulting' as NavSection, label: 'Consulting', icon: Handshake },
    { id: 'health' as NavSection, label: 'Health', icon: HeartPulse },
    { id: 'properties' as NavSection, label: 'Properties', icon: Building2 },
    { id: 'services' as NavSection, label: 'Services', icon: BriefcaseBusiness },
    { id: 'agencies' as NavSection, label: 'Agencies', icon: ShieldCheck },
    { id: 'blogs' as NavSection, label: 'Blogs', icon: Newspaper },
    { id: 'users' as NavSection, label: 'Users', icon: Users },
    ...(user?.role === 'Admin'
      ? [{ id: 'roles' as NavSection, label: 'Roles', icon: KeyRound }]
      : []),
    { id: 'profile' as NavSection, label: 'Profile', icon: User },
  ];

  const handleNavClick = (id: NavSection) => {
    onNavigate(id);
    onMobileClose();
  };

  const content = (
    <div className="flex flex-col h-full bg-[#151A46] dark:bg-[#0B1030] text-white border-r border-[#252B5C] select-none">
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
          const isActive = currentSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#FF7817] text-white font-semibold shadow-md'
                  : 'text-[#D9DDE8] hover:text-white hover:bg-[#252B5C]/50'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[#8A90A2]'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Branding & Current User */}
      <div className="p-4 border-t border-[#252B5C]/60 space-y-4">
        <div className="px-2 py-1.5 bg-[#0B1030]/50 dark:bg-[#151A46]/40 rounded-lg text-center">
          <p className="text-[11px] font-medium text-[#D9DDE8] tracking-wide">
            Building Better Communities Together
          </p>
        </div>

        {/* User Card */}
        <div className="flex items-center gap-3 p-2 rounded-lg bg-[#252B5C]/40 border border-[#252B5C]/50">
          <Avatar src={user?.profile_image} name={user?.name || 'Ahmed Ali'} size="md" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">
              {user?.name || 'Ahmed Ali'}
            </p>
            <p className="text-[10px] text-[#8A90A2] truncate">
              {user?.role || 'Administrator'}
            </p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={() => logout()}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-[#D9DDE8] hover:text-rose-300 hover:bg-rose-950/20 rounded-lg transition-colors cursor-pointer"
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
