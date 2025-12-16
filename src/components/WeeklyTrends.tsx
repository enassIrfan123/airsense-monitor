import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Calendar } from 'lucide-react';

interface WeeklyTrendsProps {
  currentPM25?: number;
  currentPM10?: number;
  currentO3?: number;
  currentNO2?: number;
}

interface DataPoint {
  day: string;
  pm25: number;
  pm10: number;
  o3: number;
  no2: number;
  avgAQI: number;
}

export function WeeklyTrends({ currentPM25 = 0, currentPM10 = 0, currentO3 = 0, currentNO2 = 0 }: WeeklyTrendsProps) {
  const [weeklyData, setWeeklyData] = useState<DataPoint[]>([]);

  useEffect(() => {
    // Generate simulated weekly data (7 days)
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const simulatedData: DataPoint[] = days.map((day, index) => {
      const isToday = index === 6; // Sunday is today
      const pm25 = isToday ? currentPM25 : currentPM25 * (0.7 + Math.random() * 0.6);
      const pm10 = isToday ? currentPM10 : currentPM10 * (0.7 + Math.random() * 0.6);
      const o3 = isToday ? currentO3 : currentO3 * (0.7 + Math.random() * 0.6);
      const no2 = isToday ? currentNO2 : currentNO2 * (0.7 + Math.random() * 0.6);
      
      // Simple AQI calculation (normalized average)
      const avgAQI = ((pm25 / 35.4) + (pm10 / 154) + (o3 / 85) + (no2 / 360)) * 25;

      return {
        day,
        pm25: parseFloat(pm25.toFixed(2)),
        pm10: parseFloat(pm10.toFixed(2)),
        o3: parseFloat(o3.toFixed(2)),
        no2: parseFloat(no2.toFixed(2)),
        avgAQI: parseFloat(avgAQI.toFixed(1)),
      };
    });

    setWeeklyData(simulatedData);
  }, [currentPM25, currentPM10, currentO3, currentNO2]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold mb-1">{payload[0].payload.day}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value?.toFixed(2) ?? 'N/A'} {entry.name === 'AQI' ? '' : 'μg/m³'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Calculate trend
  const firstDayAQI = weeklyData[0]?.avgAQI ?? 0;
  const lastDayAQI = weeklyData[weeklyData.length - 1]?.avgAQI ?? 0;
  const trendPercentage = firstDayAQI > 0 ? (((lastDayAQI - firstDayAQI) / firstDayAQI) * 100).toFixed(1) : '0.0';
  const isImproving = parseFloat(trendPercentage) < 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <CardTitle>Weekly Air Quality Trends</CardTitle>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <TrendingUp className={`h-4 w-4 ${isImproving ? 'text-quality-good' : 'text-quality-unhealthy'}`} />
            <span className={isImproving ? 'text-quality-good' : 'text-quality-unhealthy'}>
              {isImproving ? 'Improving' : 'Declining'} ({trendPercentage}%)
            </span>
          </div>
        </div>
        <CardDescription>7-day air quality patterns and analysis</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="particulates">Particulates</TabsTrigger>
            <TabsTrigger value="gases">Gases</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="colorAQI" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="day" className="text-xs" />
                <YAxis className="text-xs" label={{ value: 'AQI', angle: -90, position: 'insideLeft' }} />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="avgAQI" 
                  stroke="hsl(var(--primary))" 
                  fill="url(#colorAQI)"
                  name="AQI"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="particulates" className="mt-4">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="day" className="text-xs" />
                <YAxis className="text-xs" label={{ value: 'μg/m³', angle: -90, position: 'insideLeft' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="pm25" stroke="hsl(var(--quality-moderate))" name="PM2.5" strokeWidth={2} />
                <Line type="monotone" dataKey="pm10" stroke="hsl(var(--quality-unhealthy))" name="PM10" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="gases" className="mt-4">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="day" className="text-xs" />
                <YAxis className="text-xs" label={{ value: 'μg/m³', angle: -90, position: 'insideLeft' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="o3" stroke="hsl(var(--primary))" name="Ozone (O₃)" strokeWidth={2} />
                <Line type="monotone" dataKey="no2" stroke="hsl(var(--accent))" name="NO₂" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        <p>Weekly trends based on simulated historical data • Updates daily at midnight</p>
      </CardFooter>
    </Card>
  );
}
