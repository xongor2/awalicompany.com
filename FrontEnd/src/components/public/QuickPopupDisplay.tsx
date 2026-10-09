import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import type { QuickPopup } from '../../types';

interface QuickPopupDisplayProps {
  popup: QuickPopup;
  onClose: () => void;
}

export const QuickPopupDisplay: React.FC<QuickPopupDisplayProps> = ({ popup, onClose }) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    if (popup.popupType === 'Screen Modal') document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab' || !panelRef.current) return;
      const focusable = [...panelRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )].filter(element => !element.hasAttribute('hidden'));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [popup.popupType]);

  const content = (
    <div className="relative">
      <button
        ref={closeRef}
        type="button"
        onClick={event => { event.preventDefault(); event.stopPropagation(); onClose(); }}
        className="absolute right-3 top-3 z-20 grid h-9 w-9 place-items-center rounded-full border border-white/50 bg-[#0B1030]/85 text-white shadow-lg transition hover:bg-[#FF7817] focus:outline-none focus:ring-2 focus:ring-white"
        aria-label="Close popup"
      >
        <X className="h-5 w-5" />
      </button>

      {popup.designType === 'Image' && popup.image ? (
        popup.destinationLink ? (
          <a href={popup.destinationLink} target="_blank" rel="noopener noreferrer" className="block">
            <img src={popup.image} alt={popup.name} className="block h-auto max-h-[calc(100vh-3rem)] w-full object-contain" />
          </a>
        ) : (
          <img src={popup.image} alt={popup.name} className="block h-auto max-h-[calc(100vh-3rem)] w-full object-contain" />
        )
      ) : (
        <div className="space-y-5 p-7 pt-16 sm:p-9 sm:pt-16">
          <div className="h-1 w-14 rounded-full bg-[#FF7817]" />
          <h2 id={`popup-title-${popup.id}`} className="font-heading text-2xl font-bold leading-tight text-[#151A46] dark:text-white sm:text-3xl">
            {popup.title}
          </h2>
          <p className="whitespace-pre-wrap text-sm leading-7 text-[#4B5368] dark:text-[#D9DDE8] sm:text-base">
            {popup.body}
          </p>
          {popup.footer ? (
            <p className="border-t border-[#D9DDE8] pt-4 text-xs font-semibold leading-6 text-[#5F667A] dark:border-[#252B5C] dark:text-[#AEB4C7]">
              {popup.footer}
            </p>
          ) : null}
        </div>
      )}
    </div>
  );

  if (popup.popupType === 'Right Sidebar') {
    return (
      <div className="pointer-events-none fixed inset-0 z-[100] flex justify-end" aria-live="polite">
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={popup.designType === 'Custom Content' ? `popup-title-${popup.id}` : undefined}
          aria-label={popup.designType === 'Image' ? popup.name : undefined}
          className="pointer-events-auto h-full w-full max-w-md overflow-y-auto border-l border-[#D9DDE8] bg-white shadow-2xl quick-popup-slide-in dark:border-[#252B5C] dark:bg-[#151A46]"
        >
          {content}
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-[#0B1030]/70 p-4 backdrop-blur-sm"
      onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={popup.designType === 'Custom Content' ? `popup-title-${popup.id}` : undefined}
        aria-label={popup.designType === 'Image' ? popup.name : undefined}
        className="max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#D9DDE8] bg-white shadow-2xl quick-popup-modal-in dark:border-[#252B5C] dark:bg-[#151A46]"
      >
        {content}
      </div>
    </div>
  );
};
