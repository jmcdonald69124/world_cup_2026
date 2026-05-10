import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { SCHEDULE } from '../data/schedule.js';
import { getTeamsByGroup, GROUPS } from '../data/teams.js';
import MatchCard from '../components/MatchCard.jsx';

function GroupMiniTable({ group }) {
  const teams = getTeamsByGroup(group);
  const matches = SCHEDULE.filter(m => m.group === group && m.status === 'FINISHED');
  const standings = teams.map((team) => {
    let w = 0, d = 0, l = 0, gf = 0, ga = 0;
    matches.forEach((m) => {
      const isHome = m.homeTeam.code === team.code;
      const isAway = m.awayTeam.code === team.code;
      if (!isHome && !isAway) return;
      const th = isHome ? m.score.home : m.score.away;
      const ta = isHome ? m.score.away : m.score.home;
      gf += th || 0; ga += ta || 0;
      if (th > ta) w++; else if (th === ta) d++; else l++;
    });
    return { ...team, w, d, l, gf, ga, pts: w * 3 + d };
  }).sort((a, b) => b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga));

  return (
    <div className="mb-4">
      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Group {group}</h4>
      <table className="w-full text-xs">
        <thead><tr className="text-gray-600"><th className="text-left pb-1">Team</th><th className="text-center pb-1">P</th><th className="text-center pb-1">W</th><th className="text-center pb-1">D</th><th className="text-center pb-1">L</th><th className="text-center pb-1 font-bold text-wcGold">Pts</th></tr></thead>
        <tbody>
          {standings.map((team, i) => (
            <tr key={team.id} className={`border-t border-white/5 ${i < 2 ? 'text-white' : 'text-gray-500'}`}>
              <td className="py-1 flex items-center gap-1.5"><span>{team.flagEmoji}</span><span className="truncate">{team.code}</span>{i < 2 && <span className="w-1 h-1 rounded-full bg-wcGreen" />}</td>
              <td className="text-center">{team.w + team.d + team.l}</td>
              <td className="text-center">{team.w}</td>
              <td className="text-center">{team.d}</td>
              <td className="text-center">{team.l}</td>
              <td className="text-center font-bold">{team.pts}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function MatchDashboard() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('date');

  const filteredMatches = useMemo(() => {
    let matches = [...SCHEDULE];
    if (activeFilter === 'Live') matches = matches.filter(m => m.status === 'LIVE');
    else if (activeFilter === 'Scheduled') matches = matches.filter(m => m.status === 'SCHEDULED');
    else if (activeFilter.startsWith('Group ')) { const g = activeFilter.split(' ')[1]; matches = matches.filter(m => m.group === g); }
    if (search.trim()) {
      const q = search.toLowerCase();
      matches = matches.filter(m => m.homeTeam.name.toLowerCase().includes(q) || m.awayTeam.name.toLowerCase().includes(q) || m.homeTeam.code.toLowerCase().includes(q) || m.awayTeam.code.toLowerCase().includes(q));
    }
    if (sortBy === 'date') matches.sort((a, b) => new Date(a.date) - new Date(b.date));
    else if (sortBy === 'group') matches.sort((a, b) => a.group.localeCompare(b.group));
    const live = matches.filter(m => m.status === 'LIVE');
    const rest = matches.filter(m => m.status !== 'LIVE');
    return [...live, ...rest];
  }, [activeFilter, search, sortBy]);

  const liveCount = SCHEDULE.filter(m => m.status === 'LIVE').length;

  return (
    <div className="min-h-screen pt-20 px-4 pb-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-black text-white mb-1">Matches</h1>
          <p className="text-gray-500 text-sm">
            {liveCount > 0 && <span className="text-red-400 font-semibold">{liveCount} live · </span>}
            {SCHEDULE.length} total matches
          </p>
        </div>
        <div className="flex gap-6">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap gap-2 mb-4">
              {['All', 'Live', 'Scheduled'].map((f) => (
                <button key={f} onClick={() => setActiveFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    activeFilter === f ? 'bg-wcGreen/20 text-wcGreen border border-wcGreen/30' : 'glass-card text-gray-400 hover:text-white border-transparent'
                  }`}>
                  {f === 'Live' && liveCount > 0 ? (<span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-red-500 rounded-full live-pulse" />{f} ({liveCount})</span>) : f}
                </button>
              ))}
            </div>
            <div className="flex gap-3 mb-5">
              <input type="text" placeholder="Search teams..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-wcGreen/50" />
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-400 focus:outline-none">
                <option value="date">Sort: Date</option>
                <option value="group">Sort: Group</option>
              </select>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-5">
              {GROUPS.map((g) => (
                <button key={g} onClick={() => setActiveFilter(activeFilter === `Group ${g}` ? 'All' : `Group ${g}`)}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                    activeFilter === `Group ${g}` ? 'bg-wcBlue text-white' : 'bg-white/5 text-gray-500 hover:text-white'
                  }`}>{g}</button>
              ))}
            </div>
            {filteredMatches.length === 0 ? (
              <div className="text-center py-16 text-gray-500"><p>No matches found</p></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredMatches.map((match, i) => (
                  <motion.div key={match.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                    <MatchCard match={match} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
          <div className="hidden lg:block w-64 flex-shrink-0 space-y-4">
            <div className="glass-card rounded-xl p-4">
              <h3 className="text-sm font-bold text-white mb-3">Group Standings</h3>
              <div className="space-y-1 max-h-96 overflow-y-auto scrollbar-thin">
                {['A', 'B', 'C', 'D'].map((g) => <GroupMiniTable key={g} group={g} />)}
              </div>
            </div>
            <div className="glass-card rounded-xl p-4">
              <h3 className="text-sm font-bold text-white mb-3">Tournament Stats</h3>
              <div className="space-y-2">
                {[
                  { label: 'Live Matches', value: liveCount, color: 'text-red-400' },
                  { label: 'Scheduled', value: SCHEDULE.filter(m => m.status === 'SCHEDULED').length, color: 'text-blue-400' },
                  { label: 'Groups', value: 12, color: 'text-wcGold' },
                  { label: 'Teams', value: 48, color: 'text-wcGreen' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex justify-between text-xs">
                    <span className="text-gray-500">{label}</span>
                    <span className={`font-bold ${color}`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
