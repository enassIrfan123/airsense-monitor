import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Loader2, Locate } from 'lucide-react';
import { Location } from '@/types/airQuality';
import { toast } from 'sonner';

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
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

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

  const handleUseCurrentLocation = async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setIsLoadingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const currentLat = position.coords.latitude;
        const currentLon = position.coords.longitude;
        
        setLat(currentLat.toString());
        setLon(currentLon.toString());
        
        // Reverse geocode to get location name
        try {
          const response = await fetch(
            `https://api.openweathermap.org/geo/1.0/reverse?lat=${currentLat}&lon=${currentLon}&limit=1&appid=d13fb2febeee7ffb24c3cf514f5457d6`
          );
          
          if (response.ok) {
            const data = await response.json();
            if (data && data.length > 0) {
              const locationName = data[0].name || 'Current Location';
              setName(locationName);
              onLocationChange({ lat: currentLat, lon: currentLon, name: locationName });
              toast.success(`Location detected: ${locationName}`);
            } else {
              setName('Current Location');
              onLocationChange({ lat: currentLat, lon: currentLon, name: 'Current Location' });
              toast.success('Location detected');
            }
          } else {
            setName('Current Location');
            onLocationChange({ lat: currentLat, lon: currentLon, name: 'Current Location' });
            toast.success('Location detected');
          }
        } catch (error) {
          console.error('Reverse geocoding error:', error);
          setName('Current Location');
          onLocationChange({ lat: currentLat, lon: currentLon, name: 'Current Location' });
          toast.success('Location detected');
        }
        
        setIsLoadingLocation(false);
      },
      (error) => {
        setIsLoadingLocation(false);
        let errorMessage = 'Unable to retrieve your location';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location permissions.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        
        toast.error(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
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
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleUseCurrentLocation}
            disabled={isLoadingLocation}
            className="flex-1 bg-accent hover:bg-accent/90"
            size="lg"
          >
            {isLoadingLocation ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Detecting Location...
              </>
            ) : (
              <>
                <Locate className="h-4 w-4 mr-2" />
                Use Current Location
              </>
            )}
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or select a location</span>
          </div>
        </div>

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
