import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightElement, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-[#171A2B] dark:text-[#D9DDE8] mb-1.5">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 pointer-events-none text-[#8A90A2]">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`w-full h-11 px-3.5 ${leftIcon ? 'pl-10' : ''} ${rightElement ? 'pr-10' : ''} rounded-lg border bg-white dark:bg-[#0B1030] text-[#171A2B] dark:text-white placeholder-[#8A90A2] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF7817] focus:border-[#FF7817] disabled:bg-gray-100 dark:disabled:bg-[#151A46] disabled:cursor-not-allowed ${
              error
                ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500'
                : 'border-[#D9DDE8] dark:border-[#252B5C]'
            } ${className}`}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3.5 flex items-center">
              {rightElement}
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-xs text-rose-500 font-medium">{error}</p>}
        {!error && helperText && <p className="mt-1 text-xs text-[#8A90A2]">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
