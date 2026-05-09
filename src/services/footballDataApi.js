import axios from 'axios';
import { withCache, TTL } from '../utils/cache.js';

const BASE_URL = 'https://api.football-data.org/v4';
const API_KEY = import.meta.env.VITE_FOOTBALL_DATA_API_KEY;

const client = axios.create({ baseURL: BASE_URL, headers: { 'X-Auth-Token': API_KEY } });

let requestsAvailableThisMinute = 10;
let throttleResetMs = null;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

client.interceptors.response.use(
  (response) => {
    const available = response.headers['x-requests-available-minute'];
    const counterReset = response.headers['x-requestcounter-reset'];
    if (available !== undefined) requestsAvailableThisMinute = parseInt(available, 10);
    if (counterReset !== undefined) throttleResetMs = parseInt(counterReset, 10) * 1000;
    return response;
  },
  async (error) => {
    if (error.response?.status === 429) {
      const waitMs = throttleResetMs ?? 60000;
      await sleep(waitMs);
      return client.request(error.config);
    }
    return Promise.reject(error);
  }
);

client.interceptors.request.use(async (config) => {
  if (requestsAvailableThisMinute <= 0 && throttleResetMs) {
    await sleep(throttleResetMs);
    requestsAvailableThisMinute = 10;
  }
  requestsAvailableThisMinute = Math.max(0, requestsAvailableThisMinute - 1);
  return config;
});

const get = (url, params) => client.get(url, params ? { params } : undefined).then(r => r.data);

export const footballDataApi = {
  getCompetition: () => withCache('fd:competition', () => get('/competitions/WC'), TTL.STATIC),
  getMatches: (params = {}) => withCache(`fd:matches:${JSON.stringify(params)}`, () => get('/competitions/WC/matches', params), TTL.SCHEDULE),
  getLiveMatches: () => withCache('fd:matches:live', () => get('/competitions/WC/matches', { status: 'LIVE' }), TTL.LIVE),
  getTeams: () => withCache('fd:teams', () => get('/competitions/WC/teams'), TTL.TEAM),
  getStandings: () => withCache('fd:standings', () => get('/competitions/WC/standings'), TTL.STANDINGS),
  getMatch: (id) => withCache(`fd:match:${id}`, () => get(`/matches/${id}`), TTL.MATCH),
  getTeam: (id) => withCache(`fd:team:${id}`, () => get(`/teams/${id}`), TTL.TEAM),
  getTeamMatches: (id, params = {}) => withCache(`fd:team:${id}:matches:${JSON.stringify(params)}`, () => get(`/teams/${id}/matches`, params), TTL.SCHEDULE),
  getPersonMatches: (id, params = {}) => withCache(`fd:person:${id}:matches`, () => get(`/persons/${id}/matches`, params), TTL.TEAM),
};

export default footballDataApi;
