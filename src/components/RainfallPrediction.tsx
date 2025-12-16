import { CloudRain, Droplets } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface RainfallPredictionProps {
  rain_1h?: number;
  rain_3h?: number;
  clouds?: number;
}

export function RainfallPrediction({ rain_1h, rain_3h, clouds }: RainfallPredictionProps) {
  // Estimate precipitation probability based on cloud coverage
  const precipitationProb = clouds ? Math.min(clouds, 100) : 0;
  
  const hasRainData = rain_1h !== undefined || rain_3h !== undefined;
  const currentRain = rain_1h || 0;
  const recent3hRain = rain_3h || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <CloudRain className="h-5 w-5 text-blue-500" />
          Rainfall Prediction
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-secondary/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Droplets className="h-4 w-4 text-blue-500" />
              <p className="text-sm text-muted-foreground">Last Hour</p>
            </div>
            <p className="text-2xl font-bold">
              {hasRainData ? `${currentRain?.toFixed(1) ?? '0.0'} mm` : 'No rain'}
            </p>
          </div>
          
          <div className="p-4 bg-secondary/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CloudRain className="h-4 w-4 text-blue-500" />
              <p className="text-sm text-muted-foreground">Last 3 Hours</p>
            </div>
            <p className="text-2xl font-bold">
              {hasRainData ? `${recent3hRain?.toFixed(1) ?? '0.0'} mm` : 'No rain'}
            </p>
          </div>

          <div className="p-4 bg-secondary/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CloudRain className="h-4 w-4 text-blue-500" />
              <p className="text-sm text-muted-foreground">Cloud Coverage</p>
            </div>
            <p className="text-2xl font-bold">{clouds?.toFixed(0) || 0}%</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Precipitation Likelihood</span>
            <span className="font-semibold">{precipitationProb?.toFixed(0) ?? '0'}%</span>
          </div>
          <Progress value={precipitationProb} className="h-2" />
        </div>

        <p className="text-sm text-muted-foreground">
          {precipitationProb < 30 
            ? '☀️ Clear skies expected' 
            : precipitationProb < 60 
            ? '⛅ Partly cloudy, possible light rain' 
            : '🌧️ High chance of rain, bring an umbrella'}
        </p>
      </CardContent>
    </Card>
  );
}
