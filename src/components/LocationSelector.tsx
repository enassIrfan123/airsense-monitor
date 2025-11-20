import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import { Location } from '@/types/airQuality';

interface LocationSelectorProps {
  currentLocation: Location;
  onLocationChange: (location: Location) => void;
}

const presetLocations: Location[] = [
  { lat: 40.7128, lon: -74.0060, name: 'New York' },
  { lat: 51.5074, lon: -0.1278, name: 'London' },
  { lat: 35.6762, lon: 139.6503, name: 'Tokyo' },
  { lat: 48.8566, lon: 2.3522, name: 'Paris' },
  { lat: -33.8688, lon: 151.2093, name: 'Sydney' },
];

export function LocationSelector({ currentLocation, onLocationChange }: LocationSelectorProps) {
  const [lat, setLat] = useState(currentLocation.lat.toString());
  const [lon, setLon] = useState(currentLocation.lon.toString());
  const [name, setName] = useState(currentLocation.name);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedLat = parseFloat(lat);
    const parsedLon = parseFloat(lon);
    
    if (!isNaN(parsedLat) && !isNaN(parsedLon)) {
      onLocationChange({ lat: parsedLat, lon: parsedLon, name });
    }
  };

  const handlePresetClick = (location: Location) => {
    setLat(location.lat.toString());
    setLon(location.lon.toString());
    setName(location.name);
    onLocationChange(location);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Location Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {presetLocations.map((location) => (
            <Button
              key={location.name}
              variant={currentLocation.name === location.name ? 'default' : 'outline'}
              size="sm"
              onClick={() => handlePresetClick(location)}
            >
              {location.name}
            </Button>
          ))}
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lat">Latitude</Label>
              <Input
                id="lat"
                type="number"
                step="any"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                placeholder="40.7128"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lon">Longitude</Label>
              <Input
                id="lon"
                type="number"
                step="any"
                value={lon}
                onChange={(e) => setLon(e.target.value)}
                placeholder="-74.0060"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Location Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Custom Location"
              />
            </div>
          </div>
          <Button type="submit" className="w-full sm:w-auto">
            Update Location
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
