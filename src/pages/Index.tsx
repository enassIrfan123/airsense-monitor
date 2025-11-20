import { useState } from 'react';
import { IndoorAirQuality } from '@/components/IndoorAirQuality';
import { OutdoorAirQuality } from '@/components/OutdoorAirQuality';
import { LocationSelector } from '@/components/LocationSelector';
import { Location } from '@/types/airQuality';
import { Wind, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const Index = () => {
  const [location, setLocation] = useState<Location>({
    lat: 40.7128,
    lon: -74.0060,
    name: 'New York',
  });

  const queryClient = useQueryClient();

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
