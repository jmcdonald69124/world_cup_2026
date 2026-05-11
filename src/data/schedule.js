/**
 * schedule.js — WC 2026 group stage fixture list.
 *
 * 48 teams · 12 groups (A–L) · 72 group stage matches · all SCHEDULED.
 * Live results will be layered in via tournamentPoller.js once the
 * tournament begins (Jun 11, 2026). Knockout fixtures are not yet known.
 */

import { TEAMS } from './teams.js';

function teamInfo(code) {
  const t = TEAMS.find(t => t.code === code);
  if (!t) return { name: code, code, flagEmoji: '🏳', eloRating: 1700 };
  return { name: t.name, code: t.code, flagEmoji: t.flagEmoji, eloRating: t.eloRating };
}

// Each group: teams=[t1,t2,t3,t4], 3 matchdays
// Fixture order: MD1=t1vt2,t3vt4 / MD2=t1vt3,t2vt4 / MD3=t1vt4,t2vt3 (simultaneous)
const GROUP_CONFIG = [
  {
    group: 'A', teams: ['USA', 'PAN', 'TRI', 'BHR'],
    dates: ['2026-06-11', '2026-06-17', '2026-06-23'],
    times: [['12:00 ET', '15:00 ET'], ['12:00 ET', '15:00 ET'], ['20:00 ET', '20:00 ET']],
    venues: [
      { name: 'MetLife Stadium',  city: 'East Rutherford', country: 'USA' },
      { name: 'AT&T Stadium',     city: 'Arlington',       country: 'USA' },
    ],
  },
  {
    group: 'B', teams: ['CAN', 'HON', 'JAM', 'UZB'],
    dates: ['2026-06-12', '2026-06-18', '2026-06-24'],
    times: [['12:00 ET', '15:00 ET'], ['12:00 ET', '15:00 ET'], ['20:00 ET', '20:00 ET']],
    venues: [
      { name: 'BMO Field', city: 'Toronto',   country: 'Canada' },
      { name: 'BC Place',  city: 'Vancouver', country: 'Canada' },
    ],
  },
  {
    group: 'C', teams: ['MEX', 'ECU', 'BOL', 'NZL'],
    dates: ['2026-06-13', '2026-06-19', '2026-06-25'],
    times: [['12:00 ET', '15:00 ET'], ['12:00 ET', '15:00 ET'], ['20:00 ET', '20:00 ET']],
    venues: [
      { name: 'Estadio Azteca', city: 'Mexico City', country: 'Mexico' },
      { name: 'Estadio Akron',  city: 'Guadalajara', country: 'Mexico' },
    ],
  },
  {
    group: 'D', teams: ['BRA', 'CRC', 'COD', 'AUS'],
    dates: ['2026-06-14', '2026-06-20', '2026-06-26'],
    times: [['12:00 ET', '15:00 ET'], ['12:00 ET', '15:00 ET'], ['20:00 ET', '20:00 ET']],
    venues: [
      { name: 'Hard Rock Stadium', city: 'Miami',      country: 'USA' },
      { name: 'Gillette Stadium',  city: 'Foxborough', country: 'USA' },
    ],
  },
  {
    group: 'E', teams: ['ARG', 'CHI', 'SEN', 'JPN'],
    dates: ['2026-06-15', '2026-06-21', '2026-06-27'],
    times: [['12:00 ET', '15:00 ET'], ['12:00 ET', '15:00 ET'], ['20:00 ET', '20:00 ET']],
    venues: [
      { name: 'Rose Bowl',      city: 'Pasadena',    country: 'USA' },
      { name: "Levi's Stadium", city: 'Santa Clara', country: 'USA' },
    ],
  },
  {
    group: 'F', teams: ['FRA', 'URU', 'IRN', 'KSA'],
    dates: ['2026-06-16', '2026-06-22', '2026-06-28'],
    times: [['12:00 ET', '15:00 ET'], ['12:00 ET', '15:00 ET'], ['20:00 ET', '20:00 ET']],
    venues: [
      { name: 'SoFi Stadium',      city: 'Inglewood',   country: 'USA' },
      { name: 'Arrowhead Stadium', city: 'Kansas City', country: 'USA' },
    ],
  },
  {
    group: 'G', teams: ['ESP', 'COL', 'CIV', 'ALG'],
    dates: ['2026-06-11', '2026-06-17', '2026-06-23'],
    times: [['18:00 ET', '21:00 ET'], ['18:00 ET', '21:00 ET'], ['16:00 ET', '16:00 ET']],
    venues: [
      { name: 'Lincoln Financial Field', city: 'Philadelphia', country: 'USA' },
      { name: 'NRG Stadium',             city: 'Houston',      country: 'USA' },
    ],
  },
  {
    group: 'H', teams: ['ENG', 'TUN', 'SVK', 'KOR'],
    dates: ['2026-06-12', '2026-06-18', '2026-06-24'],
    times: [['18:00 ET', '21:00 ET'], ['18:00 ET', '21:00 ET'], ['16:00 ET', '16:00 ET']],
    venues: [
      { name: 'AT&T Stadium',   city: 'Arlington',       country: 'USA' },
      { name: 'MetLife Stadium', city: 'East Rutherford', country: 'USA' },
    ],
  },
  {
    group: 'I', teams: ['GER', 'POR', 'NGA', 'PAR'],
    dates: ['2026-06-13', '2026-06-19', '2026-06-25'],
    times: [['18:00 ET', '21:00 ET'], ['18:00 ET', '21:00 ET'], ['16:00 ET', '16:00 ET']],
    venues: [
      { name: 'BC Place',  city: 'Vancouver', country: 'Canada' },
      { name: 'BMO Field', city: 'Toronto',   country: 'Canada' },
    ],
  },
  {
    group: 'J', teams: ['NED', 'GHA', 'MAR', 'VEN'],
    dates: ['2026-06-14', '2026-06-20', '2026-06-26'],
    times: [['18:00 ET', '21:00 ET'], ['18:00 ET', '21:00 ET'], ['16:00 ET', '16:00 ET']],
    venues: [
      { name: 'Estadio BBVA',  city: 'Monterrey',   country: 'Mexico' },
      { name: 'Estadio Azteca', city: 'Mexico City', country: 'Mexico' },
    ],
  },
  {
    group: 'K', teams: ['BEL', 'EGY', 'PER', 'IDN'],
    dates: ['2026-06-15', '2026-06-21', '2026-06-27'],
    times: [['18:00 ET', '21:00 ET'], ['18:00 ET', '21:00 ET'], ['16:00 ET', '16:00 ET']],
    venues: [
      { name: 'Gillette Stadium',        city: 'Foxborough',   country: 'USA' },
      { name: 'Lincoln Financial Field', city: 'Philadelphia', country: 'USA' },
    ],
  },
  {
    group: 'L', teams: ['ITA', 'CRO', 'QAT', 'CMR'],
    dates: ['2026-06-16', '2026-06-22', '2026-06-28'],
    times: [['18:00 ET', '21:00 ET'], ['18:00 ET', '21:00 ET'], ['16:00 ET', '16:00 ET']],
    venues: [
      { name: "Levi's Stadium", city: 'Santa Clara', country: 'USA' },
      { name: 'Rose Bowl',      city: 'Pasadena',    country: 'USA' },
    ],
  },
];

