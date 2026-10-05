import React from 'react';

export interface BrandLogoProps {
  variant?: 'full' | 'icon-only' | 'sidebar';
  className?: string;
  themeMode?: 'light' | 'dark' | 'auto';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'full',
  className = '',
  themeMode = 'auto',
}) => {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* AW Monogram Logo Mark matching image.png */}
      <div className="relative shrink-0 flex items-center justify-center">
        <svg
          className="w-10 h-10"
          viewBox="0 0 120 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Stylized 'A' stem and 'W' double-valley curves in AW Orange */}
          <path
            d="M16 82V32C16 20.9543 24.9543 12 36 12C47.0457 12 56 20.9543 56 32V82"
            stroke="#FF7817"
            strokeWidth="11"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M36 82V48C36 39.1634 43.1634 32 52 32C60.8366 32 68 39.1634 68 48V82"
            stroke="#FF7817"
            strokeWidth="11"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Upper flowing swoosh trail */}
          <path
            d="M58 22C74 16 94 18 112 28"
            stroke="#FF7817"
            strokeWidth="8"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Brand Typography */}
      {variant !== 'icon-only' && (
        <div className="flex flex-col justify-center">
          <div className="flex items-baseline">
            <span
              className={`font-heading text-2xl font-black tracking-tight uppercase transition-colors ${
                themeMode === 'dark'
                  ? 'text-white'
                  : themeMode === 'light'
                  ? 'text-[#151A46]'
                  : 'text-[#151A46] dark:text-white'
              }`}
              style={{ letterSpacing: '-0.02em' }}
            >
              Ali Company
            </span>
          </div>
          {variant === 'sidebar' && (
            <span className="text-[8px] font-semibold tracking-widest text-[#8A90A2] uppercase mt-0.5 whitespace-nowrap">
              Properties • Services • Education
            </span>
          )}
        </div>
      )}
    </div>
  );
};
