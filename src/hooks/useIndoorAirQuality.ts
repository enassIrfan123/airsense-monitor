import { useQuery } from '@tanstack/react-query';
import { IndoorAirQuality } from '@/types/airQuality';

const FIREBASE_URL = 'https://air-sense-d7792-default-rtdb.firebaseio.com/airQuality.json';

async function fetchIndoorAirQuality(): Promise<IndoorAirQuality> {
  const response = await fetch(FIREBASE_URL);
  if (!response.ok) {
    throw new Error('Failed to fetch indoor air quality data');
  }
  const data = await response.json();
  return data;
}

export function useIndoorAirQuality() {
  return useQuery({
    queryKey: ['indoorAirQuality'],
    queryFn: fetchIndoorAirQuality,
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: 3,
  });
}
