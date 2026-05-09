import axios from 'axios';
import { withCache, TTL } from '../utils/cache.js';

const BASE_URL = 'https://v3.football.api-sports.io';
const API_KEY = import.meta.env.VITE_API_FOOTBALL_KEY;
const WC_LEAGUE_ID = 1;
const WC_SEASON = 2026;

const client = axios.create({ baseURL: BASE_URL, headers: { 'x-apisports-key': API_KEY } });

let dailyRequestsRemaining = 100;
client.interceptors.response.use(
  (response) => {
    const remaining = response.headers['x-ratelimit-requests-remaining'];
    if (remaining !== undefined) dailyRequestsRemaining = parseInt(remaining, 10);
    return response;
  },
  (error) => { console.error('API-Football error:', error.response?.status, error.message); return Promise.reject(error); }
);

export function getDailyQuotaRemaining() { return dailyRequestsRemaining; }

export const apiFootball = {
  getFixtures: (params = {}) => withCache(`fixtures:${JSON.stringify(params)}`, () => client.get('/fixtures', { params: { league: WC_LEAGUE_ID, season: WC_SEASON, ...params } }).then(r => r.data), TTL.SCHEDULE),
  getLiveFixtures: () => withCache('fixtures:live', () => client.get('/fixtures', { params: { league: WC_LEAGUE_ID, season: WC_SEASON, live: 'all' } }).then(r => r.data), TTL.LIVE),
  getFixture: (id) => withCache(`fixture:${id}`, () => client.get('/fixtures', { params: { id } }).then(r => r.data), TTL.MATCH),
  getFixtureEvents: (id) => withCache(`fixture:events:${id}`, () => client.get('/fixtures/events', { params: { fixture: id } }).then(r => r.data), TTL.LIVE),
  getFixtureStats: (id) => withCache(`fixture:stats:${id}`, () => client.get('/fixtures/statistics', { params: { fixture: id } }).then(r => r.data), TTL.LIVE),
  getFixtureLineups: (id) => withCache(`fixture:lineups:${id}`, () => client.get('/fixtures/lineups', { params: { fixture: id } }).then(r => r.data), TTL.MATCH),
  getStandings: () => withCache('standings', () => client.get('/standings', { params: { league: WC_LEAGUE_ID, season: WC_SEASON } }).then(r => r.data), TTL.STANDINGS),
  getTeam: (id) => withCache(`team:${id}`, () => client.get('/teams', { params: { id } }).then(r => r.data), TTL.TEAM),
  getSquad: (id) => withCache(`squad:${id}`, () => client.get('/players/squads', { params: { team: id } }).then(r => r.data), TTL.TEAM),
  getPlayerStats: (id) => withCache(`player:${id}:${WC_SEASON}`, () => client.get('/players', { params: { id, season: WC_SEASON } }).then(r => r.data), TTL.TEAM),
  getTopScorers: () => withCache('topscorers', () => client.get('/players/topscorers', { params: { league: WC_LEAGUE_ID, season: WC_SEASON } }).then(r => r.data), TTL.STANDINGS),
  getHeadToHead: (t1, t2) => withCache(`h2h:${Math.min(t1,t2)}-${Math.max(t1,t2)}`, () => client.get('/fixtures/headtohead', { params: { h2h: `${t1}-${t2}`, last: 10 } }).then(r => r.data), TTL.TEAM),
  getOdds: (id) => withCache(`odds:${id}`, () => client.get('/odds', { params: { fixture: id, bookmaker: 8 } }).then(r => r.data), TTL.MATCH),
};

export default apiFootball;
