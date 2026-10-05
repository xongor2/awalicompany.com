import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-[#D9DDE8] dark:border-[#252B5C] text-xs text-[#5F667A] dark:text-[#8A90A2]">
      <div>
        Showing <span className="font-semibold text-[#171A2B] dark:text-white">{startItem}</span> to{' '}
        <span className="font-semibold text-[#171A2B] dark:text-white">{endItem}</span> of{' '}
        <span className="font-semibold text-[#171A2B] dark:text-white">{totalItems}</span> results
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="p-1.5 rounded-lg border border-[#D9DDE8] dark:border-[#252B5C] bg-white dark:bg-[#151A46] text-[#171A2B] dark:text-[#D9DDE8] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#EEF0F5] dark:hover:bg-[#252B5C] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="px-2 font-medium text-[#171A2B] dark:text-white">
          {currentPage} / {totalPages}
        </span>

        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="p-1.5 rounded-lg border border-[#D9DDE8] dark:border-[#252B5C] bg-white dark:bg-[#151A46] text-[#171A2B] dark:text-[#D9DDE8] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#EEF0F5] dark:hover:bg-[#252B5C] transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
