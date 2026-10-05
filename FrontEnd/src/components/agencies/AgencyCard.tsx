import React from 'react';
import { MapPin, User, Mail, Phone, Globe, Building2 } from 'lucide-react';
import { Agency } from '../../types';

export interface AgencyCardProps {
  agency: Agency;
  onClick?: (agency: Agency) => void;
}

export const AgencyCard: React.FC<AgencyCardProps> = ({ agency, onClick }) => {
  // Format createdAt into "Month Year" (e.g., "May 2026")
  const formatOnFileSince = (isoDate?: string): string => {
    if (!isoDate) return 'May 2026';
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) return 'May 2026';
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // If user clicked directly on a link or button, don't trigger parent card action
    const target = e.target as HTMLElement;
    if (target.closest('a') || target.closest('button')) {
      return;
    }
    if (onClick) {
      onClick(agency);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && onClick) {
      const target = e.target as HTMLElement;
      if (!target.closest('a') && !target.closest('button')) {
        e.preventDefault();
        onClick(agency);
      }
    }
  };

  const firstLetter = agency.name.trim().charAt(0) || 'A';
  const websiteUrl = agency.website
    ? agency.website.startsWith('http://') || agency.website.startsWith('https://')
      ? agency.website
      : `https://${agency.website}`
    : '';

  return (
    <article
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : 'article'}
      aria-label={`${agency.name} — Agency in ${agency.city}, ${agency.country}`}
      className={`group relative bg-white dark:bg-[#111638] rounded-[16px] border border-gray-200/80 dark:border-[#202754] p-6 sm:p-7 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between ${
        onClick ? 'cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7817]' : ''
      }`}
    >
      <div>
        {/* 1. Header row */}
        <div className="flex items-start justify-between gap-4">
          {/* Left: circular avatar (about 64px) with double brand accent borders */}
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center p-[3px] border border-[#FF7817] shrink-0 select-none bg-white dark:bg-[#151A46]"
            aria-hidden="true"
          >
            <div className="w-full h-full rounded-full border border-dashed border-[#FF7817]/60 flex items-center justify-center bg-[#FF7817]/5 dark:bg-[#0B1030] overflow-hidden">
              {agency.logo ? (
                <img
                  src={agency.logo}
                  alt={`${agency.name} logo`}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <span className="text-2xl font-light text-[#0F1F4D] dark:text-white uppercase">
                  {firstLetter}
                </span>
              )}
            </div>
          </div>

          {/* Right: VERIFIED pill badge */}
          {agency.verified && (
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E3F1EB] border border-[#A9D3C0] text-[#1F7A55] text-[11px] font-bold tracking-wider uppercase select-none shrink-0"
              title="Verified Agency"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#1F7A55]" />
              <span>VERIFIED</span>
            </div>
          )}
        </div>

        {/* 2. Agency name */}
        <h3 className="font-heading text-xl sm:text-2xl font-medium text-[#0F1F4D] dark:text-white mt-4 tracking-tight leading-snug group-hover:text-[#3B63E0] transition-colors">
          {agency.name}
        </h3>

        {/* 3. Location line */}
        <div className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#3B63E0] mt-1.5">
          <MapPin className="w-3.5 h-3.5 shrink-0 text-[#3B63E0]" aria-hidden="true" />
          <span>
            {agency.country} · {agency.city}
          </span>
        </div>

        {/* 4. Dashed light-gray divider line */}
        <div className="border-b border-dashed border-gray-200 dark:border-[#202754] my-4" />

        {/* 5. Info rows */}
        <div className="space-y-2.5 text-xs sm:text-sm">
          {/* Contact Person */}
          {agency.contactName && (
            <div className="flex items-center gap-2.5 text-[#0F1F4D] dark:text-[#D9DDE8]">
              <User className="w-4 h-4 shrink-0 text-[#FF7817]" aria-hidden="true" />
              <span className="truncate">{agency.contactName}</span>
            </div>
          )}

          {/* Email */}
          {agency.email && (
            <div className="flex items-center gap-2.5 text-[#0F1F4D] dark:text-[#D9DDE8]">
              <Mail className="w-4 h-4 shrink-0 text-[#FF7817]" aria-hidden="true" />
              <a
                href={`mailto:${agency.email}`}
                className="truncate hover:text-[#FF7817] hover:underline transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#FF7817] rounded"
                title={`Send email to ${agency.email}`}
              >
                {agency.email}
              </a>
            </div>
          )}

          {/* Phone */}
          {agency.phone && (
            <div className="flex items-center gap-2.5 text-[#0F1F4D] dark:text-[#D9DDE8]">
              <Phone className="w-4 h-4 shrink-0 text-[#FF7817]" aria-hidden="true" />
              <a
                href={`tel:${agency.phone}`}
                className="truncate hover:text-[#FF7817] hover:underline transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#FF7817] rounded"
                title={`Call ${agency.phone}`}
              >
                {agency.phone}
              </a>
            </div>
          )}

          {/* Website */}
          {agency.website && (
            <div className="flex items-center gap-2.5 text-[#0F1F4D] dark:text-[#D9DDE8]">
              <Globe className="w-4 h-4 shrink-0 text-[#FF7817]" aria-hidden="true" />
              <a
                href={websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium hover:text-[#FF7817] hover:underline transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#FF7817] rounded inline-flex items-center gap-1"
                title={`Visit ${agency.name} website (opens in a new tab)`}
              >
                <span>Visit Website</span>
              </a>
            </div>
          )}

          {/* Address */}
          {agency.address && (
            <div className="flex items-start gap-2.5 text-[#0F1F4D] dark:text-[#D9DDE8]">
              <Building2 className="w-4 h-4 shrink-0 text-[#FF7817] mt-0.5" aria-hidden="true" />
              <span className="leading-snug line-clamp-2">{agency.address}</span>
            </div>
          )}
        </div>
      </div>

      <div>
        {/* 6. Dashed light-gray divider line */}
        <div className="border-b border-dashed border-gray-200 dark:border-[#202754] my-4" />

        {/* 7. Footer row */}
        <div className="flex items-center justify-between text-xs pt-1">
          <span className="font-bold tracking-wider text-[#6B7280] dark:text-[#8A90A2] uppercase text-[11px] select-none">
            ON FILE SINCE
          </span>
          <span className="font-semibold text-[#FF7817] text-xs">
            {formatOnFileSince(agency.createdAt)}
          </span>
        </div>
      </div>
    </article>
  );
};
