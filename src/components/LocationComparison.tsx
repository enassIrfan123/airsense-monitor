import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useOutdoorData } from '@/hooks/useOutdoorData';
import { MapPin, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { getPM25Level, getPM10Level, getLevelColor, getLevelLabel } from '@/utils/airQualityCalculations';

interface ComparisonLocation {
  name: string;
  lat: number;
  lon: number;
}

export function LocationComparison() {
  const [locations, setLocations] = useState<ComparisonLocation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearchLocation = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a location');
      return;
    }

    setIsSearching(true);
    try {
      const geocodeUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(searchQuery)}&limit=1&appid=d13fb2febeee7ffb24c3cf514f5457d6`;
      const response = await fetch(geocodeUrl);
      const data = await response.json();

      if (data && data.length > 0) {
        const location = data[0];
        const newLocation: ComparisonLocation = {
          name: location.name + (location.state ? `, ${location.state}` : '') + (location.country ? `, ${location.country}` : ''),
          lat: location.lat,
          lon: location.lon,
        };

        if (locations.some(loc => loc.lat === newLocation.lat && loc.lon === newLocation.lon)) {
          toast.error('Location already added');
          return;
        }

        if (locations.length >= 4) {
          toast.error('Maximum 4 locations allowed');
          return;
        }

        setLocations([...locations, newLocation]);
        setSearchQuery('');
        toast.success(`Added ${newLocation.name}`);
      } else {
        toast.error('Location not found');
      }
    } catch (error) {
      toast.error('Failed to search location');
      console.error(error);
    } finally {
      setIsSearching(false);
    }
  };

  const removeLocation = (index: number) => {
    setLocations(locations.filter((_, i) => i !== index));
  };

  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <MapPin className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <CardTitle>Location Comparison</CardTitle>
            <CardDescription>Compare air quality across multiple locations</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Add Location */}
        <div className="flex gap-2">
          <Input
            placeholder="Search city name (e.g., Paris, Tokyo)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearchLocation()}
            disabled={isSearching || locations.length >= 4}
          />
          <Button
            onClick={handleSearchLocation}
            disabled={isSearching || locations.length >= 4}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </div>

        {/* Comparison Grid */}
        {locations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {locations.map((location, index) => (
              <LocationCard
                key={`${location.lat}-${location.lon}`}
                location={location}
                onRemove={() => removeLocation(index)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <MapPin className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Add locations to compare air quality</p>
            <p className="text-sm mt-1">You can add up to 4 locations</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface LocationCardProps {
  location: ComparisonLocation;
  onRemove: () => void;
}

function LocationCard({ location, onRemove }: LocationCardProps) {
  const { data, isLoading, error } = useOutdoorData(location.lat, location.lon);

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-4">
          <div className="h-24 bg-muted rounded"></div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="border-destructive">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-sm">{location.name}</h3>
            <Button variant="ghost" size="sm" onClick={onRemove}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-destructive">Failed to load data</p>
        </CardContent>
      </Card>
    );
  }

  const pm25Level = getPM25Level(data.airPollution.pm2_5);
  const pm10Level = getPM10Level(data.airPollution.pm10);
  const pm25Color = getLevelColor(pm25Level);
  const pm25Label = getLevelLabel(pm25Level);

  return (
    <Card className="border-l-4 transition-all hover:shadow-md" style={{ borderLeftColor: `hsl(var(--${pm25Color}))` }}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-1">{location.name}</h3>
            <div className="flex items-center gap-2">
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: `hsl(var(--${pm25Color}) / 0.1)`,
                  color: `hsl(var(--${pm25Color}))`
                }}
              >
                {pm25Label}
              </span>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onRemove} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">PM2.5</span>
            <span className="font-mono font-semibold">{data.airPollution.pm2_5?.toFixed(1) ?? 'N/A'} μg/m³</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">PM10</span>
            <span className="font-mono font-semibold">{data.airPollution.pm10?.toFixed(1) ?? 'N/A'} μg/m³</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Temperature</span>
            <span className="font-mono">{data.weather.temp?.toFixed(1) ?? 'N/A'}°C</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Humidity</span>
            <span className="font-mono">{data.weather.humidity}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
