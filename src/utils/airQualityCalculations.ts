import { AirQualityLevel } from '@/types/airQuality';

// EPA AQI breakpoints for each pollutant
interface AQIBreakpoint {
  cLow: number;
  cHigh: number;
  iLow: number;
  iHigh: number;
}

// Calculate sub-index using EPA formula: I = ((Ihigh - Ilow) / (Chigh - Clow)) * (C - Clow) + Ilow
function calculateSubIndex(concentration: number, breakpoints: AQIBreakpoint[]): number {
  for (const bp of breakpoints) {
    if (concentration >= bp.cLow && concentration <= bp.cHigh) {
      return Math.round(
        ((bp.iHigh - bp.iLow) / (bp.cHigh - bp.cLow)) * (concentration - bp.cLow) + bp.iLow
      );
    }
  }
  // If concentration exceeds all breakpoints, return max AQI
  return 500;
}

// EPA breakpoints for PM2.5 (µg/m³, 24-hour average)
const pm25Breakpoints: AQIBreakpoint[] = [
  { cLow: 0, cHigh: 12, iLow: 0, iHigh: 50 },
  { cLow: 12.1, cHigh: 35.4, iLow: 51, iHigh: 100 },
  { cLow: 35.5, cHigh: 55.4, iLow: 101, iHigh: 150 },
  { cLow: 55.5, cHigh: 150.4, iLow: 151, iHigh: 200 },
  { cLow: 150.5, cHigh: 250.4, iLow: 201, iHigh: 300 },
  { cLow: 250.5, cHigh: 500.4, iLow: 301, iHigh: 500 },
];

// EPA breakpoints for PM10 (µg/m³, 24-hour average)
const pm10Breakpoints: AQIBreakpoint[] = [
  { cLow: 0, cHigh: 54, iLow: 0, iHigh: 50 },
  { cLow: 55, cHigh: 154, iLow: 51, iHigh: 100 },
  { cLow: 155, cHigh: 254, iLow: 101, iHigh: 150 },
  { cLow: 255, cHigh: 354, iLow: 151, iHigh: 200 },
  { cLow: 355, cHigh: 424, iLow: 201, iHigh: 300 },
  { cLow: 425, cHigh: 604, iLow: 301, iHigh: 500 },
];

// EPA breakpoints for CO (ppm, 8-hour average)
const coBreakpoints: AQIBreakpoint[] = [
  { cLow: 0, cHigh: 4.4, iLow: 0, iHigh: 50 },
  { cLow: 4.5, cHigh: 9.4, iLow: 51, iHigh: 100 },
  { cLow: 9.5, cHigh: 12.4, iLow: 101, iHigh: 150 },
  { cLow: 12.5, cHigh: 15.4, iLow: 151, iHigh: 200 },
  { cLow: 15.5, cHigh: 30.4, iLow: 201, iHigh: 300 },
  { cLow: 30.5, cHigh: 50.4, iLow: 301, iHigh: 500 },
];

// EPA breakpoints for NO2 (ppb, 1-hour average)
const no2Breakpoints: AQIBreakpoint[] = [
  { cLow: 0, cHigh: 53, iLow: 0, iHigh: 50 },
  { cLow: 54, cHigh: 100, iLow: 51, iHigh: 100 },
  { cLow: 101, cHigh: 360, iLow: 101, iHigh: 150 },
  { cLow: 361, cHigh: 649, iLow: 151, iHigh: 200 },
  { cLow: 650, cHigh: 1249, iLow: 201, iHigh: 300 },
  { cLow: 1250, cHigh: 2049, iLow: 301, iHigh: 500 },
];

// EPA breakpoints for SO2 (ppb, 1-hour average)
const so2Breakpoints: AQIBreakpoint[] = [
  { cLow: 0, cHigh: 35, iLow: 0, iHigh: 50 },
  { cLow: 36, cHigh: 75, iLow: 51, iHigh: 100 },
  { cLow: 76, cHigh: 185, iLow: 101, iHigh: 150 },
  { cLow: 186, cHigh: 304, iLow: 151, iHigh: 200 },
  { cLow: 305, cHigh: 604, iLow: 201, iHigh: 300 },
  { cLow: 605, cHigh: 1004, iLow: 301, iHigh: 500 },
];

// EPA breakpoints for O3 (ppb, 8-hour average)
const o3Breakpoints: AQIBreakpoint[] = [
  { cLow: 0, cHigh: 54, iLow: 0, iHigh: 50 },
  { cLow: 55, cHigh: 70, iLow: 51, iHigh: 100 },
  { cLow: 71, cHigh: 85, iLow: 101, iHigh: 150 },
  { cLow: 86, cHigh: 105, iLow: 151, iHigh: 200 },
  { cLow: 106, cHigh: 200, iLow: 201, iHigh: 300 },
  { cLow: 201, cHigh: 504, iLow: 301, iHigh: 500 },
];

// Calculate overall AQI from all pollutants (EPA uses the highest sub-index)
export interface AQIResult {
  aqi: number;
  level: AirQualityLevel;
  dominantPollutant: string;
  subIndices: {
    pm25: number;
    pm10: number;
    co: number;
    no2: number;
    so2: number;
    o3: number;
  };
}

export function calculateAQI(
  pm25: number,
  pm10: number,
  co: number,
  no2: number,
  so2: number,
  o3: number
): AQIResult {
  const subIndices = {
    pm25: calculateSubIndex(pm25, pm25Breakpoints),
    pm10: calculateSubIndex(pm10, pm10Breakpoints),
    co: calculateSubIndex(co, coBreakpoints),
    no2: calculateSubIndex(no2, no2Breakpoints),
    so2: calculateSubIndex(so2, so2Breakpoints),
    o3: calculateSubIndex(o3, o3Breakpoints),
  };

  // Find the maximum sub-index (this becomes the overall AQI)
  const pollutantNames = ['PM2.5', 'PM10', 'CO', 'NO₂', 'SO₂', 'O₃'];
  const values = Object.values(subIndices);
  const maxIndex = Math.max(...values);
  const dominantIndex = values.indexOf(maxIndex);

  return {
    aqi: maxIndex,
    level: getAQILevel(maxIndex),
    dominantPollutant: pollutantNames[dominantIndex],
    subIndices,
  };
}

export function getAQILevel(aqi: number): AirQualityLevel {
  if (aqi <= 50) return 'good';
  if (aqi <= 100) return 'moderate';
  if (aqi <= 150) return 'unhealthy';
  if (aqi <= 200) return 'very-unhealthy';
  return 'hazardous';
}

export function getAQIDescription(aqi: number): string {
  if (aqi <= 50) return 'Air quality is satisfactory';
  if (aqi <= 100) return 'Acceptable for most people';
  if (aqi <= 150) return 'Unhealthy for sensitive groups';
  if (aqi <= 200) return 'Unhealthy for everyone';
  if (aqi <= 300) return 'Very unhealthy - health alert';
  return 'Hazardous - emergency conditions';
}

// Returns styling classes for AQI levels
export function getAQIStyles(level: AirQualityLevel): {
  bg: string;
  border: string;
  text: string;
} {
  const styles = {
    good: {
      bg: 'bg-green-500/10',
      border: 'border-green-500/30',
      text: 'text-green-600',
    },
    moderate: {
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/30',
      text: 'text-yellow-600',
    },
    unhealthy: {
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/30',
      text: 'text-orange-600',
    },
    'very-unhealthy': {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      text: 'text-red-600',
    },
    hazardous: {
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/30',
      text: 'text-purple-600',
    },
  };
  return styles[level];
}

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
