"use client";

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { getWeatherIcon } from '../lib/api';

// Dynamically import Leaflet with no SSR to avoid window is not defined error
const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-blue-50 rounded-lg flex items-center justify-center">
      <p className="text-gray-500">Loading map...</p>
    </div>
  ),
});

interface WeatherMapProps {
  weatherData: any;
  location: any;
}

export default function WeatherMap({ weatherData, location }: WeatherMapProps) {
  return <LeafletMap weatherData={weatherData} location={location} />;
}
