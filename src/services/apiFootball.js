import axios from 'axios';
import { withCache, TTL } from '../utils/cache.js';

const BASE_URL = 'https://v3.football.api-sports.io';
const API_KEY = import.meta.env.VITE_API_FOOTBALL_KEY;

// WC 2026 league ID in API-Football
const WC_LEAGUE_ID = 1;
const WC_SEASON = 2026;

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    'x-apisports-key': API_KEY,
  },
});

// Track remaining quota from response headers (100 req/day free tier)
let dailyRequestsRemaining = 100;

client.interceptors.response.use(
  (response) => {
    const remaining = response.headers['x-ratelimit-requests-remaining'];
    if (remaining !== undefined) dailyRequestsRemaining = parseInt(remaining, 10);
    return response;
  },
  (error) => {
    console.error('API-Football error:', error.response?.status, error.message);
    return Promise.reject(error);
  }
);

export function getDailyQuotaRemaining() {
  return dailyRequestsRemaining;
}

// All public methods go through withCache to protect the 100 req/day limit

export const apiFootball = {
  getFixtures: (params = {}) =>
    withCache(
      `fixtures:${JSON.stringify(params)}`,
      () => client.get('/fixtures', { params: { league: WC_LEAGUE_ID, season: WC_SEASON, ...params } }).then(r => r.data),
      TTL.SCHEDULE
    ),

  getLiveFixtures: () =>
    withCache(
      'fixtures:live',
      () => client.get('/fixtures', { params: { league: WC_LEAGUE_ID, season: WC_SEASON, live: 'all' } }).then(r => r.data),
      TTL.LIVE
    ),

  getFixture: (fixtureId) =>
    withCache(
      `fixture:${fixtureId}`,
      () => client.get('/fixtures', { params: { id: fixtureId } }).then(r => r.data),
      TTL.MATCH
    ),

  getFixtureEvents: (fixtureId) =>
    withCache(
      `fixture:events:${fixtureId}`,
      () => client.get('/fixtures/events', { params: { fixture: fixtureId } }).then(r => r.data),
      TTL.LIVE
    ),

  getFixtureStats: (fixtureId) =>
    withCache(
      `fixture:stats:${fixtureId}`,
      () => client.get('/fixtures/statistics', { params: { fixture: fixtureId } }).then(r => r.data),
      TTL.LIVE
    ),

  getFixtureLineups: (fixtureId) =>
    withCache(
      `fixture:lineups:${fixtureId}`,
      () => client.get('/fixtures/lineups', { params: { fixture: fixtureId } }).then(r => r.data),
      TTL.MATCH
    ),

  getStandings: () =>
    withCache(
      'standings',
      () => client.get('/standings', { params: { league: WC_LEAGUE_ID, season: WC_SEASON } }).then(r => r.data),
      TTL.STANDINGS
    ),

  getTeam: (teamId) =>
    withCache(
      `team:${teamId}`,
      () => client.get('/teams', { params: { id: teamId } }).then(r => r.data),
      TTL.TEAM
    ),

  getSquad: (teamId) =>
    withCache(
      `squad:${teamId}`,
      () => client.get('/players/squads', { params: { team: teamId } }).then(r => r.data),
      TTL.TEAM
    ),

  getPlayerStats: (playerId) =>
    withCache(
      `player:${playerId}:${WC_SEASON}`,
      () => client.get('/players', { params: { id: playerId, season: WC_SEASON } }).then(r => r.data),
      TTL.TEAM
    ),

  getTopScorers: () =>
    withCache(
      'topscorers',
      () => client.get('/players/topscorers', { params: { league: WC_LEAGUE_ID, season: WC_SEASON } }).then(r => r.data),
      TTL.STANDINGS
    ),

  getHeadToHead: (team1Id, team2Id) =>
    withCache(
      `h2h:${Math.min(team1Id, team2Id)}-${Math.max(team1Id, team2Id)}`,
      () => client.get('/fixtures/headtohead', { params: { h2h: `${team1Id}-${team2Id}`, last: 10 } }).then(r => r.data),
      TTL.TEAM
    ),

  getOdds: (fixtureId) =>
    withCache(
      `odds:${fixtureId}`,
      () => client.get('/odds', { params: { fixture: fixtureId, bookmaker: 8 } }).then(r => r.data),
      TTL.MATCH
    ),
};

export default apiFootball;
