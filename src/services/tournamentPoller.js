/**
 * tournamentPoller.js
 *
 * Runs once per calendar day. Checks football-data.org for WC 2026 fixtures.
 * When data is found it is stored in localStorage under 'wc2026_live_fixtures'
 * and a custom event 'wc2026:live-data-ready' is dispatched so components can
 * re-render without a page reload.
 *
 * The API key comes from VITE_FOOTBALL_DATA_API_KEY in .env.
 * Until the key is set (or the tournament starts), every daily poll will fail
 * gracefully — the app simply stays on WC 2022 demo data.
 */

const STORAGE_KEY  = 'wc2026_live_fixtures';
const POLL_DATE_KEY = 'wc2026_last_poll_date';
const WC_COMPETITION = 'WC';
const WC_SEASON = 2026;

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function alreadyPolledToday() {
  return localStorage.getItem(POLL_DATE_KEY) === todayStr();
}

function markPolledToday() {
  localStorage.setItem(POLL_DATE_KEY, todayStr());
}

function statusFrom(fdStatus) {
  if (['IN_PLAY', 'PAUSED', 'HALFTIME'].includes(fdStatus)) return 'LIVE';
  if (['FINISHED', 'AWARDED'].includes(fdStatus)) return 'FINISHED';
  return 'SCHEDULED';
}

function normaliseFixtures(fdMatches) {
  return fdMatches.map((m, i) => ({
    id: m.id ?? i + 1,
    homeTeam: {
      name: m.homeTeam.name,
      code: m.homeTeam.tla ?? m.homeTeam.shortName,
      flagEmoji: '🏳',
      eloRating: 1800,
    },
    awayTeam: {
      name: m.awayTeam.name,
      code: m.awayTeam.tla ?? m.awayTeam.shortName,
      flagEmoji: '🏳',
      eloRating: 1800,
    },
    date: m.utcDate?.slice(0, 10),
    time: m.utcDate?.slice(11, 16) ?? '—',
    timezone: 'UTC',
    stadium: { name: m.venue ?? '', city: '', country: '' },
    group: m.group ?? null,
    round: m.stage,
    matchday: m.matchday ?? null,
    status: statusFrom(m.status),
    score: {
      home: m.score?.fullTime?.home ?? null,
      away: m.score?.fullTime?.away ?? null,
    },
    pens: null,
    events: [],
  }));
}

export function getLiveSchedule() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function hasLiveData() {
  return Boolean(localStorage.getItem(STORAGE_KEY));
}

export function clearLiveData() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(POLL_DATE_KEY);
}

export async function pollForLiveData() {
  const apiKey = import.meta.env.VITE_FOOTBALL_DATA_API_KEY;
  if (!apiKey || apiKey === 'your_key_here') return;
  if (alreadyPolledToday()) return;

  markPolledToday();

  try {
    const res = await fetch(
      `https://api.football-data.org/v4/competitions/${WC_COMPETITION}/matches?season=${WC_SEASON}`,
      { headers: { 'X-Auth-Token': apiKey } }
    );

    if (!res.ok) {
      console.info(`[poller] football-data.org returned ${res.status} — staying on demo data`);
      return;
    }

    const data = await res.json();
    const matches = data.matches ?? [];

    if (matches.length === 0) {
      console.info('[poller] No WC 2026 fixtures available yet.');
      return;
    }

    const normalised = normaliseFixtures(matches);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalised));
    window.dispatchEvent(new CustomEvent('wc2026:live-data-ready', { detail: normalised }));
    console.info(`[poller] ✓ ${normalised.length} WC 2026 fixtures loaded from API.`);
  } catch (err) {
    console.warn('[poller] Network error — will retry tomorrow.', err.message);
  }
}
