"use client";

import { useState } from 'react';
import { Inter } from 'next/font/google';
import WeatherService from '../components/WeatherService';
import WeatherMap from '../components/WeatherMap';
import HourlyForecastChart from '../components/HourlyForecastChart';
import DailyForecastChart from '../components/DailyForecastChart';

const inter = Inter({ subsets: ['latin'] });

export default function Home() {
  const [weatherData, setWeatherData] = useState<any>(null);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);

  const handleWeatherDataLoaded = (data: any) => {
    setWeatherData(data);
  };

  const handleLocationChange = (location: any) => {
    setSelectedLocation(location);
  };

  return (
    <main className={`min-h-screen p-4 md:p-8 ${inter.className}`}>
      <div className="container mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            Interactive Weather Explorer
          </h1>
          <p className="text-center text-gray-600 mt-2">
            Discover detailed weather information with interactive maps and visualizations
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar with search and basic info */}
          <div className="lg:col-span-4 bg-white rounded-xl shadow-lg p-4">
            <WeatherService 
              onWeatherDataLoaded={handleWeatherDataLoaded}
              onLocationChange={handleLocationChange}
              initialLocation="London"
            />
            
            {weatherData && weatherData.current && (
              <div className="current-weather mt-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg">
                <h2 className="text-xl font-semibold mb-2">
                  {selectedLocation?.name}, {selectedLocation?.country}
                </h2>
                <div className="flex items-center justify-between">
                  <div className="text-5xl font-bold text-blue-700">
                    {Math.round(weatherData.current.temperature_2m)}°
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-medium">
                      {weatherData.current.weather_description}
                    </div>
                    <div className="text-sm text-gray-600">
                      Feels like {Math.round(weatherData.current.apparent_temperature)}°
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="weather-detail">
                    <span className="text-gray-500">Humidity</span>
                    <span className="font-medium">{weatherData.current.relative_humidity_2m}%</span>
                  </div>
                  <div className="weather-detail">
                    <span className="text-gray-500">Wind</span>
                    <span className="font-medium">{Math.round(weatherData.current.wind_speed_10m)} km/h</span>
                  </div>
                  <div className="weather-detail">
                    <span className="text-gray-500">Pressure</span>
                    <span className="font-medium">{Math.round(weatherData.current.pressure_msl)} hPa</span>
                  </div>
                  <div className="weather-detail">
                    <span className="text-gray-500">Cloud Cover</span>
                    <span className="font-medium">{weatherData.current.cloud_cover}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Main content area for map and charts */}
          <div className="lg:col-span-8 bg-white rounded-xl shadow-lg p-4">
            <div className="h-96 bg-blue-50 rounded-lg">
              {weatherData && selectedLocation && (
                <WeatherMap 
                  weatherData={weatherData} 
                  location={selectedLocation} 
                />
              )}
            </div>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h3 className="text-lg font-medium mb-4">Hourly Forecast</h3>
                {weatherData && weatherData.hourly ? (
                  <HourlyForecastChart hourlyData={weatherData.hourly} />
                ) : (
                  <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">Loading hourly forecast data...</p>
                  </div>
                )}
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h3 className="text-lg font-medium mb-4">Daily Forecast</h3>
                {weatherData && weatherData.daily ? (
                  <DailyForecastChart dailyData={weatherData.daily} />
                ) : (
                  <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">Loading daily forecast data...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
