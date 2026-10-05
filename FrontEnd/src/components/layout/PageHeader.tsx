import React from 'react';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, action }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight text-[#171A2B] dark:text-white">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-[#5F667A] dark:text-[#8A90A2] mt-1">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="flex items-center gap-3 shrink-0">{action}</div>}
    </div>
  );
};
