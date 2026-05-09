import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';

const MAX_GOALS = 6;

function poissonPMF(lambda, k) {
  if (lambda <= 0) return k === 0 ? 1 : 0;
  let p = Math.exp(-lambda);
  for (let i = 1; i <= k; i++) p *= lambda / i;
  return p;
}

function computeScorelines(homeXG, awayXG) {
  let pHomeWin = 0, pDraw = 0, pAwayWin = 0;
  const grid = [];
  for (let h = 0; h <= MAX_GOALS; h++) {
    const row = [];
    for (let a = 0; a <= MAX_GOALS; a++) {
      const p = poissonPMF(homeXG, h) * poissonPMF(awayXG, a);
      row.push(p);
      if (h > a) pHomeWin += p;
      else if (h === a) pDraw += p;
      else pAwayWin += p;
    }
    grid.push(row);
  }
  return { pHomeWin, pDraw, pAwayWin, grid };
}

function Slider({ label, value, min, max, step, onChange, format }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-gray-400">{label}</span>
        <span className="text-white font-semibold tabular-nums">{format ? format(value) : value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1 appearance-none bg-gray-700 rounded-full outline-none accent-wcGreen"
      />
    </div>
  );
}

function ProbBar({ label, prob, color }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-400">{label}</span>
        <span className={`font-bold tabular-nums ${color}`}>{(prob * 100).toFixed(1)}%</span>
      </div>
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color === 'text-wcGreen' ? 'bg-wcGreen' : color === 'text-wcRed' ? 'bg-wcRed' : 'bg-gray-500'}`}
          animate={{ width: `${prob * 100}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        />
      </div>
    </div>
  );
}

