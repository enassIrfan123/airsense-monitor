import { AirQualityLevel } from '@/types/airQuality';

// Air Quality Index (AQI) thresholds based on EPA standards
export function getPM25Level(value: number): AirQualityLevel {
  if (value <= 12) return 'good';
  if (value <= 35.4) return 'moderate';
  if (value <= 55.4) return 'unhealthy';
  if (value <= 150.4) return 'very-unhealthy';
  return 'hazardous';
}

export function getPM10Level(value: number): AirQualityLevel {
  if (value <= 54) return 'good';
  if (value <= 154) return 'moderate';
  if (value <= 254) return 'unhealthy';
  if (value <= 354) return 'very-unhealthy';
  return 'hazardous';
}

export function getCOLevel(value: number): AirQualityLevel {
  if (value <= 4.4) return 'good';
  if (value <= 9.4) return 'moderate';
  if (value <= 12.4) return 'unhealthy';
  if (value <= 15.4) return 'very-unhealthy';
  return 'hazardous';
}

export function getNO2Level(value: number): AirQualityLevel {
  if (value <= 53) return 'good';
  if (value <= 100) return 'moderate';
  if (value <= 360) return 'unhealthy';
  if (value <= 649) return 'very-unhealthy';
  return 'hazardous';
}

export function getSO2Level(value: number): AirQualityLevel {
  if (value <= 35) return 'good';
  if (value <= 75) return 'moderate';
  if (value <= 185) return 'unhealthy';
  if (value <= 304) return 'very-unhealthy';
  return 'hazardous';
}

export function getO3Level(value: number): AirQualityLevel {
  if (value <= 54) return 'good';
  if (value <= 70) return 'moderate';
  if (value <= 85) return 'unhealthy';
  if (value <= 105) return 'very-unhealthy';
  return 'hazardous';
}

export function getLevelColor(level: AirQualityLevel): string {
  const colors = {
    good: 'quality-good',
    moderate: 'quality-moderate',
    unhealthy: 'quality-unhealthy',
    'very-unhealthy': 'quality-very-unhealthy',
    hazardous: 'quality-hazardous',
  };
  return colors[level];
}

export function getLevelLabel(level: AirQualityLevel): string {
  const labels = {
    good: 'Good',
    moderate: 'Moderate',
    unhealthy: 'Unhealthy',
    'very-unhealthy': 'Very Unhealthy',
    hazardous: 'Hazardous',
  };
  return labels[level];
}
