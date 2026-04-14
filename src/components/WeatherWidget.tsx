'use client';

import { useEffect, useState } from 'react';

// WMO天気コードを日本語に変換
function describeWeather(code: number): { text: string; emoji: string } {
  if (code === 0)         return { text: '快晴',     emoji: '☀️' };
  if (code <= 2)          return { text: '晴れ',     emoji: '🌤️' };
  if (code <= 3)          return { text: '曇り',     emoji: '☁️' };
  if (code <= 48)         return { text: '霧',       emoji: '🌫️' };
  if (code <= 57)         return { text: '霧雨',     emoji: '🌦️' };
  if (code <= 67)         return { text: '雨',       emoji: '🌧️' };
  if (code <= 77)         return { text: '雪',       emoji: '❄️' };
  if (code <= 82)         return { text: 'にわか雨', emoji: '🌦️' };
  if (code <= 86)         return { text: '吹雪',     emoji: '🌨️' };
  if (code <= 99)         return { text: '雷雨',     emoji: '⛈️' };
  return { text: '不明', emoji: '🌡️' };
}

interface WeatherData {
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  code: number;
}

// 福山市の緯度・経度
const FUKUYAMA_LAT = 34.4858;
const FUKUYAMA_LON = 133.3625;

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${FUKUYAMA_LAT}&longitude=${FUKUYAMA_LON}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code&timezone=Asia/Tokyo&forecast_days=1`;
    fetch(url)
      .then(r => r.json())
      .then(data => {
        const c = data.current;
        setWeather({
          temp: Math.round(c.temperature_2m),
          feelsLike: Math.round(c.apparent_temperature),
          humidity: c.relative_humidity_2m,
          windSpeed: Math.round(c.wind_speed_10m),
          code: c.weather_code,
        });
      })
      .catch(() => { /* サイレント失敗 */ })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-3 px-3 py-2 bg-sky-50 dark:bg-sky-900/20 rounded-xl animate-pulse">
        <div className="w-8 h-8 bg-sky-200 dark:bg-sky-800 rounded-full" />
        <div className="space-y-1">
          <div className="h-3 w-16 bg-sky-200 dark:bg-sky-800 rounded" />
          <div className="h-2 w-24 bg-sky-100 dark:bg-sky-900 rounded" />
        </div>
      </div>
    );
  }

  if (!weather) return null;

  const { text, emoji } = describeWeather(weather.code);

  return (
    <div className="flex items-center gap-3 px-3 py-2.5 bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 rounded-xl border border-sky-100 dark:border-sky-900/30">
      <span className="text-2xl" aria-hidden>{emoji}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-sky-800 dark:text-sky-200">{weather.temp}°C</span>
          <span className="text-xs text-sky-600 dark:text-sky-400">{text}</span>
        </div>
        <p className="text-xs text-sky-500 dark:text-sky-500">
          体感 {weather.feelsLike}° · 湿度 {weather.humidity}% · 風 {weather.windSpeed}km/h
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-xs font-semibold text-sky-700 dark:text-sky-300">福山市</p>
        <p className="text-[10px] text-sky-400">現在の天気</p>
      </div>
    </div>
  );
}
