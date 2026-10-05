import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const ThemeToggle: React.FC<{ className?: string; showLabel?: boolean }> = ({
  className = '',
  showLabel = false
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      id="theme-toggle-btn"
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} mode (currently in ${theme} mode)`}
      title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} mode`}
      className={`inline-flex items-center gap-2 p-2 rounded-lg text-[#5F667A] hover:text-[#171A2B] hover:bg-[#EEF0F5] dark:text-[#D9DDE8] dark:hover:text-white dark:hover:bg-[#252B5C] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF7817] cursor-pointer ${className}`}
    >
      {theme === 'light' ? (
        <>
          <Moon className="w-5 h-5 transition-transform duration-200 hover:-rotate-12 text-[#151A46]" />
          {showLabel && <span className="text-xs font-semibold">Dark Mode</span>}
        </>
      ) : (
        <>
          <Sun className="w-5 h-5 text-[#FF7817] transition-transform duration-200 hover:rotate-45" />
          {showLabel && <span className="text-xs font-semibold">Light Mode</span>}
        </>
      )}
    </button>
  );
};
