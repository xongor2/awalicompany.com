import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'active' | 'pending' | 'sold' | 'inactive' | 'admin' | 'agent' | 'client' | 'neutral';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', className = '' }) => {
  const variantStyles = {
    // Semantic status: Active/Success
    active: 'bg-orange-50 text-[#FF7817] border-orange-200 dark:bg-orange-950/40 dark:text-[#FF9240] dark:border-orange-800/60',
    // Semantic status: Pending/Warning
    pending: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60',
    // Semantic status: Sold/Inactive
    sold: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    inactive: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/60',
    // Roles
    admin: 'bg-[#151A46]/10 text-[#151A46] border-[#151A46]/20 dark:bg-[#FF7817]/10 dark:text-[#FF7817] dark:border-[#FF7817]/30 font-semibold',
    agent: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/60 font-medium',
    client: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800/60 font-medium',
    neutral: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-[#252B5C] dark:text-[#D9DDE8] dark:border-[#252B5C]',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap ${variantStyles[variant]} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-75" />
      {children}
    </span>
  );
};
