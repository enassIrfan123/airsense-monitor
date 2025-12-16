export interface IndoorAirQuality {
  PM2_5: number;
  PM10: number;
  NO2: number;
  CO: number;
  SO2: number;
  O3: number;
  temperature: number;
  feels_like: number;
  humidity: number;
  pressure: number;
  timestamp?: number;
}

export interface OutdoorWeather {
  temp: number;
  feels_like: number;
  humidity: number;
  pressure: number;
  uvi?: number;
  clouds?: number;
  wind_speed?: number;
  weather_description?: string;
  rain_1h?: number;
  rain_3h?: number;
}

export interface OutdoorAirPollution {
  co: number;
  no2: number;
  o3: number;
  so2: number;
  pm2_5: number;
  pm10: number;
}

export interface Location {
  lat: number;
  lon: number;
  name: string;
}

export type AirQualityLevel = 'good' | 'moderate' | 'unhealthy' | 'very-unhealthy' | 'hazardous';

export interface AirQualityMetric {
  label: string;
  value: number;
  unit: string;
  level: AirQualityLevel;
}
