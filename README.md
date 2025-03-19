# Interactive Weather Explorer

This project is a **Next.js-based Weather Application** that provides users with detailed weather information, interactive maps, and visualizations. It allows users to search for locations worldwide and view comprehensive weather data including current conditions, hourly forecasts, daily forecasts, and specialized weather maps with different layers. The project is designed with a focus on visual presentation and user experience, utilizing modern React components and data visualization libraries.

## Project Description

The **Interactive Weather Explorer** application is built to provide users with an immersive weather-viewing experience. It combines clean UI design with powerful data visualization to deliver weather information in an intuitive way.

### Key Features:
- **Location Search:** Users can search for any location worldwide with geocoding functionality.
- **Current Weather Display:** Shows detailed information about current weather conditions including temperature, humidity, wind, pressure, and cloud cover.
- **Interactive Weather Map:** Features a Leaflet-based map with selectable weather layers (Temperature, Precipitation, Wind, Clouds).
- **Hourly Forecast:** Visualizes temperature and precipitation predictions for the next 24 hours.
- **Daily Forecast:** Displays high/low temperatures and precipitation for the upcoming week.
- **Responsive Design:** The application is fully responsive, adapting to different screen sizes for optimal viewing on desktop, tablet, and mobile devices.
- **Weather Icons and Descriptions:** Uses weather codes to provide descriptive text and appropriate icons based on conditions.

## Technologies Used:
- **Next.js:** React framework for server-rendered applications.
- **React:** Used for building the user interface and managing component state.
- **Tailwind CSS:** Utility-first CSS framework for styling components.
- **Recharts:** Charting library for creating interactive visualizations.
- **Leaflet:** JavaScript library for interactive maps.
- **Axios:** Promise-based HTTP client for API requests.
- **Open-Meteo API:** Free weather API for retrieving forecast data.
- **TypeScript:** For type safety and improved developer experience.

## How to Install and Run the Project

### Prerequisites
- **Node.js** (version 14.x or higher)
- **npm** or **yarn** (for managing dependencies)

### Steps
1. Clone the Repository:
   ```bash
   git clone https://github.com/yourusername/interactive-weather-explorer.git
   cd interactive-weather-explorer
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```
   
3. Run the development server:
    ```bash
    npm run dev
    # or
    yarn dev
    ```

4. Open your browser and navigate to http://localhost:3000.

## Project Structure

```
interactive-weather-explorer/
│
├── app/                       # Next.js app directory
│   ├── globals.css            # Global styles with Tailwind directives
│   ├── layout.tsx             # Root layout component
│   └── page.tsx               # Home page component
│
├── components/                # React components
│   ├── DailyForecastChart.tsx # Component for daily forecast visualization
│   ├── HourlyForecastChart.tsx # Component for hourly forecast visualization
│   ├── LeafletMap.tsx         # Component for interactive map with Leaflet
│   ├── WeatherMap.tsx         # Wrapper for dynamic import of Leaflet
│   └── WeatherService.tsx     # Component for location search and weather fetching
│
├── lib/                       # Utility functions and API clients
│   ├── api.ts                 # API functions for Open-Meteo
│   └── utils.ts               # Utility functions
│
├── public/                    # Static assets
│
└── next.config.js             # Next.js configuration
```

## Component Descriptions

### `page.tsx`
- **Serves as the main page** of the application, bringing together all components.
- **Manages the state** for weather data and selected location.
- **Components:**
  - **WeatherService:** Handles location search and weather data fetching.
  - **WeatherMap:** Displays interactive map with weather data overlays.
  - **HourlyForecastChart:** Visualizes hourly weather forecast.
  - **DailyForecastChart:** Visualizes daily weather forecast.
- **Key State:**
  - `weatherData`: Stores all weather information for the current location.
  - `selectedLocation`: Stores information about the currently selected location.
- **Key Functions:**
  - `handleWeatherDataLoaded(data)`: Updates state when new weather data is loaded.
  - `handleLocationChange(location)`: Updates state when a new location is selected.

### `WeatherService.tsx`
- **Props:**
  - `onWeatherDataLoaded`: Callback function when weather data is fetched.
  - `onLocationChange`: Callback function when location changes.
  - `initialLocation`: Default location to load on startup.
