import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getMatchById } from '../data/schedule.js';
import { getTeamByCode } from '../data/teams.js';
import { matchProbabilities, applyMatchEvents } from '../utils/bayesian.js';
import WinProbabilityGauge from '../components/charts/WinProbabilityGauge.jsx';
import ProbabilityHistory from '../components/charts/ProbabilityHistory.jsx';
import MatchTimeline from '../components/charts/MatchTimeline.jsx';
import TeamRadar from '../components/charts/TeamRadar.jsx';
import WeatherWidget from '../components/WeatherWidget.jsx';

function getTeamStats(team) {
  if (!team) return {};
  const elo = team.eloRating || 1700;
  const base = (elo - 1400) / 700;
  return {
    attack: Math.min(95, Math.round(50 + base * 45 + (Math.random() * 10 - 5))),
    defense: Math.min(95, Math.round(48 + base * 42 + (Math.random() * 10 - 5))),
    possession: Math.min(90, Math.round(45 + base * 40 + (Math.random() * 10 - 5))),
    pace: Math.min(90, Math.round(55 + base * 30 + (Math.random() * 15 - 7))),
    setpieces: Math.min(85, Math.round(45 + base * 35 + (Math.random() * 10 - 5))),
    experience: Math.min(95, Math.round(40 + base * 50 + (Math.random() * 10 - 5))),
  };
}

function StatBar({ label, homeVal, awayVal }) {
  const total = homeVal + awayVal;
  const homePct = total > 0 ? Math.round((homeVal / total) * 100) : 50;
  const awayPct = 100 - homePct;

  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs text-gray-400 mb-1">
        <span className="font-semibold text-white">{homeVal}</span>
        <span className="text-gray-500">{label}</span>
        <span className="font-semibold text-white">{awayVal}</span>
      </div>
      <div className="flex h-1.5 rounded-full overflow-hidden bg-gray-800">
        <div className="bg-wcGreen stat-bar-fill" style={{ width: `${homePct}%` }} />
        <div className="bg-wcRed stat-bar-fill" style={{ width: `${awayPct}%` }} />
      </div>
    </div>
  );
}

function generateLiveStats(match) {
  const homeAdv = match.score.home > match.score.away ? 1.2 : match.score.home < match.score.away ? 0.8 : 1.0;
  return {
    possession: { home: Math.round(45 + homeAdv * 8), away: Math.round(55 - homeAdv * 8) },
    shots: { home: Math.round(7 + homeAdv * 4), away: Math.round(6 - homeAdv * 2) },
    shotsOnTarget: { home: Math.round(3 + homeAdv * 2), away: Math.round(2 + homeAdv) },
    corners: { home: Math.round(4 + homeAdv * 2), away: Math.round(3 + homeAdv) },
    fouls: { home: Math.round(8 - homeAdv), away: Math.round(10 + homeAdv) },
    passes: { home: Math.round(200 + homeAdv * 80), away: Math.round(180 + homeAdv * 40) },
    passAccuracy: { home: Math.round(80 + homeAdv * 5), away: Math.round(75 + homeAdv * 3) },
  };
}

function generateLineup(teamName) {
  return [
    { number: 1, name: `${teamName} GK`, position: 'GK' },
    { number: 2, name: `${teamName} RB`, position: 'RB' },
    { number: 5, name: `${teamName} CB`, position: 'CB' },
    { number: 6, name: `${teamName} CB`, position: 'CB' },
    { number: 3, name: `${teamName} LB`, position: 'LB' },
    { number: 8, name: `${teamName} CM`, position: 'CM' },
    { number: 4, name: `${teamName} CM`, position: 'CM' },
    { number: 10, name: `${teamName} AM`, position: 'AM' },
    { number: 7, name: `${teamName} RW`, position: 'RW' },
    { number: 11, name: `${teamName} LW`, position: 'LW' },
    { number: 9, name: `${teamName} ST`, position: 'ST' },
  ];
}

