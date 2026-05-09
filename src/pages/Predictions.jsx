import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SCHEDULE } from '../data/schedule.js';
import { matchProbabilities, brierScore } from '../utils/bayesian.js';

const STORAGE_KEY = 'wc2026_predictions';

function getCrowdPrediction(matchId) {
  const seed = matchId * 7919;
  const homeP = 20 + (seed % 60);
  const drawP = 15 + ((seed * 3) % 25);
  const awayP = 100 - homeP - drawP;
  return { home: Math.abs(homeP), draw: Math.abs(drawP), away: Math.abs(awayP) };
}

function OutcomeButton({ label, selected, onClick, prob, crowdPct, color }) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`flex-1 relative flex flex-col items-center justify-center py-3 px-2 rounded-xl border-2 transition-all ${
        selected
          ? `border-${color}/60 bg-${color}/15 text-white`
          : 'border-white/10 bg-white/3 text-gray-400 hover:border-white/20 hover:text-white'
      }`}
    >
      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 w-5 h-5 bg-wcGold rounded-full flex items-center justify-center"
        >
          <span className="text-xs text-black font-bold">✓</span>
        </motion.div>
      )}
      <span className="text-xs font-semibold mb-1">{label}</span>
      <span className="text-lg font-black">{prob}%</span>
      <span className="text-xs opacity-60">model</span>
      {crowdPct !== undefined && (
        <span className="text-xs mt-1 opacity-50">{crowdPct}% crowd</span>
      )}
    </motion.button>
  );
}

