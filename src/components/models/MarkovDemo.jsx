import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { simulateMarkov, steadyState } from '../../utils/models.js';

const STATE_LABELS = ['Def 3rd', 'Mid 3rd', 'Att 3rd', 'Shot', 'Goal'];
const STATE_COLORS = ['#6b7280', '#9ca3af', '#facc15', '#f97316', '#00A550'];

const T = [
  [0.55, 0.35, 0.08, 0.02, 0.00],
  [0.25, 0.45, 0.25, 0.05, 0.00],
  [0.10, 0.35, 0.40, 0.15, 0.00],
  [0.60, 0.05, 0.05, 0.00, 0.30],
  [0.00, 0.00, 0.00, 0.00, 1.00],
];

export default function MarkovDemo() {
  const [path, setPath] = useState([0]);
  const [running, setRunning] = useState(false);

  const goalProb = useMemo(() => {
    let goals = 0;
    const N = 5000;
    for (let i = 0; i < N; i++) {
      const p = simulateMarkov(T, 0, 30);
      if (p[p.length - 1] === 4) goals++;
    }
    return goals / N;
  }, []);

  const run = () => {
    setRunning(true);
    const newPath = simulateMarkov(T, 0, 30);
    let i = 0;
    setPath([newPath[0]]);
    const id = setInterval(() => {
      i++;
      if (i >= newPath.length) {
        clearInterval(id);
        setRunning(false);
        return;
      }
      setPath((p) => [...p, newPath[i]]);
    }, 220);
  };

  return (
    <div className="card rounded-xl p-5 space-y-4">
      <div>
        <div className="text-2xs text-gray-600 uppercase tracking-widest mb-2">Transition matrix P(next state | current state)</div>
        <div className="grid gap-px bg-white/[0.05] p-px rounded-md" style={{ gridTemplateColumns: 'auto repeat(5, 1fr)' }}>
          <div className="bg-wcDark px-2 py-1 text-2xs text-gray-600" />
          {STATE_LABELS.map((l, j) => (
            <div key={`h-${j}`} className="bg-wcDark px-2 py-1 text-2xs text-center" style={{ color: STATE_COLORS[j] }}>{l}</div>
          ))}
          {T.map((row, i) => (
            <React.Fragment key={`row-${i}`}>
              <div className="bg-wcDark px-2 py-1 text-2xs" style={{ color: STATE_COLORS[i] }}>{STATE_LABELS[i]}</div>
              {row.map((p, j) => (
                <div key={`cell-${i}-${j}`}
                  className="bg-wcDark px-1 py-1 text-2xs text-center tabular-nums"
                  style={{ background: `rgba(0,165,80,${p * 0.8})`, color: p > 0.4 ? 'white' : '#6b7280' }}>
                  {p === 0 ? '·' : p.toFixed(2)}
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>

      <button onClick={run} disabled={running}
        className="w-full py-2.5 rounded-md bg-wcGreen/15 hover:bg-wcGreen/25 border border-wcGreen/30 text-wcGreen text-sm font-semibold transition-colors disabled:opacity-50">
        {running ? 'Simulating possession…' : 'Run one possession'}
      </button>

      <div>
        <div className="text-2xs text-gray-600 uppercase tracking-widest mb-2">State sequence</div>
        <div className="flex flex-wrap gap-1.5 items-center min-h-[2rem]">
          {path.map((s, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span className="text-gray-700">→</span>}
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-2xs font-bold px-2 py-0.5 rounded"
                style={{ background: `${STATE_COLORS[s]}25`, color: STATE_COLORS[s] }}
              >{STATE_LABELS[s]}</motion.span>
            </React.Fragment>
          ))}
        </div>
        <div className="text-2xs text-gray-700 mt-3 pt-3 border-t border-white/[0.06] leading-relaxed">
          Across 5,000 simulated possessions starting from the defensive third,
          <span className="text-wcGreen tabular-nums"> {(goalProb * 100).toFixed(1)}% </span>
          end in a goal. The Markov property — each transition depends only on the current state — is a strong assumption.
          Reality has memory (fatigue, momentum, scoreline pressure) that this model ignores.
        </div>
      </div>
    </div>
  );
}
