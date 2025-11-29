import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Map } from 'lucide-react';

// Fix Leaflet default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface AirQualityMapProps {
  lat: number;
  lon: number;
  locationName: string;
  pm25: number;
}

function getPM25Color(pm25: number): string {
  if (pm25 <= 12) return '#00e400'; // Good
  if (pm25 <= 35.4) return '#ffff00'; // Moderate
  if (pm25 <= 55.4) return '#ff7e00'; // Unhealthy for Sensitive
  if (pm25 <= 150.4) return '#ff0000'; // Unhealthy
  if (pm25 <= 250.4) return '#8f3f97'; // Very Unhealthy
  return '#7e0023'; // Hazardous
}

export function AirQualityMap({ lat, lon, locationName, pm25 }: AirQualityMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Clean up existing map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
    }

    // Create new map
    const map = L.map(mapRef.current).setView([lat, lon], 10);
    mapInstanceRef.current = map;

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    // Add marker for the location
    const marker = L.circleMarker([lat, lon], {
      radius: 15,
      fillColor: getPM25Color(pm25),
      color: '#fff',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.7,
    }).addTo(map);

    marker.bindPopup(`
      <div style="text-align: center;">
        <strong>${locationName}</strong><br/>
        PM2.5: ${pm25?.toFixed(1) ?? 'N/A'} µg/m³
      </div>
    `).openPopup();

    // Add heat circle effect
    L.circle([lat, lon], {
      radius: 5000,
      fillColor: getPM25Color(pm25),
      color: getPM25Color(pm25),
      weight: 1,
      opacity: 0.3,
      fillOpacity: 0.1,
    }).addTo(map);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [lat, lon, locationName, pm25]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Map className="h-5 w-5 text-primary" />
          Air Quality Heat Map
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          PM2.5 levels visualization for {locationName}
        </p>
      </CardHeader>
      <CardContent>
        <div ref={mapRef} className="h-[400px] rounded-lg overflow-hidden border" />
        <div className="mt-4 flex flex-wrap gap-2 justify-center text-xs">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#00e400' }} />
            <span>Good</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ffff00' }} />
            <span>Moderate</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ff7e00' }} />
            <span>Unhealthy (Sensitive)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ff0000' }} />
            <span>Unhealthy</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#8f3f97' }} />
            <span>Very Unhealthy</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#7e0023' }} />
            <span>Hazardous</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
