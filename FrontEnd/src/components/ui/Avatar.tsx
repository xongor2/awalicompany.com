import React from 'react';

export interface AvatarProps {
  src?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ src, name = 'User', size = 'md', className = '' }) => {
  const sizeMap = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
  };

  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(n => n[0].toUpperCase())
    .join('');

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`rounded-full object-cover border border-[#D9DDE8] dark:border-[#252B5C] bg-[#EEF0F5] ${sizeMap[size]} ${className}`}
        onError={(e) => {
          // Fallback to text avatar if broken
          e.currentTarget.style.display = 'none';
          e.currentTarget.parentElement?.classList.add('fallback-avatar');
        }}
      />
    );
  }

  return (
    <div
      className={`rounded-full flex items-center justify-center font-semibold bg-[#151A46] text-[#FF7817] dark:bg-[#FF7817] dark:text-white border border-[#D9DDE8] dark:border-[#252B5C] ${sizeMap[size]} ${className}`}
    >
      {initials || 'AW'}
    </div>
  );
};
