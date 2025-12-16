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
  getAQILevel,
  getAQIDescription,
  getAQIStyles,
} from '@/utils/airQualityCalculations';
import { predictAQI } from '@/services/predictionApi';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, Loader2, WifiOff, Activity } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function IndoorAirQuality() {
  const { data, isLoading, error } = useIndoorAirQuality();

  // Prediction State
  const [predictedAQI, setPredictedAQI] = useState<number | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);

  const isDisconnected = error || !data;

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

  useEffect(() => {
    async function fetchPrediction() {
      // Don't predict if disconnected or loading (implicitly handled relying on sensorData default 0s, 
      // but sticking to isDisconnected logic is safer for logic)
      if (isDisconnected) return;

      setIsPredicting(true);
      console.log("Predicting with inputs:", {
        "PM2.5": sensorData.PM2_5,
        "PM10": sensorData.PM10,
        "SO2": sensorData.SO2,
        "O3": sensorData.O3,
        "NO2": sensorData.NO2,
        "CO": sensorData.CO
      });

      try {
        const aqi = await predictAQI({
          "PM2.5": sensorData.PM2_5,
          "PM10": sensorData.PM10,
          "SO2": sensorData.SO2,
          "O3": sensorData.O3,
          "NO2": sensorData.NO2,
          "CO": sensorData.CO
        });
        console.log("Prediction result:", aqi);
        setPredictedAQI(aqi);
      } catch (err) {
        console.error("Failed to predict AQI", err);
        // Fallback to error UI or notification
        toast.error("Failed to connect to AQI Prediction API");
      } finally {
        setIsPredicting(false);
      }
    }

    fetchPrediction();
  }, [
    sensorData.PM2_5,
    sensorData.PM10,
    sensorData.SO2,
    sensorData.O3,
    sensorData.NO2,
    sensorData.CO,
    isDisconnected
  ]);

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

  const weatherMetrics = [
    { label: 'Temperature', value: sensorData.temperature, unit: '°C' },
    { label: 'Feels Like', value: sensorData.feels_like, unit: '°C' },
    { label: 'Humidity', value: sensorData.humidity, unit: '%' },
    { label: 'Pressure', value: sensorData.pressure, unit: 'hPa' },
  ];

  const currentAQI = predictedAQI ?? 0; // Default to 0 if loading/error
  const currentLevel = getAQILevel(currentAQI);
  const aqStyles = getAQIStyles(currentLevel);

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
        <div className={`p-4 rounded-lg ${aqStyles.bg} border ${aqStyles.border}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className={`h-8 w-8 ${aqStyles.text}`} />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {isPredicting ? "Predicting AQI..." : "Predicted AQI (ML)"}
                </p>
                <div className="flex items-baseline gap-2">
                  {isPredicting ? (
                    <Loader2 className={`h-6 w-6 animate-spin ${aqStyles.text}`} />
                  ) : (
                    <p className={`text-3xl font-bold ${aqStyles.text}`}>
                      {currentAQI}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-lg font-semibold capitalize ${aqStyles.text}`}>
                {currentLevel.replace('-', ' ')}
              </p>
              <p className="text-xs text-muted-foreground">{getAQIDescription(currentAQI)}</p>
              <p className="text-xs text-muted-foreground mt-1">Source: Random Forest Model</p>
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
