import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';

export interface DropdownAction {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'danger';
}

export interface ActionMenuProps {
  actions: DropdownAction[];
}

export const ActionMenu: React.FC<ActionMenuProps> = ({ actions }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Actions"
        className="p-1.5 rounded-lg text-[#8A90A2] hover:text-[#171A2B] hover:bg-[#EEF0F5] dark:hover:text-white dark:hover:bg-[#252B5C] transition-colors focus:outline-none"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-20 mt-1 w-44 origin-top-right rounded-lg bg-white dark:bg-[#151A46] border border-[#D9DDE8] dark:border-[#252B5C] shadow-lg py-1 focus:outline-none animate-in fade-in zoom-in-95">
          {actions.map((action, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setIsOpen(false);
                action.onClick();
              }}
              className={`w-full text-left px-3.5 py-2 text-xs font-medium flex items-center gap-2.5 transition-colors ${
                action.variant === 'danger'
                  ? 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                  : 'text-[#171A2B] dark:text-[#D9DDE8] hover:bg-[#EEF0F5] dark:hover:bg-[#252B5C]'
              }`}
            >
              {action.icon && <span className="w-4 h-4">{action.icon}</span>}
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
