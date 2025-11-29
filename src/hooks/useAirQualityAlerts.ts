import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { AirQualityLevel } from '@/types/airQuality';
import { AlertThreshold } from '@/components/AlertSettings';

interface AlertThresholds {
  pm25: number;
  pm25Level: AirQualityLevel;
  pm10: number;
  pm10Level: AirQualityLevel;
  o3: number;
  o3Level: AirQualityLevel;
  no2?: number;
  no2Level?: AirQualityLevel;
  so2?: number;
  so2Level?: AirQualityLevel;
  co?: number;
  coLevel?: AirQualityLevel;
}

export function useAirQualityAlerts(
  thresholds: AlertThresholds | null,
  enabled: boolean,
  customThresholds?: AlertThreshold[]
) {
  const lastAlertRef = useRef<Record<string, number>>({});
  const ALERT_COOLDOWN = 5 * 60 * 1000; // 5 minutes

  useEffect(() => {
    if (!enabled || !thresholds) return;

    const now = Date.now();
    const alerts: { message: string; key: string }[] = [];

    // Helper function to check if alert should be triggered
    const shouldAlert = (
      pollutant: 'pm25' | 'pm10' | 'o3' | 'no2' | 'so2' | 'co',
      value: number,
      level: AirQualityLevel
    ): boolean => {
      if (!customThresholds) {
        // Default behavior: alert on unhealthy or worse
        return level === 'unhealthy' || level === 'very-unhealthy' || level === 'hazardous';
      }

      // Custom threshold behavior
      const threshold = customThresholds.find(t => t.pollutant === pollutant);
      if (!threshold) return false;

      const levelOrder: AirQualityLevel[] = ['good', 'moderate', 'unhealthy', 'very-unhealthy', 'hazardous'];
      const currentSeverity = levelOrder.indexOf(level);
      const thresholdSeverity = levelOrder.indexOf(threshold.level);

      return value >= threshold.value && currentSeverity >= thresholdSeverity;
    };

    // PM2.5 alerts
    if (shouldAlert('pm25', thresholds.pm25, thresholds.pm25Level)) {
      const key = 'pm25';
      if (!lastAlertRef.current[key] || now - lastAlertRef.current[key] > ALERT_COOLDOWN) {
        alerts.push({
          key,
          message: `PM2.5 levels are ${thresholds.pm25Level.replace('-', ' ')} (${thresholds.pm25.toFixed(1)} µg/m³)`,
        });
      }
    }

    // PM10 alerts
    if (shouldAlert('pm10', thresholds.pm10, thresholds.pm10Level)) {
      const key = 'pm10';
      if (!lastAlertRef.current[key] || now - lastAlertRef.current[key] > ALERT_COOLDOWN) {
        alerts.push({
          key,
          message: `PM10 levels are ${thresholds.pm10Level.replace('-', ' ')} (${thresholds.pm10.toFixed(1)} µg/m³)`,
        });
      }
    }

    // O3 alerts
    if (shouldAlert('o3', thresholds.o3, thresholds.o3Level)) {
      const key = 'o3';
      if (!lastAlertRef.current[key] || now - lastAlertRef.current[key] > ALERT_COOLDOWN) {
        alerts.push({
          key,
          message: `Ozone levels are ${thresholds.o3Level.replace('-', ' ')} (${thresholds.o3.toFixed(1)} µg/m³)`,
        });
      }
    }

    // NO2 alerts
    if (thresholds.no2 && thresholds.no2Level && shouldAlert('no2', thresholds.no2, thresholds.no2Level)) {
      const key = 'no2';
      if (!lastAlertRef.current[key] || now - lastAlertRef.current[key] > ALERT_COOLDOWN) {
        alerts.push({
          key,
          message: `NO₂ levels are ${thresholds.no2Level.replace('-', ' ')} (${thresholds.no2.toFixed(1)} µg/m³)`,
        });
      }
    }

    // SO2 alerts
    if (thresholds.so2 && thresholds.so2Level && shouldAlert('so2', thresholds.so2, thresholds.so2Level)) {
      const key = 'so2';
      if (!lastAlertRef.current[key] || now - lastAlertRef.current[key] > ALERT_COOLDOWN) {
        alerts.push({
          key,
          message: `SO₂ levels are ${thresholds.so2Level.replace('-', ' ')} (${thresholds.so2.toFixed(1)} µg/m³)`,
        });
      }
    }

    // CO alerts
    if (thresholds.co && thresholds.coLevel && shouldAlert('co', thresholds.co, thresholds.coLevel)) {
      const key = 'co';
      if (!lastAlertRef.current[key] || now - lastAlertRef.current[key] > ALERT_COOLDOWN) {
        alerts.push({
          key,
          message: `CO levels are ${thresholds.coLevel.replace('-', ' ')} (${thresholds.co.toFixed(1)} mg/m³)`,
        });
      }
    }

    // Show alerts
    alerts.forEach(({ key, message }) => {
      toast.warning('Air Quality Alert', {
        description: message,
        duration: 10000,
      });
      lastAlertRef.current[key] = now;
    });
  }, [thresholds, enabled, customThresholds]);
}
