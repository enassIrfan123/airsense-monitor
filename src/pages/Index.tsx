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
import { DashboardNav } from '@/components/DashboardNav';
import { WeeklyTrends } from '@/components/WeeklyTrends';
import { LocationFavorites } from '@/components/LocationFavorites';
import { Location } from '@/types/airQuality';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Cloud, Home } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useOutdoorData } from '@/hooks/useOutdoorData';
import { useIndoorAirQuality } from '@/hooks/useIndoorAirQuality';
import { useAirQualityAlerts } from '@/hooks/useAirQualityAlerts';
import { exportToCSV, exportToJSON, ExportData } from '@/utils/dataExport';
import { ErrorBoundary } from '@/components/ErrorBoundary';
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
  const [alertsEnabled, setAlertsEnabled] = useState(true);

  const queryClient = useQueryClient();
  const { data: outdoorData } = useOutdoorData(location.lat, location.lon);
  const { data: indoorData } = useIndoorAirQuality();

  // Alert notifications
  useAirQualityAlerts(
    outdoorData
      ? {
        pm25: outdoorData.airPollution.pm2_5,
        pm25Level: getPM25Level(outdoorData.airPollution.pm2_5),
        pm10: outdoorData.airPollution.pm10,
        pm10Level: getPM10Level(outdoorData.airPollution.pm10),
        o3: outdoorData.airPollution.o3,
        o3Level: getO3Level(outdoorData.airPollution.o3),
        no2: outdoorData.airPollution.no2,
        no2Level: getNO2Level(outdoorData.airPollution.no2),
        so2: outdoorData.airPollution.so2,
        so2Level: getSO2Level(outdoorData.airPollution.so2),
        co: outdoorData.airPollution.co / 1000,
        coLevel: getCOLevel(outdoorData.airPollution.co / 1000),
      }
      : null,
    alertsEnabled
  );

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['indoorAirQuality'] });
    queryClient.invalidateQueries({ queryKey: ['outdoorData'] });
    toast.success('Data refreshed successfully');
  };

  const handleExport = (format: 'csv' | 'json') => {
    const exportData: ExportData = {
      timestamp: new Date().toISOString(),
      location: {
        name: location.name,
        lat: location.lat,
        lon: location.lon,
      },
      indoor: indoorData
        ? {
          pm25: indoorData.PM2_5,
          pm10: indoorData.PM10,
          no2: indoorData.NO2,
          co: indoorData.CO,
          so2: indoorData.SO2,
          o3: indoorData.O3,
        }
        : undefined,
      outdoor: outdoorData
        ? {
          pm25: outdoorData.airPollution.pm2_5,
          pm10: outdoorData.airPollution.pm10,
          co: outdoorData.airPollution.co / 1000,
          no2: outdoorData.airPollution.no2,
          so2: outdoorData.airPollution.so2,
          o3: outdoorData.airPollution.o3,
          temperature: outdoorData.weather.temp,
          humidity: outdoorData.weather.humidity,
          uvi: outdoorData.weather.uvi,
        }
        : undefined,
    };

    if (format === 'csv') {
      exportToCSV(exportData);
      toast.success('Data exported as CSV');
    } else {
      exportToJSON(exportData);
      toast.success('Data exported as JSON');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      {/* Navigation */}
      <DashboardNav
        onRefresh={handleRefresh}
        onExport={handleExport}
        onToggleAlerts={() => setAlertsEnabled(!alertsEnabled)}
        alertsEnabled={alertsEnabled}
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Outdoor/Indoor Tabs */}
          <Tabs defaultValue="outdoor" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-14 p-1 bg-muted/50 rounded-lg">
              <TabsTrigger 
                value="outdoor" 
                className="flex items-center justify-center gap-2 h-12 text-base font-semibold rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Cloud className="h-5 w-5" />
                Outdoor
              </TabsTrigger>
              <TabsTrigger 
                value="indoor" 
                className="flex items-center justify-center gap-2 h-12 text-base font-semibold rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Home className="h-5 w-5" />
                Indoor
              </TabsTrigger>
            </TabsList>

            {/* Outdoor Tab Content */}
            <TabsContent value="outdoor" className="mt-6 space-y-6">
              {/* Location Favorites */}
              <LocationFavorites
                currentLocation={location}
                onLocationSelect={setLocation}
              />

              {/* Location Selector */}
              <LocationSelector currentLocation={location} onLocationChange={setLocation} />

              {/* Outdoor Air Quality */}
              <div id="outdoor">
                <OutdoorAirQuality
                  lat={location.lat}
                  lon={location.lon}
                  locationName={location.name}
                />
              </div>

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
                <div id="alerts">
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
                </div>
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

              {/* Weekly Trends */}
              {outdoorData && (
                <WeeklyTrends
                  currentPM25={outdoorData.airPollution.pm2_5}
                  currentPM10={outdoorData.airPollution.pm10}
                  currentO3={outdoorData.airPollution.o3}
                  currentNO2={outdoorData.airPollution.no2}
                />
              )}

              {/* Location Comparison */}
              <div id="comparison">
                <LocationComparison />
              </div>
            </TabsContent>

            {/* Indoor Tab Content */}
            <TabsContent value="indoor" className="mt-6 space-y-6">
              <div id="indoor">
                <ErrorBoundary>
                  <IndoorAirQuality />
                </ErrorBoundary>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-12 py-6 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            Real-time data updates • Indoor sensors via Firebase • Outdoor data from OpenWeatherMap
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
