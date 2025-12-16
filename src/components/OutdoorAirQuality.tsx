import { useOutdoorData } from '@/hooks/useOutdoorData';
import { MetricCard } from './MetricCard';
import { AirQualityMetric } from '@/types/airQuality';
import {
  getPM25Level,
  getPM10Level,
  getCOLevel,
  getNO2Level,
  getSO2Level,
  getO3Level,
  calculateAQI,
  getAQIDescription,
  getAQIStyles,
} from '@/utils/airQualityCalculations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cloud, AlertCircle, Loader2, Thermometer, Droplets, Gauge, Activity } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface OutdoorAirQualityProps {
  lat: number;
  lon: number;
  locationName: string;
}

export function OutdoorAirQuality({ lat, lon, locationName }: OutdoorAirQualityProps) {
  const { data, isLoading, error } = useOutdoorData(lat, lon);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Outdoor Conditions - {locationName}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Outdoor Conditions - {locationName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load outdoor data. Please check your internet connection or try a different location.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  // Calculate AQI
  const aqiResult = calculateAQI(
    data.airPollution.pm2_5,
    data.airPollution.pm10,
    data.airPollution.co / 1000, // Convert from µg/m³ to ppm
    data.airPollution.no2,
    data.airPollution.so2,
    data.airPollution.o3
  );

  const airQualityMetrics: AirQualityMetric[] = [
    {
      label: 'PM2.5',
      value: data.airPollution.pm2_5,
      unit: 'µg/m³',
      level: getPM25Level(data.airPollution.pm2_5),
    },
    {
      label: 'PM10',
      value: data.airPollution.pm10,
      unit: 'µg/m³',
      level: getPM10Level(data.airPollution.pm10),
    },
    {
      label: 'NO₂',
      value: data.airPollution.no2,
      unit: 'ppb',
      level: getNO2Level(data.airPollution.no2),
    },
    {
      label: 'CO',
      value: data.airPollution.co / 1000,
      unit: 'ppm',
      level: getCOLevel(data.airPollution.co / 1000),
    },
    {
      label: 'SO₂',
      value: data.airPollution.so2,
      unit: 'ppb',
      level: getSO2Level(data.airPollution.so2),
    },
    {
      label: 'O₃',
      value: data.airPollution.o3,
      unit: 'ppb',
      level: getO3Level(data.airPollution.o3),
    },
  ];

  return (
    <Card className="border-2">
      <CardHeader className="bg-gradient-to-r from-accent/10 to-primary/10">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Cloud className="h-6 w-6 text-accent" />
          Outdoor Conditions - {locationName}
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Weather and air quality from OpenWeatherMap
        </p>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* AQI Display */}
        {(() => {
          const styles = getAQIStyles(aqiResult.level);
          return (
            <div className={`p-4 rounded-lg ${styles.bg} border ${styles.border}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Activity className={`h-8 w-8 ${styles.text}`} />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Air Quality Index (AQI)</p>
                    <p className={`text-3xl font-bold ${styles.text}`}>
                      {aqiResult.aqi}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-semibold capitalize ${styles.text}`}>
                    {aqiResult.level.replace('-', ' ')}
                  </p>
                  <p className="text-xs text-muted-foreground">{getAQIDescription(aqiResult.aqi)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Dominant: {aqiResult.dominantPollutant}</p>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Weather Information */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-4 border-b">
          <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
            <Thermometer className="h-8 w-8 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Temperature</p>
              <p className="text-2xl font-bold">{data.weather.temp?.toFixed(1) ?? 'N/A'}°C</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
            <Thermometer className="h-8 w-8 text-accent" />
            <div>
              <p className="text-xs text-muted-foreground">Feels Like</p>
              <p className="text-2xl font-bold">{data.weather.feels_like?.toFixed(1) ?? 'N/A'}°C</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
            <Droplets className="h-8 w-8 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Humidity</p>
              <p className="text-2xl font-bold">{data.weather.humidity}%</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
            <Gauge className="h-8 w-8 text-accent" />
            <div>
              <p className="text-xs text-muted-foreground">Pressure</p>
              <p className="text-2xl font-bold">{data.weather.pressure} hPa</p>
            </div>
          </div>
        </div>

        {/* Air Quality Metrics */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Air Pollution Levels</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {airQualityMetrics.map((metric) => (
              <MetricCard key={metric.label} metric={metric} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
