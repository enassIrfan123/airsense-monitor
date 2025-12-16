import { Card, CardContent } from '@/components/ui/card';
import { AirQualityMetric } from '@/types/airQuality';
import { getLevelColor, getLevelLabel } from '@/utils/airQualityCalculations';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  metric: AirQualityMetric;
}

export function MetricCard({ metric }: MetricCardProps) {
  const colorClass = getLevelColor(metric.level);
  const levelLabel = getLevelLabel(metric.level);

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg border-l-4" style={{ borderLeftColor: `hsl(var(--${colorClass}))` }}>
      <CardContent className="p-4">
        <div className="flex flex-col space-y-2">
          <div className="flex items-start justify-between">
            <span className="text-sm font-medium text-muted-foreground">{metric.label}</span>
            <span 
              className={cn("text-xs font-semibold px-2 py-1 rounded-full", `bg-${colorClass}/10`)}
              style={{ color: `hsl(var(--${colorClass}))` }}
            >
              {levelLabel}
            </span>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-foreground">
              {metric.value?.toFixed(1) ?? 'N/A'}
            </span>
            <span className="text-sm text-muted-foreground">{metric.unit}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
