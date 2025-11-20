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
} from '@/utils/airQualityCalculations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function IndoorAirQuality() {
  const { data, isLoading, error } = useIndoorAirQuality();

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

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Indoor Air Quality
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Firebase Permission Denied (401)</strong>
              <br />
              The Firebase Realtime Database needs read permissions configured.
              <br />
              <br />
              To fix this, update your Firebase Realtime Database rules to allow read access:
              <br />
              <code className="text-xs bg-muted px-2 py-1 rounded mt-2 block">
                {`{\n  "rules": {\n    "airQuality": {\n      ".read": true\n    }\n  }\n}`}
              </code>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  const metrics: AirQualityMetric[] = [
    {
      label: 'PM2.5',
      value: data.PM25,
      unit: 'µg/m³',
      level: getPM25Level(data.PM25),
    },
    {
      label: 'PM10',
      value: data.PM10,
      unit: 'µg/m³',
      level: getPM10Level(data.PM10),
    },
    {
      label: 'NO₂',
      value: data.NO2,
      unit: 'ppb',
      level: getNO2Level(data.NO2),
    },
    {
      label: 'CO',
      value: data.CO,
      unit: 'ppm',
      level: getCOLevel(data.CO),
    },
    {
      label: 'SO₂',
      value: data.SO2,
      unit: 'ppb',
      level: getSO2Level(data.SO2),
    },
    {
      label: 'O₃',
      value: data.O3,
      unit: 'ppb',
      level: getO3Level(data.O3),
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
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map((metric) => (
            <MetricCard key={metric.label} metric={metric} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
