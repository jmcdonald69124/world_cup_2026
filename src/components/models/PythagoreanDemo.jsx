import React, { useState, useMemo } from 'react';
import { pythagoreanWinPct } from '../../utils/models.js';

const PRESETS = [
  { name: 'Argentina (WC22)', gf: 9,  ga: 5,  actual: 0.611 },
  { name: 'France (WC22)',    gf: 16, ga: 8,  actual: 0.714 },
  { name: 'Morocco (WC22)',   gf: 6,  ga: 5,  actual: 0.571 },
  { name: 'Germany (WC22)',   gf: 6,  ga: 5,  actual: 0.333 },
];

export default function PythagoreanDemo() {
  const [gf, setGf] = useState(15);
  const [ga, setGa] = useState(8);
  const [exp, setExp] = useState(1.3);

  const pct = useMemo(() => pythagoreanWinPct(gf, ga, exp), [gf, ga, exp]);

  return (
    <div className="card rounded-xl p-5 space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-gray-500 block mb-1">Goals for</label>
          <input type="number" min="0" max="100" value={gf}
            onChange={(e) => setGf(Math.max(0, parseInt(e.target.value, 10) || 0))}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-md px-3 py-1.5 text-lg text-wcGreen font-bold tabular-nums" />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Goals against</label>
          <input type="number" min="0" max="100" value={ga}
            onChange={(e) => setGa(Math.max(0, parseInt(e.target.value, 10) || 0))}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-md px-3 py-1.5 text-lg text-wcRed font-bold tabular-nums" />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Exponent: <span className="text-white tabular-nums">{exp.toFixed(2)}</span></label>
          <input type="range" min="1.0" max="2.5" step="0.05" value={exp}
            onChange={(e) => setExp(parseFloat(e.target.value))}
            className="w-full accent-wcGreen mt-2" />
        </div>
      </div>

      <div className="bg-white/[0.03] rounded-md p-4 text-center">
        <div className="text-2xs text-gray-600 uppercase tracking-widest mb-1">Expected win rate</div>
        <div className="text-4xl font-black text-white tabular-nums">{(pct * 100).toFixed(1)}%</div>
        <div className="text-2xs text-gray-600 mt-1 font-mono">
          {gf}^{exp.toFixed(2)} / ({gf}^{exp.toFixed(2)} + {ga}^{exp.toFixed(2)})
        </div>
      </div>

      <div>
        <div className="text-2xs text-gray-600 uppercase tracking-widest mb-2">WC 2022 teams — predicted vs actual win rate</div>
        <div className="space-y-1.5">
          {PRESETS.map(p => {
            const predicted = pythagoreanWinPct(p.gf, p.ga, exp);
            const diff = (predicted - p.actual) * 100;
            return (
              <button key={p.name} onClick={() => { setGf(p.gf); setGa(p.ga); }}
                className="w-full text-left flex items-center justify-between text-xs py-1.5 px-2 rounded hover:bg-white/[0.04] transition-colors">
                <span className="text-gray-400">{p.name}</span>
                <div className="flex items-center gap-3 tabular-nums">
                  <span className="text-gray-600">{p.gf} GF / {p.ga} GA</span>
                  <span className="text-white">pred {(predicted * 100).toFixed(0)}%</span>
                  <span className="text-gray-500">actual {(p.actual * 100).toFixed(0)}%</span>
                  <span className={`w-10 text-right ${Math.abs(diff) < 8 ? 'text-wcGreen' : 'text-wcRed'}`}>
                    {diff > 0 ? '+' : ''}{diff.toFixed(0)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
