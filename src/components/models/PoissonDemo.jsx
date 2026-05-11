import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { scoreMatrix, outcomeProbs } from '../../utils/models.js';

export default function PoissonDemo() {
  const [lambdaH, setLambdaH] = useState(1.8);
  const [lambdaA, setLambdaA] = useState(1.2);
  const [useDixonColes, setUseDixonColes] = useState(false);

  const matrix = useMemo(
    () => scoreMatrix(lambdaH, lambdaA, 5, useDixonColes ? -0.1 : 0),
    [lambdaH, lambdaA, useDixonColes]
  );
  const probs = useMemo(() => outcomeProbs(matrix), [matrix]);

  let bestP = 0, bestI = 0, bestJ = 0;
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[0].length; j++) {
      if (matrix[i][j] > bestP) { bestP = matrix[i][j]; bestI = i; bestJ = j; }
    }
  }

  const maxCell = bestP;

  return (
    <div className="card rounded-xl p-5 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-gray-500 block mb-1">Home λ (expected goals)</label>
          <input type="range" min="0.2" max="4" step="0.1" value={lambdaH}
            onChange={(e) => setLambdaH(parseFloat(e.target.value))}
            className="w-full accent-wcGreen" />
          <div className="text-sm font-bold text-wcGreen tabular-nums">{lambdaH.toFixed(1)}</div>
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Away λ (expected goals)</label>
          <input type="range" min="0.2" max="4" step="0.1" value={lambdaA}
            onChange={(e) => setLambdaA(parseFloat(e.target.value))}
            className="w-full accent-wcRed" />
          <div className="text-sm font-bold text-wcRed tabular-nums">{lambdaA.toFixed(1)}</div>
        </div>
      </div>

      <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
        <input type="checkbox" checked={useDixonColes}
          onChange={(e) => setUseDixonColes(e.target.checked)}
          className="accent-wcGreen" />
        <span>Apply Dixon-Coles correction (ρ = −0.1) for low-score draws</span>
      </label>

      <div>
        <div className="text-2xs text-gray-600 uppercase tracking-widest mb-2">Score-line probabilities</div>
        <div className="grid gap-px bg-white/[0.05] p-px rounded-md" style={{ gridTemplateColumns: 'auto repeat(6, 1fr)' }}>
          <div className="bg-wcDark px-2 py-1 text-2xs text-gray-600 text-center">H \ A</div>
          {Array.from({ length: 6 }, (_, j) => (
            <div key={`hdr-${j}`} className="bg-wcDark px-2 py-1 text-2xs text-gray-600 text-center tabular-nums">{j}</div>
          ))}
          {matrix.map((row, i) => (
            <React.Fragment key={`r-${i}`}>
              <div className="bg-wcDark px-2 py-1 text-2xs text-gray-600 text-center tabular-nums">{i}</div>
              {row.map((p, j) => {
                const intensity = maxCell > 0 ? p / maxCell : 0;
                const isWin = i > j, isDraw = i === j;
                const bg = isWin ? `rgba(0,165,80,${intensity})` :
                           isDraw ? `rgba(250,204,21,${intensity})` :
                                    `rgba(218,41,28,${intensity})`;
                const isBest = i === bestI && j === bestJ;
                return (
                  <div key={`c-${i}-${j}`}
                    className={`relative px-1 py-1 text-2xs text-center tabular-nums ${isBest ? 'ring-1 ring-white' : ''}`}
                    style={{ background: bg }}>
                    <span className={intensity > 0.4 ? 'text-white font-semibold' : 'text-gray-500'}>
                      {(p * 100).toFixed(1)}
                    </span>
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
        <div className="text-2xs text-gray-600 mt-1.5">
          Most likely: <span className="text-white">{bestI}–{bestJ}</span> at {(bestP * 100).toFixed(1)}%
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/[0.06]">
        {[
          { label: 'Home win', val: probs.home, color: 'text-wcGreen' },
          { label: 'Draw',     val: probs.draw, color: 'text-yellow-400' },
          { label: 'Away win', val: probs.away, color: 'text-wcRed' },
        ].map(({ label, val, color }) => (
          <div key={label} className="text-center">
            <div className="text-2xs text-gray-600">{label}</div>
            <div className={`text-lg font-black tabular-nums ${color}`}>{(val * 100).toFixed(1)}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}
