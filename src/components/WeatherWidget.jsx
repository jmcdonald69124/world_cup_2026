import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { weatherApi, getWeatherDescription, getWeatherIcon, isGoodForFootball } from '../services/weatherApi.js';

function SkeletonBox({ className }) { return <div className={`skeleton rounded ${className}`} />; }

export default function WeatherWidget({ stadium, date }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['weather', stadium.lat, stadium.lon, date],
    queryFn: () => date ? weatherApi.getMatchWeather(stadium.lat, stadium.lon, date) : weatherApi.getCurrentWeather(stadium.lat, stadium.lon),
    staleTime: 10 * 60 * 1000, retry: 2,
  });
  if (isLoading) return (
    <div className="glass-card rounded-xl p-4 space-y-3">
      <SkeletonBox className="h-4 w-32" />
      <div className="flex gap-3"><SkeletonBox className="h-10 w-10 rounded-lg" /><div className="flex-1 space-y-2"><SkeletonBox className="h-4 w-24" /><SkeletonBox className="h-3 w-36" /></div></div>
      <div className="grid grid-cols-3 gap-2"><SkeletonBox className="h-8" /><SkeletonBox className="h-8" /><SkeletonBox className="h-8" /></div>
    </div>
  );
  if (isError) return <div className="glass-card rounded-xl p-4"><p className="text-xs text-gray-500 text-center">Weather data unavailable</p></div>;
  let weatherData = null;
  if (data) {
    if (date && data.daily) {
      const d = data.daily;
      weatherData = { tempMax: Math.round(d.temperature_2m_max[0]), tempMin: Math.round(d.temperature_2m_min[0]), windMax: Math.round(d.windspeed_10m_max[0]), precip: d.precipitation_sum[0], code: d.weathercode[0] };
    } else if (data.current_weather) {
      const cw = data.current_weather;
      weatherData = { tempMax: Math.round(cw.temperature), tempMin: Math.round(cw.temperature - 8), windMax: Math.round(cw.windspeed), precip: 0, code: cw.weathercode };
    }
  }
  if (!weatherData) return <div className="glass-card rounded-xl p-4"><p className="text-xs text-gray-500 text-center">No weather data</p></div>;
  const icon = getWeatherIcon(weatherData.code);
  const description = getWeatherDescription(weatherData.code);
  const verdict = isGoodForFootball(weatherData.tempMax, weatherData.windMax, weatherData.precip);
  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Match Weather</h4>
        <span className="text-xs text-gray-500">{stadium.city}</span>
      </div>
      <div className="flex items-center gap-3 mb-3">
        <div className="text-3xl">{icon}</div>
        <div><div className="text-xl font-bold text-white">{weatherData.tempMax}°F</div><div className="text-xs text-gray-400">{description}</div></div>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-white/5 rounded-lg p-2 text-center"><div className="text-xs text-gray-500 mb-0.5">Low</div><div className="text-sm font-semibold text-white">{weatherData.tempMin}°F</div></div>
        <div className="bg-white/5 rounded-lg p-2 text-center"><div className="text-xs text-gray-500 mb-0.5">Wind</div><div className="text-sm font-semibold text-white">{weatherData.windMax} mph</div></div>
        <div className="bg-white/5 rounded-lg p-2 text-center"><div className="text-xs text-gray-500 mb-0.5">Rain</div><div className="text-sm font-semibold text-white">{weatherData.precip.toFixed(1)}mm</div></div>
      </div>
      <div className={`text-xs font-semibold text-center py-1.5 bg-white/5 rounded-lg ${verdict.color}`}>{verdict.verdict}</div>
    </div>
  );
}
