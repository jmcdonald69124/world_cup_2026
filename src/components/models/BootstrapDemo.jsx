import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { bootstrap } from '../../utils/models.js';

const PRESETS = {
  Argentina22: [1, 0, 1, 1, 0.5, 1, 1],
  France18:    [1, 1, 1, 1, 1, 1, 1],
  Germany22:   [1, 0.5, 0],
};

const mean = (a) => a.reduce((s, v) => s + v, 0) / (a.length || 1);

export default function BootstrapDemo() {
  const [preset, setPreset] = useState('Argentina22');
  const [nBoot, setNBoot] = useState(2000);

  const sample = PRESETS[preset];
  const result = useMemo(() => bootstrap(sample, mean, nBoot, 0.05), [sample, nBoot]);

  const widthPct = (val) => Math.max(0, Math.min(100, val * 100));

  return (
    <div className="card rounded-xl p-5 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-gray-500 block mb-1">Sample (1=win, 0.5=draw, 0=loss)</label>
          <select value={preset} onChange={(e) => setPreset(e.target.value)}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-md px-3 py-1.5 text-sm text-white">
            <option value="Argentina22">Argentina · WC2022 (7 games)</option>
            <option value="France18">France · WC2018 (7 games)</option>
            <option value="Germany22">Germany · WC2022 group (3 games)</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Bootstrap resamples: <span className="text-white tabular-nums">{nBoot.toLocaleString()}</span></label>
          <input type="range" min="200" max="10000" step="200" value={nBoot}
            onChange={(e) => setNBoot(parseInt(e.target.value, 10))}
            className="w-full accent-wcGreen mt-2" />
        </div>
      </div>

      <div className="bg-white/[0.03] rounded-md p-4">
        <div className="text-2xs text-gray-600 uppercase tracking-widest mb-2">Sample data ({sample.length} matches)</div>
        <div className="flex flex-wrap gap-1.5">
          {sample.map((r, i) => (
            <span key={i} className={`text-2xs font-bold px-2 py-0.5 rounded tabular-nums ${
              r === 1 ? 'bg-wcGreen/15 text-wcGreen' :
              r === 0.5 ? 'bg-yellow-500/15 text-yellow-400' :
                          'bg-wcRed/15 text-wcRed'
            }`}>{r === 1 ? 'W' : r === 0.5 ? 'D' : 'L'}</span>
          ))}
        </div>
        <div className="text-2xs text-gray-600 mt-2">
          Point estimate (sample mean): <span className="text-white tabular-nums">{(mean(sample) * 100).toFixed(1)}%</span>
        </div>
      </div>

      <div className="bg-white/[0.03] rounded-md p-4">
        <div className="text-2xs text-gray-600 uppercase tracking-widest mb-3">95% bootstrap CI for true win rate</div>
        <div className="relative h-8">
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 bg-white/[0.06] rounded-full" />
          <motion.div
            initial={false}
            animate={{ left: `${widthPct(result.lo)}%`, width: `${widthPct(result.hi - result.lo)}%` }}
            transition={{ duration: 0.3 }}
            className="absolute top-1/2 -translate-y-1/2 h-1 bg-wcGreen rounded-full"
          />
          <motion.div
            initial={false}
            animate={{ left: `calc(${widthPct(result.mean)}% - 6px)` }}
            transition={{ duration: 0.3 }}
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full border-2 border-wcGreen"
          />
        </div>
        <div className="flex justify-between text-2xs text-gray-600 mt-2 tabular-nums">
          <span>0%</span><span>50%</span><span>100%</span>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-white/[0.06] text-center">
          <div>
            <div className="text-2xs text-gray-600">Lower 2.5%</div>
            <div className="text-sm font-bold text-wcRed tabular-nums">{(result.lo * 100).toFixed(1)}%</div>
          </div>
          <div>
            <div className="text-2xs text-gray-600">Bootstrap mean</div>
            <div className="text-sm font-bold text-white tabular-nums">{(result.mean * 100).toFixed(1)}%</div>
          </div>
          <div>
            <div className="text-2xs text-gray-600">Upper 97.5%</div>
            <div className="text-sm font-bold text-wcGreen tabular-nums">{(result.hi * 100).toFixed(1)}%</div>
          </div>
        </div>
      </div>

      <div className="text-2xs text-gray-700 leading-relaxed">
        Notice how the CI tightens when you switch to a longer sample. With only 3 games (Germany), the
        interval is huge — a single result swings the estimate dramatically. Small samples carry large uncertainty.
      </div>
    </div>
  );
}
