import { useState, useEffect } from 'react';
import { AlertThreshold } from '@/components/AlertSettings';
import { AirQualityLevel } from '@/types/airQuality';

const STORAGE_KEY = 'air-quality-alert-thresholds';

const DEFAULT_THRESHOLDS: AlertThreshold[] = [
  { pollutant: 'pm25', value: 35.4, level: 'unhealthy' },
  { pollutant: 'pm10', value: 154, level: 'unhealthy' },
  { pollutant: 'o3', value: 85, level: 'unhealthy' },
  { pollutant: 'no2', value: 360, level: 'unhealthy' },
  { pollutant: 'so2', value: 185, level: 'unhealthy' },
  { pollutant: 'co', value: 12.4, level: 'unhealthy' },
];

export function useAlertThresholds() {
  const [thresholds, setThresholds] = useState<AlertThreshold[]>(DEFAULT_THRESHOLDS);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setThresholds(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load alert thresholds', e);
      }
    }
  }, []);

  const saveThresholds = (newThresholds: AlertThreshold[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newThresholds));
    setThresholds(newThresholds);
  };

  const checkThreshold = (
    pollutant: AlertThreshold['pollutant'],
    value: number,
    currentLevel: AirQualityLevel
  ): boolean => {
    const threshold = thresholds.find(t => t.pollutant === pollutant);
    if (!threshold) return false;

    // Get severity order
    const levelOrder: AirQualityLevel[] = ['good', 'moderate', 'unhealthy', 'very-unhealthy', 'hazardous'];
    const currentSeverity = levelOrder.indexOf(currentLevel);
    const thresholdSeverity = levelOrder.indexOf(threshold.level);

    // Alert if current level is at or above threshold level
    return value >= threshold.value && currentSeverity >= thresholdSeverity;
  };

  return {
    thresholds,
    saveThresholds,
    checkThreshold,
  };
}
