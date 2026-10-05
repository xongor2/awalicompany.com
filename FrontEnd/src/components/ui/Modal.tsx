import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'md'
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div
          className="fixed inset-0 bg-[#0B1030]/60 backdrop-blur-xs transition-opacity animate-in fade-in"
          onClick={onClose}
        />
        <div
          className={`relative transform overflow-hidden rounded-xl bg-white dark:bg-[#151A46] text-left shadow-2xl transition-all sm:my-8 w-full ${maxWidthClasses[maxWidth]} border border-[#D9DDE8] dark:border-[#252B5C] animate-in zoom-in-95 duration-150`}
        >
          {title && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#D9DDE8] dark:border-[#252B5C]">
              <div className="font-heading text-lg font-semibold text-[#171A2B] dark:text-white">
                {title}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-[#8A90A2] hover:text-[#171A2B] hover:bg-[#EEF0F5] dark:hover:text-white dark:hover:bg-[#252B5C] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
          <div className="px-6 py-5 max-h-[80vh] overflow-y-auto">{children}</div>
        </div>
      </div>
    </div>
  );
};
