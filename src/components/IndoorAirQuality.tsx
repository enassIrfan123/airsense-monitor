import { useIndoorAirQuality } from '@/hooks/useIndoorAirQuality';
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
  getLevelColor,
  getAQIDescription,
} from '@/utils/airQualityCalculations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, Loader2, WifiOff, Activity } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function IndoorAirQuality() {
  const { data, isLoading, error } = useIndoorAirQuality();

  const isDisconnected = error || !data;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Indoor Air Quality
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  // Default zero values when sensor is not connected
  const sensorData = isDisconnected ? {
    temperature: 0,
    feels_like: 0,
    humidity: 0,
    pressure: 0,
    PM2_5: 0,
    PM10: 0,
    CO: 0,
    NO2: 0,
    SO2: 0,
    O3: 0,
  } : data;

  const weatherMetrics = [
    { label: 'Temperature', value: sensorData.temperature, unit: '°C' },
    { label: 'Feels Like', value: sensorData.feels_like, unit: '°C' },
    { label: 'Humidity', value: sensorData.humidity, unit: '%' },
    { label: 'Pressure', value: sensorData.pressure, unit: 'hPa' },
  ];

  // Calculate AQI
  const aqiResult = calculateAQI(
    sensorData.PM2_5,
    sensorData.PM10,
    sensorData.CO,
    sensorData.NO2,
    sensorData.SO2,
    sensorData.O3
  );

  const airQualityMetrics: AirQualityMetric[] = [
    {
      label: 'PM2.5',
      value: sensorData.PM2_5,
      unit: 'µg/m³',
      level: getPM25Level(sensorData.PM2_5),
    },
    {
      label: 'PM10',
      value: sensorData.PM10,
      unit: 'µg/m³',
      level: getPM10Level(sensorData.PM10),
    },
    {
      label: 'CO',
      value: sensorData.CO,
      unit: 'ppm',
      level: getCOLevel(sensorData.CO),
    },
    {
      label: 'NO₂',
      value: sensorData.NO2,
      unit: 'ppb',
      level: getNO2Level(sensorData.NO2),
    },
    {
      label: 'SO₂',
      value: sensorData.SO2,
      unit: 'ppb',
      level: getSO2Level(sensorData.SO2),
    },
    {
      label: 'O₃',
      value: sensorData.O3,
      unit: 'ppb',
      level: getO3Level(sensorData.O3),
    },
  ];

  return (
    <Card className="border-2">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Home className="h-6 w-6 text-primary" />
          Indoor Air Quality
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Real-time monitoring from Firebase sensors
        </p>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {isDisconnected && (
          <Alert className="bg-muted/50 border-muted-foreground/20">
            <WifiOff className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Sensor not connected. Connect the sensor to view indoor air quality.</span>
            </AlertDescription>
          </Alert>
        )}

        {/* AQI Display */}
        <div className={`p-4 rounded-lg bg-${getLevelColor(aqiResult.level)}/10 border border-${getLevelColor(aqiResult.level)}/30`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className={`h-8 w-8 text-${getLevelColor(aqiResult.level)}`} />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Air Quality Index (AQI)</p>
                <p className={`text-3xl font-bold text-${getLevelColor(aqiResult.level)}`}>
                  {aqiResult.aqi}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-lg font-semibold capitalize text-${getLevelColor(aqiResult.level)}`}>
                {aqiResult.level.replace('-', ' ')}
              </p>
              <p className="text-xs text-muted-foreground">{getAQIDescription(aqiResult.aqi)}</p>
              <p className="text-xs text-muted-foreground mt-1">Dominant: {aqiResult.dominantPollutant}</p>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">Weather Conditions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {weatherMetrics.map((metric) => (
              <Card key={metric.label} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex flex-col space-y-1">
                    <span className="text-xs font-medium text-muted-foreground">{metric.label}</span>
                    <div className="flex items-baseline space-x-1">
                      <span className="text-2xl font-bold text-foreground">
                        {metric.value?.toFixed(1) ?? '0'}
                      </span>
                      <span className="text-xs text-muted-foreground">{metric.unit}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">Air Quality</h3>
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
