import React, { useState, useEffect } from 'react';
import { hasLiveData } from '../services/tournamentPoller.js';

export default function DemoBanner() {
  const [live, setLive] = useState(hasLiveData());
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem('wc2026_banner_dismissed') === '1'
  );

  useEffect(() => {
    const handler = () => setLive(true);
    window.addEventListener('wc2026:live-data-ready', handler);
    return () => window.removeEventListener('wc2026:live-data-ready', handler);
  }, []);

  if (live || dismissed) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-4 pointer-events-none">
      <div className="max-w-xl mx-auto pointer-events-auto">
        <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl border border-white/[0.08] bg-wcCard backdrop-blur-xl shadow-lg">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-1.5 h-1.5 rounded-full bg-wcGold flex-shrink-0" />
            <p className="text-xs text-gray-400 leading-snug">
              <span className="text-white font-medium">Pre-tournament · WC 2026 group stage</span>
              {' '}— All 72 fixtures scheduled. Live scores and results will appear automatically when the tournament begins Jun 11.
            </p>
          </div>
          <button
            onClick={() => {
              sessionStorage.setItem('wc2026_banner_dismissed', '1');
              setDismissed(true);
            }}
            className="text-gray-600 hover:text-gray-300 transition-colors flex-shrink-0 text-lg leading-none"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
