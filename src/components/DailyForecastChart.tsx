"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getWeatherDescription, getWeatherIcon } from '../lib/api';

interface DailyForecastChartProps {
  dailyData: any;
}

export default function DailyForecastChart({ dailyData }: DailyForecastChartProps) {
  // Format data for the chart
  const formatChartData = () => {
    if (!dailyData || !dailyData.time) return [];
    
    return dailyData.time.map((time: string, index: number) => {
      const date = new Date(time);
      const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date);
      const formattedDate = `${dayName} ${date.getDate()}`;
      
      return {
        date: formattedDate,
        fullDate: time,
        tempMax: dailyData.temperature_2m_max[index],
        tempMin: dailyData.temperature_2m_min[index],
        precipitation: dailyData.precipitation_sum ? dailyData.precipitation_sum[index] : 0,
        weatherCode: dailyData.weather_code ? dailyData.weather_code[index] : 0,
        weatherDescription: dailyData.weather_code ? getWeatherDescription(dailyData.weather_code[index]) : '',
        precipitationProbability: dailyData.precipitation_probability_max ? dailyData.precipitation_probability_max[index] : 0,
        windSpeed: dailyData.wind_speed_10m_max ? dailyData.wind_speed_10m_max[index] : 0,
      };
    });
  };
  
  const chartData = formatChartData();
  
  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">No daily forecast data available</p>
      </div>
    );
  }
  
  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
          <p className="font-medium">{new Date(data.fullDate).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</p>
          <p className="text-sm text-gray-600">{data.weatherDescription}</p>
          <div className="flex justify-between gap-4 mt-2">
            <div>
              <p className="text-xs text-gray-500">High</p>
              <p className="font-medium">{Math.round(data.tempMax)}°C</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Low</p>
              <p className="font-medium">{Math.round(data.tempMin)}°C</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Precip</p>
              <p className="font-medium">{data.precipitation} mm</p>
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xs text-gray-500">Chance of Rain: {data.precipitationProbability}%</p>
            <p className="text-xs text-gray-500">Wind: {Math.round(data.windSpeed)} km/h</p>
          </div>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            yAxisId="temp"
            domain={['auto', 'auto']}
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `${value}°`}
          />
          <YAxis 
            yAxisId="precip"
            orientation="right"
            domain={[0, 'auto']}
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `${value} mm`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar 
            yAxisId="temp"
            dataKey="tempMax" 
            name="High" 
            fill="#f97316" 
            radius={[4, 4, 0, 0]}
          />
          <Bar 
            yAxisId="temp"
            dataKey="tempMin" 
            name="Low" 
            fill="#3b82f6" 
            radius={[4, 4, 0, 0]}
          />
          <Bar 
            yAxisId="precip"
            dataKey="precipitation" 
            name="Precipitation" 
            fill="#60a5fa" 
            radius={[4, 4, 0, 0]}
            fillOpacity={0.6}
          />
        </BarChart>
      </ResponsiveContainer>
      
      {/* Daily forecast cards */}
      <div className="mt-4 grid grid-cols-7 gap-2">
        {chartData.map((day, index) => (
          <div key={index} className="daily-forecast-card text-center p-2 bg-blue-50 rounded-lg">
            <div className="text-sm font-medium">{day.date}</div>
            <div className="text-xs mt-1">{day.weatherDescription}</div>
            <div className="flex justify-between text-xs mt-1">
              <span className="text-red-500">{Math.round(day.tempMax)}°</span>
              <span className="text-blue-500">{Math.round(day.tempMin)}°</span>
            </div>
            <div className="text-xs mt-1 text-blue-600">{day.precipitation > 0 ? `${day.precipitation} mm` : '-'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
