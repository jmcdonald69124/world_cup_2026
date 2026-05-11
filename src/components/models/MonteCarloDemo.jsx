import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { monteCarloGroup, eloToLambda } from '../../utils/models.js';
import { getTeamsByGroup, GROUPS } from '../../data/teams.js';

export default function MonteCarloDemo() {
  const [group, setGroup] = useState('E');
  const [nSims, setNSims] = useState(2000);
  const [results, setResults] = useState(null);
  const [running, setRunning] = useState(false);

  const teams = getTeamsByGroup(group).map(t => ({ code: t.code, name: t.name, flag: t.flagEmoji, elo: t.eloRating }));

  const run = () => {
    setRunning(true);
    setTimeout(() => {
      const out = monteCarloGroup(teams, eloToLambda, nSims);
      const sorted = out
        .map(o => ({ ...o, ...teams.find(t => t.code === o.code) }))
        .sort((a, b) => b.top2 - a.top2);
      setResults(sorted);
      setRunning(false);
    }, 30);
  };

  return (
    <div className="card rounded-xl p-5 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-gray-500 block mb-1">Group</label>
          <select value={group} onChange={(e) => { setGroup(e.target.value); setResults(null); }}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-md px-3 py-1.5 text-sm text-white">
            {GROUPS.map(g => <option key={g} value={g}>Group {g}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Iterations: <span className="text-wcGreen tabular-nums">{nSims.toLocaleString()}</span></label>
          <input type="range" min="500" max="10000" step="500" value={nSims}
            onChange={(e) => setNSims(parseInt(e.target.value, 10))}
            className="w-full accent-wcGreen" />
        </div>
      </div>

      <button onClick={run} disabled={running}
        className="w-full py-2.5 rounded-md bg-wcGreen/15 hover:bg-wcGreen/25 border border-wcGreen/30 text-wcGreen text-sm font-semibold transition-colors disabled:opacity-50">
        {running ? 'Simulating…' : `Run ${nSims.toLocaleString()} tournament simulations`}
      </button>

      {results && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <div className="text-2xs text-gray-600 uppercase tracking-widest">Group {group} — top-2 probability after {nSims.toLocaleString()} simulated round-robins</div>
          {results.map((t) => (
            <div key={t.code} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span>{t.flag}</span>
                  <span className="text-white font-medium">{t.name}</span>
                  <span className="text-gray-700 tabular-nums">ELO {t.elo}</span>
                </div>
                <div className="flex items-center gap-3 tabular-nums">
                  <span className="text-gray-600">avg {t.avgPts.toFixed(1)} pts</span>
                  <span className="text-gray-500">win grp {(t.win * 100).toFixed(1)}%</span>
                  <span className="text-wcGreen font-bold w-12 text-right">{(t.top2 * 100).toFixed(1)}%</span>
                </div>
              </div>
              <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden">
                <div className="h-full bg-wcGreen" style={{ width: `${t.top2 * 100}%` }} />
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
