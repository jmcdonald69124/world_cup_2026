import axios from 'axios';

const BASE_URL = 'https://api.football-data.org/v4';
const API_KEY = import.meta.env.VITE_FOOTBALL_DATA_API_KEY;

const client = axios.create({
  baseURL: BASE_URL,
  headers: { 'X-Auth-Token': API_KEY },
});

// Throttle state — football-data.org rate limit: 10 req/min on free tier
let requestsAvailableThisMinute = 10;
let throttleResetMs = null;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

client.interceptors.response.use(
  (response) => {
    // Inspect rate-limit headers on every successful response
    const available = response.headers['x-requests-available-minute'];
    const counterReset = response.headers['x-requestcounter-reset'];
    if (available !== undefined) requestsAvailableThisMinute = parseInt(available, 10);
    if (counterReset !== undefined) throttleResetMs = parseInt(counterReset, 10) * 1000;
    return response;
  },
  async (error) => {
    if (error.response?.status === 429) {
      // Rate limited — wait for the counter reset window then retry once
      const waitMs = throttleResetMs ?? 60000;
      console.warn(`football-data.org rate limited. Retrying after ${waitMs}ms…`);
      await sleep(waitMs);
      return client.request(error.config);
    }
    console.error('Football Data API error:', error.response?.status, error.message);
    return Promise.reject(error);
  }
);

// Pre-request: if we're out of quota, wait before sending
client.interceptors.request.use(async (config) => {
  if (requestsAvailableThisMinute <= 0 && throttleResetMs) {
    console.warn(`Quota exhausted — waiting ${throttleResetMs}ms before next request`);
    await sleep(throttleResetMs);
    requestsAvailableThisMinute = 10;
  }
  requestsAvailableThisMinute = Math.max(0, requestsAvailableThisMinute - 1);
  return config;
});

export const footballDataApi = {
  getCompetition: () => client.get('/competitions/WC'),
  getMatches: (params = {}) => client.get('/competitions/WC/matches', { params }),
  getTeams: () => client.get('/competitions/WC/teams'),
  getStandings: () => client.get('/competitions/WC/standings'),
  getMatch: (id) => client.get(`/matches/${id}`),
  getTeam: (id) => client.get(`/teams/${id}`),
  getTeamMatches: (id, params = {}) => client.get(`/teams/${id}/matches`, { params }),
  getPersonMatches: (id, params = {}) => client.get(`/persons/${id}/matches`, { params }),
};

export default footballDataApi;
