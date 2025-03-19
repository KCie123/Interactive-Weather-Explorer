import axios from 'axios';

// Base URL for Open-Meteo API
const OPEN_METEO_BASE_URL = 'https://api.open-meteo.com/v1';

// Interface for weather forecast parameters
interface ForecastParams {
  latitude: number;
  longitude: number;
  timezone?: string;
  current?: string[];
  hourly?: string[];
  daily?: string[];
  forecast_days?: number;
  past_days?: number;
}

// Interface for geocoding parameters
interface GeocodingParams {
  name: string;
  count?: number;
  language?: string;
  format?: 'json' | 'geojson';
}

/**
 * Fetches weather forecast data from Open-Meteo API
 * @param params - Forecast parameters
 * @returns Promise with the forecast data
 */
export const getForecast = async (params: ForecastParams) => {
  try {
    const response = await axios.get(`${OPEN_METEO_BASE_URL}/forecast`, {
      params: {
        ...params,
        current: params.current?.join(','),
        hourly: params.hourly?.join(','),
        daily: params.daily?.join(','),
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    throw error;
  }
};

/**
 * Geocodes a location name to coordinates using Open-Meteo Geocoding API
 * @param params - Geocoding parameters
 * @returns Promise with the geocoding results
 */
export const geocodeLocation = async (params: GeocodingParams) => {
  try {
    const response = await axios.get('https://geocoding-api.open-meteo.com/v1/search', {
      params,
    });
    return response.data;
  } catch (error) {
    console.error('Error geocoding location:', error);
    throw error;
  }
};

/**
 * Gets current weather for a specific location
 * @param latitude - Latitude coordinate
 * @param longitude - Longitude coordinate
 * @returns Promise with current weather data
 */
export const getCurrentWeather = async (latitude: number, longitude: number) => {
  const currentWeatherParams: ForecastParams = {
    latitude,
    longitude,
    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'precipitation',
      'rain',
      'showers',
      'snowfall',
      'weather_code',
      'cloud_cover',
      'pressure_msl',
      'surface_pressure',
      'wind_speed_10m',
      'wind_direction_10m',
      'wind_gusts_10m'
    ],
  };
  
  return getForecast(currentWeatherParams);
};

/**
 * Gets hourly weather forecast for a specific location
 * @param latitude - Latitude coordinate
 * @param longitude - Longitude coordinate
 * @param days - Number of forecast days (default: 3)
 * @returns Promise with hourly forecast data
 */
export const getHourlyForecast = async (latitude: number, longitude: number, days: number = 3) => {
  const hourlyForecastParams: ForecastParams = {
    latitude,
    longitude,
    forecast_days: days,
    hourly: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'precipitation_probability',
      'precipitation',
      'rain',
      'showers',
      'snowfall',
      'weather_code',
      'cloud_cover',
      'pressure_msl',
      'surface_pressure',
      'wind_speed_10m',
      'wind_direction_10m',
      'wind_gusts_10m'
    ],
  };
  
  return getForecast(hourlyForecastParams);
};

/**
 * Gets daily weather forecast for a specific location
 * @param latitude - Latitude coordinate
 * @param longitude - Longitude coordinate
 * @param days - Number of forecast days (default: 7)
 * @returns Promise with daily forecast data
 */
export const getDailyForecast = async (latitude: number, longitude: number, days: number = 7) => {
  const dailyForecastParams: ForecastParams = {
    latitude,
    longitude,
    forecast_days: days,
    daily: [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'apparent_temperature_max',
      'apparent_temperature_min',
      'sunrise',
      'sunset',
      'precipitation_sum',
      'rain_sum',
      'showers_sum',
      'snowfall_sum',
      'precipitation_hours',
      'precipitation_probability_max',
      'wind_speed_10m_max',
      'wind_gusts_10m_max',
      'wind_direction_10m_dominant'
    ],
  };
  
  return getForecast(dailyForecastParams);
};

/**
 * Converts weather code to human-readable description
 * @param code - WMO weather code
 * @returns Weather description
 */
export const getWeatherDescription = (code: number): string => {
  const weatherCodes: Record<number, string> = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    56: 'Light freezing drizzle',
    57: 'Dense freezing drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Light freezing rain',
    67: 'Heavy freezing rain',
    71: 'Slight snow fall',
    73: 'Moderate snow fall',
    75: 'Heavy snow fall',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail',
  };
  
  return weatherCodes[code] || 'Unknown';
};

/**
 * Gets weather icon based on weather code and is_day flag
 * @param code - WMO weather code
 * @param isDay - Whether it's daytime (true) or nighttime (false)
 * @returns Icon name/class
 */
export const getWeatherIcon = (code: number, isDay: boolean = true): string => {
  // This function would return appropriate icon names/classes
  // based on the weather code and time of day
  // Could be used with icon libraries like Lucide, Font Awesome, etc.
  
  if (code === 0) return isDay ? 'sun' : 'moon';
  if (code === 1) return isDay ? 'sun-dim' : 'moon';
  if (code === 2) return isDay ? 'cloud-sun' : 'cloud-moon';
  if (code === 3) return 'cloud';
  if (code === 45 || code === 48) return 'cloud-fog';
  if (code >= 51 && code <= 57) return 'cloud-drizzle';
  if (code >= 61 && code <= 67) return 'cloud-rain';
  if (code >= 71 && code <= 77) return 'cloud-snow';
  if (code >= 80 && code <= 82) return 'cloud-rain';
  if (code >= 85 && code <= 86) return 'cloud-snow';
  if (code >= 95) return 'cloud-lightning';
  
  return 'help-circle'; // Fallback icon
};
