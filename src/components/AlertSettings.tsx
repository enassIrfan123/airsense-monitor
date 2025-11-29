import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AirQualityLevel } from '@/types/airQuality';
import { toast } from 'sonner';
import { Settings } from 'lucide-react';

export interface AlertThreshold {
  pollutant: 'pm25' | 'pm10' | 'o3' | 'no2' | 'so2' | 'co';
  value: number;
  level: AirQualityLevel;
}

interface AlertSettingsProps {
  onSave: (thresholds: AlertThreshold[]) => void;
  currentThresholds: AlertThreshold[];
}

const DEFAULT_THRESHOLDS: AlertThreshold[] = [
  { pollutant: 'pm25', value: 35.4, level: 'unhealthy' },
  { pollutant: 'pm10', value: 154, level: 'unhealthy' },
  { pollutant: 'o3', value: 85, level: 'unhealthy' },
  { pollutant: 'no2', value: 360, level: 'unhealthy' },
  { pollutant: 'so2', value: 185, level: 'unhealthy' },
  { pollutant: 'co', value: 12.4, level: 'unhealthy' },
];

const POLLUTANT_LABELS = {
  pm25: 'PM2.5',
  pm10: 'PM10',
  o3: 'Ozone (O₃)',
  no2: 'Nitrogen Dioxide (NO₂)',
  so2: 'Sulfur Dioxide (SO₂)',
  co: 'Carbon Monoxide (CO)',
};

const POLLUTANT_UNITS = {
  pm25: 'µg/m³',
  pm10: 'µg/m³',
  o3: 'µg/m³',
  no2: 'µg/m³',
  so2: 'µg/m³',
  co: 'mg/m³',
};

export function AlertSettings({ onSave, currentThresholds }: AlertSettingsProps) {
  const [thresholds, setThresholds] = useState<AlertThreshold[]>(currentThresholds);

  useEffect(() => {
    setThresholds(currentThresholds);
  }, [currentThresholds]);

  const handleValueChange = (pollutant: AlertThreshold['pollutant'], value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;

    setThresholds(prev =>
      prev.map(t => (t.pollutant === pollutant ? { ...t, value: numValue } : t))
    );
  };

  const handleLevelChange = (pollutant: AlertThreshold['pollutant'], level: AirQualityLevel) => {
    setThresholds(prev =>
      prev.map(t => (t.pollutant === pollutant ? { ...t, level } : t))
    );
  };

  const handleSave = () => {
    onSave(thresholds);
    toast.success('Alert thresholds updated');
  };

  const handleReset = () => {
    setThresholds(DEFAULT_THRESHOLDS);
    toast.info('Thresholds reset to defaults');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          <CardTitle>Alert Settings</CardTitle>
        </div>
        <CardDescription>
          Customize when you receive air quality alerts based on pollutant levels
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {thresholds.map(threshold => (
          <div key={threshold.pollutant} className="space-y-2">
            <Label className="text-base font-semibold">
              {POLLUTANT_LABELS[threshold.pollutant]}
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="text-sm text-muted-foreground">Threshold Value</Label>
                <div className="flex gap-2 items-center mt-1">
                  <Input
                    type="number"
                    step="0.1"
                    value={threshold.value}
                    onChange={e => handleValueChange(threshold.pollutant, e.target.value)}
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    {POLLUTANT_UNITS[threshold.pollutant]}
                  </span>
                </div>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Alert Level</Label>
                <Select
                  value={threshold.level}
                  onValueChange={(value: AirQualityLevel) =>
                    handleLevelChange(threshold.pollutant, value)
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="unhealthy">Unhealthy</SelectItem>
                    <SelectItem value="very-unhealthy">Very Unhealthy</SelectItem>
                    <SelectItem value="hazardous">Hazardous</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        ))}
        <div className="flex gap-3 pt-4">
          <Button onClick={handleSave} className="flex-1">
            Save Settings
          </Button>
          <Button onClick={handleReset} variant="outline">
            Reset to Defaults
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
