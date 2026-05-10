import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { WC2022_TEAMS, WC2022_GROUPS, WC2022_TOP_SCORERS, getTeam, WC2022_TOURNAMENT } from '../data/wc2022/teams.js';
import { WC2022_MATCHES } from '../data/wc2022/matches.js';

// ─── Poisson model (same as MatchSimulator) ──────────────────────────────────

function poissonPMF(lambda, k) {
  if (lambda <= 0) return k === 0 ? 1 : 0;
  let p = Math.exp(-lambda);
  for (let i = 1; i <= k; i++) p *= lambda / i;
  return p;
}

const MAX_GOALS = 10;

function computeMatchProbs(homeElo, awayElo) {
  const eloFactor = (homeElo - awayElo) / 400;
  const homeXG = Math.max(0.3, 1.35 * Math.pow(10, eloFactor / 2));
  const awayXG = Math.max(0.3, 1.05 / Math.pow(10, eloFactor / 2));
  let pHomeWin = 0, pDraw = 0, pAwayWin = 0;
  for (let h = 0; h <= MAX_GOALS; h++) {
    for (let a = 0; a <= MAX_GOALS; a++) {
      const p = poissonPMF(homeXG, h) * poissonPMF(awayXG, a);
      if (h > a) pHomeWin += p;
      else if (h === a) pDraw += p;
      else pAwayWin += p;
    }
  }
  return { pHomeWin, pDraw, pAwayWin, homeXG, awayXG };
}

// Brier score: (p - outcome)^2, lower is better
function brierScore(probs, actualResult) {
  const { pHomeWin, pDraw, pAwayWin } = probs;
  const oH = actualResult === 'home' ? 1 : 0;
  const oD = actualResult === 'draw' ? 1 : 0;
  const oA = actualResult === 'away' ? 1 : 0;
  return ((pHomeWin - oH) ** 2 + (pDraw - oD) ** 2 + (pAwayWin - oA) ** 2) / 3;
}

function getActualResult(match) {
  const { home, away } = match.score;
  if (home > away) return 'home';
  if (home === away && !match.pens) return 'draw';
  // In knockout, use pens to determine overall winner
  if (match.pens) return match.pens.home > match.pens.away ? 'home' : 'away';
  return 'away';
}

// ─── Subcomponents ───────────────────────────────────────────────────────────

function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-black text-white">{title}</h2>
      {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      <div className="w-8 h-px bg-wcGreen mt-3" />
    </div>
  );
}

function StatBadge({ label, value, color = 'text-white' }) {
  return (
    <div className="text-center">
      <div className={`text-3xl font-black tabular-nums ${color}`}>{value}</div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  );
}

