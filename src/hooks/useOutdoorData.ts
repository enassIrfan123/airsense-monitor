import { useQuery } from '@tanstack/react-query';
import { OutdoorWeather, OutdoorAirPollution } from '@/types/airQuality';

const API_KEY = 'd13fb2febeee7ffb24c3cf514f5457d6';

interface OutdoorData {
  weather: OutdoorWeather;
  airPollution: OutdoorAirPollution;
}

async function fetchOutdoorData(lat: number, lon: number): Promise<OutdoorData> {
  // Fetch weather data
  const weatherResponse = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
  );
  if (!weatherResponse.ok) {
    throw new Error('Failed to fetch weather data');
  }
  const weatherData = await weatherResponse.json();

  // Fetch air pollution data (using HTTPS to avoid mixed content issues)
  const pollutionResponse = await fetch(
    `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`
  );
  if (!pollutionResponse.ok) {
    throw new Error('Failed to fetch air pollution data');
  }
  const pollutionData = await pollutionResponse.json();

  return {
    weather: {
      temp: weatherData.main.temp,
      feels_like: weatherData.main.feels_like,
      humidity: weatherData.main.humidity,
      pressure: weatherData.main.pressure,
      uvi: weatherData.uvi,
      clouds: weatherData.clouds?.all,
      wind_speed: weatherData.wind?.speed,
      weather_description: weatherData.weather?.[0]?.description,
      rain_1h: weatherData.rain?.['1h'],
      rain_3h: weatherData.rain?.['3h'],
    },
    airPollution: {
      co: pollutionData.list[0].components.co,
      no2: pollutionData.list[0].components.no2,
      o3: pollutionData.list[0].components.o3,
      so2: pollutionData.list[0].components.so2,
      pm2_5: pollutionData.list[0].components.pm2_5,
      pm10: pollutionData.list[0].components.pm10,
    },
  };
}

export function useOutdoorData(lat: number, lon: number) {
  return useQuery({
    queryKey: ['outdoorData', lat, lon],
    queryFn: () => fetchOutdoorData(lat, lon),
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: 3,
    enabled: !!(lat && lon),
  });
}
