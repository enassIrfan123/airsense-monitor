import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Loader2, Locate, ChevronDown, Navigation, Map } from 'lucide-react';
import { Location } from '@/types/airQuality';
import { toast } from 'sonner';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

// Fix Leaflet default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const API_KEY = 'd13fb2febeee7ffb24c3cf514f5457d6';

interface LocationSelectorProps {
  currentLocation: Location;
  onLocationChange: (location: Location) => void;
}

const presetLocations: Location[] = [
  { lat: 33.6844, lon: 73.0479, name: 'Islamabad' },
  { lat: 31.5497, lon: 74.3436, name: 'Lahore' },
  { lat: 24.8607, lon: 67.0011, name: 'Karachi' },
  { lat: 40.7128, lon: -74.0060, name: 'New York' },
  { lat: 51.5074, lon: -0.1278, name: 'London' },
  { lat: 35.6762, lon: 139.6503, name: 'Tokyo' },
];

interface CitySuggestion {
  name: string;
  country: string;
  lat: number;
  lon: number;
  state?: string;
}

export function LocationSelector({ currentLocation, onLocationChange }: LocationSelectorProps) {
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [manualLat, setManualLat] = useState('');
  const [manualLon, setManualLon] = useState('');
  const [manualName, setManualName] = useState('');
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [hoverCoords, setHoverCoords] = useState<{ lat: number; lon: number } | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const presetMarkersRef = useRef<L.Marker[]>([]);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    const normalizedQuery = searchQuery.trim();
    
    if (normalizedQuery.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(normalizedQuery)}&limit=5&appid=${API_KEY}`
        );

        if (response.ok) {
          const data = await response.json();
          setSuggestions(data);
          setShowSuggestions(data.length > 0);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Initialize and handle map picker
  useEffect(() => {
    if (!showMapPicker || !mapRef.current) return;

    // Clean up existing map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }
    presetMarkersRef.current = [];

    // Create new map centered on current location
    const map = L.map(mapRef.current, {
      zoomControl: false, // We'll add custom position
    }).setView([currentLocation.lat, currentLocation.lon], 3);
    mapInstanceRef.current = map;

    // Add zoom control to top-right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Add scale control
    L.control.scale({ position: 'bottomleft', imperial: false }).addTo(map);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 18,
    }).addTo(map);

    // Create custom icon for preset cities
    const presetIcon = L.divIcon({
      className: 'custom-preset-marker',
      html: `<div style="
        width: 24px;
        height: 24px;
        background: hsl(var(--primary));
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      "><div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    // Add preset city markers
    presetLocations.forEach((loc) => {
      const presetMarker = L.marker([loc.lat, loc.lon], { icon: presetIcon }).addTo(map);
      presetMarker.bindTooltip(loc.name, { 
        permanent: false, 
        direction: 'top',
        offset: [0, -12],
        className: 'preset-tooltip'
      });
      presetMarker.on('click', () => {
        onLocationChange(loc);
        toast.success(`Location set to ${loc.name}`);
        if (markerRef.current) {
          markerRef.current.setLatLng([loc.lat, loc.lon]);
          markerRef.current.bindPopup(`<strong>${loc.name}</strong>`).openPopup();
        }
      });
      presetMarkersRef.current.push(presetMarker);
    });

    // Add current location marker (different style)
    const selectedIcon = L.divIcon({
      className: 'custom-selected-marker',
      html: `<div style="
        width: 32px;
        height: 32px;
        background: hsl(var(--destructive));
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 3px 8px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        animation: pulse 2s infinite;
      "><div style="width: 10px; height: 10px; background: white; border-radius: 50%;"></div></div>
      <style>
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      </style>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const marker = L.marker([currentLocation.lat, currentLocation.lon], { icon: selectedIcon }).addTo(map);
    marker.bindPopup(`<strong>${currentLocation.name}</strong><br><small>Selected Location</small>`).openPopup();
    markerRef.current = marker;

    // Handle mouse move for coordinate display
    const handleMouseMove = (e: L.LeafletMouseEvent) => {
      setHoverCoords({ lat: e.latlng.lat, lon: e.latlng.lng });
    };

    const handleMouseOut = () => {
      setHoverCoords(null);
    };

    map.on('mousemove', handleMouseMove);
    map.on('mouseout', handleMouseOut);

    // Handle map clicks
    const handleMapClick = async (e: L.LeafletMouseEvent) => {
      const { lat, lng: lon } = e.latlng;
      
      // Update marker position
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lon]);
      } else {
        markerRef.current = L.marker([lat, lon], { icon: selectedIcon }).addTo(map);
      }

      // Reverse geocode to get location name
      try {
        const response = await fetch(
          `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`
        );
        
        if (response.ok) {
          const data = await response.json();
          const locationName = data?.[0]?.name || `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
          markerRef.current?.bindPopup(`<strong>${locationName}</strong><br><small>Selected Location</small>`).openPopup();
          onLocationChange({ lat, lon, name: locationName });
          toast.success(`Location set to ${locationName}`);
        } else {
          const name = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
          markerRef.current?.bindPopup(`<strong>${name}</strong><br><small>Selected Location</small>`).openPopup();
          onLocationChange({ lat, lon, name });
          toast.success(`Location set to ${name}`);
        }
      } catch (error) {
        const name = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
        markerRef.current?.bindPopup(`<strong>${name}</strong><br><small>Selected Location</small>`).openPopup();
        onLocationChange({ lat, lon, name });
        toast.success(`Location set to ${name}`);
      }
    };

    map.on('click', handleMapClick);

    // Fix map size issues when container becomes visible
    setTimeout(() => {
      map.invalidateSize();
    }, 100);

    return () => {
      map.off('click', handleMapClick);
      map.off('mousemove', handleMouseMove);
      map.off('mouseout', handleMouseOut);
      presetMarkersRef.current = [];
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [showMapPicker, currentLocation.lat, currentLocation.lon, onLocationChange]);

  const handlePresetClick = (location: Location) => {
    onLocationChange(location);
    toast.success(`Location set to ${location.name}`);
  };

  const handleSuggestionSelect = (suggestion: CitySuggestion) => {
    const locationName = `${suggestion.name}${suggestion.state ? `, ${suggestion.state}` : ''}, ${suggestion.country}`;
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    onLocationChange({ lat: suggestion.lat, lon: suggestion.lon, name: locationName });
    toast.success(`Location set to ${locationName}`);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedLat = parseFloat(manualLat);
    const parsedLon = parseFloat(manualLon);
    
    if (!isNaN(parsedLat) && !isNaN(parsedLon)) {
      const name = manualName || `${parsedLat.toFixed(2)}, ${parsedLon.toFixed(2)}`;
      onLocationChange({ lat: parsedLat, lon: parsedLon, name });
      toast.success(`Location set to ${name}`);
      setManualLat('');
      setManualLon('');
      setManualName('');
    } else {
      toast.error('Please enter valid coordinates');
    }
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
        
        try {
          const response = await fetch(
            `https://api.openweathermap.org/geo/1.0/reverse?lat=${currentLat}&lon=${currentLon}&limit=1&appid=${API_KEY}`
          );
          
          if (response.ok) {
            const data = await response.json();
            if (data && data.length > 0) {
              const locationName = data[0].name || 'Current Location';
              onLocationChange({ lat: currentLat, lon: currentLon, name: locationName });
              toast.success(`Location detected: ${locationName}`);
            } else {
              onLocationChange({ lat: currentLat, lon: currentLon, name: 'Current Location' });
              toast.success('Location detected');
            }
          } else {
            onLocationChange({ lat: currentLat, lon: currentLon, name: 'Current Location' });
            toast.success('Location detected');
          }
        } catch (error) {
          console.error('Reverse geocoding error:', error);
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
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {/* Current Location Header */}
        <div className="bg-primary/5 border-b p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Navigation className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Current Location</p>
                <h3 className="text-lg font-semibold">{currentLocation.name}</h3>
              </div>
            </div>
            <Button
              onClick={handleUseCurrentLocation}
              disabled={isLoadingLocation}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              {isLoadingLocation ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Locate className="h-4 w-4" />
              )}
              {isLoadingLocation ? 'Detecting...' : 'Auto-detect'}
            </Button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Search Input */}
          <div className="relative" ref={dropdownRef}>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for a city..."
                className="pl-10 pr-10 h-11"
                autoComplete="off"
              />
              {isSearching && (
                <Loader2 className="h-4 w-4 animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              )}
            </div>
            
            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 z-50">
                <Command className="rounded-lg border shadow-lg bg-popover">
                  <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup>
                      {suggestions.map((suggestion, index) => (
                        <CommandItem
                          key={`${suggestion.lat}-${suggestion.lon}-${index}`}
                          onSelect={() => handleSuggestionSelect(suggestion)}
                          className="cursor-pointer py-3"
                        >
                          <MapPin className="mr-3 h-4 w-4 text-primary" />
                          <div>
                            <span className="font-medium">{suggestion.name}</span>
                            <span className="text-muted-foreground">
                              {suggestion.state && `, ${suggestion.state}`}
                              {`, ${suggestion.country}`}
                            </span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </div>
            )}
          </div>

          {/* Quick Select Cities */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Quick Select</p>
            <div className="flex flex-wrap gap-2">
              {presetLocations.map((location) => (
                <Button
                  key={location.name}
                  variant={currentLocation.name === location.name ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePresetClick(location)}
                  className="h-8 text-xs"
                >
                  {location.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Map Picker */}
          <Collapsible open={showMapPicker} onOpenChange={setShowMapPicker}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-between text-muted-foreground hover:text-foreground">
                <span className="flex items-center gap-2 text-xs uppercase tracking-wide">
                  <Map className="h-4 w-4" />
                  Select on Map
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${showMapPicker ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">Click anywhere on the map to select a location</p>
                  {hoverCoords && (
                    <div className="text-xs font-mono bg-muted px-2 py-1 rounded">
                      {hoverCoords.lat.toFixed(4)}, {hoverCoords.lon.toFixed(4)}
                    </div>
                  )}
                </div>
                <div className="relative">
                  <div 
                    ref={mapRef} 
                    className="h-[300px] rounded-lg overflow-hidden border"
                    style={{ zIndex: 0 }}
                  />
                  <div className="absolute bottom-2 right-2 z-10 bg-background/90 backdrop-blur-sm rounded px-2 py-1 text-xs flex items-center gap-2 border shadow-sm">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-primary border border-white" />
                      <span>Cities</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-destructive border border-white" />
                      <span>Selected</span>
                    </div>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Advanced: Manual Coordinates */}
          <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-between text-muted-foreground hover:text-foreground">
                <span className="text-xs uppercase tracking-wide">Manual Coordinates</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3">
              <form onSubmit={handleManualSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Input
                      type="number"
                      step="any"
                      value={manualLat}
                      onChange={(e) => setManualLat(e.target.value)}
                      placeholder="Latitude"
                      className="h-9"
                    />
                  </div>
                  <div>
                    <Input
                      type="number"
                      step="any"
                      value={manualLon}
                      onChange={(e) => setManualLon(e.target.value)}
                      placeholder="Longitude"
                      className="h-9"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Input
                    type="text"
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    placeholder="Location name (optional)"
                    className="h-9 flex-1"
                  />
                  <Button type="submit" size="sm" className="h-9">
                    Set
                  </Button>
                </div>
              </form>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </CardContent>
    </Card>
  );
}
