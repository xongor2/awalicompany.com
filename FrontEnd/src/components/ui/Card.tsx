import React from 'react';

export interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  children: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  action,
  noPadding = false,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`rounded-xl border bg-white border-[#D9DDE8] shadow-sm dark:bg-[#151A46] dark:border-[#252B5C] transition-colors ${className}`}
      {...props}
    >
      {(title || action) && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#D9DDE8] dark:border-[#252B5C]">
          <div>
            {typeof title === 'string' ? (
              <h3 className="font-heading text-base font-semibold text-[#171A2B] dark:text-white">
                {title}
              </h3>
            ) : (
              title
            )}
            {subtitle && (
              <p className="text-xs text-[#5F667A] dark:text-[#8A90A2] mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-6'}>{children}</div>
    </div>
  );
};
