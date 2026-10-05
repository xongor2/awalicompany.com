import React from 'react';
import { Search, X } from 'lucide-react';

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  width?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  className = '',
  width = 'w-full sm:w-72 md:w-80'
}) => {
  return (
    <div className={`relative flex items-center ${width} ${className}`}>
      <Search className="absolute left-3.5 w-4 h-4 text-[#8A90A2] pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 pl-10 pr-9 rounded-lg border border-[#D9DDE8] dark:border-[#252B5C] bg-white dark:bg-[#0B1030] text-[#171A2B] dark:text-white placeholder-[#8A90A2] text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#FF7817] focus:border-[#FF7817]"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-3 text-[#8A90A2] hover:text-[#171A2B] dark:hover:text-white transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
