import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { matchProbabilities, applyMatchEvents } from '../utils/bayesian.js';

export default function MatchCard({ match, onClick }) {
  const navigate = useNavigate();

  const isLive      = match.status === 'LIVE';
  const isFinished  = match.status === 'FINISHED' || match.status === 'FT';
  const isScheduled = match.status === 'SCHEDULED';

  const probs = isLive && match.events?.length > 0
    ? applyMatchEvents(matchProbabilities(match.homeTeam.eloRating, match.awayTeam.eloRating), match.events)
    : matchProbabilities(match.homeTeam.eloRating, match.awayTeam.eloRating);

  const homeW = Math.round(probs.home * 100);
  const drawW = Math.round(probs.draw * 100);
  const awayW = Math.round(probs.away * 100);

  return (
    <motion.div
      whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
      transition={{ duration: 0.15 }}
      onClick={() => onClick ? onClick(match) : navigate(`/match/${match.id}`)}
      className="card rounded-xl p-4 cursor-pointer transition-colors relative overflow-hidden"
    >
      {isLive && <div className="absolute top-0 left-0 right-0 h-px bg-wcGreen" />}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-2xs font-semibold text-gray-600 uppercase tracking-wider">
          Group {match.group} · MD{match.matchday}
        </span>
        {isLive && (
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-wcGreen rounded-full live-pulse" />
            <span className="text-2xs font-bold text-wcGreen">{match.currentMinute}'</span>
          </div>
        )}
        {isFinished && (
          <span className="text-2xs font-semibold text-gray-600 bg-white/[0.05] px-2 py-0.5 rounded-full">FT</span>
        )}
        {isScheduled && (
          <span className="text-2xs text-gray-600">{match.time}</span>
        )}
      </div>

      {/* Teams + score */}
      <div className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <span className="text-xl flex-shrink-0">{match.homeTeam.flagEmoji}</span>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-white truncate leading-tight">{match.homeTeam.name}</div>
            <div className="text-2xs text-gray-600 font-mono">{match.homeTeam.code}</div>
          </div>
        </div>

        <div className="flex-shrink-0 text-center px-2">
          {isScheduled ? (
            <div className="text-xs text-gray-600 font-medium">vs</div>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className={`text-xl font-black tabular-nums ${isLive ? 'text-white' : 'text-gray-400'}`}>
                {match.score.home ?? 0}
              </span>
              <span className="text-gray-700 text-sm">–</span>
              <span className={`text-xl font-black tabular-nums ${isLive ? 'text-white' : 'text-gray-400'}`}>
                {match.score.away ?? 0}
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 flex items-center gap-2 justify-end min-w-0 flex-row-reverse">
          <span className="text-xl flex-shrink-0">{match.awayTeam.flagEmoji}</span>
          <div className="min-w-0 text-right">
            <div className="text-sm font-semibold text-white truncate leading-tight">{match.awayTeam.name}</div>
            <div className="text-2xs text-gray-600 font-mono">{match.awayTeam.code}</div>
          </div>
        </div>
      </div>

      <div className="mt-2 text-2xs text-gray-700 text-center truncate">
        {match.stadium.name}, {match.stadium.city}
      </div>

      {/* Probability bar */}
      <div className="mt-4 pt-3 border-t border-white/[0.06]">
        <div className="flex justify-between text-2xs text-gray-600 mb-1.5">
          <span className={isLive ? 'text-wcGreen font-medium' : ''}>{homeW}%</span>
          <span>Draw · {drawW}%</span>
          <span>{awayW}%</span>
        </div>
        <div className="flex h-0.5 rounded-full overflow-hidden bg-white/[0.06]">
          <div className="bg-wcGreen probability-bar" style={{ width: `${homeW}%` }} />
          <div className="bg-gray-600 probability-bar" style={{ width: `${drawW}%` }} />
          <div className="bg-wcRed probability-bar" style={{ width: `${awayW}%` }} />
        </div>
      </div>

      {isLive && match.events?.filter(e => e.type === 'goal').length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {match.events.filter(e => e.type === 'goal').map((e, i) => (
            <span key={i} className="text-2xs bg-white/[0.04] rounded px-1.5 py-0.5 text-gray-500">
              {e.player} {e.minute}'
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}
