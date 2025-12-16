import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AirQualityLevel } from '@/types/airQuality';
import { Heart, AlertTriangle, Activity, Users } from 'lucide-react';

interface HealthRecommendationsProps {
  pm25Level: AirQualityLevel;
  pm10Level: AirQualityLevel;
  o3Level: AirQualityLevel;
  no2Level: AirQualityLevel;
}

interface Recommendation {
  group: string;
  advice: string;
  icon: typeof Heart;
}

function getRecommendations(level: AirQualityLevel): Recommendation[] {
  const recommendations: Record<AirQualityLevel, Recommendation[]> = {
    'good': [
      { group: 'General Public', advice: 'Air quality is satisfactory. Enjoy outdoor activities!', icon: Heart },
      { group: 'Sensitive Groups', advice: 'No special precautions needed.', icon: Users },
    ],
    'moderate': [
      { group: 'General Public', advice: 'Air quality is acceptable. Unusually sensitive people should consider reducing prolonged outdoor exertion.', icon: Heart },
      { group: 'Sensitive Groups', advice: 'Consider reducing prolonged or heavy outdoor activities if you experience symptoms.', icon: AlertTriangle },
    ],
    'unhealthy': [
      { group: 'General Public', advice: 'Reduce prolonged or heavy outdoor exertion. Take more breaks during outdoor activities.', icon: AlertTriangle },
      { group: 'Sensitive Groups', advice: 'Avoid prolonged or heavy outdoor activities. Keep outdoor activities short. Consider moving activities indoors.', icon: AlertTriangle },
      { group: 'Children & Elderly', advice: 'Limit time outdoors. Use air purifiers indoors if available.', icon: Users },
    ],
    'very-unhealthy': [
      { group: 'General Public', advice: 'Avoid prolonged or heavy outdoor activities. Move activities indoors or reschedule.', icon: AlertTriangle },
      { group: 'Sensitive Groups', advice: 'Avoid all outdoor physical activities. Stay indoors and keep activity levels low.', icon: AlertTriangle },
      { group: 'Everyone', advice: 'Wear N95 masks if you must go outside. Use air purifiers indoors.', icon: Activity },
    ],
    'hazardous': [
      { group: 'Everyone', advice: 'Remain indoors and keep activity levels low. Run air purifiers if available.', icon: AlertTriangle },
      { group: 'Everyone', advice: 'Avoid all outdoor activities. Wear N95 masks if you must go outside.', icon: AlertTriangle },
      { group: 'Emergency', advice: 'This is a health emergency. Follow local advisories. Seek medical attention if experiencing symptoms.', icon: AlertTriangle },
    ],
  };

  return recommendations[level] || recommendations['good'];
}

function getOverallLevel(pm25: AirQualityLevel, pm10: AirQualityLevel, o3: AirQualityLevel, no2: AirQualityLevel): AirQualityLevel {
  const levelPriority: Record<AirQualityLevel, number> = {
    'good': 1,
    'moderate': 2,
    'unhealthy': 3,
    'very-unhealthy': 4,
    'hazardous': 5,
  };

  const levels = [pm25, pm10, o3, no2];
  const maxLevel = levels.reduce((max, level) => 
    levelPriority[level] > levelPriority[max] ? level : max
  , 'good');

  return maxLevel;
}

function getLevelColor(level: AirQualityLevel): string {
  const colors = {
    'good': 'quality-good',
    'moderate': 'quality-moderate',
    'unhealthy': 'quality-unhealthy',
    'very-unhealthy': 'quality-very-unhealthy',
    'hazardous': 'quality-hazardous',
  };
  return colors[level];
}

export function HealthRecommendations({ pm25Level, pm10Level, o3Level, no2Level }: HealthRecommendationsProps) {
  const overallLevel = getOverallLevel(pm25Level, pm10Level, o3Level, no2Level);
  const recommendations = getRecommendations(overallLevel);
  const colorClass = getLevelColor(overallLevel);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b" style={{ borderLeftWidth: '4px', borderLeftColor: `hsl(var(--${colorClass}))` }}>
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Heart className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <CardTitle>Health Recommendations</CardTitle>
            <CardDescription>
              Based on current air quality conditions
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        {recommendations.map((rec, index) => {
          const Icon = rec.icon;
          return (
            <Alert key={index} className="border-l-4" style={{ borderLeftColor: `hsl(var(--${colorClass}))` }}>
              <Icon className="h-4 w-4" style={{ color: `hsl(var(--${colorClass}))` }} />
              <AlertDescription>
                <span className="font-semibold">{rec.group}:</span> {rec.advice}
              </AlertDescription>
            </Alert>
          );
        })}
        
        <div className="mt-6 p-4 rounded-lg bg-muted">
          <h4 className="font-semibold mb-2 text-sm">Additional Tips:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Monitor symptoms like coughing, shortness of breath, or eye irritation</li>
            <li>• Keep windows closed during poor air quality</li>
            <li>• Use HEPA air purifiers indoors when possible</li>
            <li>• Stay hydrated to help your body process pollutants</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
