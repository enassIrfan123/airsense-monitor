import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AirQualityLevel } from '@/types/airQuality';
import { AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AirQualityAlertsProps {
  pm25: number;
  pm10: number;
  co: number;
  no2: number;
  so2: number;
  o3: number;
  pm25Level: AirQualityLevel;
  pm10Level: AirQualityLevel;
  coLevel: AirQualityLevel;
  no2Level: AirQualityLevel;
  so2Level: AirQualityLevel;
  o3Level: AirQualityLevel;
}

interface AlertItem {
  severity: 'info' | 'warning' | 'danger' | 'success';
  title: string;
  message: string;
  pollutant: string;
  value: number;
  unit: string;
}

function getAlerts(props: AirQualityAlertsProps): AlertItem[] {
  const alerts: AlertItem[] = [];

  // PM2.5 Alerts
  if (props.pm25Level === 'hazardous') {
    alerts.push({
      severity: 'danger',
      title: 'Hazardous PM2.5 Levels',
      message: 'Stay indoors! PM2.5 levels are extremely dangerous. Health emergency.',
      pollutant: 'PM2.5',
      value: props.pm25,
      unit: 'μg/m³',
    });
  } else if (props.pm25Level === 'very-unhealthy') {
    alerts.push({
      severity: 'danger',
      title: 'Very Unhealthy PM2.5',
      message: 'Everyone should avoid outdoor activities. Wear masks if going outside.',
      pollutant: 'PM2.5',
      value: props.pm25,
      unit: 'μg/m³',
    });
  } else if (props.pm25Level === 'unhealthy') {
    alerts.push({
      severity: 'warning',
      title: 'Unhealthy PM2.5 Levels',
      message: 'Sensitive groups should limit outdoor exposure.',
      pollutant: 'PM2.5',
      value: props.pm25,
      unit: 'μg/m³',
    });
  }

  // PM10 Alerts
  if (props.pm10Level === 'hazardous' || props.pm10Level === 'very-unhealthy') {
    alerts.push({
      severity: 'danger',
      title: 'High PM10 Particulates',
      message: 'Coarse particles at dangerous levels. Avoid outdoor activities.',
      pollutant: 'PM10',
      value: props.pm10,
      unit: 'μg/m³',
    });
  } else if (props.pm10Level === 'unhealthy') {
    alerts.push({
      severity: 'warning',
      title: 'Elevated PM10',
      message: 'Particulate matter may affect sensitive individuals.',
      pollutant: 'PM10',
      value: props.pm10,
      unit: 'μg/m³',
    });
  }

  // CO Alerts
  if (props.coLevel === 'very-unhealthy' || props.coLevel === 'hazardous') {
    alerts.push({
      severity: 'danger',
      title: 'Dangerous Carbon Monoxide',
      message: 'CO levels are extremely high. Ensure proper ventilation.',
      pollutant: 'CO',
      value: props.co,
      unit: 'μg/m³',
    });
  }

  // NO2 Alerts
  if (props.no2Level === 'unhealthy' || props.no2Level === 'very-unhealthy' || props.no2Level === 'hazardous') {
    alerts.push({
      severity: props.no2Level === 'hazardous' ? 'danger' : 'warning',
      title: 'High Nitrogen Dioxide',
      message: 'Respiratory irritant detected. Limit outdoor activities.',
      pollutant: 'NO₂',
      value: props.no2,
      unit: 'μg/m³',
    });
  }

  // O3 Alerts
  if (props.o3Level === 'unhealthy' || props.o3Level === 'very-unhealthy' || props.o3Level === 'hazardous') {
    alerts.push({
      severity: props.o3Level === 'hazardous' ? 'danger' : 'warning',
      title: 'Elevated Ozone Levels',
      message: 'Ground-level ozone can cause breathing problems. Stay indoors during peak hours.',
      pollutant: 'O₃',
      value: props.o3,
      unit: 'μg/m³',
    });
  }

  // SO2 Alerts
  if (props.so2Level === 'unhealthy' || props.so2Level === 'very-unhealthy' || props.so2Level === 'hazardous') {
    alerts.push({
      severity: props.so2Level === 'hazardous' ? 'danger' : 'warning',
      title: 'High Sulfur Dioxide',
      message: 'SO₂ can trigger asthma and respiratory issues.',
      pollutant: 'SO₂',
      value: props.so2,
      unit: 'μg/m³',
    });
  }

  // If no alerts, add a success message
  if (alerts.length === 0) {
    alerts.push({
      severity: 'success',
      title: 'Air Quality is Good',
      message: 'All pollutant levels are within safe ranges. Enjoy outdoor activities!',
      pollutant: 'All',
      value: 0,
      unit: '',
    });
  }

  return alerts;
}

export function AirQualityAlerts(props: AirQualityAlertsProps) {
  const alerts = getAlerts(props);

  const getIcon = (severity: AlertItem['severity']) => {
    switch (severity) {
      case 'danger': return <AlertTriangle className="h-5 w-5" />;
      case 'warning': return <AlertCircle className="h-5 w-5" />;
      case 'success': return <CheckCircle className="h-5 w-5" />;
      default: return <Info className="h-5 w-5" />;
    }
  };

  const getAlertClassName = (severity: AlertItem['severity']) => {
    switch (severity) {
      case 'danger': return 'border-l-4 border-l-quality-hazardous bg-quality-hazardous/5';
      case 'warning': return 'border-l-4 border-l-quality-unhealthy bg-quality-unhealthy/5';
      case 'success': return 'border-l-4 border-l-quality-good bg-quality-good/5';
      default: return 'border-l-4 border-l-primary';
    }
  };

  const getIconColor = (severity: AlertItem['severity']) => {
    switch (severity) {
      case 'danger': return 'text-quality-hazardous';
      case 'warning': return 'text-quality-unhealthy';
      case 'success': return 'text-quality-good';
      default: return 'text-primary';
    }
  };

  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <AlertTriangle className="h-5 w-5 text-primary" />
          </div>
          <CardTitle>Air Quality Alerts</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        {alerts.map((alert, index) => (
          <Alert key={index} className={getAlertClassName(alert.severity)}>
            <div className={cn("flex items-start gap-3", getIconColor(alert.severity))}>
              {getIcon(alert.severity)}
              <div className="flex-1">
                <AlertTitle className="mb-1">{alert.title}</AlertTitle>
                <AlertDescription className="text-sm">
                  {alert.message}
                  {alert.value > 0 && (
                    <span className="block mt-1 font-mono text-xs">
                      {alert.pollutant}: {alert.value.toFixed(1)} {alert.unit}
                    </span>
                  )}
                </AlertDescription>
              </div>
            </div>
          </Alert>
        ))}
      </CardContent>
    </Card>
  );
}