function buildGroupFixtures(cfg) {
  const [t1, t2, t3, t4] = cfg.teams;
  const [d1, d2, d3] = cfg.dates;
  const [[ta1, tb1], [ta2, tb2], [ta3, tb3]] = cfg.times;
  const [v1, v2] = cfg.venues;
  return [
    { home: t1, away: t2, date: d1, time: ta1, matchday: 1, stadium: v1 },
    { home: t3, away: t4, date: d1, time: tb1, matchday: 1, stadium: v2 },
    { home: t1, away: t3, date: d2, time: ta2, matchday: 2, stadium: v1 },
    { home: t2, away: t4, date: d2, time: tb2, matchday: 2, stadium: v2 },
    { home: t1, away: t4, date: d3, time: ta3, matchday: 3, stadium: v1 },
    { home: t2, away: t3, date: d3, time: tb3, matchday: 3, stadium: v2 },
  ].map(m => ({ ...m, group: cfg.group }));
}

const allFixtures = GROUP_CONFIG.flatMap(buildGroupFixtures);

export const SCHEDULE = allFixtures.map((m, i) => ({
  id: i + 1,
  homeTeam: teamInfo(m.home),
  awayTeam: teamInfo(m.away),
  date: m.date,
  time: m.time,
  timezone: 'ET',
  stadium: m.stadium,
  group: m.group,
  round: 'Group Stage',
  matchday: m.matchday,
  status: 'SCHEDULED',
  score: { home: null, away: null },
  pens: null,
  events: [],
}));

export const getMatchById = (id) => SCHEDULE.find(m => m.id === Number(id));
