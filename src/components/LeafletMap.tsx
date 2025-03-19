"use client";

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getWeatherIcon } from '../lib/api';

// Fix for Leaflet marker icons in Next.js
const fixLeafletIcon = () => {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  });
};

interface LeafletMapProps {
  weatherData: any;
  location: any;
}

export default function LeafletMap({ weatherData, location }: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const weatherOverlayRef = useRef<L.LayerGroup | null>(null);
  const legendRef = useRef<L.Control | null>(null);
  const [activeOverlay, setActiveOverlay] = useState<string>('temperature');

  useEffect(() => {
    // Fix Leaflet icon issue
    fixLeafletIcon();
    
    // Initialize map if it doesn't exist yet
    if (mapRef.current && !mapInstanceRef.current) {
      const map = L.map(mapRef.current, {
        center: [51.505, -0.09],
        zoom: 5,
        layers: [
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
          })
        ]
      });
      
      // Add scale control
      L.control.scale().addTo(map);
      
      // Create layer groups
      const markersLayer = L.layerGroup().addTo(map);
      const weatherOverlay = L.layerGroup().addTo(map);
      
      // Add custom controls for overlay selection
      const overlayControl = L.control({ position: 'topright' });
      overlayControl.onAdd = function() {
        const div = L.DomUtil.create('div', 'overlay-control');
        div.innerHTML = `
          <div class="bg-white p-2 rounded-md shadow-md">
            <div class="text-sm font-medium mb-1">Weather Overlay</div>
            <div class="flex flex-col space-y-1">
              <button class="overlay-btn active px-2 py-1 text-xs rounded bg-blue-500 text-white" data-overlay="temperature">Temperature</button>
              <button class="overlay-btn px-2 py-1 text-xs rounded bg-gray-200" data-overlay="precipitation">Precipitation</button>
              <button class="overlay-btn px-2 py-1 text-xs rounded bg-gray-200" data-overlay="wind">Wind</button>
              <button class="overlay-btn px-2 py-1 text-xs rounded bg-gray-200" data-overlay="clouds">Cloud Cover</button>
            </div>
          </div>
        `;
        
        // Add event listeners to buttons
        setTimeout(() => {
          const buttons = div.querySelectorAll('.overlay-btn');
          buttons.forEach(button => {
            button.addEventListener('click', (e) => {
              // Update active button styling
              buttons.forEach(b => {
                b.classList.remove('active', 'bg-blue-500', 'text-white');
                b.classList.add('bg-gray-200');
              });
              (e.target as HTMLElement).classList.add('active', 'bg-blue-500', 'text-white');
              (e.target as HTMLElement).classList.remove('bg-gray-200');
              
              // Update active overlay
              const overlayType = (e.target as HTMLElement).getAttribute('data-overlay');
              if (overlayType) {
                setActiveOverlay(overlayType);
              }
            });
          });
        }, 0);
        
        return div;
      };
      overlayControl.addTo(map);
      
      // Create legend control
      const legend = L.control({ position: 'bottomright' });
      legend.onAdd = function() {
        const div = L.DomUtil.create('div', 'legend');
        div.innerHTML = createTemperatureLegend();
        return div;
      };
      legend.addTo(map);
      
      // Store references
      mapInstanceRef.current = map;
      markersLayerRef.current = markersLayer;
      weatherOverlayRef.current = weatherOverlay;
      legendRef.current = legend;
    }
    
    // Clean up on unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersLayerRef.current = null;
        weatherOverlayRef.current = null;
        legendRef.current = null;
      }
    };
  }, []);
  
  // Update legend based on active overlay
  useEffect(() => {
    if (!legendRef.current || !mapInstanceRef.current) return;
    
    const legendDiv = (legendRef.current as any).getContainer();
    
    switch (activeOverlay) {
      case 'temperature':
        legendDiv.innerHTML = createTemperatureLegend();
        break;
      case 'precipitation':
        legendDiv.innerHTML = createPrecipitationLegend();
        break;
      case 'wind':
        legendDiv.innerHTML = createWindLegend();
        break;
      case 'clouds':
        legendDiv.innerHTML = createCloudLegend();
        break;
    }
    
    // Update weather overlay
    updateWeatherOverlay();
    
  }, [activeOverlay]);
  
  // Update map when location or weather data changes
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current || !location || !weatherData) {
      return;
    }
    
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    
    // Clear existing markers
    markersLayer.clearLayers();
    
    // Get coordinates
    const { latitude, longitude, name, country } = location;
    
    // Create custom icon for the weather marker
    const weatherIcon = L.divIcon({
      className: 'weather-marker-icon',
      html: `<div class="p-2 bg-white rounded-full shadow-lg">
              <div class="text-xl font-bold">${Math.round(weatherData.current.temperature_2m)}°</div>
            </div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });
    
    // Add marker for the location
    const marker = L.marker([latitude, longitude], { icon: weatherIcon }).addTo(markersLayer);
    
    // Add popup with weather info
    marker.bindPopup(`
      <div class="weather-popup">
        <h3 class="font-bold">${name}, ${country}</h3>
        <div class="flex items-center mt-2">
          <span class="text-xl font-bold">${Math.round(weatherData.current.temperature_2m)}°C</span>
          <span class="ml-2">${weatherData.current.weather_description}</span>
        </div>
        <div class="mt-2">
          <div>Humidity: ${weatherData.current.relative_humidity_2m}%</div>
          <div>Wind: ${Math.round(weatherData.current.wind_speed_10m)} km/h</div>
        </div>
      </div>
    `).openPopup();
    
    // Pan to the location
    map.setView([latitude, longitude], 8);
    
    // Update weather overlay
    updateWeatherOverlay();
    
  }, [location, weatherData]);
  
  // Function to update weather overlay based on active overlay type
  const updateWeatherOverlay = () => {
    if (!weatherOverlayRef.current || !mapInstanceRef.current || !weatherData) return;
    
    const weatherOverlay = weatherOverlayRef.current;
    weatherOverlay.clearLayers();
    
    // Get hourly data for overlay
    const hourlyData = weatherData.hourly;
    if (!hourlyData || !hourlyData.time || hourlyData.time.length === 0) return;
    
    // Get current time index (closest to now)
    const now = new Date();
    const timeIndex = hourlyData.time.findIndex((time: string) => {
      const timeDate = new Date(time);
      return timeDate > now;
    }) - 1;
    
    if (timeIndex < 0) return;
    
    // Create grid of points for overlay
    const { latitude, longitude } = location;
    const gridSize = 0.5; // Grid size in degrees
    const gridPoints = [];
    
    for (let lat = latitude - 2; lat <= latitude + 2; lat += gridSize) {
      for (let lng = longitude - 2; lng <= longitude + 2; lng += gridSize) {
        gridPoints.push({ lat, lng });
      }
    }
    
    // Add overlay based on active type
    switch (activeOverlay) {
      case 'temperature':
        addTemperatureOverlay(gridPoints, hourlyData, timeIndex);
        break;
      case 'precipitation':
        addPrecipitationOverlay(gridPoints, hourlyData, timeIndex);
        break;
      case 'wind':
        addWindOverlay(gridPoints, hourlyData, timeIndex);
        break;
      case 'clouds':
        addCloudOverlay(gridPoints, hourlyData, timeIndex);
        break;
    }
  };
  
  // Add temperature overlay
  const addTemperatureOverlay = (gridPoints: any[], hourlyData: any, timeIndex: number) => {
    if (!weatherOverlayRef.current) return;
    
    const weatherOverlay = weatherOverlayRef.current;
    const baseTemp = hourlyData.temperature_2m[timeIndex];
    
    gridPoints.forEach((point, index) => {
      // Simulate temperature variation based on distance from center
      const distFactor = Math.sqrt(
        Math.pow(point.lat - location.latitude, 2) + 
        Math.pow(point.lng - location.longitude, 2)
      );
      
      // Random variation with distance factor
      const variation = (Math.random() * 2 - 1) * (distFactor * 3);
      const temp = baseTemp + variation;
      
      // Create circle with color based on temperature
      const circle = L.circle([point.lat, point.lng], {
        color: getTemperatureColor(temp),
        fillColor: getTemperatureColor(temp),
        fillOpacity: 0.5,
        radius: 15000,
      }).addTo(weatherOverlay);
      
      // Add popup with temperature info
      circle.bindPopup(`Temperature: ${Math.round(temp)}°C`);
    });
  };
  
  // Add precipitation overlay
  const addPrecipitationOverlay = (gridPoints: any[], hourlyData: any, timeIndex: number) => {
    if (!weatherOverlayRef.current) return;
    
    const weatherOverlay = weatherOverlayRef.current;
    const basePrecip = hourlyData.precipitation ? hourlyData.precipitation[timeIndex] : 0;
    
    gridPoints.forEach((point, index) => {
      // Simulate precipitation variation
      const distFactor = Math.sqrt(
        Math.pow(point.lat - location.latitude, 2) + 
        Math.pow(point.lng - location.longitude, 2)
      );
      
      // Random variation with distance factor
      const variation = (Math.random() * 2 - 1) * (distFactor * 2);
      const precip = Math.max(0, basePrecip + variation);
      
      // Create circle with color based on precipitation
      const circle = L.circle([point.lat, point.lng], {
        color: getPrecipitationColor(precip),
        fillColor: getPrecipitationColor(precip),
        fillOpacity: 0.5,
        radius: 15000,
      }).addTo(weatherOverlay);
      
      // Add popup with precipitation info
      circle.bindPopup(`Precipitation: ${precip.toFixed(1)} mm`);
    });
  };
  
  // Add wind overlay
  const addWindOverlay = (gridPoints: any[], hourlyData: any, timeIndex: number) => {
    if (!weatherOverlayRef.current) return;
    
    const weatherOverlay = weatherOverlayRef.current;
    const baseWindSpeed = hourlyData.wind_speed_10m ? hourlyData.wind_speed_10m[timeIndex] : 0;
    const baseWindDir = hourlyData.wind_direction_10m ? hourlyData.wind_direction_10m[timeIndex] : 0;
    
    gridPoints.forEach((point, index) => {
      // Simulate wind variation
      const distFactor = Math.sqrt(
        Math.pow(point.lat - location.latitude, 2) + 
        Math.pow(point.lng - location.longitude, 2)
      );
      
      // Random variation with distance factor
      const speedVariation = (Math.random() * 2 - 1) * (distFactor * 5);
      const dirVariation = (Math.random() * 2 - 1) * (distFactor * 20);
      
      const windSpeed = Math.max(0, baseWindSpeed + speedVariation);
      const windDir = (baseWindDir + dirVariation) % 360;
      
      // Create wind arrow
      const arrowIcon = L.divIcon({
        className: 'wind-arrow-icon',
        html: `<div class="wind-arrow" style="transform: rotate(${windDir}deg); color: ${getWindColor(windSpeed)};">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L9 9h6L12 2zm0 20l3-7H9l3 7z"/>
                </svg>
              </div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });
      
      const marker = L.marker([point.lat, point.lng], { icon: arrowIcon }).addTo(weatherOverlay);
      
      // Add popup with wind info
      marker.bindPopup(`Wind: ${Math.round(windSpeed)} km/h, Direction: ${Math.round(windDir)}°`);
    });
  };
  
  // Add cloud cover overlay
  const addCloudOverlay = (gridPoints: any[], hourlyData: any, timeIndex: number) => {
    if (!weatherOverlayRef.current) return;
    
    const weatherOverlay = weatherOverlayRef.current;
    const baseCloudCover = hourlyData.cloud_cover ? hourlyData.cloud_cover[timeIndex] : 0;
    
    gridPoints.forEach((point, index) => {
      // Simulate cloud cover variation
      const distFactor = Math.sqrt(
        Math.pow(point.lat - location.latitude, 2) + 
        Math.pow(point.lng - location.longitude, 2)
      );
      
      // Random variation with distance factor
      const variation = (Math.random() * 2 - 1) * (distFactor * 15);
      const cloudCover = Math.max(0, Math.min(100, baseCloudCover + variation));
      
      // Create circle with color based on cloud cover
      const circle = L.circle([point.lat, point.lng], {
        color: getCloudColor(cloudCover),
        fillColor: getCloudColor(cloudCover),
        fillOpacity: 0.5,
        radius: 15000,
      }).addTo(weatherOverlay);
      
      // Add popup with cloud cover info
      circle.bindPopup(`Cloud Cover: ${Math.round(cloudCover)}%`);
    });
  };
  
  // Helper functions for color scales
  const getTemperatureColor = (temp: number): string => {
    if (temp <= -10) return '#9f7aea';
    if (temp <= 0) return '#7f9cf5';
    if (temp <= 10) return '#63b3ed';
    if (temp <= 20) return '#4fd1c5';
    if (temp <= 25) return '#68d391';
    if (temp <= 30) return '#f6e05e';
    if (temp <= 35) return '#f6ad55';
    return '#f56565';
  };
  
  const getPrecipitationColor = (precip: number): string => {
    if (precip === 0) return '#f7fafc';
    if (precip < 0.5) return '#e6fffa';
    if (precip < 1) return '#b2f5ea';
    if (precip < 2) return '#81e6d9';
    if (precip < 4) return '#4fd1c5';
    if (precip < 8) return '#38b2ac';
    if (precip < 12) return '#319795';
    if (precip < 20) return '#2c7a7b';
    return '#285e61';
  };
  
  const getWindColor = (speed: number): string => {
    if (speed < 5) return '#a0aec0';
    if (speed < 10) return '#718096';
    if (speed < 20) return '#4a5568';
    if (speed < 30) return '#2d3748';
    if (speed < 40) return '#1a202c';
    return '#000000';
  };
  
  const getCloudColor = (cover: number): string => {
    if (cover < 10) return '#f7fafc';
    if (cover < 25) return '#edf2f7';
    if (cover < 50) return '#e2e8f0';
    if (cover < 75) return '#cbd5e0';
    if (cover < 90) return '#a0aec0';
    return '#718096';
  };
  
  // Create legend HTML
  const createTemperatureLegend = (): string => {
    return `
      <div class="bg-white p-2 rounded-md shadow-md">
        <div class="text-sm font-medium mb-1">Temperature (°C)</div>
        <div class="grid grid-cols-2 gap-1 text-xs">
          <div class="flex items-center"><div class="w-4 h-4 mr-1" style="background-color: #9f7aea;"></div> ≤ -10</div>
          <div class="flex items-center"><div class="w-4 h-4 mr-1" style="background-color: #7f9cf5;"></div> -10 to 0</div>
          <div class="flex items-center"><div class="w-4 h-4 mr-1" style="background-color: #63b3ed;"></div> 0 to 10</div>
          <div class="flex items-center"><div class="w-4 h-4 mr-1" style="background-color: #4fd1c5;"></div> 10 to 20</div>
          <div class="flex items-center"><div class="w-4 h-4 mr-1" style="background-color: #68d391;"></div> 20 to 25</div>
          <div class="flex items-center"><div class="w-4 h-4 mr-1" style="background-color: #f6e05e;"></div> 25 to 30</div>
          <div class="flex items-center"><div class="w-4 h-4 mr-1" style="background-color: #f6ad55;"></div> 30 to 35</div>
          <div class="flex items-center"><div class="w-4 h-4 mr-1" style="background-color: #f56565;"></div> > 35</div>
        </div>
      </div>
    `;
  };
  
  const createPrecipitationLegend = (): string => {
    return `
      <div class="bg-white p-2 rounded-md shadow-md">
        <div class="text-sm font-medium mb-1">Precipitation (mm)</div>
        <div class="grid grid-cols-2 gap-1 text-xs">
          <div class="flex items-center"><div class="w-4 h-4 mr-1" style="background-color: #f7fafc;"></div> 0</div>
          <div class="flex items-center"><div class="w-4 h-4 mr-1" style="background-color: #b2f5ea;"></div> 0.5 to 1</div>
          <div class="flex items-center"><div class="w-4 h-4 mr-1" style="background-color: #81e6d9;"></div> 1 to 2</div>
          <div class="flex items-center"><div class="w-4 h-4 mr-1" style="background-color: #4fd1c5;"></div> 2 to 4</div>
          <div class="flex items-center"><div class="w-4 h-4 mr-1" style="background-color: #38b2ac;"></div> 4 to 8</div>
          <div class="flex items-center"><div class="w-4 h-4 mr-1" style="background-color: #319795;"></div> 8 to 12</div>
          <div class="flex items-center"><div class="w-4 h-4 mr-1" style="background-color: #2c7a7b;"></div> 12 to 20</div>
          <div class="flex items-center"><div class="w-4 h-4 mr-1" style="background-color: #285e61;"></div> > 20</div>
        </div>
      </div>
    `;
  };
  
  const createWindLegend = (): string => {
    return `
      <div class="bg-white p-2 rounded-md shadow-md">
        <div class="text-sm font-medium mb-1">Wind Speed (km/h)</div>
        <div class="grid grid-cols-2 gap-1 text-xs">
          <div class="flex items-center"><div class="w-4 h-4 mr-1" style="background-color: #a0aec0;"></div> < 5</div>
          <div class="flex items-center"><div class="w-4 h-4 mr-1" style="background-color: #718096;"></div> 5 to 10</div>
          <div class="flex items-center"><div class="w-4 h-4 mr-1" style="background-color: #4a5568;"></div> 10 to 20</div>
          <div class="flex items-center"><div class="w-4 h-4 mr-1" style="background-color: #2d3748;"></div> 20 to 30</div>
          <div class="flex items-center"><div class="w-4 h-4 mr-1" style="background-color: #1a202c;"></div> 30 to 40</div>
          <div class="flex items-center"><div class="w-4 h-4 mr-1" style="background-color: #000000;"></div> > 40</div>
        </div>
      </div>
    `;
  };
  
  const createCloudLegend = (): string => {
    return `
      <div class="bg-white p-2 rounded-md shadow-md">
        <div class="text-sm font-medium mb-1">Cloud Cover (%)</div>
        <div class="grid grid-cols-2 gap-1 text-xs">
          <div class="flex items-center"><div class="w-4 h-4 mr-1" style="background-color: #f7fafc;"></div> < 10</div>
          <div class="flex items-center"><div class="w-4 h-4 mr-1" style="background-color: #edf2f7;"></div> 10 to 25</div>
          <div class="flex items-center"><div class="w-4 h-4 mr-1" style="background-color: #e2e8f0;"></div> 25 to 50</div>
          <div class="flex items-center"><div class="w-4 h-4 mr-1" style="background-color: #cbd5e0;"></div> 50 to 75</div>
          <div class="flex items-center"><div class="w-4 h-4 mr-1" style="background-color: #a0aec0;"></div> 75 to 90</div>
          <div class="flex items-center"><div class="w-4 h-4 mr-1" style="background-color: #718096;"></div> > 90</div>
        </div>
      </div>
    `;
  };
  
  return (
    <div className="h-full w-full">
      <div ref={mapRef} className="map-container" />
      <style jsx global>{`
        .wind-arrow {
          display: inline-block;
          transform-origin: center;
        }
        .overlay-control button.active {
          font-weight: bold;
        }
      `}</style>
    </div>
  );
}
