#!/usr/bin/env node
/**
 * backfill-history.mjs
 *
 * Fetches World Cup match data from football-data.org for each historical
 * tournament and writes static JS data files into src/data/wc<YEAR>/.
 *
 * Usage:
 *   FOOTBALL_DATA_API_KEY=<your_key> node scripts/backfill-history.mjs
 *
 *   Or if the key is already in .env:
 *   node scripts/backfill-history.mjs
 *
 * The free tier allows 10 req/min. This script paces itself automatically.
 * Expect ~2 minutes total runtime (4 seasons × ~2 requests each + pacing).
 *
 * Output files written:
 *   src/data/wc2018/matches.js
 *   src/data/wc2014/matches.js
 *   src/data/wc2010/matches.js
 *   src/data/wc2006/matches.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC_DATA = path.join(ROOT, 'src', 'data');

// ── Load API key ──────────────────────────────────────────────────────────────
function loadEnv() {
  const envPath = path.join(ROOT, '.env');
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
      const [k, ...rest] = line.split('=');
      if (k && rest.length) process.env[k.trim()] = rest.join('=').trim();
    }
  }
}
loadEnv();

const API_KEY =
  process.env.FOOTBALL_DATA_API_KEY ||
  process.env.VITE_FOOTBALL_DATA_API_KEY;

if (!API_KEY) {
  console.error('❌  No API key found. Set FOOTBALL_DATA_API_KEY in .env or environment.');
  process.exit(1);
}

const BASE_URL = 'https://api.football-data.org/v4';
const SEASONS = [2018, 2014, 2010, 2006];

// ── Rate-limit-aware fetch ────────────────────────────────────────────────────
let requestsRemaining = 10;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function apiFetch(path) {
  if (requestsRemaining <= 1) {
    console.log('  ⏳ Rate limit approaching — waiting 65s for quota reset…');
    await sleep(65_000);
    requestsRemaining = 10;
  }

  const url = `${BASE_URL}${path}`;
  console.log(`  → GET ${url}`);

  const res = await fetch(url, {
    headers: { 'X-Auth-Token': API_KEY },
  });

  const remaining = res.headers.get('x-requests-available-minute');
  if (remaining !== null) requestsRemaining = parseInt(remaining, 10);

  if (res.status === 429) {
    const reset = parseInt(res.headers.get('x-requestcounter-reset') || '60', 10);
    console.log(`  ⏳ 429 rate limited — waiting ${reset}s…`);
    await sleep(reset * 1000 + 1000);
    return apiFetch(path);
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status} for ${url}: ${text}`);
  }

  return res.json();
}

// ── Data transformation ───────────────────────────────────────────────────────

// football-data.org stage names → our round labels
const STAGE_MAP = {
  GROUP_STAGE: 'Group',
  LAST_16: 'Round of 16',
  QUARTER_FINALS: 'Quarterfinals',
  SEMI_FINALS: 'Semifinals',
  THIRD_PLACE: '3rd Place',
  FINAL: 'Final',
};

// football-data.org 3-letter codes sometimes differ from our convention
const CODE_OVERRIDES = {
  KSA: 'KSA',
  IRN: 'IRN',
  KOR: 'KOR',
  USA: 'USA',
  GER: 'GER',
  NED: 'NED',
  POR: 'POR',
  CRO: 'CRO',
  MAR: 'MAR',
  SUI: 'SUI',
  SRB: 'SRB',
  CIV: 'CIV',
  ANT: 'ANT',
  TRI: 'TRI',
  TOG: 'TOG',
  PAR: 'PAR',
  GRE: 'GRE',
  ECU: 'ECU',
  SLO: 'SVN',
};

function teamCode(team) {
  if (!team) return '???';
  const tla = team.tla || team.shortName?.slice(0, 3).toUpperCase() || '???';
  return CODE_OVERRIDES[tla] || tla;
}

function parseScorers(match) {
  const goals = match.goals || [];
  return goals.map((g) => ({
    team: g.team ? teamCode(g.team) : '???',
    player: g.scorer?.name || 'Unknown',
    minute: g.minute || 0,
    ...(g.type === 'OWN' ? { ownGoal: true } : {}),
    ...(g.type === 'PENALTY' ? { penalty: true } : {}),
  }));
}

function roundId(stage, matchday, index) {
  switch (stage) {
    case 'LAST_16':        return `R16_${index + 1}`;
    case 'QUARTER_FINALS': return `QF${index + 1}`;
    case 'SEMI_FINALS':    return `SF${index + 1}`;
    case 'THIRD_PLACE':    return 'TP';
    case 'FINAL':          return 'FIN';
    default:               return `${stage}_${index + 1}`;
  }
}

function groupLetter(match) {
  if (match.group) return match.group.replace('GROUP_', '');
  return null;
}

function transformMatches(rawMatches) {
  const byStage = {};
  for (const m of rawMatches) {
    const s = m.stage;
    if (!byStage[s]) byStage[s] = [];
    byStage[s].push(m);
  }

  const result = [];

  const groupMatches = (byStage['GROUP_STAGE'] || []).sort(
    (a, b) => new Date(a.utcDate) - new Date(b.utcDate)
  );
  const groupCounters = {};
  for (const m of groupMatches) {
    const letter = groupLetter(m);
    if (!groupCounters[letter]) groupCounters[letter] = 1;
    const id = `${letter}${groupCounters[letter]++}`;

    const homeScore = m.score?.fullTime?.home ?? null;
    const awayScore = m.score?.fullTime?.away ?? null;
    const homePens  = m.score?.penalties?.home ?? null;
    const awayPens  = m.score?.penalties?.away ?? null;

    result.push({
      id,
      round: 'Group',
      group: letter,
      date: m.utcDate?.slice(0, 10),
      home: teamCode(m.homeTeam),
      away: teamCode(m.awayTeam),
      score: { home: homeScore, away: awayScore },
      ...(homePens !== null ? { pens: { home: homePens, away: awayPens } } : {}),
      venue: m.venue || null,
      city: null,
      scorers: parseScorers(m),
    });
  }

  const knockoutOrder = ['LAST_16', 'QUARTER_FINALS', 'SEMI_FINALS', 'THIRD_PLACE', 'FINAL'];
  for (const stage of knockoutOrder) {
    const stageMatches = (byStage[stage] || []).sort(
      (a, b) => new Date(a.utcDate) - new Date(b.utcDate)
    );
    stageMatches.forEach((m, idx) => {
      const homeScore = m.score?.fullTime?.home ?? null;
      const awayScore = m.score?.fullTime?.away ?? null;
      const homePens  = m.score?.penalties?.home ?? null;
      const awayPens  = m.score?.penalties?.away ?? null;

      result.push({
        id: roundId(stage, m.matchday, idx),
        round: STAGE_MAP[stage] || stage,
        group: null,
        date: m.utcDate?.slice(0, 10),
        home: teamCode(m.homeTeam),
        away: teamCode(m.awayTeam),
        score: { home: homeScore, away: awayScore },
        ...(homePens !== null ? { pens: { home: homePens, away: awayPens } } : {}),
        venue: m.venue || null,
        city: null,
        scorers: parseScorers(m),
      });
    });
  }

  return result;
}

function matchesToJs(year, matches, meta) {
  const varName = `WC${year}_MATCHES`;
  const tournVar = `WC${year}_TOURNAMENT`;

  const matchLines = matches.map((m) => {
    const scorerStr = m.scorers.length
      ? `[${m.scorers.map((s) =>
          `{ team: '${s.team}', player: ${JSON.stringify(s.player)}, minute: ${s.minute}${s.ownGoal ? ', ownGoal: true' : ''}${s.penalty ? ', penalty: true' : ''} }`
        ).join(', ')}]`
      : '[]';

    const pensStr = m.pens
      ? `, pens: { home: ${m.pens.home}, away: ${m.pens.away} }`
      : '';
    const venueStr = m.venue ? `, venue: ${JSON.stringify(m.venue)}` : '';
    const cityStr  = m.city  ? `, city: ${JSON.stringify(m.city)}`   : '';
    const groupStr = m.group ? `group: '${m.group}'` : 'group: null';

    return `  { id: '${m.id}', round: '${m.round}', ${groupStr}, date: '${m.date}', home: '${m.home}', away: '${m.away}', score: { home: ${m.score.home}, away: ${m.score.away} }${pensStr}${venueStr}${cityStr},\n    scorers: ${scorerStr} },`;
  });

  const totalGoals = matches.reduce(
    (s, m) => s + (m.score.home ?? 0) + (m.score.away ?? 0), 0
  );
  const matchCount = matches.length;

  return `// World Cup ${year} — all ${matchCount} match results
// Generated by scripts/backfill-history.mjs using football-data.org API
// Scorelines are final results (including AET where applicable); pens field added where relevant

export const ${varName} = [
${matchLines.join('\n')}
];

export const ${tournVar} = {
  name: ${JSON.stringify(meta.name)},
  host: ${JSON.stringify(meta.host)},
  startDate: ${JSON.stringify(meta.startDate)},
  endDate: ${JSON.stringify(meta.endDate)},
  teams: ${meta.teams},
  matches: ${matchCount},
  totalGoals: ${totalGoals},
  avgGoalsPerMatch: ${matchCount ? (totalGoals / matchCount).toFixed(2) : 0},
  champion: ${JSON.stringify(meta.champion)},
  runnerUp: ${JSON.stringify(meta.runnerUp)},
  thirdPlace: ${JSON.stringify(meta.thirdPlace)},
  fourthPlace: ${JSON.stringify(meta.fourthPlace)},
  goldenBall: ${JSON.stringify(meta.goldenBall)},
  goldenBoot: ${JSON.stringify(meta.goldenBoot)},
  goldenGlove: ${JSON.stringify(meta.goldenGlove)},
};
`;
}

const TOURNAMENT_META = {
  2018: {
    name: 'FIFA World Cup Russia 2018',
    host: 'Russia',
    startDate: '2018-06-14',
    endDate: '2018-07-15',
    teams: 32,
    champion: 'FRA',
    runnerUp: 'CRO',
    thirdPlace: 'BEL',
    fourthPlace: 'ENG',
    goldenBall: { player: 'Luka Modrić', team: 'CRO' },
    goldenBoot: { player: 'Harry Kane', team: 'ENG', goals: 6 },
    goldenGlove: { player: 'Thibaut Courtois', team: 'BEL' },
  },
  2014: {
    name: 'FIFA World Cup Brazil 2014',
    host: 'Brazil',
    startDate: '2014-06-12',
    endDate: '2014-07-13',
    teams: 32,
    champion: 'GER',
    runnerUp: 'ARG',
    thirdPlace: 'NED',
    fourthPlace: 'BRA',
    goldenBall: { player: 'Lionel Messi', team: 'ARG' },
    goldenBoot: { player: 'James Rodríguez', team: 'COL', goals: 6 },
    goldenGlove: { player: 'Manuel Neuer', team: 'GER' },
  },
  2010: {
    name: 'FIFA World Cup South Africa 2010',
    host: 'South Africa',
    startDate: '2010-06-11',
    endDate: '2010-07-11',
    teams: 32,
    champion: 'ESP',
    runnerUp: 'NED',
    thirdPlace: 'GER',
    fourthPlace: 'URU',
    goldenBall: { player: 'Diego Forlán', team: 'URU' },
    goldenBoot: { player: 'Thomas Müller', team: 'GER', goals: 5 },
    goldenGlove: { player: 'Iker Casillas', team: 'ESP' },
  },
  2006: {
    name: 'FIFA World Cup Germany 2006',
    host: 'Germany',
    startDate: '2006-06-09',
    endDate: '2006-07-09',
    teams: 32,
    champion: 'ITA',
    runnerUp: 'FRA',
    thirdPlace: 'GER',
    fourthPlace: 'POR',
    goldenBall: { player: 'Zinedine Zidane', team: 'FRA' },
    goldenBoot: { player: 'Miroslav Klose', team: 'GER', goals: 5 },
    goldenGlove: { player: 'Gianluigi Buffon', team: 'ITA' },
  },
};

// ── Main ──────────────────────────────────────────────────────────────────────

async function fetchSeason(season) {
  console.log(`\n📅 Fetching WC ${season}…`);

  const data = await apiFetch(`/competitions/WC/matches?season=${season}`);
  const matches = data.matches || [];
  console.log(`  ✓ ${matches.length} matches received`);

  if (matches.length === 0) {
    console.warn(`  ⚠️  No matches returned for ${season} — skipping`);
    return;
  }

  const transformed = transformMatches(matches);
  const meta = TOURNAMENT_META[season];

  const dates = matches.map((m) => m.utcDate?.slice(0, 10)).filter(Boolean).sort();
  if (dates.length) {
    meta.startDate = meta.startDate || dates[0];
    meta.endDate   = meta.endDate   || dates[dates.length - 1];
  }

  const js = matchesToJs(season, transformed, meta);

  const outDir = path.join(SRC_DATA, `wc${season}`);
  fs.mkdirSync(outDir, { recursive: true });

  const outFile = path.join(outDir, 'matches.js');
  fs.writeFileSync(outFile, js, 'utf8');
  console.log(`  ✅ Written → ${path.relative(ROOT, outFile)} (${transformed.length} matches)`);

  return new Promise((r) => setTimeout(r, 7_000));
}

async function main() {
  console.log('🌍 World Cup history backfill');
  console.log(`   API key: ${API_KEY.slice(0, 6)}…${API_KEY.slice(-4)}`);
  console.log(`   Seasons: ${SEASONS.join(', ')}`);
  console.log('');

  for (const season of SEASONS) {
    await fetchSeason(season);
  }

  console.log('\n✅  All done! Files written to src/data/wc<YEAR>/matches.js');
  console.log('\nNext steps:');
  console.log('  1. Check src/data/wc2018/matches.js looks correct');
  console.log('  2. Update src/data/wcHistory.js to set hasFullData: true for each year');
  console.log('  3. Add routes in App.jsx: /history/2018 → WC2022 page with year prop');
  console.log('  4. Commit and push the generated files');
}

main().catch((err) => {
  console.error('\n❌  Fatal error:', err.message);
  process.exit(1);
});
