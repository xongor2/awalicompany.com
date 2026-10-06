import React from 'react';

export interface BrandLogoProps {
  variant?: 'full' | 'icon-only' | 'sidebar';
  className?: string;
  themeMode?: 'light' | 'dark' | 'auto';
}

const logoClassNames = {
  full: 'w-[170px] sm:w-[185px] h-auto',
  sidebar: 'w-[205px] max-w-full h-auto',
  'icon-only': 'w-11 h-11 object-cover object-left',
};

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'full',
  className = '',
  themeMode = 'auto',
}) => {
  const imageClassName = logoClassNames[variant];

  return (
    <div className={`flex items-center ${className}`}>
      {themeMode === 'auto' ? (
        <>
          <img
            src="/images/avatars/Logo-light.png"
            alt="Ali Company"
            className={`${imageClassName} block dark:hidden`}
          />
          <img
            src="/images/avatars/Logo-dark.png"
            alt="Ali Company"
            className={`${imageClassName} hidden dark:block`}
          />
        </>
      ) : (
        <img
          src={`/images/avatars/Logo-${themeMode}.png`}
          alt="Ali Company"
          className={imageClassName}
        />
      )}
    </div>
  );
};
