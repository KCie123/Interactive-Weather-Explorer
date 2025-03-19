"use client";

import { useEffect, useRef } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';

interface HourlyForecastChartProps {
  hourlyData: any;
}

export default function HourlyForecastChart({ hourlyData }: HourlyForecastChartProps) {
  // Format data for the chart
  const formatChartData = () => {
    if (!hourlyData || !hourlyData.time) return [];
    
    return hourlyData.time.map((time: string, index: number) => {
      const date = new Date(time);
      const hour = date.getHours();
      const formattedHour = hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
      
      return {
        time: formattedHour,
        fullTime: time,
        temperature: hourlyData.temperature_2m[index],
        apparentTemperature: hourlyData.apparent_temperature[index],
        precipitation: hourlyData.precipitation[index],
        humidity: hourlyData.relative_humidity_2m[index],
        windSpeed: hourlyData.wind_speed_10m[index],
        cloudCover: hourlyData.cloud_cover[index],
      };
    }).slice(0, 24); // Show only next 24 hours
  };
  
  const chartData = formatChartData();
  
  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">No hourly forecast data available</p>
      </div>
    );
  }
  
  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={200}>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 12 }}
            interval={3} // Show every 3rd label to avoid crowding
          />
          <YAxis 
            yAxisId="temp"
            domain={['auto', 'auto']}
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `${value}°`}
          />
          <Tooltip 
            formatter={(value, name) => {
              if (name === 'Temperature') return [`${value}°C`, name];
              if (name === 'Feels Like') return [`${value}°C`, name];
              return [value, name];
            }}
            labelFormatter={(label, items) => {
              const item = items[0]?.payload;
              if (item) {
                const date = new Date(item.fullTime);
                return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
              }
              return label;
            }}
          />
          <Legend />
          <Line 
            yAxisId="temp"
            type="monotone" 
            dataKey="temperature" 
            name="Temperature" 
            stroke="#2563eb" 
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6 }}
          />
          <Line 
            yAxisId="temp"
            type="monotone" 
            dataKey="apparentTemperature" 
            name="Feels Like" 
            stroke="#7c3aed" 
            strokeWidth={2}
            dot={false}
            strokeDasharray="5 5"
          />
        </LineChart>
      </ResponsiveContainer>
      
      <ResponsiveContainer width="100%" height={100}>
        <AreaChart
          data={chartData}
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 10 }}
            interval={3}
            height={20}
          />
          <YAxis 
            yAxisId="precip"
            orientation="right"
            domain={[0, 'auto']}
            tick={{ fontSize: 10 }}
            tickFormatter={(value) => `${value} mm`}
          />
          <Tooltip 
            formatter={(value, name) => {
              if (name === 'Precipitation') return [`${value} mm`, name];
              return [value, name];
            }}
          />
          <Area
            yAxisId="precip"
            type="monotone"
            dataKey="precipitation"
            name="Precipitation"
            fill="#60a5fa"
            stroke="#3b82f6"
            fillOpacity={0.5}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