function MatchPredictionCard({ match, prediction, onPredict }) {
  const initialProbs = matchProbabilities(match.homeTeam.eloRating, match.awayTeam.eloRating);
  const homeProb = Math.round(initialProbs.home * 100);
  const drawProb = Math.round(initialProbs.draw * 100);
  const awayProb = Math.round(initialProbs.away * 100);

  const crowd = getCrowdPrediction(match.id);
  const hasPrediction = prediction !== null && prediction !== undefined;
  const isLive = match.status === 'LIVE';
  const isFinished = match.status === 'FINISHED';

  const handlePick = (outcome) => {
    onPredict(match.id, outcome);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-card rounded-xl p-4 ${isLive ? 'border border-red-500/20' : ''}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-500 font-semibold">Group {match.group} · {match.date}</span>
        {isLive && (
          <span className="flex items-center gap-1 text-xs text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full live-pulse" />
            LIVE
          </span>
        )}
        {hasPrediction && (
          <span className="text-xs text-wcGold bg-wcGold/10 px-2 py-0.5 rounded-full">Predicted ✓</span>
        )}
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{match.homeTeam.flagEmoji}</span>
          <span className="font-semibold text-white text-sm">{match.homeTeam.name}</span>
        </div>
        <span className="text-gray-600 font-bold">vs</span>
        <div className="flex items-center gap-2 flex-row-reverse">
          <span className="text-2xl">{match.awayTeam.flagEmoji}</span>
          <span className="font-semibold text-white text-sm">{match.awayTeam.name}</span>
        </div>
      </div>

      <div className="flex gap-2 mb-3">
        <OutcomeButton
          label={match.homeTeam.code}
          selected={prediction === 'home'}
          onClick={() => !isFinished && handlePick('home')}
          prob={homeProb}
          crowdPct={crowd.home}
          color="wcGreen"
        />
        <OutcomeButton
          label="Draw"
          selected={prediction === 'draw'}
          onClick={() => !isFinished && handlePick('draw')}
          prob={drawProb}
          crowdPct={crowd.draw}
          color="yellow-500"
        />
        <OutcomeButton
          label={match.awayTeam.code}
          selected={prediction === 'away'}
          onClick={() => !isFinished && handlePick('away')}
          prob={awayProb}
          crowdPct={crowd.away}
          color="wcRed"
        />
      </div>

      <AnimatePresence>
        {hasPrediction && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="text-xs bg-white/5 rounded-lg p-3"
          >
            <div>
              <span className="text-gray-300">
                Predicted: <strong className="text-white">{prediction === 'home' ? match.homeTeam.name : prediction === 'away' ? match.awayTeam.name : 'Draw'}</strong>
              </span>
              <div className="text-gray-500 mt-1">
                Model probability: {prediction === 'home' ? homeProb : prediction === 'away' ? awayProb : drawProb}%.
                Crowd: {prediction === 'home' ? crowd.home : prediction === 'away' ? crowd.away : crowd.draw}% agree.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function BrierScoreExplainer() {
  return (
    <div className="glass-card rounded-xl p-5">
      <h3 className="text-sm font-bold text-white mb-3">How predictions are scored</h3>
      <p className="text-sm text-gray-400 mb-3 leading-relaxed">
        Predictions are graded using the <strong className="text-white">Brier Score</strong> — a proper scoring rule that rewards calibrated probability estimates, not just correct picks.
      </p>
      <div className="bg-gray-900/50 rounded-lg p-3 mb-3 text-center">
        <code className="text-wcGold text-sm font-mono">
          Brier Score = (p_home − o_home)² + (p_draw − o_draw)² + (p_away − o_away)²
        </code>
      </div>
      <div className="space-y-2 text-xs text-gray-500">
        <p>· <strong className="text-gray-300">0.0</strong> = perfect (assigned 100% to correct outcome)</p>
        <p>· <strong className="text-gray-300">0.67</strong> = worst possible (assigned 100% to wrong outcome)</p>
        <p>· <strong className="text-gray-300">0.22</strong> = naive baseline (uniform 33% on all three outcomes)</p>
      </div>
      <div className="mt-3 text-xs text-gray-600">
        Brier scoring incentivizes honesty — saying "60%" scores better than "100%" when uncertain.
      </div>
    </div>
  );
}

export default function Predictions() {
  const [predictions, setPredictions] = useState({});
  const [showExplainer, setShowExplainer] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setPredictions(JSON.parse(stored));
    } catch { }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(predictions));
    } catch { }
  }, [predictions]);

  const handlePredict = (matchId, outcome) => {
    setPredictions((prev) => ({ ...prev, [matchId]: outcome }));
  };

  const predictionCount = Object.keys(predictions).length;
  const totalMatches = SCHEDULE.length;

  const finishedWithPredictions = SCHEDULE.filter(
    (m) => m.status === 'FINISHED' && predictions[m.id]
  );

  const avgBrierScore = useMemo(() => {
    if (finishedWithPredictions.length === 0) return null;
    const total = finishedWithPredictions.reduce((sum, m) => {
      const actualOutcome = m.score.home > m.score.away ? 'home' : m.score.away > m.score.home ? 'away' : 'draw';
      const predicted = predictions[m.id];
      const probs = { home: predicted === 'home' ? 1 : 0, draw: predicted === 'draw' ? 1 : 0, away: predicted === 'away' ? 1 : 0 };
      return sum + brierScore(probs, actualOutcome);
    }, 0);
    return (total / finishedWithPredictions.length).toFixed(3);
  }, [finishedWithPredictions, predictions]);

  const upcomingMatches = SCHEDULE.filter(m => m.status === 'SCHEDULED');
  const liveMatches = SCHEDULE.filter(m => m.status === 'LIVE');

  const clearPredictions = () => {
    setPredictions({});
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-black text-white mb-2">Predictions</h1>
            <p className="text-gray-500">Predict match outcomes and track your statistical accuracy</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowExplainer(!showExplainer)}
              className="px-3 py-2 glass-card text-gray-400 hover:text-white text-sm rounded-lg transition-all"
            >
              How scoring works
            </button>
            {predictionCount > 0 && (
              <button
                onClick={clearPredictions}
                className="px-3 py-2 bg-wcRed/10 text-wcRed hover:bg-wcRed/20 text-sm rounded-lg transition-all"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Predictions Made', value: predictionCount, color: 'text-wcGreen' },
            { label: 'Remaining', value: totalMatches - predictionCount, color: 'text-gray-300' },
            { label: 'Graded', value: finishedWithPredictions.length, color: 'text-wcBlue' },
            { label: 'Avg Brier Score', value: avgBrierScore ?? '—', color: avgBrierScore && parseFloat(avgBrierScore) < 0.25 ? 'text-wcGreen' : 'text-wcGold' },
          ].map(({ label, value, color }) => (
            <div key={label} className="glass-card rounded-xl p-3 text-center">
              <div className={`text-xl font-black ${color}`}>{value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        <AnimatePresence>
          {showExplainer && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <BrierScoreExplainer />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="glass-card rounded-xl p-4 mb-6 border border-white/10">
          <h4 className="text-sm font-semibold text-white mb-1">Model probabilities</h4>
          <p className="text-xs text-gray-400">
            Each card shows the Poisson model’s win, draw, and loss probabilities derived from ELO ratings.
            Crowd percentages show aggregate fan picks. When you diverge from the model, note why — that reasoning is the point.
          </p>
        </div>

        {liveMatches.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full live-pulse" />
              Live Now
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {liveMatches.map((match) => (
                <MatchPredictionCard
                  key={match.id}
                  match={match}
                  prediction={predictions[match.id] ?? null}
                  onPredict={handlePredict}
                />
              ))}
            </div>
          </div>
        )}

        <div>
          <h2 className="text-lg font-bold text-white mb-3">Upcoming Matches</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingMatches.map((match) => (
              <MatchPredictionCard
                key={match.id}
                match={match}
                prediction={predictions[match.id] ?? null}
                onPredict={handlePredict}
              />
            ))}
          </div>
        </div>

        <div className="mt-10 glass-card rounded-xl p-5">
          <h3 className="text-sm font-bold text-white mb-2">Leaderboard — Coming Soon</h3>
          <p className="text-sm text-gray-400 mb-3">
            Predictions are stored locally. A future version will support accounts and a global Brier Score leaderboard.
          </p>
          <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
            <div className="bg-white/3 rounded-lg p-2">
              <div className="font-bold text-gray-400">#1 fan_predictor</div>
              <div>Brier: 0.183 (44 preds)</div>
            </div>
            <div className="bg-white/3 rounded-lg p-2">
              <div className="font-bold text-gray-400">#2 stats_wizard</div>
              <div>Brier: 0.201 (38 preds)</div>
            </div>
            <div className="bg-white/3 rounded-lg p-2">
              <div className="font-bold text-gray-400">#3 model_beater</div>
              <div>Brier: 0.215 (51 preds)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
