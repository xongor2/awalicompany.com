import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'accent' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  className = '',
  ...props
}) => {
  const sizeClasses = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base',
  };

  const variantClasses = {
    primary: 'bg-[#151A46] text-white hover:bg-[#0B1030] dark:bg-gradient-to-r dark:from-[#FF7817] dark:to-[#E66606] dark:hover:from-[#E66606] dark:hover:to-[#D95D00] shadow-xs active:scale-[0.98] transition-all duration-150',
    accent: 'bg-gradient-to-r from-[#FF7817] via-[#FF8024] to-[#E66606] text-white hover:from-[#E66606] hover:to-[#D95D00] shadow-[0_2px_8px_rgba(255,120,23,0.28)] hover:shadow-[0_4px_14px_rgba(255,120,23,0.40)] border border-[#FFA057]/30 active:scale-[0.98] transition-all duration-150',
    secondary: 'bg-white text-[#171A2B] border border-[#D9DDE8] hover:bg-[#EEF0F5] hover:border-[#C5CBE0] dark:bg-[#151A46] dark:text-white dark:border-[#252B5C] dark:hover:bg-[#252B5C] shadow-2xs active:scale-[0.98] transition-all duration-150',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 shadow-sm active:scale-[0.98] transition-all duration-150',
    ghost: 'bg-transparent text-[#5F667A] hover:text-[#171A2B] hover:bg-[#EEF0F5] dark:text-[#D9DDE8] dark:hover:text-white dark:hover:bg-[#252B5C] transition-colors',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-[#FF7817] focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin h-4 w-4 text-current" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      ) : (
        leftIcon
      )}
      <span className="inline-flex items-center gap-2 tracking-normal font-semibold leading-none">{children}</span>
      {!isLoading && rightIcon}
    </button>
  );
};
