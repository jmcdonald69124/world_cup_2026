/**
 * schedule.js — Active match schedule for the app.
 *
 * Currently powered by WC 2022 Qatar data (64 real matches, all FINISHED).
 * When WC 2026 data becomes available via the tournament poller it will be
 * written to localStorage and the app will prefer it automatically.
 * See src/services/tournamentPoller.js.
 */

import { WC2022_MATCHES } from './wc2022/matches.js';
import { WC2022_TEAMS } from './wc2022/teams.js';

// ── helpers ──────────────────────────────────────────────────────────────────────────

function teamInfo(code) {
  const t = WC2022_TEAMS.find(t => t.code === code);
  if (!t) return { name: code, code, flagEmoji: '🏳', eloRating: 1700 };
  return { name: t.name, code: t.code, flagEmoji: t.flagEmoji, eloRating: t.eloRating };
}

function matchday(id) {
  if (id.startsWith('R16')) return 4;
  if (id.startsWith('QF'))  return 5;
  if (id.startsWith('SF'))  return 6;
  if (id === 'TP' || id === 'FIN') return 7;
  const n = parseInt(id.slice(-1), 10);
  if (n <= 2) return 1;
  if (n <= 4) return 2;
  return 3;
}

function scorersToEvents(scorers = [], homeCode) {
  return scorers.map(s => ({
    type: 'goal',
    scoredBy: s.team === homeCode ? 'home' : 'away',
    minute: s.minute,
    player: s.player,
  }));
}

// ── static 2022 schedule (used until live 2026 data is available) ─────────────────

export const SCHEDULE = WC2022_MATCHES.map((m, i) => ({
  id: i + 1,
  matchId: m.id,
  homeTeam: teamInfo(m.home),
  awayTeam: teamInfo(m.away),
  date: m.date,
  time: '—',
  timezone: 'AST',
  stadium: { name: m.venue, city: m.city, country: 'Qatar' },
  group: m.group,
  round: m.round,
  matchday: matchday(m.id),
  status: 'FINISHED',
  score: m.score,
  pens: m.pens ?? null,
  events: scorersToEvents(m.scorers, m.home),
}));

export const getMatchById = (id) => SCHEDULE.find(m => m.id === Number(id));
