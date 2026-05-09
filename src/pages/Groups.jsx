import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTeamsByGroup, GROUPS } from '../data/teams.js';
import { SCHEDULE } from '../data/schedule.js';

function buildStandings(group) {
  const teams = getTeamsByGroup(group);
  const matches = SCHEDULE.filter(m => m.group === group && m.status !== 'SCHEDULED');

  return teams.map((team) => {
    let w = 0, d = 0, l = 0, gf = 0, ga = 0;
    matches.forEach((m) => {
      const isHome = m.homeTeam.code === team.code;
      const isAway = m.awayTeam.code === team.code;
      if (!isHome && !isAway) return;
      const tf = isHome ? (m.score.home || 0) : (m.score.away || 0);
      const ta = isHome ? (m.score.away || 0) : (m.score.home || 0);
      gf += tf;
      ga += ta;
      if (tf > ta) w++;
      else if (tf === ta) d++;
      else l++;
    });
    return {
      ...team,
      p: w + d + l,
      w, d, l, gf, ga,
      gd: gf - ga,
      pts: w * 3 + d,
    };
  }).sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
}

function TeamRow({ team, position, onClick }) {
  const qualColor =
    position === 1 ? 'bg-wcGreen/10 border-l-2 border-wcGreen' :
    position === 2 ? 'bg-blue-500/10 border-l-2 border-blue-500' :
    position === 3 ? 'bg-orange-500/5 border-l-2 border-orange-500' :
    'border-l-2 border-transparent';

  const posLabel =
    position <= 2 ? 'Advance' :
    position === 3 ? 'Best 3rd?' : 'Eliminated';
  const posColor =
    position <= 2 ? 'text-wcGreen' :
    position === 3 ? 'text-orange-400' : 'text-gray-600';

  return (
    <motion.tr
      layout
      className={`border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors ${qualColor}`}
      onClick={() => onClick && onClick(team)}
    >
      <td className="py-2.5 pl-3">
        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-xs w-4">{position}</span>
          <span className="text-xl">{team.flagEmoji}</span>
          <div>
            <span className="text-sm text-white font-medium">{team.name}</span>
            <div className={`text-xs ${posColor} leading-none`}>{posLabel}</div>
          </div>
        </div>
      </td>
      <td className="text-center text-sm text-gray-400 py-2.5">{team.p}</td>
      <td className="text-center text-sm text-gray-300 py-2.5">{team.w}</td>
      <td className="text-center text-sm text-gray-400 py-2.5">{team.d}</td>
      <td className="text-center text-sm text-gray-400 py-2.5">{team.l}</td>
      <td className="text-center text-sm text-gray-400 py-2.5">{team.gf}</td>
      <td className="text-center text-sm text-gray-400 py-2.5">{team.ga}</td>
      <td className="text-center text-sm text-gray-400 py-2.5">
        <span className={team.gd > 0 ? 'text-wcGreen' : team.gd < 0 ? 'text-wcRed' : ''}>
          {team.gd > 0 ? '+' : ''}{team.gd}
        </span>
      </td>
      <td className="text-center text-sm font-bold text-white py-2.5 pr-3">{team.pts}</td>
    </motion.tr>
  );
}

function GroupCard({ group, defaultExpanded }) {
  const [expanded, setExpanded] = useState(defaultExpanded || false);
  const standings = buildStandings(group);
  const groupMatches = SCHEDULE.filter(m => m.group === group);
  const liveCount = groupMatches.filter(m => m.status === 'LIVE').length;

  return (
    <motion.div
      layout
      className="glass-card rounded-xl overflow-hidden"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl font-black gradient-text">Group {group}</span>
          <div className="flex gap-1">
            {standings.slice(0, 4).map((t) => (
              <span key={t.id} className="text-lg">{t.flagEmoji}</span>
            ))}
          </div>
          {liveCount > 0 && (
            <span className="flex items-center gap-1 text-xs text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full live-pulse" />
              {liveCount} LIVE
            </span>
          )}
        </div>
        <span className="text-gray-400 text-lg">{expanded ? '▲' : '▼'}</span>
      </button>

      <div className="px-5 pb-4">
        <table className="w-full">
          <thead>
            <tr className="text-xs text-gray-600 border-b border-white/5">
              <th className="text-left pb-2">Team</th>
              <th className="text-center pb-2">P</th>
              <th className="text-center pb-2">W</th>
              <th className="text-center pb-2">D</th>
              <th className="text-center pb-2">L</th>
              <th className="text-center pb-2">GF</th>
              <th className="text-center pb-2">GA</th>
              <th className="text-center pb-2">GD</th>
              <th className="text-center pb-2 text-wcGold">Pts</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((team, i) => (
              <TeamRow key={team.id} team={team} position={i + 1} />
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-white/5 px-5 py-4"
          >
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Matches</h4>
            <div className="space-y-2">
              {groupMatches.map((m) => {
                const isLive = m.status === 'LIVE';
                const isFinished = m.status === 'FINISHED';
                return (
                  <div key={m.id} className="flex items-center justify-between text-sm py-2 px-3 bg-white/3 rounded-lg">
                    <div className="flex items-center gap-2 flex-1">
                      <span>{m.homeTeam.flagEmoji}</span>
                      <span className="text-white font-medium">{m.homeTeam.code}</span>
                    </div>
                    <div className="text-center px-3">
                      {isLive ? (
                        <span className="text-white font-bold">{m.score.home}–{m.score.away}</span>
                      ) : isFinished ? (
                        <span className="text-gray-400 font-bold">{m.score.home}–{m.score.away}</span>
                      ) : (
                        <span className="text-gray-600">{m.date}</span>
                      )}
                      {isLive && (
                        <div className="text-xs text-red-400 live-pulse">{m.currentMinute}'</div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-1 justify-end">
                      <span className="text-white font-medium">{m.awayTeam.code}</span>
                      <span>{m.awayTeam.flagEmoji}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Groups() {
  const [showAll, setShowAll] = useState(false);
  const visibleGroups = showAll ? GROUPS : GROUPS.slice(0, 6);

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white mb-2">Group Stage</h1>
          <p className="text-gray-500">12 groups · 4 teams each · Top 2 qualify + best 8 third-placed teams</p>
        </div>

        <div className="flex flex-wrap gap-4 mb-6 text-xs">
          {[
            { color: 'bg-wcGreen', label: 'Advance to Round of 32 (Top 2)' },
            { color: 'bg-blue-500', label: 'Advancing' },
            { color: 'bg-orange-500', label: 'Potential Best 3rd' },
            { color: 'bg-gray-600', label: 'Eliminated' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-sm ${color}`} />
              <span className="text-gray-400">{label}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {visibleGroups.map((group, i) => (
            <motion.div
              key={group}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <GroupCard group={group} defaultExpanded={i === 0} />
            </motion.div>
          ))}
        </div>

        {!showAll && GROUPS.length > 6 && (
          <div className="text-center mt-6">
            <button
              onClick={() => setShowAll(true)}
              className="px-6 py-3 glass-card text-white font-medium rounded-xl hover:bg-white/10 transition-all border border-white/10"
            >
              Show All Groups ({GROUPS.length - 6} more)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
