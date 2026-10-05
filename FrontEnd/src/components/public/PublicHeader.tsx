import React, { useState, useRef, useEffect } from 'react';
import { BrandLogo } from '../common/BrandLogo';
import {
  ChevronDown,
  Menu,
  X,
  Sun,
  Moon,
  Shield,
  ExternalLink,
  Home,
  Building2,
  Briefcase,
  GraduationCap,
  HeartPulse,
  Info,
  BookOpen,
  FileText,
  PhoneCall,
  Phone,
  Mail,
  ShieldCheck,
  Facebook,
  Instagram,
  Check,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage, LanguageCode } from '../../context/LanguageContext';

export interface LanguageItem {
  code: string;
  name: string;
}

export const LanguageFlag: React.FC<{ code: string; className?: string }> = ({
  code,
  className = 'w-5 h-3.5',
}) => {
  switch (code) {
    case 'en':
      return (
        <svg viewBox="0 0 60 40" className={`${className} rounded-xs shrink-0 shadow-xs border border-white/30 inline-block overflow-hidden`}>
          <clipPath id="uk-flag-clip">
            <rect width="60" height="40" rx="1.5" />
          </clipPath>
          <g clipPath="url(#uk-flag-clip)">
            <rect width="60" height="40" fill="#012169" />
            <path d="M0,0 L60,40 M60,0 L0,40" stroke="#FFFFFF" strokeWidth="8" />
            <path d="M0,0 L60,40" stroke="#C8102E" strokeWidth="4" />
            <path d="M60,0 L0,40" stroke="#C8102E" strokeWidth="4" />
            <path d="M30,0 v40 M0,20 h60" stroke="#FFFFFF" strokeWidth="12" />
            <path d="M30,0 v40 M0,20 h60" stroke="#C8102E" strokeWidth="7" />
          </g>
        </svg>
      );
    case 'tr':
      return (
        <svg viewBox="0 0 60 40" className={`${className} rounded-xs shrink-0 shadow-xs border border-white/30 inline-block overflow-hidden`}>
          <rect width="60" height="40" fill="#E30A17" rx="1.5" />
          <circle cx="24" cy="20" r="10" fill="#FFFFFF" />
          <circle cx="27" cy="20" r="8" fill="#E30A17" />
          <polygon
            points="34,20 38.5,21.5 35.8,17.5 35.8,22.5 38.5,18.5"
            fill="#FFFFFF"
          />
        </svg>
      );
    case 'so':
      return (
        <svg viewBox="0 0 60 40" className={`${className} rounded-xs shrink-0 shadow-xs border border-white/30 inline-block overflow-hidden`}>
          <rect width="60" height="40" fill="#4189DD" rx="1.5" />
          <polygon
            points="30,8 32.5,16 41,16 34.2,21 36.8,29 30,24 23.2,29 25.8,21 19,16 27.5,16"
            fill="#FFFFFF"
          />
        </svg>
      );
    case 'fr':
      return (
        <svg viewBox="0 0 60 40" className={`${className} rounded-xs shrink-0 shadow-xs border border-white/30 inline-block overflow-hidden`}>
          <rect width="20" height="40" x="0" fill="#002654" />
          <rect width="20" height="40" x="20" fill="#FFFFFF" />
          <rect width="20" height="40" x="40" fill="#ED2939" />
        </svg>
      );
    case 'ar':
      return (
        <svg viewBox="0 0 60 40" className={`${className} rounded-xs shrink-0 shadow-xs border border-white/30 inline-block overflow-hidden`}>
          <rect width="16" height="40" x="0" fill="#ED1C24" />
          <rect width="44" height="13.3" x="16" y="0" fill="#00732F" />
          <rect width="44" height="13.4" x="16" y="13.3" fill="#FFFFFF" />
          <rect width="44" height="13.3" x="16" y="26.7" fill="#000000" />
        </svg>
      );
    default:
      return null;
  }
};

export const LANGUAGES: LanguageItem[] = [
  { code: 'en', name: 'English' },
  { code: 'tr', name: 'Turkish' },
  { code: 'so', name: 'Somali' },
  { code: 'fr', name: 'France' },
  { code: 'ar', name: 'Arabic' },
];

export interface PublicHeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onOpenPortal: () => void;
}