const H2H_RESULTS = [
  { year: 2022, competition: 'World Cup', home: null, away: null, homeScore: 2, awayScore: 1 },
  { year: 2019, competition: 'Friendly', home: null, away: null, homeScore: 0, awayScore: 0 },
  { year: 2018, competition: 'World Cup', home: null, away: null, homeScore: 1, awayScore: 2 },
  { year: 2016, competition: 'Friendly', home: null, away: null, homeScore: 3, awayScore: 1 },
  { year: 2014, competition: 'World Cup', home: null, away: null, homeScore: 1, awayScore: 1 },
];

export default function MatchDetail() {
  const { id } = useParams();
  const match = getMatchById(id);

  if (!match) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">⚽</div>
          <h2 className="text-xl font-bold text-white mb-2">Match not found</h2>
          <Link to="/matches" className="text-wcGreen hover:underline">← Back to matches</Link>
        </div>
      </div>
    );
  }

  const homeTeamFull = getTeamByCode(match.homeTeam.code);
  const awayTeamFull = getTeamByCode(match.awayTeam.code);

  const initialProbs = matchProbabilities(match.homeTeam.eloRating, match.awayTeam.eloRating);
  const currentProbs = match.events?.length > 0
    ? applyMatchEvents(initialProbs, match.events)
    : initialProbs;

  const isLive = match.status === 'LIVE';
  const isScheduled = match.status === 'SCHEDULED';

  const liveStats = !isScheduled ? generateLiveStats(match) : null;
  const homeLineup = generateLineup(match.homeTeam.code);
  const awayLineup = generateLineup(match.awayTeam.code);

  const homeStats = getTeamStats(homeTeamFull);
  const awayStats = getTeamStats(awayTeamFull);

  const h2h = H2H_RESULTS.map((r, i) => ({
    ...r,
    home: i % 2 === 0 ? match.homeTeam.name : match.awayTeam.name,
    away: i % 2 === 0 ? match.awayTeam.name : match.homeTeam.name,
  }));

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-5xl mx-auto">
        <Link to="/matches" className="inline-flex items-center gap-1 text-gray-500 hover:text-white text-sm mb-6 transition-colors">
          ← Back to Matches
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-6 mb-6 relative overflow-hidden"
        >
          {isLive && <div className="absolute inset-0 bg-green-500/3 pointer-events-none" />}

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-500 uppercase">Group {match.group} · MD{match.matchday}</span>
            </div>
            {isLive && (
              <div className="flex items-center gap-2 bg-red-500/15 px-3 py-1.5 rounded-full">
                <span className="w-2 h-2 bg-red-500 rounded-full live-pulse" />
                <span className="text-sm font-bold text-red-400">{match.currentMinute}'</span>
              </div>
            )}
            {isScheduled && (
              <span className="text-sm text-gray-400">{match.date} · {match.time} {match.timezone}</span>
            )}
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 text-center">
              <div className="text-5xl mb-2">{match.homeTeam.flagEmoji}</div>
              <h2 className="font-bold text-white text-lg">{match.homeTeam.name}</h2>
              <div className="text-xs text-gray-500">ELO: {match.homeTeam.eloRating}</div>
              {homeTeamFull && (
                <div className="text-xs text-gray-600 mt-1">Coach: {homeTeamFull.coachName}</div>
              )}
            </div>

            <div className="text-center flex-shrink-0 px-6">
              {isScheduled ? (
                <div>
                  <div className="text-4xl font-black text-gray-600 mb-1">vs</div>
                  <div className="text-sm text-gray-500">{match.time} {match.timezone}</div>
                </div>
              ) : (
                <div>
                  <div className="text-5xl font-black text-white tabular-nums">
                    {match.score.home} – {match.score.away}
                  </div>
                  {isLive && (
                    <div className="text-xs text-wcGreen font-semibold mt-1">LIVE · {match.currentMinute}'</div>
                  )}
                </div>
              )}
            </div>

            <div className="flex-1 text-center">
              <div className="text-5xl mb-2">{match.awayTeam.flagEmoji}</div>
              <h2 className="font-bold text-white text-lg">{match.awayTeam.name}</h2>
              <div className="text-xs text-gray-500">ELO: {match.awayTeam.eloRating}</div>
              {awayTeamFull && (
                <div className="text-xs text-gray-600 mt-1">Coach: {awayTeamFull.coachName}</div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/5 text-center text-xs text-gray-500">
            📍 {match.stadium.name}, {match.stadium.city}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card rounded-xl p-5">
              <h3 className="text-sm font-bold text-white mb-4">Win Probability</h3>
              <WinProbabilityGauge
                homeProb={currentProbs.home}
                drawProb={currentProbs.draw}
                awayProb={currentProbs.away}
                homeTeam={match.homeTeam.name}
                awayTeam={match.awayTeam.name}
              />
              <div className="grid grid-cols-3 gap-2 mt-3">
                <div className="text-center py-2 bg-wcGreen/10 rounded-lg">
                  <div className="text-lg font-black text-wcGreen">{Math.round(currentProbs.home * 100)}%</div>
                  <div className="text-xs text-gray-500">{match.homeTeam.code} Win</div>
                </div>
                <div className="text-center py-2 bg-gray-800 rounded-lg">
                  <div className="text-lg font-black text-gray-300">{Math.round(currentProbs.draw * 100)}%</div>
                  <div className="text-xs text-gray-500">Draw</div>
                </div>
                <div className="text-center py-2 bg-wcRed/10 rounded-lg">
                  <div className="text-lg font-black text-wcRed">{Math.round(currentProbs.away * 100)}%</div>
                  <div className="text-xs text-gray-500">{match.awayTeam.code} Win</div>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-xl p-5">
              <h3 className="text-sm font-bold text-white mb-4">Probability History</h3>
              <ProbabilityHistory
                events={match.events || []}
                initialProbs={initialProbs}
                homeTeam={match.homeTeam.name}
                awayTeam={match.awayTeam.name}
                currentMinute={match.currentMinute || 0}
              />
            </div>

            {!isScheduled && (
              <div className="glass-card rounded-xl p-5">
                <h3 className="text-sm font-bold text-white mb-4">Match Timeline</h3>
                <MatchTimeline
                  events={match.events || []}
                  currentMinute={match.currentMinute || 0}
                  homeTeam={match.homeTeam.name}
                  awayTeam={match.awayTeam.name}
                />
              </div>
            )}

            {liveStats && (
              <div className="glass-card rounded-xl p-5">
                <h3 className="text-sm font-bold text-white mb-4">Match Statistics</h3>
                <div className="flex justify-between text-xs font-bold text-gray-400 mb-3">
                  <span className="text-wcGreen">{match.homeTeam.name}</span>
                  <span className="text-wcRed">{match.awayTeam.name}</span>
                </div>
                <StatBar label="Possession %" homeVal={liveStats.possession.home} awayVal={liveStats.possession.away} />
                <StatBar label="Shots" homeVal={liveStats.shots.home} awayVal={liveStats.shots.away} />
                <StatBar label="Shots on Target" homeVal={liveStats.shotsOnTarget.home} awayVal={liveStats.shotsOnTarget.away} />
                <StatBar label="Corners" homeVal={liveStats.corners.home} awayVal={liveStats.corners.away} />
                <StatBar label="Fouls" homeVal={liveStats.fouls.home} awayVal={liveStats.fouls.away} />
                <StatBar label="Passes" homeVal={liveStats.passes.home} awayVal={liveStats.passes.away} />
                <StatBar label="Pass Accuracy %" homeVal={liveStats.passAccuracy.home} awayVal={liveStats.passAccuracy.away} />
              </div>
            )}

            <div className="glass-card rounded-xl p-5">
              <h3 className="text-sm font-bold text-white mb-4">Team Comparison</h3>
              <TeamRadar
                teamA={homeTeamFull}
                teamB={awayTeamFull}
                statsA={homeStats}
                statsB={awayStats}
              />
            </div>

            <div className="glass-card rounded-xl p-5">
              <h3 className="text-sm font-bold text-white mb-4">Lineups</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xs font-semibold text-wcGreen mb-3">{match.homeTeam.name}</h4>
                  <div className="space-y-1.5">
                    {homeLineup.map((p) => (
                      <div key={p.number} className="flex items-center gap-2 text-xs">
                        <span className="w-5 text-center text-gray-600 font-mono">{p.number}</span>
                        <span className="bg-wcGreen/10 text-wcGreen px-1 rounded text-xs font-bold">{p.position}</span>
                        <span className="text-gray-300">{p.name}</span>
                      </div>
                    ))}
                  </div>
                  {homeTeamFull && (
                    <div className="mt-3 text-xs text-gray-500">
                      Key Players: {homeTeamFull.keyPlayers.join(', ')}
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-wcRed mb-3">{match.awayTeam.name}</h4>
                  <div className="space-y-1.5">
                    {awayLineup.map((p) => (
                      <div key={p.number} className="flex items-center gap-2 text-xs">
                        <span className="w-5 text-center text-gray-600 font-mono">{p.number}</span>
                        <span className="bg-wcRed/10 text-wcRed px-1 rounded text-xs font-bold">{p.position}</span>
                        <span className="text-gray-300">{p.name}</span>
                      </div>
                    ))}
                  </div>
                  {awayTeamFull && (
                    <div className="mt-3 text-xs text-gray-500">
                      Key Players: {awayTeamFull.keyPlayers.join(', ')}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="glass-card rounded-xl p-5">
              <h3 className="text-sm font-bold text-white mb-4">Head to Head (Last 5)</h3>
              <div className="space-y-2">
                {h2h.map((r, i) => {
                  const homeWon = r.homeScore > r.awayScore;
                  const draw = r.homeScore === r.awayScore;
                  return (
                    <div key={i} className="flex items-center justify-between text-xs py-2 border-b border-white/5">
                      <span className="text-gray-500 w-12">{r.year}</span>
                      <span className="text-gray-400">{r.competition}</span>
                      <div className="flex items-center gap-2">
                        <span className={homeWon ? 'text-white font-bold' : 'text-gray-600'}>{r.home}</span>
                        <span className={`px-2 py-0.5 rounded font-bold ${draw ? 'bg-gray-700 text-gray-300' : homeWon ? 'bg-wcGreen/20 text-wcGreen' : 'bg-wcRed/20 text-wcRed'}`}>
                          {r.homeScore}–{r.awayScore}
                        </span>
                        <span className={!homeWon && !draw ? 'text-white font-bold' : 'text-gray-600'}>{r.away}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          <div className="space-y-4">
            <WeatherWidget stadium={match.stadium} date={match.date} />

            <div className="glass-card rounded-xl p-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">ELO Ratings</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white">{match.homeTeam.name}</span>
                    <span className="text-wcGold font-bold">{match.homeTeam.eloRating}</span>
                  </div>
                  <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-wcGreen rounded-full"
                      style={{ width: `${((match.homeTeam.eloRating - 1400) / 700) * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white">{match.awayTeam.name}</span>
                    <span className="text-wcGold font-bold">{match.awayTeam.eloRating}</span>
                  </div>
                  <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-wcRed rounded-full"
                      style={{ width: `${((match.awayTeam.eloRating - 1400) / 700) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {homeTeamFull && awayTeamFull && (
              <div className="glass-card rounded-xl p-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Key Players</h4>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-wcGreen font-semibold mb-1">{match.homeTeam.name}</div>
                    {homeTeamFull.keyPlayers.map((p) => (
                      <div key={p} className="text-xs text-gray-300 py-0.5">⭐ {p}</div>
                    ))}
                  </div>
                  <div className="border-t border-white/5 pt-3">
                    <div className="text-xs text-wcRed font-semibold mb-1">{match.awayTeam.name}</div>
                    {awayTeamFull.keyPlayers.map((p) => (
                      <div key={p} className="text-xs text-gray-300 py-0.5">⭐ {p}</div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {match.events?.filter(e => e.type === 'goal').length > 0 && (
              <div className="glass-card rounded-xl p-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Goals</h4>
                <div className="space-y-2">
                  {match.events.filter(e => e.type === 'goal').map((e, i) => {
                    const isHome = e.scoredBy === 'home';
                    return (
                      <div key={i} className={`flex items-center gap-2 text-xs ${isHome ? '' : 'flex-row-reverse text-right'}`}>
                        <span>⚽</span>
                        <div>
                          <span className="text-white font-medium">{e.player}</span>
                          {e.assist && <span className="text-gray-500 ml-1">(assist: {e.assist})</span>}
                          <span className="text-gray-600 ml-1">{e.minute}'</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
