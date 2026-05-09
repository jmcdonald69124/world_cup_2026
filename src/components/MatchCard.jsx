import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { matchProbabilities, applyMatchEvents } from '../utils/bayesian.js';

export default function MatchCard({ match, onClick }) {
  const navigate = useNavigate();
  const handleClick = () => { if (onClick) onClick(match); else navigate(`/match/${match.id}`); };
  const isLive = match.status === 'LIVE';
  const isFinished = match.status === 'FINISHED' || match.status === 'FT';
  const isScheduled = match.status === 'SCHEDULED';
  const initialProbs = matchProbabilities(match.homeTeam.eloRating, match.awayTeam.eloRating);
  const currentProbs = isLive && match.events?.length > 0 ? applyMatchEvents(initialProbs, match.events) : initialProbs;
  const homeW = Math.round(currentProbs.home * 100);
  const drawW = Math.round(currentProbs.draw * 100);
  const awayW = Math.round(currentProbs.away * 100);
  return (
    <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onClick={handleClick}
      className="glass-card rounded-xl p-4 cursor-pointer hover:border-white/20 transition-all duration-200 relative overflow-hidden">
      {isLive && <div className="absolute inset-0 bg-green-500/5 pointer-events-none" />}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Group {match.group} · MD{match.matchday}</span>
        {isLive && (<div className="flex items-center gap-1.5 bg-red-500/15 px-2.5 py-1 rounded-full"><span className="w-1.5 h-1.5 bg-red-500 rounded-full live-pulse" /><span className="text-xs font-bold text-red-400">{match.currentMinute}'</span></div>)}
        {isFinished && <span className="text-xs font-semibold text-gray-500 bg-gray-800 px-2.5 py-1 rounded-full">FT</span>}
        {isScheduled && <span className="text-xs text-gray-500">{match.time} {match.timezone}</span>}
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{match.homeTeam.flagEmoji}</span>
            <div><div className="font-semibold text-sm text-white leading-tight">{match.homeTeam.name}</div><div className="text-xs text-gray-500">{match.homeTeam.code}</div></div>
          </div>
        </div>
        <div className="text-center flex-shrink-0 px-3">
          {isScheduled ? (
            <div><span className="text-gray-500 font-bold text-lg">vs</span><div className="text-xs text-gray-600 mt-0.5">{match.date}</div></div>
          ) : (
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-black ${isLive ? 'text-white' : 'text-gray-300'}`}>{match.score.home ?? 0}</span>
              <span className="text-gray-600 font-light">-</span>
              <span className={`text-2xl font-black ${isLive ? 'text-white' : 'text-gray-300'}`}>{match.score.away ?? 0}</span>
            </div>
          )}
        </div>
        <div className="flex-1 flex justify-end">
          <div className="flex items-center gap-2 flex-row-reverse">
            <span className="text-2xl">{match.awayTeam.flagEmoji}</span>
            <div className="text-right"><div className="font-semibold text-sm text-white leading-tight">{match.awayTeam.name}</div><div className="text-xs text-gray-500">{match.awayTeam.code}</div></div>
          </div>
        </div>
      </div>
      <div className="mt-2 text-xs text-gray-600 text-center">{match.stadium.name}, {match.stadium.city}</div>
      {(isLive || isFinished) && (
        <div className="mt-3 pt-3 border-t border-white/5">
          <div className="flex text-xs text-gray-500 justify-between mb-1">
            <span className="font-medium text-wcGreen">{homeW}%</span><span>Draw {drawW}%</span><span className="font-medium text-wcRed">{awayW}%</span>
          </div>
          <div className="flex h-1.5 rounded-full overflow-hidden bg-gray-800">
            <div className="bg-wcGreen probability-bar" style={{ width: `${homeW}%` }} />
            <div className="bg-gray-600 probability-bar" style={{ width: `${drawW}%` }} />
            <div className="bg-wcRed probability-bar" style={{ width: `${awayW}%` }} />
          </div>
        </div>
      )}
      {isScheduled && (
        <div className="mt-3 pt-3 border-t border-white/5">
          <div className="flex text-xs text-gray-600 justify-between mb-1">
            <span>{homeW}%</span><span>Draw {drawW}%</span><span>{awayW}%</span>
          </div>
          <div className="flex h-1 rounded-full overflow-hidden bg-gray-800">
            <div className="bg-wcGreen/50 probability-bar" style={{ width: `${homeW}%` }} />
            <div className="bg-gray-600/50 probability-bar" style={{ width: `${drawW}%` }} />
            <div className="bg-wcRed/50 probability-bar" style={{ width: `${awayW}%` }} />
          </div>
        </div>
      )}
      {isLive && match.events?.filter(e => e.type === 'goal').length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {match.events.filter(e => e.type === 'goal').map((e, i) => (
            <span key={i} className="text-xs bg-white/5 rounded px-1.5 py-0.5 text-gray-400">⚽ {e.player} {e.minute}'</span>
          ))}
        </div>
      )}
    </motion.div>
  );
}
