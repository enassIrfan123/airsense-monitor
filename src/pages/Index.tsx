import { useState } from 'react';
import { IndoorAirQuality } from '@/components/IndoorAirQuality';
import { OutdoorAirQuality } from '@/components/OutdoorAirQuality';
import { LocationSelector } from '@/components/LocationSelector';
import { UVIndex } from '@/components/UVIndex';
import { RainfallPrediction } from '@/components/RainfallPrediction';
import { AirQualityMap } from '@/components/AirQualityMap';
import { HealthRecommendations } from '@/components/HealthRecommendations';
import { AirQualityAlerts } from '@/components/AirQualityAlerts';
import { LocationComparison } from '@/components/LocationComparison';
import { HistoricalCharts } from '@/components/HistoricalCharts';
import { Location } from '@/types/airQuality';
import { Wind, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useOutdoorData } from '@/hooks/useOutdoorData';
import {
  getPM25Level,
  getPM10Level,
  getCOLevel,
  getNO2Level,
  getSO2Level,
  getO3Level,
} from '@/utils/airQualityCalculations';

const Index = () => {
  const [location, setLocation] = useState<Location>({
    lat: 40.7128,
    lon: -74.0060,
    name: 'New York',
  });

  const queryClient = useQueryClient();
  const { data: outdoorData } = useOutdoorData(location.lat, location.lon);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['indoorAirQuality'] });
    queryClient.invalidateQueries({ queryKey: ['outdoorData'] });
    toast.success('Data refreshed successfully');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Wind className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  AirSense Monitor
                </h1>
                <p className="text-sm text-muted-foreground">Real-time Environmental Monitoring</p>
              </div>
            </div>
            <Button onClick={handleRefresh} variant="outline" size="sm" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Location Selector */}
          <LocationSelector currentLocation={location} onLocationChange={setLocation} />

          {/* Indoor Air Quality */}
          <IndoorAirQuality />

          {/* Outdoor Air Quality */}
          <OutdoorAirQuality 
            lat={location.lat} 
            lon={location.lon} 
            locationName={location.name}
          />

          {/* UV Index and Rainfall in a grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <UVIndex uvi={outdoorData?.weather.uvi} />
            <RainfallPrediction 
              rain_1h={outdoorData?.weather.rain_1h}
              rain_3h={outdoorData?.weather.rain_3h}
              clouds={outdoorData?.weather.clouds}
            />
          </div>

          {/* Air Quality Heat Map */}
          {outdoorData && (
            <AirQualityMap
              lat={location.lat}
              lon={location.lon}
              locationName={location.name}
              pm25={outdoorData.airPollution.pm2_5}
            />
          )}

          {/* Air Quality Alerts */}
          {outdoorData && (
            <AirQualityAlerts
              pm25={outdoorData.airPollution.pm2_5}
              pm10={outdoorData.airPollution.pm10}
              co={outdoorData.airPollution.co / 1000}
              no2={outdoorData.airPollution.no2}
              so2={outdoorData.airPollution.so2}
              o3={outdoorData.airPollution.o3}
              pm25Level={getPM25Level(outdoorData.airPollution.pm2_5)}
              pm10Level={getPM10Level(outdoorData.airPollution.pm10)}
              coLevel={getCOLevel(outdoorData.airPollution.co / 1000)}
              no2Level={getNO2Level(outdoorData.airPollution.no2)}
              so2Level={getSO2Level(outdoorData.airPollution.so2)}
              o3Level={getO3Level(outdoorData.airPollution.o3)}
            />
          )}

          {/* Health Recommendations */}
          {outdoorData && (
            <HealthRecommendations
              pm25Level={getPM25Level(outdoorData.airPollution.pm2_5)}
              pm10Level={getPM10Level(outdoorData.airPollution.pm10)}
              o3Level={getO3Level(outdoorData.airPollution.o3)}
              no2Level={getNO2Level(outdoorData.airPollution.no2)}
            />
          )}

          {/* Historical Data Charts */}
          {outdoorData && (
            <HistoricalCharts
              currentPM25={outdoorData.airPollution.pm2_5}
              currentPM10={outdoorData.airPollution.pm10}
              currentCO={outdoorData.airPollution.co / 1000}
              currentNO2={outdoorData.airPollution.no2}
              currentO3={outdoorData.airPollution.o3}
              currentSO2={outdoorData.airPollution.so2}
            />
          )}

          {/* Location Comparison */}
          <LocationComparison />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-12 py-6 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            Data updates every 30 seconds • Indoor data from Firebase • Outdoor data from OpenWeatherMap
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
