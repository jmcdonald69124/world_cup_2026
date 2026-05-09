import axios from 'axios';

const BASE_URL = 'https://api.the-odds-api.com/v4';
const API_KEY = import.meta.env.VITE_ODDS_API_KEY;

export const oddsApi = {
  getSports: () =>
    axios.get(`${BASE_URL}/sports`, { params: { apiKey: API_KEY } }),

  getOdds: (sport = 'soccer_fifa_world_cup', regions = 'us,uk', markets = 'h2h') =>
    axios.get(`${BASE_URL}/sports/${sport}/odds`, {
      params: { apiKey: API_KEY, regions, markets, oddsFormat: 'decimal' },
    }),

  getScores: (sport = 'soccer_fifa_world_cup') =>
    axios.get(`${BASE_URL}/sports/${sport}/scores`, { params: { apiKey: API_KEY } }),

  getEventOdds: (sport, eventId, markets = 'h2h') =>
    axios.get(`${BASE_URL}/sports/${sport}/events/${eventId}/odds`, {
      params: { apiKey: API_KEY, markets, oddsFormat: 'decimal' },
    }),
};

// Mock odds for when API key is not available
export const getMockOdds = (homeElo, awayElo) => {
  const { matchProbabilities } = require('../utils/bayesian.js');
  const probs = matchProbabilities(homeElo, awayElo);
  const margin = 1.05; // 5% bookmaker margin
  return {
    home: parseFloat((1 / probs.home / margin).toFixed(2)),
    draw: parseFloat((1 / probs.draw / margin).toFixed(2)),
    away: parseFloat((1 / probs.away / margin).toFixed(2)),
  };
};

export default oddsApi;