export const PublicHeader: React.FC<PublicHeaderProps> = ({
  currentPage,
  onNavigate,
  onOpenPortal,
}) => {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [isAboutDropdownOpen, setIsAboutDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Language selector state
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const languageDropdownRef = useRef<HTMLDivElement>(null);
  const selectedLanguage = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsAboutDropdownOpen(false);
      }
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target as Node)) {
        setIsLanguageDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavClick = (page: string) => {
    onNavigate(page);
    setIsAboutDropdownOpen(false);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isAboutActive = ['our-story', 'blog', 'contact', 'about-us'].includes(currentPage);

  return (
    <>
      {/* ─────────────────────────────────────────────────────────────
          TOP HEADER BAR (Non-sticky: scrolls away with the page)
      ───────────────────────────────────────────────────────────── */}
      <div className="relative z-[60] w-full bg-[#ef4035] text-white text-xs border-b border-[#d8352b] shadow-2xs transition-colors">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-2 flex items-center justify-between gap-4 text-white">
          {/* Left: Contact Info (Direct Hotline, Email, Headquarters) */}
          <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
            <a
              href="tel:+252613295050"
              className="inline-flex items-center gap-1.5 text-white hover:text-white/80 transition-colors"
              title="Call AW Ali Direct Hotline"
            >
              <Phone className="w-3.5 h-3.5 text-white shrink-0" />
              <span className="font-bold text-white">+252 61 3295050</span>
            </a>

            <a
              href="mailto:info@awalicompany.com"
              className="hidden sm:inline-flex items-center gap-1.5 text-white hover:text-white/80 transition-colors"
              title="Email AW Ali Group"
            >
              <Mail className="w-3.5 h-3.5 text-white shrink-0" />
              <span className="font-semibold text-white">info@awalicompany.com</span>
            </a>
          </div>

          {/* Right: Social Media Icons + Language Translator Dropdown */}
          <div className="flex items-center gap-3 text-white">
            {/* Social Icons: Facebook & Instagram */}
            <div className="flex items-center gap-1.5 sm:gap-2 pr-2.5 sm:pr-3 border-r border-white/25">
              <a
                href="https://www.facebook.com/profile.php?id=61579015975877"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-6 h-6 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
                title="Follow AW Ali Company on Facebook"
              >
                <Facebook className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://www.instagram.com/awalicompany2020/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-6 h-6 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
                title="Follow AW Ali Company on Instagram"
              >
                <Instagram className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Language Translator Dropdown */}
            <div className="relative" ref={languageDropdownRef}>
              <button
                type="button"
                onClick={() => setIsLanguageDropdownOpen(prev => !prev)}
                className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-white/15 hover:bg-white/25 text-xs font-bold text-white transition-colors cursor-pointer border border-white/25"
                aria-expanded={isLanguageDropdownOpen}
                aria-label={t('topbar.select_lang')}
              >
                <LanguageFlag code={selectedLanguage.code} />
                <span className="text-white">{selectedLanguage.name}</span>
                <ChevronDown
                  className={`w-3 h-3 text-white transition-transform duration-200 ${
                    isLanguageDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Language Options Dropdown */}
              {isLanguageDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-44 bg-white dark:bg-[#0E1333] rounded-lg shadow-2xl border border-slate-200 dark:border-[#222956] py-1 z-[70] animate-in fade-in duration-150">
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    {t('topbar.select_lang')}
                  </div>
                  {LANGUAGES.map(lang => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => {
                        setLanguage(lang.code as LanguageCode);
                        setIsLanguageDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors text-left cursor-pointer ${
                        selectedLanguage.code === lang.code
                          ? 'bg-[#FF7817]/10 text-[#FF7817] font-bold'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 font-medium'
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <LanguageFlag code={lang.code} />
                        <span>{lang.name}</span>
                      </span>
                      {selectedLanguage.code === lang.code && (
                        <Check className="w-3.5 h-3.5 text-[#FF7817]" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          MAIN NAVBAR (Sticky top-0: stays visible on scroll)
      ───────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full bg-white/95 dark:bg-[#0B1030]/95 backdrop-blur-md border-b border-[#E2E6EF] dark:border-[#202754] text-[#171A2B] dark:text-white transition-colors">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 h-20 flex items-center justify-between gap-4">
        {/* Left Zone: Brand Logo */}
        <button
          type="button"
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-2 text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7817] rounded-lg"
        >
          <BrandLogo variant="full" themeMode="auto" />
        </button>

        {/* Center Zone: Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-7 text-sm font-semibold tracking-wide">
          {/* 1 - Home */}
          <button
            type="button"
            onClick={() => handleNavClick('home')}
            className={`inline-flex items-center gap-2 transition-colors cursor-pointer py-1.5 border-b-2 ${
              currentPage === 'home'
                ? 'border-[#FF7817] text-[#FF7817]'
                : 'border-transparent text-[#4B5368] dark:text-[#D9DDE8] hover:text-[#111638] dark:hover:text-white'
            }`}
          >
            <Home className="w-4 h-4 shrink-0" />
            <span>{t('nav.home')}</span>
          </button>

          {/* 2 - Consulting */}
          <button
            type="button"
            onClick={() => handleNavClick('consulting')}
            className={`inline-flex items-center gap-2 transition-colors cursor-pointer py-1.5 border-b-2 ${
              currentPage === 'consulting'
                ? 'border-[#FF7817] text-[#FF7817]'
                : 'border-transparent text-[#4B5368] dark:text-[#D9DDE8] hover:text-[#111638] dark:hover:text-white'
            }`}
          >
            <Briefcase className="w-4 h-4 shrink-0" />
            <span>{t('nav.consulting')}</span>
          </button>

          {/* 3 - Health */}
          <button
            type="button"
            onClick={() => handleNavClick('health')}
            className={`inline-flex items-center gap-2 transition-colors cursor-pointer py-1.5 border-b-2 ${
              currentPage === 'health'
                ? 'border-[#FF7817] text-[#FF7817]'
                : 'border-transparent text-[#4B5368] dark:text-[#D9DDE8] hover:text-[#111638] dark:hover:text-white'
            }`}
          >
            <HeartPulse className="w-4 h-4 shrink-0 text-[#FF7817]" />
            <span>{t('nav.health')}</span>
          </button>

          {/* 4 - Education */}
          <button
            type="button"
            onClick={() => handleNavClick('education')}
            className={`inline-flex items-center gap-2 transition-colors cursor-pointer py-1.5 border-b-2 ${
              currentPage === 'education'
                ? 'border-[#FF7817] text-[#FF7817]'
                : 'border-transparent text-[#4B5368] dark:text-[#D9DDE8] hover:text-[#111638] dark:hover:text-white'
            }`}
          >
            <GraduationCap className="w-4 h-4 shrink-0" />
            <span>{t('nav.education')}</span>
          </button>

          {/* 5 - Real Estate */}
          <button
            type="button"
            onClick={() => handleNavClick('real-estate')}
            className={`inline-flex items-center gap-2 transition-colors cursor-pointer py-1.5 border-b-2 ${
              currentPage === 'real-estate'
                ? 'border-[#FF7817] text-[#FF7817]'
                : 'border-transparent text-[#4B5368] dark:text-[#D9DDE8] hover:text-[#111638] dark:hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4 shrink-0" />
            <span>{t('nav.realEstate')}</span>
          </button>

          {/* 6 - Agencies */}
          <button
            type="button"
            onClick={() => handleNavClick('agencies')}
            className={`inline-flex items-center gap-2 transition-colors cursor-pointer py-1.5 border-b-2 ${
              currentPage === 'agencies'
                ? 'border-[#FF7817] text-[#FF7817]'
                : 'border-transparent text-[#4B5368] dark:text-[#D9DDE8] hover:text-[#111638] dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>{t('nav.agencies')}</span>
          </button>

          {/* About us with required Sub-menu */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsAboutDropdownOpen(!isAboutDropdownOpen)}
              onMouseEnter={() => setIsAboutDropdownOpen(true)}
              className={`inline-flex items-center gap-2 transition-colors cursor-pointer py-1.5 border-b-2 ${
                isAboutActive
                  ? 'border-[#FF7817] text-[#FF7817]'
                  : 'border-transparent text-[#4B5368] dark:text-[#D9DDE8] hover:text-[#111638] dark:hover:text-white'
              }`}
              aria-expanded={isAboutDropdownOpen}
              aria-haspopup="true"
            >
              <Info className="w-4 h-4 shrink-0" />
              <span>{t('nav.aboutUs')}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isAboutDropdownOpen ? 'rotate-180 text-[#FF7817]' : 'text-[#8A90A2]'
                }`}
              />
            </button>

            {/* Sub-menu Dropdown */}
            {isAboutDropdownOpen && (
              <div
                onMouseLeave={() => setIsAboutDropdownOpen(false)}
                className="absolute top-full left-0 mt-2 w-52 bg-white dark:bg-[#0E1235] border border-[#E2E6EF] dark:border-[#252B5C] rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
              >
                <button
                  type="button"
                  onClick={() => handleNavClick('our-story')}
                  className={`w-full text-left px-4 py-2.5 text-xs font-semibold flex items-center justify-between transition-colors ${
                    currentPage === 'our-story'
                      ? 'text-[#FF7817] bg-[#FF7817]/10'
                      : 'text-[#4B5368] dark:text-[#D9DDE8] hover:text-[#111638] dark:hover:text-white hover:bg-[#F2F5FB] dark:hover:bg-white/5'
                  }`}
                >
                  <div className="inline-flex items-center gap-2.5">
                    <BookOpen className="w-4 h-4 text-[#FF7817]" />
                    <span>{t('nav.ourStory')}</span>
                  </div>
                  {currentPage === 'our-story' && <span className="w-1.5 h-1.5 rounded-full bg-[#FF7817]" />}
                </button>

                <button
                  type="button"
                  onClick={() => handleNavClick('blog')}
                  className={`w-full text-left px-4 py-2.5 text-xs font-semibold flex items-center justify-between transition-colors ${
                    currentPage === 'blog'
                      ? 'text-[#FF7817] bg-[#FF7817]/10'
                      : 'text-[#4B5368] dark:text-[#D9DDE8] hover:text-[#111638] dark:hover:text-white hover:bg-[#F2F5FB] dark:hover:bg-white/5'
                  }`}
                >
                  <div className="inline-flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-[#FF7817]" />
                    <span>{t('nav.blog')}</span>
                  </div>
                  {currentPage === 'blog' && <span className="w-1.5 h-1.5 rounded-full bg-[#FF7817]" />}
                </button>

                <button
                  type="button"
                  onClick={() => handleNavClick('contact')}
                  className={`w-full text-left px-4 py-2.5 text-xs font-semibold flex items-center justify-between transition-colors ${
                    currentPage === 'contact'
                      ? 'text-[#FF7817] bg-[#FF7817]/10'
                      : 'text-[#4B5368] dark:text-[#D9DDE8] hover:text-[#111638] dark:hover:text-white hover:bg-[#F2F5FB] dark:hover:bg-white/5'
                  }`}
                >
                  <div className="inline-flex items-center gap-2.5">
                    <PhoneCall className="w-4 h-4 text-[#FF7817]" />
                    <span>{t('nav.contact')}</span>
                  </div>
                  {currentPage === 'contact' && <span className="w-1.5 h-1.5 rounded-full bg-[#FF7817]" />}
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* Right Zone: Actions (Portal Access & Theme toggle) */}
        <div className="flex items-center gap-3">
          {/* Theme switch button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2.5 rounded-xl text-[#5F667A] dark:text-[#8A90A2] hover:text-[#171A2B] dark:hover:text-white hover:bg-[#EEF1F7] dark:hover:bg-white/10 transition-colors cursor-pointer"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle light/dark theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-[#FF7817] transition-transform hover:rotate-45" />
            ) : (
              <Moon className="w-5 h-5 text-[#151A46] transition-transform hover:-rotate-12" />
            )}
          </button>

          {/* Admin / Management Portal Switch Button */}
          <button
            type="button"
            onClick={onOpenPortal}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#FF7817] dark:text-white bg-transparent border border-[#FF7817] rounded-xl hover:bg-[#FF7817] hover:text-white transition-all cursor-pointer shadow-xs active:scale-95"
            title="Access internal management system"
          >
            <Shield className="w-3.5 h-3.5 text-[#FF7817] group-hover:text-white" />
            <span>Portal</span>
          </button>

          {/* Mobile Menu Hamburger button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-[#171A2B] dark:text-white hover:bg-[#EEF1F7] dark:hover:bg-white/10 transition-colors"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-[#0B1030] border-b border-[#E2E6EF] dark:border-[#202754] px-6 py-5 space-y-4 animate-in fade-in duration-150">
          <div className="flex flex-col space-y-2">
            {/* 1 - Home */}
            <button
              type="button"
              onClick={() => handleNavClick('home')}
              className={`inline-flex items-center gap-2.5 text-left py-2 text-sm font-semibold transition-colors ${
                currentPage === 'home' ? 'text-[#FF7817]' : 'text-[#4B5368] dark:text-[#D9DDE8]'
              }`}
            >
              <Home className="w-4 h-4 shrink-0" />
              <span>{t('nav.home')}</span>
            </button>

            {/* 2 - Consulting */}
            <button
              type="button"
              onClick={() => handleNavClick('consulting')}
              className={`inline-flex items-center gap-2.5 text-left py-2 text-sm font-semibold transition-colors ${
                currentPage === 'consulting' ? 'text-[#FF7817]' : 'text-[#4B5368] dark:text-[#D9DDE8]'
              }`}
            >
              <Briefcase className="w-4 h-4 shrink-0" />
              <span>{t('nav.consulting')}</span>
            </button>

            {/* 3 - Health */}
            <button
              type="button"
              onClick={() => handleNavClick('health')}
              className={`inline-flex items-center gap-2.5 text-left py-2 text-sm font-semibold transition-colors ${
                currentPage === 'health' ? 'text-[#FF7817]' : 'text-[#4B5368] dark:text-[#D9DDE8]'
              }`}
            >
              <HeartPulse className="w-4 h-4 shrink-0 text-[#FF7817]" />
              <span>{t('nav.health')}</span>
            </button>

            {/* 4 - Education */}
            <button
              type="button"
              onClick={() => handleNavClick('education')}
              className={`inline-flex items-center gap-2.5 text-left py-2 text-sm font-semibold transition-colors ${
                currentPage === 'education' ? 'text-[#FF7817]' : 'text-[#4B5368] dark:text-[#D9DDE8]'
              }`}
            >
              <GraduationCap className="w-4 h-4 shrink-0" />
              <span>{t('nav.education')}</span>
            </button>

            {/* 5 - Real Estate */}
            <button
              type="button"
              onClick={() => handleNavClick('real-estate')}
              className={`inline-flex items-center gap-2.5 text-left py-2 text-sm font-semibold transition-colors ${
                currentPage === 'real-estate' ? 'text-[#FF7817]' : 'text-[#4B5368] dark:text-[#D9DDE8]'
              }`}
            >
              <Building2 className="w-4 h-4 shrink-0" />
              <span>{t('nav.realEstate')}</span>
            </button>

            {/* 6 - Agencies */}
            <button
              type="button"
              onClick={() => handleNavClick('agencies')}
              className={`inline-flex items-center gap-2.5 text-left py-2 text-sm font-semibold transition-colors ${
                currentPage === 'agencies' ? 'text-[#FF7817]' : 'text-[#4B5368] dark:text-[#D9DDE8]'
              }`}
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>{t('nav.agencies')}</span>
            </button>

            {/* Mobile About us Accordion */}
            <div className="pt-2 border-t border-[#E2E6EF] dark:border-[#202754]">
              <div className="inline-flex items-center gap-2 text-xs uppercase font-bold tracking-wider text-[#8A90A2] mb-2">
                <Info className="w-3.5 h-3.5" />
                <span>{t('nav.aboutUs')}</span>
              </div>
              <div className="pl-3 space-y-2">
                <button
                  type="button"
                  onClick={() => handleNavClick('our-story')}
                  className={`inline-flex items-center gap-2 text-left block py-1.5 text-sm font-medium transition-colors ${
                    currentPage === 'our-story' ? 'text-[#FF7817]' : 'text-[#4B5368] dark:text-[#D9DDE8]'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#FF7817]" />
                  <span>{t('nav.ourStory')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleNavClick('blog')}
                  className={`inline-flex items-center gap-2 text-left block py-1.5 text-sm font-medium transition-colors ${
                    currentPage === 'blog' ? 'text-[#FF7817]' : 'text-[#4B5368] dark:text-[#D9DDE8]'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-[#FF7817]" />
                  <span>{t('nav.blog')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleNavClick('contact')}
                  className={`inline-flex items-center gap-2 text-left block py-1.5 text-sm font-medium transition-colors ${
                    currentPage === 'contact' ? 'text-[#FF7817]' : 'text-[#4B5368] dark:text-[#D9DDE8]'
                  }`}
                >
                  <PhoneCall className="w-3.5 h-3.5 text-[#FF7817]" />
                  <span>{t('nav.contact')}</span>
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E2E6EF] dark:border-[#202754]">
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenPortal();
                }}
                className="w-full py-2.5 text-xs font-bold text-center text-white bg-[#FF7817] rounded-xl hover:bg-[#E66606] transition-colors"
              >
                {t('nav.accessPortal')}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  </>
);
};
