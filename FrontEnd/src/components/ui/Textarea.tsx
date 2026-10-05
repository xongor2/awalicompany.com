import React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const textareaId = id || (label ? `textarea-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={textareaId} className="block text-sm font-medium text-[#171A2B] dark:text-[#D9DDE8] mb-1.5">
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          className={`w-full min-h-[120px] p-3.5 rounded-lg border bg-white dark:bg-[#0B1030] text-[#171A2B] dark:text-white placeholder-[#8A90A2] transition-colors resize-y focus:outline-none focus:ring-2 focus:ring-[#FF7817] focus:border-[#FF7817] disabled:bg-gray-100 dark:disabled:bg-[#151A46] ${
            error ? 'border-rose-500 focus:ring-rose-500' : 'border-[#D9DDE8] dark:border-[#252B5C]'
          } ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-rose-500 font-medium">{error}</p>}
        {!error && helperText && <p className="mt-1 text-xs text-[#8A90A2]">{helperText}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
