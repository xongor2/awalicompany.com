import React, { useEffect, useRef, useState } from 'react';
import { api } from '../../services/api';
import type { QuickPopup, QuickPopupDisplayPage } from '../../types';
import { QuickPopupDisplay } from './QuickPopupDisplay';

interface PublicQuickPopupProps {
  displayPage: QuickPopupDisplayPage | null;
}

const historyKey = (popup: QuickPopup) => `aw-ali-popup-views:${popup.id}:${popup.updatedAt}`;

const readRecentViews = (popup: QuickPopup): number[] => {
  try {
    const stored = JSON.parse(localStorage.getItem(historyKey(popup)) || '[]');
    if (!Array.isArray(stored)) return [];
    const unitMs = popup.repeatEveryUnit === 'Days' ? 86_400_000 : 3_600_000;
    const cutoff = Date.now() - popup.repeatEveryValue * unitMs;
    return stored.filter(value => typeof value === 'number' && value >= cutoff);
  } catch {
    return [];
  }
};

export const PublicQuickPopup: React.FC<PublicQuickPopupProps> = ({ displayPage }) => {
  const [popup, setPopup] = useState<QuickPopup | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const shownForVisit = useRef(false);

  useEffect(() => {
    let cancelled = false;
    setPopup(null);
    setIsVisible(false);
    shownForVisit.current = false;
    if (!displayPage) return () => { cancelled = true; };

    void api.getActiveQuickPopup(displayPage)
      .then(result => { if (!cancelled) setPopup(result); })
      .catch(() => { if (!cancelled) setPopup(null); });
    return () => { cancelled = true; };
  }, [displayPage]);

  useEffect(() => {
    if (!popup || shownForVisit.current) return;
    const recentViews = readRecentViews(popup);
    try { localStorage.setItem(historyKey(popup), JSON.stringify(recentViews)); } catch { /* Storage is optional. */ }
    if (recentViews.length >= popup.maximumDisplays) return;

    const show = () => {
      if (shownForVisit.current) return;
      shownForVisit.current = true;
      setIsVisible(true);
      try { localStorage.setItem(historyKey(popup), JSON.stringify([...recentViews, Date.now()])); } catch { /* Storage is optional. */ }
    };

    if (popup.showAfterValue !== null) {
      const multiplier = popup.showAfterUnit === 'Minutes' ? 60_000 : 1_000;
      const timer = window.setTimeout(show, popup.showAfterValue * multiplier);
      return () => window.clearTimeout(timer);
    }

    if (popup.showAfterScroll !== null) {
      const onScroll = () => {
        const distance = document.documentElement.scrollHeight - window.innerHeight;
        const percentage = distance <= 0 ? 100 : (window.scrollY / distance) * 100;
        if (percentage >= popup.showAfterScroll!) {
          window.removeEventListener('scroll', onScroll);
          show();
        }
      };
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
      return () => window.removeEventListener('scroll', onScroll);
    }

    show();
  }, [popup]);

  return popup && isVisible ? <QuickPopupDisplay popup={popup} onClose={() => setIsVisible(false)} /> : null;
};
