import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { matchProbabilities, bayesianUpdate } from '../utils/bayesian.js';

const SCENARIOS = [
  { homeTeam: 'Argentina', awayTeam: 'Chile', homeElo: 2091, awayElo: 1690 },
  { homeTeam: 'France', awayTeam: 'Saudi Arabia', homeElo: 2055, awayElo: 1620 },
  { homeTeam: 'Brazil', awayTeam: 'Australia', homeElo: 2040, awayElo: 1760 },
];

function ProbBar({ label, value, color, prevValue }) {
  return (
    <div className="mb-3">
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-gray-300 font-medium">{label}</span>
        <motion.span key={value} initial={{ scale: 1.3, color: '#FFD700' }} animate={{ scale: 1, color: '#ffffff' }} className="font-bold text-white">
          {(value * 100).toFixed(1)}%
        </motion.span>
      </div>
      <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
        <motion.div className={`h-full rounded-full ${color}`} animate={{ width: `${value * 100}%` }} transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }} />
      </div>
      {prevValue !== undefined && Math.abs(prevValue - value) > 0.001 && (
        <div className={`text-xs mt-0.5 ${value > prevValue ? 'text-green-400' : 'text-red-400'}`}>
          {value > prevValue ? '↑' : '↓'} {Math.abs((value - prevValue) * 100).toFixed(1)}%
        </div>
      )}
    </div>
  );
}

export default function BayesianExplainer() {
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const scenario = SCENARIOS[scenarioIdx];
  const initialProbs = matchProbabilities(scenario.homeElo, scenario.awayElo);
  const [history, setHistory] = useState([{ event: 'Kickoff (Prior)', probs: initialProbs, minute: 0 }]);
  const [minute, setMinute] = useState(1);
  const currentProbs = history[history.length - 1].probs;
  const prevProbs = history.length >= 2 ? history[history.length - 2].probs : undefined;
  const addGoal = (scoredBy) => {
    const newMinute = Math.min(minute + Math.floor(Math.random() * 15) + 5, 90);
    const newProbs = bayesianUpdate(currentProbs, scoredBy, newMinute);
    const scorer = scoredBy === 'home' ? scenario.homeTeam : scenario.awayTeam;
    setHistory([...history, { event: `⚽ Goal for ${scorer} (${newMinute}')`, probs: newProbs, minute: newMinute, scoredBy }]);
    setMinute(newMinute + 1);
  };
  const reset = () => {
    const initial = matchProbabilities(scenario.homeElo, scenario.awayElo);
    setHistory([{ event: 'Kickoff (Prior)', probs: initial, minute: 0 }]);
    setMinute(1);
  };
  const changeScenario = (idx) => {
    setScenarioIdx(idx);
    const s = SCENARIOS[idx];
    const initial = matchProbabilities(s.homeElo, s.awayElo);
    setHistory([{ event: 'Kickoff (Prior)', probs: initial, minute: 0 }]);
    setMinute(1);
  };
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {SCENARIOS.map((s, i) => (
          <button key={i} onClick={() => changeScenario(i)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${scenarioIdx === i ? 'bg-wcGreen/20 text-wcGreen border border-wcGreen/30' : 'bg-white/5 text-gray-400 hover:text-white border border-white/5'}`}>
            {s.homeTeam} vs {s.awayTeam}
          </button>
        ))}
      </div>
      <div className="bg-wcBlue/10 border border-wcBlue/20 rounded-xl p-4">
        <h4 className="text-sm font-bold text-wcBlue mb-2">What is Bayesian Probability?</h4>
        <p className="text-sm text-gray-300 leading-relaxed">We start with our <strong className="text-white">prior belief</strong> — our best guess before the match starts, based on team ratings. Then as events happen (goals, red cards), we <strong className="text-white">update our belief</strong> using Bayes' Theorem. A goal for the favorite doesn't change much; a goal for the underdog is huge news.</p>
      </div>
      <div className="glass-card rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold text-white">Current Win Probabilities</h4>
          <span className="text-xs text-gray-500">{history[history.length - 1].event}</span>
        </div>
        <ProbBar label={`${scenario.homeTeam} Win`} value={currentProbs.home} prevValue={prevProbs?.home} color="bg-wcGreen" />
        <ProbBar label="Draw" value={currentProbs.draw} prevValue={prevProbs?.draw} color="bg-yellow-500" />
        <ProbBar label={`${scenario.awayTeam} Win`} value={currentProbs.away} prevValue={prevProbs?.away} color="bg-wcRed" />
      </div>
      <div className="flex gap-3 flex-wrap">
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => addGoal('home')} disabled={minute > 90}
          className="flex-1 bg-wcGreen/20 border border-wcGreen/40 hover:bg-wcGreen/30 text-wcGreen font-bold py-3 px-4 rounded-xl transition-all disabled:opacity-40">
          ⚽ Goal for {scenario.homeTeam}
        </motion.button>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => addGoal('away')} disabled={minute > 90}
          className="flex-1 bg-wcRed/20 border border-wcRed/40 hover:bg-wcRed/30 text-wcRed font-bold py-3 px-4 rounded-xl transition-all disabled:opacity-40">
          ⚽ Goal for {scenario.awayTeam}
        </motion.button>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={reset}
          className="bg-white/5 hover:bg-white/10 text-gray-400 font-medium py-3 px-4 rounded-xl transition-all border border-white/10">Reset</motion.button>
      </div>
      <div className="glass-card rounded-xl p-4">
        <h4 className="text-sm font-semibold text-white mb-3">Match Events</h4>
        <div className="space-y-2 max-h-36 overflow-y-auto scrollbar-thin">
          {history.map((h, i) => (
            <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-white/5">
              <span className={i === history.length - 1 ? 'text-wcGold font-semibold' : 'text-gray-500'}>{h.event}</span>
              <span className="text-gray-600 font-mono">H:{(h.probs.home*100).toFixed(0)}% D:{(h.probs.draw*100).toFixed(0)}% A:{(h.probs.away*100).toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-gray-900/50 border border-white/5 rounded-xl p-5">
        <h4 className="text-sm font-bold text-white mb-3">The Math: Bayes' Theorem</h4>
        <div className="bg-black/40 rounded-lg p-3 mb-3 text-center">
          <span className="text-wcGold font-mono text-sm">P(Win | Goal Scored) = P(Goal | Win) × P(Win) / P(Goal)</span>
        </div>
        <div className="grid grid-cols-1 gap-2 text-xs">
          <div className="flex gap-2"><span className="text-wcGold font-mono w-32 flex-shrink-0">P(Goal | Win)</span><span className="text-gray-300">= 0.7 — If the team wins, 70% chance they scored</span></div>
          <div className="flex gap-2"><span className="text-wcGold font-mono w-32 flex-shrink-0">P(Goal | Draw)</span><span className="text-gray-300">= 0.4 — If it's a draw, both teams likely scored once</span></div>
          <div className="flex gap-2"><span className="text-wcGold font-mono w-32 flex-shrink-0">P(Goal | Loss)</span><span className="text-gray-300">= 0.2 — If they lose, less likely they scored</span></div>
          <div className="flex gap-2"><span className="text-wcGold font-mono w-32 flex-shrink-0">P(Win)</span><span className="text-gray-300">= Our prior belief from ELO ratings</span></div>
        </div>
        <p className="text-gray-500 text-xs mt-3">Early goals (before 45') have 20% more weight since they represent a larger portion of remaining match time.</p>
      </div>
    </div>
  );
}
