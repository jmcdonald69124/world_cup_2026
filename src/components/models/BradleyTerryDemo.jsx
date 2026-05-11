import React, { useState, useMemo } from 'react';
import { bradleyTerryFit } from '../../utils/models.js';

const TEAMS = ['ARG', 'BRA', 'FRA', 'JPN'];
const FLAGS = { ARG: '🇦🇷', BRA: '🇧🇷', FRA: '🇫🇷', JPN: '🇯🇵' };

const DEFAULT_MATCHES = [
  { home: 0, away: 1, result: 'home' },
  { home: 2, away: 3, result: 'home' },
  { home: 0, away: 2, result: 'draw' },
  { home: 1, away: 3, result: 'home' },
  { home: 0, away: 3, result: 'home' },
  { home: 2, away: 1, result: 'home' },
];

const RESULT_LABEL = { home: 'home', draw: 'draw', away: 'away' };

export default function BradleyTerryDemo() {
  const [matches, setMatches] = useState(DEFAULT_MATCHES);

  const strengths = useMemo(() => bradleyTerryFit(matches, TEAMS.length), [matches]);
  const ranked = TEAMS.map((code, i) => ({ code, pi: strengths[i] }))
    .sort((a, b) => b.pi - a.pi);

  const cycle = (idx) => {
    const order = ['home', 'draw', 'away'];
    setMatches(matches.map((m, i) =>
      i === idx ? { ...m, result: order[(order.indexOf(m.result) + 1) % 3] } : m
    ));
  };

  return (
    <div className="card rounded-xl p-5 space-y-4">
      <div>
        <div className="text-2xs text-gray-600 uppercase tracking-widest mb-2">Mini-tournament — click any result to cycle home/draw/away</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {matches.map((m, i) => (
            <button key={i} onClick={() => cycle(i)}
              className="flex items-center justify-between text-sm py-2 px-3 bg-white/[0.03] hover:bg-white/[0.06] rounded-md transition-colors">
              <div className="flex items-center gap-1.5">
                <span>{FLAGS[TEAMS[m.home]]}</span>
                <span className="text-white font-medium">{TEAMS[m.home]}</span>
              </div>
              <span className={`text-2xs font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                m.result === 'home' ? 'bg-wcGreen/15 text-wcGreen' :
                m.result === 'draw' ? 'bg-yellow-500/15 text-yellow-400' :
                                      'bg-wcRed/15 text-wcRed'
              }`}>{RESULT_LABEL[m.result]}</span>
              <div className="flex items-center gap-1.5">
                <span className="text-white font-medium">{TEAMS[m.away]}</span>
                <span>{FLAGS[TEAMS[m.away]]}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="pt-3 border-t border-white/[0.06]">
        <div className="text-2xs text-gray-600 uppercase tracking-widest mb-2">Estimated strengths π (MLE, normalised)</div>
        <div className="space-y-2">
          {ranked.map((t, idx) => {
            const maxPi = ranked[0].pi || 1;
            return (
              <div key={t.code}>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 w-3 tabular-nums">{idx + 1}</span>
                    <span>{FLAGS[t.code]}</span>
                    <span className="text-white font-medium">{t.code}</span>
                  </div>
                  <span className="text-wcGreen font-bold tabular-nums">{t.pi.toFixed(2)}</span>
                </div>
                <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden mt-1">
                  <div className="h-full bg-wcGreen" style={{ width: `${(t.pi / maxPi) * 100}%` }} />
                </div>
              </div>
            );
          })}
        </div>
        <div className="text-2xs text-gray-700 mt-3 leading-relaxed">
          P({ranked[0].code} beats {ranked[ranked.length - 1].code}) ={' '}
          <span className="text-white tabular-nums">
            {(ranked[0].pi / (ranked[0].pi + ranked[ranked.length - 1].pi) * 100).toFixed(1)}%
          </span>
          {' '}— derived purely from the match results above, no priors.
        </div>
      </div>
    </div>
  );
}
