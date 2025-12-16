import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Trash2 } from 'lucide-react';
import { Location } from '@/types/airQuality';
import { toast } from 'sonner';

interface LocationFavoritesProps {
  currentLocation: Location;
  onLocationSelect: (location: Location) => void;
  onAddFavorite?: () => void;
}

const STORAGE_KEY = 'air-quality-favorites';
const MAX_FAVORITES = 8;

export function LocationFavorites({ currentLocation, onLocationSelect, onAddFavorite }: LocationFavoritesProps) {
  const [favorites, setFavorites] = useState<Location[]>([]);

  // Load favorites from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load favorites', e);
      }
    }
  }, []);

  // Save favorites to localStorage
  const saveFavorites = (newFavorites: Location[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newFavorites));
    setFavorites(newFavorites);
  };

  const addToFavorites = () => {
    // Check if already in favorites
    const alreadyExists = favorites.some(
      fav => fav.lat === currentLocation.lat && fav.lon === currentLocation.lon
    );

    if (alreadyExists) {
      toast.info('Location already in favorites');
      return;
    }

    if (favorites.length >= MAX_FAVORITES) {
      toast.error(`Maximum ${MAX_FAVORITES} favorite locations allowed`);
      return;
    }

    const newFavorites = [...favorites, currentLocation];
    saveFavorites(newFavorites);
    toast.success(`${currentLocation.name} added to favorites`);
    
    if (onAddFavorite) onAddFavorite();
  };

  const removeFromFavorites = (location: Location) => {
    const newFavorites = favorites.filter(
      fav => !(fav.lat === location.lat && fav.lon === location.lon)
    );
    saveFavorites(newFavorites);
    toast.success(`${location.name} removed from favorites`);
  };

  const isCurrentLocation = (location: Location) => {
    return location.lat === currentLocation.lat && location.lon === currentLocation.lon;
  };

  const isFavorite = favorites.some(
    fav => fav.lat === currentLocation.lat && fav.lon === currentLocation.lon
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            <CardTitle>Favorite Locations</CardTitle>
          </div>
          <Button
            onClick={addToFavorites}
            variant={isFavorite ? "secondary" : "default"}
            size="sm"
            disabled={isFavorite}
          >
            <Star className={`h-4 w-4 mr-1 ${isFavorite ? 'fill-current' : ''}`} />
            {isFavorite ? 'Saved' : 'Add Current'}
          </Button>
        </div>
        <CardDescription>
          Quick access to your frequently monitored locations ({favorites.length}/{MAX_FAVORITES})
        </CardDescription>
      </CardHeader>
      <CardContent>
        {favorites.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No favorite locations yet</p>
            <p className="text-sm">Add your current location to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {favorites.map((location, index) => (
              <div
                key={index}
                className={`group relative p-4 rounded-lg border transition-all hover:shadow-md cursor-pointer ${
                  isCurrentLocation(location)
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => onLocationSelect(location)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                      <h3 className="font-semibold text-sm truncate">{location.name}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {location.lat.toFixed(4)}, {location.lon.toFixed(4)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromFavorites(location);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                {isCurrentLocation(location) && (
                  <Badge variant="secondary" className="mt-2 text-xs">
                    Current
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
