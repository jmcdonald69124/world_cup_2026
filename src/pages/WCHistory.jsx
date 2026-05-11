import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { WC_HISTORY } from '../data/wcHistory.js';

// ── Historical data fetcher (football-data.org) ───────────────────────────────

const CACHE_KEY = (year) => `wc_history_${year}`;
const API_KEY = () => import.meta.env.VITE_FOOTBALL_DATA_API_KEY;

async function fetchHistoricalMatches(season) {
  const key = CACHE_KEY(season);
  const cached = sessionStorage.getItem(key);
  if (cached) return JSON.parse(cached);

  const apiKey = API_KEY();
  if (!apiKey || apiKey === 'your_key_here') return null;

  try {
    const res = await fetch(
      `https://api.football-data.org/v4/competitions/WC/matches?season=${season}`,
      { headers: { 'X-Auth-Token': apiKey } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data.matches?.length) {
      sessionStorage.setItem(key, JSON.stringify(data.matches));
      return data.matches;
    }
  } catch { /* network error */ }
  return null;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function TournamentCard({ wc, index }) {
  const [liveMatches, setLiveMatches] = useState(null);

  useEffect(() => {
    if (!wc.hasFullData) {
      fetchHistoricalMatches(wc.apiSeason).then(setLiveMatches);
    }
  }, [wc]);

  const matchCount = liveMatches?.length ?? wc.matches;
  const hasApiData = liveMatches !== null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06 }}
      className="card rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-white/[0.06]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{wc.hostFlag}</span>
              <span className="text-2xs font-semibold text-gray-600 uppercase tracking-widest">
                {wc.host} {wc.year}
              </span>
              {wc.hasFullData && (
                <span className="text-2xs bg-wcGreen/15 text-wcGreen px-2 py-0.5 rounded-full font-semibold">
                  Full data
                </span>
              )}
              {hasApiData && !wc.hasFullData && (
                <span className="text-2xs bg-blue-500/15 text-blue-400 px-2 py-0.5 rounded-full font-semibold">
                  API data
                </span>
              )}
            </div>
            <p className="text-xs text-gray-600 italic">{wc.theme}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-2xs text-gray-600">Champion</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-lg">{wc.champion.flag}</span>
              <span className="text-sm font-bold text-white">{wc.champion.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Final result */}
      <div className="px-5 py-4 border-b border-white/[0.06]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">{wc.champion.flag}</span>
            <span className="text-sm font-semibold text-white">{wc.champion.name}</span>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-600 mb-0.5">Final</div>
            <div className="text-sm font-black text-white tabular-nums">{wc.finalScore}</div>
          </div>
          <div className="flex items-center gap-2 flex-row-reverse">
            <span className="text-xl">{wc.runnerUp.flag}</span>
            <span className="text-sm font-semibold text-white">{wc.runnerUp.name}</span>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 divide-x divide-white/[0.06] border-b border-white/[0.06]">
        {[
          { label: 'Matches', value: matchCount },
          { label: 'Goals', value: wc.totalGoals },
          { label: 'Avg/match', value: wc.avgGoals.toFixed(2) },
        ].map(({ label, value }) => (
          <div key={label} className="text-center py-3">
            <div className="text-lg font-black text-white tabular-nums">{value}</div>
            <div className="text-2xs text-gray-600">{label}</div>
          </div>
        ))}
      </div>

      {/* Awards */}
      <div className="px-5 py-4 border-b border-white/[0.06] space-y-2">
        {[
          { label: 'Golden Ball', ...wc.goldenBall },
          { label: 'Golden Boot', ...wc.goldenBoot, suffix: wc.goldenBoot.goals ? ` · ${wc.goldenBoot.goals} goals` : '' },
          { label: 'Golden Glove', ...wc.goldenGlove },
        ].map(({ label, player, flag, suffix = '' }) => (
          <div key={label} className="flex items-center justify-between text-xs">
            <span className="text-gray-600">{label}</span>
            <div className="flex items-center gap-1.5">
              <span>{flag}</span>
              <span className="text-gray-300">{player}{suffix}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Top scorers */}
      <div className="px-5 py-4 border-b border-white/[0.06]">
        <div className="text-2xs text-gray-600 uppercase tracking-widest mb-2">Top Scorers</div>
        <div className="space-y-1.5">
          {wc.topScorers.slice(0, 3).map((s, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className="text-gray-700 w-3 tabular-nums">{i + 1}</span>
              <span>{s.flag}</span>
              <span className="text-gray-300 flex-1">{s.player}</span>
              <span className="text-wcGreen font-bold tabular-nums">{s.goals}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Biggest upset */}
      <div className="px-5 py-3 border-b border-white/[0.06]">
        <div className="text-2xs text-gray-600 uppercase tracking-widest mb-1">Notable</div>
        <p className="text-xs text-gray-500">{wc.biggestUpset}</p>
      </div>

      {/* CTA */}
      <div className="px-5 py-3">
        {wc.hasFullData ? (
          <Link
            to={wc.detailRoute}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-wcGreen hover:underline"
          >
            Full Poisson analysis & match data →
          </Link>
        ) : hasApiData ? (
          <div className="text-2xs text-blue-400">
            {liveMatches.length} matches loaded from football-data.org
          </div>
        ) : (
          <div className="text-2xs text-gray-700">
            Add <code className="bg-white/5 px-1 rounded">VITE_FOOTBALL_DATA_API_KEY</code> to unlock match-level data
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function WCHistory() {
  return (
    <div className="min-h-screen pt-20 pb-16 px-5">
      <div className="max-w-5xl mx-auto">

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <p className="text-2xs text-gray-600 uppercase tracking-widest mb-3">Archive</p>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-4 leading-none">
            World Cup<br />History
          </h1>
          <p className="text-sm text-gray-500 max-w-md leading-relaxed">
            Five tournaments of data — WC 2022 includes full Poisson model analysis and
            Brier scoring. Older tournaments load match-level data from football-data.org
            when an API key is configured.
          </p>
        </motion.div>

        {/* 2026 teaser */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-10 p-5 card rounded-xl border-l-2 border-wcGreen"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="w-1.5 h-1.5 bg-wcGreen rounded-full live-pulse" />
            <span className="text-xs font-semibold text-wcGreen uppercase tracking-wider">Coming 2026</span>
          </div>
          <p className="text-sm text-gray-400">
            WC 2026 · USA, Canada & Mexico · 48 teams · 104 matches ·
            Live Bayesian probability updates will appear here automatically when the tournament begins (Jun 11, 2026).
          </p>
        </motion.div>

        {/* Tournament cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {WC_HISTORY.map((wc, i) => (
            <TournamentCard key={wc.year} wc={wc} index={i} />
          ))}
        </div>

        {/* Data sources note */}
        <div className="mt-10 pt-6 section-divider text-center">
          <p className="text-2xs text-gray-700 max-w-lg mx-auto leading-relaxed">
            WC 2022 data is bundled statically. WC 2006–2018 match data loads on demand from{' '}
            <span className="text-gray-500">football-data.org</span> (requires free API key in{' '}
            <code className="bg-white/5 px-1 rounded">.env</code>).
            Data for WC 1930–2002 is available via{' '}
            <span className="text-gray-500">openfootball/worldcup</span> on GitHub.
          </p>
        </div>
      </div>
    </div>
  );
}
