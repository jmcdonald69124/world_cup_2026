import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { convertOdds } from '../utils/oddsConverter.js';
import { bookmakerMargin } from '../utils/bayesian.js';

export default function OddsExplainer({ homeTeam = 'Argentina', awayTeam = 'France', initialOdds }) {
  const defaults = initialOdds || { home: 2.50, draw: 3.20, away: 2.80 };
  const [homeOdds, setHomeOdds] = useState(defaults.home);
  const [drawOdds, setDrawOdds] = useState(defaults.draw);
  const [awayOdds, setAwayOdds] = useState(defaults.away);
  const [stake, setStake] = useState(100);
  const [selectedOutcome, setSelectedOutcome] = useState('home');

  const margin = bookmakerMargin(homeOdds, drawOdds, awayOdds);

  const outcomes = [
    { key: 'home', label: homeTeam, odds: homeOdds, setOdds: setHomeOdds, color: 'wcGreen' },
    { key: 'draw', label: 'Draw', odds: drawOdds, setOdds: setDrawOdds, color: 'yellow-500' },
    { key: 'away', label: awayTeam, odds: awayOdds, setOdds: setAwayOdds, color: 'wcRed' },
  ];

  const selectedOdds = selectedOutcome === 'home' ? homeOdds : selectedOutcome === 'draw' ? drawOdds : awayOdds;
  const profit = ((selectedOdds - 1) * stake).toFixed(2);
  const totalReturn = (selectedOdds * stake).toFixed(2);
  const impliedProb = ((1 / selectedOdds) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Outcome boxes */}
      <div className="grid grid-cols-3 gap-3">
        {outcomes.map((outcome) => {
          const implied = ((1 / outcome.odds) * 100).toFixed(1);
          const american = convertOdds.decimalToAmerican(outcome.odds);
          const fractional = convertOdds.decimalToFractional(outcome.odds);
          const isSelected = selectedOutcome === outcome.key;

          return (
            <motion.div
              key={outcome.key}
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedOutcome(outcome.key)}
              className={`glass-card rounded-xl p-4 cursor-pointer transition-all ${
                isSelected ? 'border-wcGold/40 bg-wcGold/5' : 'hover:border-white/20'
              }`}
            >
              <div className="text-xs font-semibold text-gray-400 mb-2 truncate">{outcome.label}</div>
              <div className="text-2xl font-black text-white mb-2">{outcome.odds.toFixed(2)}</div>
              <div className="space-y-0.5">
                <div className="text-xs text-gray-500">
                  <span className="text-gray-400">American:</span> {american}
                </div>
                <div className="text-xs text-gray-500">
                  <span className="text-gray-400">Fractional:</span> {fractional}
                </div>
                <div className="text-xs text-wcGold font-medium">{implied}% implied</div>
              </div>
              {/* Slider */}
              <input
                type="range"
                min="1.1"
                max="10"
                step="0.05"
                value={outcome.odds}
                onChange={(e) => outcome.setOdds(parseFloat(e.target.value))}
                onClick={(e) => e.stopPropagation()}
                className="w-full mt-3 accent-yellow-500 h-1 rounded"
              />
            </motion.div>
          );
        })}
      </div>

      {/* Probability bars - true vs implied */}
      <div className="glass-card rounded-xl p-4">
        <h4 className="text-sm font-semibold text-white mb-3">Implied Probabilities (must sum to &gt; 100% — that's the vig)</h4>
        <div className="space-y-2">
          {outcomes.map((outcome) => {
            const implied = parseFloat((1 / outcome.odds * 100).toFixed(1));
            return (
              <div key={outcome.key}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">{outcome.label}</span>
                  <span className="text-white font-medium">{implied}%</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-wcGold rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(implied, 100)}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-3 pt-3 border-t border-white/5 flex justify-between items-center">
          <span className="text-xs text-gray-500">Total implied probability:</span>
          <span className={`text-sm font-bold ${parseFloat(margin) > 0 ? 'text-wcRed' : 'text-wcGreen'}`}>
            {(100 + parseFloat(margin)).toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Bookmaker margin */}
      <div className="glass-card rounded-xl p-4 border border-wcRed/20 bg-wcRed/5">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-white">Bookmaker Margin (Vig)</h4>
            <p className="text-xs text-gray-400 mt-1">
              The extra percentage bookmakers charge. This is how they guarantee profit regardless of outcome.
            </p>
          </div>
          <div className="text-2xl font-black text-wcRed ml-4">{margin}%</div>
        </div>
      </div>

      {/* Bet calculator */}
      <div className="glass-card rounded-xl p-4">
        <h4 className="text-sm font-semibold text-white mb-3">Bet Calculator</h4>
        <div className="flex gap-3 mb-4">
          <div className="flex-1">
            <label className="text-xs text-gray-500 mb-1 block">Your Stake ($)</label>
            <input
              type="number"
              value={stake}
              onChange={(e) => setStake(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-wcGold/50"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-gray-500 mb-1 block">On outcome</label>
            <select
              value={selectedOutcome}
              onChange={(e) => setSelectedOutcome(e.target.value)}
              className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none"
            >
              <option value="home">{homeTeam}</option>
              <option value="draw">Draw</option>
              <option value="away">{awayTeam}</option>
            </select>
          </div>
        </div>
        <div className="bg-white/5 rounded-lg p-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Odds</span>
            <span className="text-white font-semibold">{selectedOdds.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Implied probability</span>
            <span className="text-white font-semibold">{impliedProb}%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Potential profit</span>
            <span className="text-wcGreen font-bold">+${profit}</span>
          </div>
          <div className="flex justify-between text-sm border-t border-white/10 pt-2">
            <span className="text-gray-400">Total return</span>
            <span className="text-white font-bold">${totalReturn}</span>
          </div>
        </div>
        <p className="text-xs text-gray-600 mt-2">
          If you bet ${stake} on {selectedOutcome === 'home' ? homeTeam : selectedOutcome === 'away' ? awayTeam : 'Draw'} at {selectedOdds.toFixed(2)} odds, you would win ${profit} profit (total return: ${totalReturn}).
        </p>
      </div>
    </div>
  );
}
