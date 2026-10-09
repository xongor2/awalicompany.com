import React, { useState } from 'react';
import { BrandLogo } from '../common/BrandLogo';
import { useToast } from '../ui/Toast';

export interface PublicFooterProps {
  onNavigate?: (page: string) => void;
}

export const PublicFooter: React.FC<PublicFooterProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { showToast } = useToast();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      showToast('Please enter a valid email address.', 'error', 'Invalid Email');
      return;
    }
    setIsSubscribed(true);
    showToast('Thank you for subscribing to AW Ali Company updates!', 'success', 'Subscribed');
    setEmail('');
  };

  const handleLinkClick = (pageKey: string) => {
    if (onNavigate) {
      onNavigate(pageKey);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="w-full bg-[#111638] text-white pt-16 pb-12 px-6 sm:px-10 lg:px-16 border-t border-[#202754] select-none">
      <div className="max-w-[1440px] mx-auto">
        {/* Main 4-Column Layout strictly matching image.png */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-14">
          {/* Column 1: Brand & Bio (Span 4) */}
          <div className="lg:col-span-4 space-y-5">
            <button
              type="button"
              onClick={() => handleLinkClick('home')}
              className="text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7817] rounded-lg"
            >
              <BrandLogo variant="full" themeMode="dark" />
            </button>
            <p className="text-sm text-[#B2B8CC] leading-relaxed max-w-sm font-normal">
              AW Ali Company is an innovative and reliable organization providing services in various fields such as consultancy, education, training, healthcare logistics, and foreign trade.
            </p>
          </div>

          {/* Column 2: Special services (Span 2) */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-heading text-lg font-bold text-white tracking-wide">
              Key Divisions
            </h3>
            <ul className="space-y-3 text-sm text-[#B2B8CC]">
              <li>
                <button
                  type="button"
                  onClick={() => handleLinkClick('consulting')}
                  className="hover:text-white transition-colors cursor-pointer text-left font-normal"
                >
                  Consulting
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleLinkClick('health')}
                  className="hover:text-[#FF7817] text-white transition-colors cursor-pointer text-left font-semibold"
                >
                  Health & Medical
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleLinkClick('education')}
                  className="hover:text-white transition-colors cursor-pointer text-left font-normal"
                >
                  Education
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleLinkClick('real-estate')}
                  className="hover:text-white transition-colors cursor-pointer text-left font-normal"
                >
                  Real Estate
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleLinkClick('agencies')}
                  className="hover:text-white transition-colors cursor-pointer text-left font-normal"
                >
                  Agencies
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleLinkClick('contact')}
                  className="hover:text-white transition-colors cursor-pointer text-left font-normal"
                >
                  Contact Us
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Follow us (Span 2) */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-heading text-lg font-bold text-white tracking-wide">
              Follow us
            </h3>
            <ul className="space-y-3 text-sm text-[#B2B8CC]">
              <li>
                <a
                  href="https://www.instagram.com/awalicompany?utm_source=qr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors inline-block font-normal"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href="https://www.facebook.com/profile.php?id=61579015975877"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors inline-block font-normal"
                >
                  Facebook
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter (Span 4) matching image.png */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="font-heading text-lg font-bold text-white tracking-wide">
              Newsletter
            </h3>
            <p className="text-sm text-[#B2B8CC] leading-relaxed">
              Sing up for email updates on the latest collections, campaigns and video
            </p>

            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-stretch gap-2.5 pt-1">
              <div className="relative flex-1">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter you em"
                  className="w-full bg-[#111638] text-white text-sm px-3.5 py-2.5 border border-[#FF7817]/70 focus:border-[#FF7817] focus:outline-none focus:ring-1 focus:ring-[#FF7817] transition-all placeholder-[#72799A]"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 text-sm font-medium text-white bg-[#111638] border border-[#FF7817] hover:bg-[#FF7817] hover:text-white active:scale-95 transition-all cursor-pointer whitespace-nowrap text-center shadow-xs"
              >
                {isSubscribed ? 'Subscribed' : 'Subscribe'}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar: Horizontal social icons at bottom right exactly like image.png */}
        <div className="pt-6 border-t border-[#1C2352] flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#72799A]">
            © {new Date().getFullYear()} AW Ali Company. All rights reserved.
          </p>

          {/* Social Icons row */}
          <div className="flex items-center gap-5 text-[#FF7817]">
            {/* Facebook */}
            <a
              href="https://www.facebook.com/profile.php?id=61579015975877"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#FF7817] hover:text-white transition-colors"
              aria-label="Visit AW Ali Company Facebook"
              title="Visit AW Ali Company Facebook"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>

            {/* Instagram */}
            <a
              href="https://www.instagram.com/awalicompany?utm_source=qr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#FF7817] hover:text-white transition-colors"
              aria-label="Visit AW Ali Company Instagram"
              title="Visit AW Ali Company Instagram"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
