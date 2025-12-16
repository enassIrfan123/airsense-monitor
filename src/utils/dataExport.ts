export interface ExportData {
  timestamp: string;
  location: {
    name: string;
    lat: number;
    lon: number;
  };
  indoor?: {
    pm25: number;
    pm10: number;
    no2: number;
    co: number;
    so2: number;
    o3: number;
  };
  outdoor?: {
    pm25: number;
    pm10: number;
    co: number;
    no2: number;
    so2: number;
    o3: number;
    temperature: number;
    humidity: number;
    uvi: number;
  };
}

export function exportToCSV(data: ExportData): void {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  // Flatten the data structure
  const flatData = {
    timestamp: data.timestamp,
    location_name: data.location.name,
    location_lat: data.location.lat,
    location_lon: data.location.lon,
    indoor_pm25: data.indoor?.pm25 ?? 'N/A',
    indoor_pm10: data.indoor?.pm10 ?? 'N/A',
    indoor_no2: data.indoor?.no2 ?? 'N/A',
    indoor_co: data.indoor?.co ?? 'N/A',
    indoor_so2: data.indoor?.so2 ?? 'N/A',
    indoor_o3: data.indoor?.o3 ?? 'N/A',
    outdoor_pm25: data.outdoor?.pm25 ?? 'N/A',
    outdoor_pm10: data.outdoor?.pm10 ?? 'N/A',
    outdoor_co: data.outdoor?.co ?? 'N/A',
    outdoor_no2: data.outdoor?.no2 ?? 'N/A',
    outdoor_so2: data.outdoor?.so2 ?? 'N/A',
    outdoor_o3: data.outdoor?.o3 ?? 'N/A',
    outdoor_temp: data.outdoor?.temperature ?? 'N/A',
    outdoor_humidity: data.outdoor?.humidity ?? 'N/A',
    outdoor_uvi: data.outdoor?.uvi ?? 'N/A',
  };

  // Create CSV content
  const headers = Object.keys(flatData).join(',');
  const values = Object.values(flatData).join(',');
  const csv = `${headers}\n${values}`;

  // Download file
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `air-quality-data-${timestamp}.csv`;
  link.click();
}

export function exportToJSON(data: ExportData): void {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  // Create JSON content
  const json = JSON.stringify(data, null, 2);

  // Download file
  const blob = new Blob([json], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `air-quality-data-${timestamp}.json`;
  link.click();
}
