import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface HistoricalChartsProps {
  currentPM25: number;
  currentPM10: number;
  currentCO: number;
  currentNO2: number;
  currentO3: number;
  currentSO2: number;
}

interface DataPoint {
  time: string;
  PM25: number;
  PM10: number;
  CO: number;
  NO2: number;
  O3: number;
  SO2: number;
}

export function HistoricalCharts({ currentPM25, currentPM10, currentCO, currentNO2, currentO3, currentSO2 }: HistoricalChartsProps) {
  const [historicalData, setHistoricalData] = useState<DataPoint[]>([]);

  useEffect(() => {
    // Initialize with simulated historical data
    const now = new Date();
    const data: DataPoint[] = [];
    
    // Generate 24 hours of historical data (hourly)
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      const variation = Math.random() * 0.3 + 0.85; // 85-115% variation
      
      data.push({
        time: time.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
        PM25: currentPM25 * variation,
        PM10: currentPM10 * variation,
        CO: currentCO * variation,
        NO2: currentNO2 * variation,
        O3: currentO3 * variation,
        SO2: currentSO2 * variation,
      });
    }
    
    setHistoricalData(data);

    // Update with current values every 30 seconds
    const interval = setInterval(() => {
      setHistoricalData(prev => {
        const newData = [...prev.slice(1)];
        const now = new Date();
        newData.push({
          time: now.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
          PM25: currentPM25,
          PM10: currentPM10,
          CO: currentCO,
          NO2: currentNO2,
          O3: currentO3,
          SO2: currentSO2,
        });
        return newData;
      });
    }, 30000);

    return () => clearInterval(interval);
  }, [currentPM25, currentPM10, currentCO, currentNO2, currentO3, currentSO2]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg shadow-lg p-3">
          <p className="font-semibold text-sm mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value?.toFixed(2) ?? 'N/A'} μg/m³
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <CardTitle>Historical Data</CardTitle>
            <CardDescription>24-hour pollutant trends</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <Tabs defaultValue="particulates" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="particulates">Particulates</TabsTrigger>
            <TabsTrigger value="gases">Gases</TabsTrigger>
            <TabsTrigger value="all">All Pollutants</TabsTrigger>
          </TabsList>

          <TabsContent value="particulates" className="mt-6">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={historicalData}>
                <defs>
                  <linearGradient id="colorPM25" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPM10" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="time" 
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: '12px' }}
                  label={{ value: 'μg/m³', angle: -90, position: 'insideLeft', style: { fill: 'hsl(var(--muted-foreground))' } }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="PM25" 
                  stroke="hsl(var(--primary))" 
                  fillOpacity={1}
                  fill="url(#colorPM25)"
                  name="PM2.5"
                />
                <Area 
                  type="monotone" 
                  dataKey="PM10" 
                  stroke="hsl(var(--accent))" 
                  fillOpacity={1}
                  fill="url(#colorPM10)"
                  name="PM10"
                />
              </AreaChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="gases" className="mt-6">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="time" 
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: '12px' }}
                  label={{ value: 'μg/m³', angle: -90, position: 'insideLeft', style: { fill: 'hsl(var(--muted-foreground))' } }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="CO" stroke="hsl(var(--quality-moderate))" strokeWidth={2} name="CO" dot={false} />
                <Line type="monotone" dataKey="NO2" stroke="hsl(var(--quality-unhealthy))" strokeWidth={2} name="NO₂" dot={false} />
                <Line type="monotone" dataKey="O3" stroke="hsl(var(--accent))" strokeWidth={2} name="O₃" dot={false} />
                <Line type="monotone" dataKey="SO2" stroke="hsl(var(--primary))" strokeWidth={2} name="SO₂" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="all" className="mt-6">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="time" 
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: '12px' }}
                  label={{ value: 'μg/m³', angle: -90, position: 'insideLeft', style: { fill: 'hsl(var(--muted-foreground))' } }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="PM25" stroke="hsl(var(--primary))" strokeWidth={2} name="PM2.5" dot={false} />
                <Line type="monotone" dataKey="PM10" stroke="hsl(var(--accent))" strokeWidth={2} name="PM10" dot={false} />
                <Line type="monotone" dataKey="CO" stroke="hsl(var(--quality-moderate))" strokeWidth={2} name="CO" dot={false} />
                <Line type="monotone" dataKey="NO2" stroke="hsl(var(--quality-unhealthy))" strokeWidth={2} name="NO₂" dot={false} />
                <Line type="monotone" dataKey="O3" stroke="hsl(var(--quality-good))" strokeWidth={2} name="O₃" dot={false} />
                <Line type="monotone" dataKey="SO2" stroke="hsl(var(--quality-very-unhealthy))" strokeWidth={2} name="SO₂" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>

        <div className="mt-4 p-3 rounded-lg bg-muted text-sm text-muted-foreground">
          <p>📊 Showing 24-hour historical trends. Data updates every 30 seconds.</p>
        </div>
      </CardContent>
    </Card>
  );
}
