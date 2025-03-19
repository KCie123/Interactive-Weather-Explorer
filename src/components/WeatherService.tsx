"use client";

import { useState, useEffect } from 'react';
import { geocodeLocation, getCurrentWeather, getHourlyForecast, getDailyForecast, getWeatherDescription, getWeatherIcon } from '../lib/api';

interface WeatherServiceProps {
  onWeatherDataLoaded: (data: any) => void;
  onLocationChange: (location: any) => void;
  initialLocation?: string;
}

export default function WeatherService({ 
  onWeatherDataLoaded, 
  onLocationChange,
  initialLocation = 'London'
}: WeatherServiceProps) {
  const [searchQuery, setSearchQuery] = useState(initialLocation);
  const [locations, setLocations] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search for locations based on query
  const searchLocations = async (query: string) => {
    if (!query.trim()) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const geocodingResult = await geocodeLocation({
        name: query,
        count: 5,
      });
      
      if (geocodingResult.results && geocodingResult.results.length > 0) {
        setLocations(geocodingResult.results);
      } else {
        setLocations([]);
        setError('No locations found. Try a different search term.');
      }
    } catch (err) {
      setError('Error searching for locations. Please try again.');
      console.error('Error searching locations:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load weather data for selected location
  const loadWeatherData = async (location: any) => {
    if (!location) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const { latitude, longitude } = location;
      
      // Fetch all weather data in parallel
      const [currentData, hourlyData, dailyData] = await Promise.all([
        getCurrentWeather(latitude, longitude),
        getHourlyForecast(latitude, longitude, 3),
        getDailyForecast(latitude, longitude, 7)
      ]);
      
      // Process and enhance the data
      const enhancedCurrentData = {
        ...currentData,
        current: {
          ...currentData.current,
          weather_description: getWeatherDescription(currentData.current.weather_code),
          weather_icon: getWeatherIcon(currentData.current.weather_code, true)
        }
      };
      
      // Combine all data
      const combinedData = {
        location,
        current: enhancedCurrentData.current,
        hourly: hourlyData.hourly,
        daily: dailyData.daily
      };
      
      // Pass the data to parent component
      onWeatherDataLoaded(combinedData);
    } catch (err) {
      setError('Error loading weather data. Please try again.');
      console.error('Error loading weather data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle location selection
  const handleSelectLocation = (location: any) => {
    setSelectedLocation(location);
    onLocationChange(location);
    loadWeatherData(location);
  };

  // Initial load
  useEffect(() => {
    if (initialLocation) {
      searchLocations(initialLocation);
    }
  }, [initialLocation]);

  // Auto-select first location when results come in
  useEffect(() => {
    if (locations.length > 0 && !selectedLocation) {
      handleSelectLocation(locations[0]);
    }
  }, [locations]);

  return (
    <div className="weather-service">
      <div className="search-container">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for a location..."
          className="search-input"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              searchLocations(searchQuery);
            }
          }}
        />
        <button 
          onClick={() => searchLocations(searchQuery)}
          className="search-button"
        >
          Search
        </button>
      </div>
      
      {loading && <div className="loading">Loading...</div>}
      
      {error && <div className="error">{error}</div>}
      
      {locations.length > 0 && (
        <div className="location-results">
          <h3>Locations</h3>
          <ul>
            {locations.map((location) => (
              <li 
                key={`${location.id}-${location.name}`}
                className={selectedLocation?.id === location.id ? 'selected' : ''}
                onClick={() => handleSelectLocation(location)}
              >
                {location.name}, {location.country} 
                {location.admin1 && ` (${location.admin1})`}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