- **Handles location search** and API calls to fetch weather data.
- **Maintains own state** for search query, location results, selected location, loading, and error states.
- **Key Functions:**
  - `searchLocations(query)`: Searches for locations based on user input.
  - `loadWeatherData(location)`: Fetches current, hourly, and daily weather data.
  - `handleSelectLocation(location)`: Sets the selected location and loads its weather data.

### `WeatherMap.tsx`
- **Props:**
  - `weatherData`: Current weather data for display.
  - `location`: Selected location information.
- **Uses dynamic import** for Leaflet to avoid SSR issues with window objects.
- **Serves as a wrapper** around the LeafletMap component to ensure proper client-side rendering.

### `LeafletMap.tsx`
- **Props:**
  - `weatherData`: Current weather data for display.
  - `location`: Selected location information.
- **Creates an interactive map** using Leaflet.
- **Provides weather overlays** for temperature, precipitation, wind, and cloud cover.
- **Maintains state** for the active overlay type.
- **Key Functions:**
  - `updateWeatherOverlay()`: Updates the map visualization based on the selected overlay type.
  - Various helper functions for creating legends and color scales for different weather parameters.

### `HourlyForecastChart.tsx`
- **Props:**
  - `hourlyData`: Hourly forecast data from the API.
- **Creates visualizations** for hourly temperature and precipitation forecasts.
- **Uses Recharts** for creating interactive line and area charts.
- **Key Function:**
  - `formatChartData()`: Processes the raw API data into a format suitable for the charts.

### `DailyForecastChart.tsx`
- **Props:**
  - `dailyData`: Daily forecast data from the API.
- **Creates visualizations** for daily high/low temperatures and precipitation forecasts.
- **Uses Recharts** for creating interactive bar charts.
- **Includes custom tooltip** for detailed information on hover.
- **Key Function:**
  - `formatChartData()`: Processes the raw API data into a format suitable for the charts.

### `api.ts`
- **Provides functions** for interacting with the Open-Meteo weather API.
- **Key Functions:**
  - `getForecast(params)`: Base function for fetching weather forecast data.
  - `geocodeLocation(params)`: Converts location name to geographic coordinates.
  - `getCurrentWeather(latitude, longitude)`: Fetches current weather conditions.
  - `getHourlyForecast(latitude, longitude, days)`: Fetches hourly weather forecast.
  - `getDailyForecast(latitude, longitude, days)`: Fetches daily weather forecast.
  - `getWeatherDescription(code)`: Converts weather codes to human-readable descriptions.
  - `getWeatherIcon(code, isDay)`: Returns appropriate icon for weather conditions.

### CSS Styles

#### `globals.css`
- **Includes Tailwind directives** for the utility-first styling approach.
- **Defines custom variables** for colors and backgrounds.
- **Contains custom component classes** for weather service, maps, charts, and cards.
- **Implements custom scrollbar** styling for better user experience.

## Features in Detail

### Weather Data Visualization
The application provides multiple ways to visualize weather data:
- **Current weather card** with temperature, feels-like temperature, and additional metrics
- **Interactive map** with selectable weather data layers (temperature, precipitation, wind, clouds)
- **Hourly forecast chart** showing temperature trends and precipitation amounts for the next 24 hours
- **Daily forecast chart** displaying high/low temperatures and precipitation for the coming week
- **Daily forecast cards** summarizing each day's conditions at a glance

### Location Search
The app includes a robust location search feature that:
- Allows users to search for any location worldwide
- Displays multiple results when location names are ambiguous
- Provides location details including country and administrative region
- Automatically selects the first result on search
- Shows clear error messages if search fails or returns no results

### Weather Map Overlays
The interactive map includes several overlay options:
- **Temperature layer:** Color-coded visualization of temperature variations
- **Precipitation layer:** Color-coded visualization of precipitation amounts
- **Wind layer:** Directional arrows showing wind speed and direction
- **Cloud cover layer:** Color-coded visualization of cloud coverage percentages

Each overlay includes a dynamic legend that updates based on the selected data type, providing users with context for interpreting the map colors and symbols.
