import { Sun, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface UVIndexProps {
  uvi?: number;
}

function getUVLevel(uvi: number): { level: string; color: string; advice: string } {
  if (uvi <= 2) {
    return {
      level: 'Low',
      color: 'text-green-600 bg-green-100',
      advice: 'No protection needed. You can safely stay outside.',
    };
  } else if (uvi <= 5) {
    return {
      level: 'Moderate',
      color: 'text-yellow-600 bg-yellow-100',
      advice: 'Wear sunscreen and protective clothing during midday hours.',
    };
  } else if (uvi <= 7) {
    return {
      level: 'High',
      color: 'text-orange-600 bg-orange-100',
      advice: 'Protection essential. Use sunscreen SPF 30+, wear hat and sunglasses.',
    };
  } else if (uvi <= 10) {
    return {
      level: 'Very High',
      color: 'text-red-600 bg-red-100',
      advice: 'Extra protection needed. Avoid sun during midday hours.',
    };
  } else {
    return {
      level: 'Extreme',
      color: 'text-purple-600 bg-purple-100',
      advice: 'Take all precautions. Avoid sun exposure during midday hours.',
    };
  }
}

export function UVIndex({ uvi }: UVIndexProps) {
  if (uvi === undefined || uvi === null) {
    return null;
  }

  const uvInfo = getUVLevel(uvi);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sun className="h-5 w-5 text-yellow-500" />
          UV Index
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className={`px-6 py-3 rounded-lg ${uvInfo.color}`}>
            <p className="text-3xl font-bold">{uvi?.toFixed(1) ?? 'N/A'}</p>
          </div>
          <div>
            <p className={`text-lg font-semibold ${uvInfo.color.split(' ')[0]}`}>
              {uvInfo.level}
            </p>
          </div>
        </div>
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{uvInfo.advice}</AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
