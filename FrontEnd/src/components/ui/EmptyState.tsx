import React from 'react';
import { PackageOpen } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-14 h-14 rounded-full bg-[#FFF0E4] dark:bg-[#252B5C] flex items-center justify-center text-[#FF7817] mb-4">
        {icon || <PackageOpen className="w-7 h-7" />}
      </div>
      <h3 className="font-heading text-lg font-semibold text-[#171A2B] dark:text-white mb-1">
        {title}
      </h3>
      <p className="text-sm text-[#5F667A] dark:text-[#8A90A2] max-w-sm mb-6">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="accent" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