export default function MatchSimulator({ homeTeam = 'Home', awayTeam = 'Away', homeElo = 1800, awayElo = 1700 }) {
  const [homeAttack, setHomeAttack] = useState(1.0);
  const [homeDefense, setHomeDefense] = useState(1.0);
  const [awayAttack, setAwayAttack] = useState(1.0);
  const [awayDefense, setAwayDefense] = useState(1.0);
  const [homeAdv, setHomeAdv] = useState(1.1);
  const [neutralVenue, setNeutralVenue] = useState(false);

  const { pHomeWin, pDraw, pAwayWin, grid, homeXG, awayXG } = useMemo(() => {
    const eloFactor = (homeElo - awayElo) / 400;
    const baseHomeXG = Math.max(0.3, 1.35 * Math.pow(10, eloFactor / 2));
    const baseAwayXG = Math.max(0.3, 1.05 / Math.pow(10, eloFactor / 2));
    const advMultiplier = neutralVenue ? 1.0 : homeAdv;
    const homeXG = baseHomeXG * homeAttack * (1 / awayDefense) * advMultiplier;
    const awayXG = baseAwayXG * awayAttack * (1 / homeDefense);
    const result = computeScorelines(homeXG, awayXG);
    return { ...result, homeXG, awayXG };
  }, [homeElo, awayElo, homeAttack, homeDefense, awayAttack, awayDefense, homeAdv, neutralVenue]);

  const scorelines = useMemo(() => {
    const flat = [];
    for (let h = 0; h <= MAX_GOALS; h++) {
      for (let a = 0; a <= MAX_GOALS; a++) {
        flat.push({ h, a, p: grid[h][a] });
      }
    }
    return flat.sort((x, y) => y.p - x.p).slice(0, 6);
  }, [grid]);

  const maxScorelineP = scorelines[0]?.p || 1;

  const cellColor = (h, a, p) => {
    const intensity = Math.min(1, p / 0.12);
    if (h > a) return `rgba(0,165,80,${0.1 + intensity * 0.55})`;
    if (h === a) return `rgba(107,114,128,${0.1 + intensity * 0.55})`;
    return `rgba(218,41,28,${0.1 + intensity * 0.55})`;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/5 rounded-xl p-4 text-center">
          <div className="text-xs text-gray-500 mb-1">{homeTeam} xG</div>
          <motion.div
            key={homeXG.toFixed(2)}
            initial={{ opacity: 0.4, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-3xl font-black text-wcGreen tabular-nums"
          >
            {homeXG.toFixed(2)}
          </motion.div>
          <div className="text-xs text-gray-600 mt-1">expected goals</div>
        </div>
        <div className="bg-white/5 rounded-xl p-4 text-center">
          <div className="text-xs text-gray-500 mb-1">{awayTeam} xG</div>
          <motion.div
            key={awayXG.toFixed(2)}
            initial={{ opacity: 0.4, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-3xl font-black text-wcRed tabular-nums"
          >
            {awayXG.toFixed(2)}
          </motion.div>
          <div className="text-xs text-gray-600 mt-1">expected goals</div>
        </div>
      </div>

      <div className="space-y-2">
        <ProbBar label={`${homeTeam} win`} prob={pHomeWin} color="text-wcGreen" />
        <ProbBar label="Draw" prob={pDraw} color="text-gray-400" />
        <ProbBar label={`${awayTeam} win`} prob={pAwayWin} color="text-wcRed" />
      </div>

      <div className="border-t border-white/5 pt-5">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Adjust Parameters</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
          <Slider label={`${homeTeam} attack`} value={homeAttack} min={0.4} max={2.0} step={0.05} onChange={setHomeAttack} format={(v) => `×${v.toFixed(2)}`} />
          <Slider label={`${awayTeam} attack`} value={awayAttack} min={0.4} max={2.0} step={0.05} onChange={setAwayAttack} format={(v) => `×${v.toFixed(2)}`} />
          <Slider label={`${homeTeam} defense`} value={homeDefense} min={0.4} max={2.0} step={0.05} onChange={setHomeDefense} format={(v) => `×${v.toFixed(2)}`} />
          <Slider label={`${awayTeam} defense`} value={awayDefense} min={0.4} max={2.0} step={0.05} onChange={setAwayDefense} format={(v) => `×${v.toFixed(2)}`} />
          {!neutralVenue && (
            <Slider label="Home advantage" value={homeAdv} min={1.0} max={1.3} step={0.01} onChange={setHomeAdv} format={(v) => `×${v.toFixed(2)}`} />
          )}
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={() => setNeutralVenue(!neutralVenue)}
              className={`w-9 h-5 rounded-full transition-colors flex-shrink-0 relative ${neutralVenue ? 'bg-wcGreen' : 'bg-gray-700'}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${neutralVenue ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </button>
            <span className="text-xs text-gray-400">Neutral venue</span>
          </div>
        </div>
      </div>

      <div className="border-t border-white/5 pt-5">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Scoreline Probability Matrix</div>
        <div className="overflow-x-auto">
          <table className="text-center text-xs w-full min-w-[320px]">
            <thead>
              <tr>
                <td className="pb-2 pr-2 text-gray-600 text-right">
                  <span className="text-wcGreen">{homeTeam} →</span>
                </td>
                {Array.from({ length: MAX_GOALS + 1 }, (_, a) => (
                  <td key={a} className="pb-2 w-10 font-bold text-gray-400">{a}</td>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: MAX_GOALS + 1 }, (_, h) => (
                <tr key={h}>
                  <td className="pr-2 py-0.5 font-bold text-gray-400 text-right">{h}</td>
                  {Array.from({ length: MAX_GOALS + 1 }, (_, a) => {
                    const p = grid[h][a];
                    return (
                      <td
                        key={a}
                        className="py-0.5 w-10 h-8 rounded text-xs font-semibold tabular-nums"
                        style={{ backgroundColor: cellColor(h, a, p), color: p > 0.04 ? 'white' : 'rgba(255,255,255,0.4)' }}
                        title={`${h}–${a}: ${(p * 100).toFixed(1)}%`}
                      >
                        {(p * 100).toFixed(1)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
            <span>Rows = {homeTeam} goals · Columns = {awayTeam} goals</span>
          </div>
        </div>
      </div>

      <div className="border-t border-white/5 pt-5">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Most Likely Scorelines</div>
        <div className="space-y-2">
          {scorelines.map(({ h, a, p }) => {
            const winner = h > a ? homeTeam : h < a ? awayTeam : 'Draw';
            const winColor = h > a ? 'text-wcGreen' : h < a ? 'text-wcRed' : 'text-gray-400';
            return (
              <div key={`${h}-${a}`} className="flex items-center gap-3">
                <span className="w-12 text-right font-black text-white tabular-nums">{h}–{a}</span>
                <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${h > a ? 'bg-wcGreen' : h < a ? 'bg-wcRed' : 'bg-gray-500'}`}
                    animate={{ width: `${(p / maxScorelineP) * 100}%` }}
                    transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                  />
                </div>
                <span className="w-10 text-right tabular-nums text-gray-300 text-xs">{(p * 100).toFixed(1)}%</span>
                <span className={`w-16 text-xs ${winColor}`}>{winner}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
