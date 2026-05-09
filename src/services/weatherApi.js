import axios from 'axios';

const BASE_URL = 'https://api.open-meteo.com/v1';

export const weatherApi = {
  getMatchWeather: async (lat, lon, date) => {
    const response = await axios.get(`${BASE_URL}/forecast`, {
      params: {
        latitude: lat,
        longitude: lon,
        daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,weathercode',
        start_date: date,
        end_date: date,
        timezone: 'auto',
        temperature_unit: 'fahrenheit',
        windspeed_unit: 'mph',
      },
    });
    return response.data;
  },

  getCurrentWeather: async (lat, lon) => {
    const response = await axios.get(`${BASE_URL}/forecast`, {
      params: {
        latitude: lat,
        longitude: lon,
        current_weather: true,
        hourly: 'temperature_2m,precipitation_probability,windspeed_10m',
        timezone: 'auto',
        temperature_unit: 'fahrenheit',
      },
    });
    return response.data;
  },
};

export const getWeatherDescription = (code) => {
  const codes = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Icy fog',
    51: 'Light drizzle',
    53: 'Drizzle',
    55: 'Heavy drizzle',
    61: 'Light rain',
    63: 'Rain',
    65: 'Heavy rain',
    71: 'Light snow',
    73: 'Snow',
    75: 'Heavy snow',
    77: 'Snow grains',
    80: 'Rain showers',
    81: 'Heavy showers',
    82: 'Violent showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm w/ hail',
    99: 'Thunderstorm w/ heavy hail',
  };
  return codes[code] || 'Unknown';
};

export const getWeatherIcon = (code) => {
  if (code === 0 || code === 1) return '☀️';
  if (code === 2 || code === 3) return '⛅';
  if (code === 45 || code === 48) return '🌫️';
  if (code >= 51 && code <= 67) return '🌧️';
  if (code >= 71 && code <= 77) return '❄️';
  if (code >= 80 && code <= 82) return '🌦️';
  if (code >= 95) return '⛈️';
  return '🌤️';
};

export const isGoodForFootball = (tempF, windMph, precipMm) => {
  const goodTemp = tempF >= 50 && tempF <= 85;
  const goodWind = windMph < 20;
  const goodPrecip = precipMm < 2;
  if (goodTemp && goodWind && goodPrecip) return { verdict: 'Perfect conditions ✓', color: 'text-wcGreen' };
  if (!goodTemp && tempF > 85) return { verdict: 'Very hot ⚠️', color: 'text-orange-400' };
  if (!goodTemp && tempF < 50) return { verdict: 'Cold conditions 🥶', color: 'text-blue-400' };
  if (!goodWind) return { verdict: 'Windy conditions 💨', color: 'text-yellow-400' };
  if (!goodPrecip) return { verdict: 'Wet conditions 🌧️', color: 'text-blue-400' };
  return { verdict: 'Acceptable', color: 'text-gray-400' };
};

export default weatherApi;