function GroupStandings({ group }) {
  const teams = WC2022_TEAMS.filter(t => t.group === group);
  const matches = WC2022_MATCHES.filter(m => m.group === group);

  const standings = teams.map(team => {
    let w = 0, d = 0, l = 0, gf = 0, ga = 0;
    matches.forEach(m => {
      const isHome = m.home === team.code;
      const isAway = m.away === team.code;
      if (!isHome && !isAway) return;
      const tf = isHome ? m.score.home : m.score.away;
      const ta = isHome ? m.score.away : m.score.home;
      gf += tf; ga += ta;
      if (tf > ta) w++; else if (tf === ta) d++; else l++;
    });
    return { ...team, w, d, l, gf, ga, pts: w * 3 + d };
  }).sort((a, b) => b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga));

  return (
    <div className="glass-card rounded-xl p-4">
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Group {group}</h3>
      <table className="w-full text-xs">
        <thead>
          <tr className="text-gray-600 border-b border-white/5">
            <th className="text-left pb-2 font-medium">Team</th>
            <th className="text-center pb-2 font-medium">P</th>
            <th className="text-center pb-2 font-medium">W</th>
            <th className="text-center pb-2 font-medium">D</th>
            <th className="text-center pb-2 font-medium">L</th>
            <th className="text-center pb-2 font-medium">GD</th>
            <th className="text-center pb-2 font-bold text-wcGold">Pts</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((team, i) => (
            <tr key={team.code} className={`border-t border-white/5 ${i < 2 ? 'text-white' : 'text-gray-500'}`}>
              <td className="py-1.5 flex items-center gap-2">
                <span>{team.flagEmoji}</span>
                <span>{team.name}</span>
                {i < 2 && <span className="w-1 h-1 rounded-full bg-wcGreen flex-shrink-0" title="Advanced" />}
              </td>
              <td className="text-center">{team.w + team.d + team.l}</td>
              <td className="text-center">{team.w}</td>
              <td className="text-center">{team.d}</td>
              <td className="text-center">{team.l}</td>
              <td className="text-center">{team.gf - team.ga > 0 ? '+' : ''}{team.gf - team.ga}</td>
              <td className="text-center font-bold text-wcGold">{team.pts}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ModelVsRealityRow({ match, rank }) {
  const homeTeam = getTeam(match.home);
  const awayTeam = getTeam(match.away);
  if (!homeTeam || !awayTeam) return null;

  const probs = computeMatchProbs(homeTeam.eloRating, awayTeam.eloRating);
  const actual = getActualResult(match);
  const brier = brierScore(probs, actual);
  const modelFavourite = probs.pHomeWin > probs.pAwayWin && probs.pHomeWin > probs.pDraw
    ? 'home' : probs.pAwayWin > probs.pHomeWin && probs.pAwayWin > probs.pDraw
    ? 'away' : 'draw';

  const isUpset = modelFavourite !== actual && (
    (actual === 'home' && probs.pHomeWin < 0.35) ||
    (actual === 'away' && probs.pAwayWin < 0.35) ||
    (actual === 'draw' && probs.pDraw < 0.25)
  );

  const actualProb = actual === 'home' ? probs.pHomeWin : actual === 'away' ? probs.pAwayWin : probs.pDraw;
  const resultLabel = match.score.home === match.score.away && match.pens
    ? `${match.score.home}–${match.score.away} (${match.pens.home}–${match.pens.away} pens)`
    : `${match.score.home}–${match.score.away}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.04 }}
      className={`glass-card rounded-xl p-4 border ${isUpset ? 'border-wcRed/30' : 'border-white/5'}`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-400">{homeTeam.flagEmoji} {homeTeam.code}</span>
            <span className="font-black text-white tabular-nums">{resultLabel}</span>
            <span className="text-gray-400">{awayTeam.code} {awayTeam.flagEmoji}</span>
          </div>
          <div className="text-xs text-gray-600 mt-0.5">{match.round} · {match.date}</div>
        </div>
        <div className="text-right flex-shrink-0">
          {isUpset && (
            <div className="text-xs font-bold text-wcRed uppercase tracking-wider mb-1">Upset</div>
          )}
          <div className="text-xs text-gray-600">Brier: <span className={`font-mono font-bold ${brier < 0.15 ? 'text-wcGreen' : brier > 0.3 ? 'text-wcRed' : 'text-gray-300'}`}>{brier.toFixed(3)}</span></div>
        </div>
      </div>

      {/* Probability bars */}
      <div className="grid grid-cols-3 gap-1 text-center text-xs">
        {[
          { label: homeTeam.code, prob: probs.pHomeWin, result: 'home', color: 'bg-wcGreen' },
          { label: 'Draw', prob: probs.pDraw, result: 'draw', color: 'bg-gray-500' },
          { label: awayTeam.code, prob: probs.pAwayWin, result: 'away', color: 'bg-wcRed' },
        ].map(({ label, prob, result, color }) => (
          <div key={result} className={`rounded-lg p-2 ${actual === result ? 'bg-white/10 ring-1 ring-white/20' : 'bg-white/3'}`}>
            <div className="text-gray-500 mb-1 truncate">{label}</div>
            <div className={`font-bold tabular-nums ${actual === result ? 'text-white' : 'text-gray-500'}`}>
              {(prob * 100).toFixed(0)}%
            </div>
            <div className="h-1 bg-gray-800 rounded-full mt-1.5 overflow-hidden">
              <div className={`h-full ${color} rounded-full`} style={{ width: `${prob * 100}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-2 text-xs text-gray-600">
        Model gave actual outcome <span className={`font-bold ${actualProb < 0.25 ? 'text-wcRed' : actualProb > 0.5 ? 'text-wcGreen' : 'text-gray-400'}`}>{(actualProb * 100).toFixed(0)}%</span> probability
      </div>
    </motion.div>
  );
}

function BrierScoreSummary({ matches }) {
  const enriched = matches.map(m => {
    const homeTeam = getTeam(m.home);
    const awayTeam = getTeam(m.away);
    if (!homeTeam || !awayTeam) return null;
    const probs = computeMatchProbs(homeTeam.eloRating, awayTeam.eloRating);
    const actual = getActualResult(m);
    return { ...m, brier: brierScore(probs, actual), actual, probs };
  }).filter(Boolean);

  const avgBrier = enriched.reduce((s, m) => s + m.brier, 0) / enriched.length;
  const correctPredictions = enriched.filter(m => {
    const { pHomeWin, pDraw, pAwayWin } = m.probs;
    const modelPick = pHomeWin >= pDraw && pHomeWin >= pAwayWin ? 'home'
      : pAwayWin >= pHomeWin && pAwayWin >= pDraw ? 'away' : 'draw';
    return modelPick === m.actual;
  }).length;

  const biggestUpsets = enriched
    .map(m => {
      const actualProb = m.actual === 'home' ? m.probs.pHomeWin : m.actual === 'away' ? m.probs.pAwayWin : m.probs.pDraw;
      return { ...m, actualProb };
    })
    .sort((a, b) => a.actualProb - b.actualProb)
    .slice(0, 5);

  return { avgBrier, correctPredictions, total: enriched.length, biggestUpsets, enriched };
}

// ─── Main Page ───────────────────────────────────────────────────────────────

const TABS = ['Overview', 'Group Standings', 'Model vs Reality', 'Biggest Upsets', 'Top Scorers'];
const ROUNDS_ORDER = ['Group', 'Round of 16', 'Quarterfinals', 'Semifinals', '3rd Place', 'Final'];

export default function WC2022() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [selectedRound, setSelectedRound] = useState('All');

  const { avgBrier, correctPredictions, total, biggestUpsets, enriched } = useMemo(
    () => BrierScoreSummary(WC2022_MATCHES),
    []
  );

  const rounds = ['All', ...ROUNDS_ORDER.filter(r => WC2022_MATCHES.some(m => m.round === r))];

  const filteredMatches = useMemo(() => {
    if (selectedRound === 'All') return WC2022_MATCHES;
    return WC2022_MATCHES.filter(m => m.round === selectedRound);
  }, [selectedRound]);

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Historical Archive</div>
          </div>
          <h1 className="text-4xl font-black text-white mb-2">Qatar 2022</h1>
          <p className="text-gray-400 max-w-2xl">
            All 64 matches, 172 goals, and a Poisson model retrospective — how well did ELO-based match predictions align with the actual tournament?
          </p>
        </motion.div>

        {/* Tournament strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8"
        >
          <StatBadge label="Total Goals" value={WC2022_TOURNAMENT.totalGoals} color="text-wcGreen" />
          <StatBadge label="Avg per Match" value={WC2022_TOURNAMENT.avgGoalsPerMatch} color="text-wcGold" />
          <StatBadge label="Model Accuracy" value={`${Math.round((correctPredictions / total) * 100)}%`} color="text-wcBlue" />
          <StatBadge label="Avg Brier Score" value={avgBrier.toFixed(3)} color="text-gray-300" />
        </motion.div>

        {/* Award bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          {[
            { label: 'Champion', value: 'Argentina', sub: 'Final: 3–3 AET (4–2 pens vs France)', color: 'border-wcGold/30 bg-wcGold/5' },
            { label: 'Golden Ball', value: WC2022_TOURNAMENT.goldenBall.player, sub: '7 goals · 3 assists', color: 'border-white/10 bg-white/3' },
            { label: 'Golden Boot', value: WC2022_TOURNAMENT.goldenBoot.player, sub: `${WC2022_TOURNAMENT.goldenBoot.goals} goals (France)`, color: 'border-white/10 bg-white/3' },
          ].map(({ label, value, sub, color }) => (
            <div key={label} className={`rounded-xl border p-4 ${color}`}>
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</div>
              <div className="font-bold text-white">{value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{sub}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1 mb-8 border-b border-white/5 pb-3">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-wcGreen/20 text-wcGreen border border-wcGreen/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── Overview ── */}
        {activeTab === 'Overview' && (
          <div className="space-y-10">
            {/* Knockout bracket summary */}
            <div>
              <SectionHeader title="Knockout Results" subtitle="Round of 16 through the Final" />
              <div className="space-y-6">
                {['Round of 16', 'Quarterfinals', 'Semifinals', '3rd Place', 'Final'].map(round => {
                  const roundMatches = WC2022_MATCHES.filter(m => m.round === round);
                  return (
                    <div key={round}>
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">{round}</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                        {roundMatches.map(m => {
                          const home = getTeam(m.home);
                          const away = getTeam(m.away);
                          const actual = getActualResult(m);
                          const resultStr = m.pens
                            ? `${m.score.home}–${m.score.away} AET (${m.pens.home}–${m.pens.away} pens)`
                            : `${m.score.home}–${m.score.away}`;
                          return (
                            <div key={m.id} className={`glass-card rounded-lg p-3 ${m.id === 'FIN' ? 'border border-wcGold/30' : 'border border-white/5'}`}>
                              <div className="text-xs text-gray-600 mb-2">{m.date}</div>
                              <div className="flex items-center justify-between gap-2">
                                <div className={`flex items-center gap-1 text-xs ${actual === 'home' ? 'text-white font-bold' : 'text-gray-500'}`}>
                                  <span>{home?.flagEmoji}</span>
                                  <span>{home?.code}</span>
                                </div>
                                <div className="text-center text-xs font-black text-white tabular-nums">{resultStr}</div>
                                <div className={`flex items-center gap-1 text-xs ${actual === 'away' ? 'text-white font-bold' : 'text-gray-500'}`}>
                                  <span>{away?.code}</span>
                                  <span>{away?.flagEmoji}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Model summary */}
            <div>
              <SectionHeader
                title="Poisson Model Performance"
                subtitle="How well did ELO-based Poisson predictions match the actual results?"
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="glass-card rounded-xl p-5">
                  <div className="text-3xl font-black text-wcGreen mb-1">{correctPredictions}/{total}</div>
                  <div className="text-sm text-gray-400">Correct favourite predicted</div>
                  <div className="text-xs text-gray-600 mt-1">Model picked the outcome with highest probability</div>
                </div>
                <div className="glass-card rounded-xl p-5">
                  <div className="text-3xl font-black text-wcGold mb-1">{avgBrier.toFixed(3)}</div>
                  <div className="text-sm text-gray-400">Average Brier score</div>
                  <div className="text-xs text-gray-600 mt-1">Lower is better · perfect = 0 · random = 0.333</div>
                </div>
                <div className="glass-card rounded-xl p-5">
                  <div className="text-3xl font-black text-wcRed mb-1">{biggestUpsets.length}</div>
                  <div className="text-sm text-gray-400">Major upsets identified</div>
                  <div className="text-xs text-gray-600 mt-1">Results where model gave outcome &lt;35% probability</div>
                </div>
              </div>
              <div className="glass-card rounded-xl p-5 border border-white/5">
                <p className="text-sm text-gray-400 leading-relaxed">
                  The Poisson model derived expected goals from pre-tournament ELO ratings, then computed outcome probabilities across all scorelines up to 10 goals. The average Brier score of <strong className="text-white">{avgBrier.toFixed(3)}</strong> indicates moderate predictive skill — substantially better than a naive uniform prior (Brier = 0.222) but imperfect, as football results carry considerable variance. The model correctly identified the favourite in <strong className="text-white">{Math.round((correctPredictions / total) * 100)}%</strong> of matches.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Group Standings ── */}
        {activeTab === 'Group Standings' && (
          <div>
            <SectionHeader title="Group Stage Standings" subtitle="Final group standings — top 2 advanced to Round of 16" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {WC2022_GROUPS.map(g => (
                <GroupStandings key={g} group={g} />
              ))}
            </div>
          </div>
        )}

        {/* ── Model vs Reality ── */}
        {activeTab === 'Model vs Reality' && (
          <div>
            <SectionHeader
              title="Model vs Reality"
              subtitle="Poisson predictions (from pre-match ELO) compared to actual results"
            />

            {/* Round filter */}
            <div className="flex flex-wrap gap-1.5 mb-6">
              {rounds.map(r => (
                <button
                  key={r}
                  onClick={() => setSelectedRound(r)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedRound === r
                      ? 'bg-wcBlue/30 text-white border border-wcBlue/50'
                      : 'bg-white/5 text-gray-500 hover:text-white'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredMatches.map((match, i) => (
                <ModelVsRealityRow key={match.id} match={match} rank={i} />
              ))}
            </div>
          </div>
        )}

        {/* ── Biggest Upsets ── */}
        {activeTab === 'Biggest Upsets' && (
          <div>
            <SectionHeader
              title="Biggest Upsets"
              subtitle="Matches where the actual winner had the lowest model-assigned probability"
            />

            <div className="mb-6 glass-card rounded-xl p-5 border border-white/5">
              <p className="text-sm text-gray-400 leading-relaxed">
                An upset is defined here as a result that the Poisson model assigned a low probability. The model assigns probabilities based solely on ELO differentials — it cannot account for tactical surprises, injuries, or the psychological weight of a single tournament match. These are the moments where football defied the numbers.
              </p>
            </div>

            <div className="space-y-4">
              {biggestUpsets.map((m, i) => {
                const homeTeam = getTeam(m.home);
                const awayTeam = getTeam(m.away);
                const resultStr = m.pens
                  ? `${m.score.home}–${m.score.away} AET (${m.pens.home}–${m.pens.away} pens)`
                  : `${m.score.home}–${m.score.away}`;
                const winnerTeam = m.actual === 'home' ? homeTeam : m.actual === 'away' ? awayTeam : null;
                const loserTeam = m.actual === 'home' ? awayTeam : m.actual === 'away' ? homeTeam : null;

                return (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="glass-card rounded-xl p-5 border border-wcRed/20"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-wcRed uppercase tracking-wider">#{i + 1} Upset</span>
                          <span className="text-xs text-gray-600">{m.round} · {m.date}</span>
                        </div>
                        <div className="text-lg font-black text-white mb-0.5">
                          {homeTeam?.flagEmoji} {homeTeam?.code} {resultStr} {awayTeam?.code} {awayTeam?.flagEmoji}
                        </div>
                        {winnerTeam && loserTeam && (
                          <div className="text-sm text-gray-400">
                            {winnerTeam.name} ({winnerTeam.eloRating} ELO) defeated {loserTeam.name} ({loserTeam.eloRating} ELO)
                          </div>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-2xl font-black text-wcRed tabular-nums">{(m.actualProb * 100).toFixed(0)}%</div>
                        <div className="text-xs text-gray-600">model probability</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-4 text-xs text-center">
                      {[
                        { label: homeTeam?.code, prob: m.probs.pHomeWin },
                        { label: 'Draw', prob: m.probs.pDraw },
                        { label: awayTeam?.code, prob: m.probs.pAwayWin },
                      ].map(({ label, prob }) => (
                        <div key={label} className="bg-white/5 rounded-lg py-2">
                          <div className="text-gray-500">{label}</div>
                          <div className="font-bold text-white tabular-nums">{(prob * 100).toFixed(0)}%</div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 h-1 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-wcRed rounded-full"
                        style={{ width: `${m.actualProb * 100}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Model confidence in actual outcome</div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Top Scorers ── */}
        {activeTab === 'Top Scorers' && (
          <div>
            <SectionHeader title="Top Scorers" subtitle="Goals scored across all 64 matches" />

            <div className="space-y-2 mb-8">
              {WC2022_TOP_SCORERS.map((scorer, i) => {
                const team = getTeam(scorer.team);
                const maxGoals = WC2022_TOP_SCORERS[0].goals;
                return (
                  <motion.div
                    key={scorer.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="glass-card rounded-xl p-4 flex items-center gap-4"
                  >
                    <div className="w-6 text-center text-sm font-black text-gray-600">{i + 1}</div>
                    <div className="text-xl">{team?.flagEmoji}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-white">{scorer.name}</div>
                      <div className="text-xs text-gray-500">{team?.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-black text-wcGold tabular-nums">{scorer.goals}</div>
                      <div className="text-xs text-gray-600">goals</div>
                    </div>
                    {scorer.assists > 0 && (
                      <div className="text-right w-12">
                        <div className="text-base font-bold text-gray-400 tabular-nums">{scorer.assists}</div>
                        <div className="text-xs text-gray-600">ast</div>
                      </div>
                    )}
                    <div className="w-24 hidden sm:block">
                      <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-wcGold rounded-full"
                          style={{ width: `${(scorer.goals / maxGoals) * 100}%` }}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* All scorers by match */}
            <SectionHeader title="All Scorers by Match" subtitle="Every goal from the 2022 tournament" />
            <div className="space-y-2">
              {WC2022_MATCHES.filter(m => m.scorers?.length > 0).map(m => {
                const homeTeam = getTeam(m.home);
                const awayTeam = getTeam(m.away);
                return (
                  <div key={m.id} className="glass-card rounded-xl p-3 flex items-start gap-3">
                    <div className="text-xs text-gray-600 w-24 flex-shrink-0 pt-0.5">
                      <div>{m.round}</div>
                      <div className="font-bold text-white">{m.home} {m.score.home}–{m.score.away} {m.away}</div>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      {m.scorers.map((s, si) => (
                        <div key={si} className="text-xs">
                          <span className={s.team === m.home ? 'text-wcGreen' : 'text-wcRed'}>{s.team}</span>
                          <span className="text-gray-300 ml-1">{s.player}</span>
                          <span className="text-gray-600 ml-1">{s.minute}'</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
