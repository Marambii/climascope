import ReactECharts from 'echarts-for-react';
import dummyData from '../data/dummyData.json';
import type { ClimascopeResponse } from '../types/mockData';

export function MetricCharts() {
  const data = dummyData as unknown as ClimascopeResponse;
  const metrics = data.historical_metrics || [];

  // Extract timestamps for X-axis categories
  const timestamps = metrics.map((m) => 
    new Date(m.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );

  // 1. Temperature Composite Chart Options (BME, MCP, SHT, Wet Bulb)
  const tempOptions = {
    title: { 
      text: 'Temperature Trajectory & Thermal Stress', 
      textStyle: { fontSize: 14, fontWeight: 'bold', color: '#1e293b' } 
    },
    tooltip: { trigger: 'axis' },
    legend: { data: ['BME Temp', 'MCP Temp', 'SHT Temp', 'Wet Bulb'], bottom: 0, textStyle: { fontSize: 11 } },
    xAxis: { type: 'category', data: timestamps, boundaryGap: false },
    yAxis: { type: 'value', name: '°C' },
    series: [
      { name: 'BME Temp', type: 'line', data: metrics.map(m => m.temp_bme), smooth: true, itemStyle: { color: '#0d9488' } },
      { name: 'MCP Temp', type: 'line', data: metrics.map(m => m.temp_mcp), smooth: true, itemStyle: { color: '#059669' } },
      { name: 'SHT Temp', type: 'line', data: metrics.map(m => m.temp_sht), smooth: true, itemStyle: { color: '#10b981' } },
      { name: 'Wet Bulb', type: 'line', data: metrics.map(m => m.wet_bulb_temp), smooth: true, itemStyle: { color: '#64748b' }, lineStyle: { type: 'dashed' } }
    ],
    grid: { left: '10%', right: '5%', bottom: '15%', top: '15%' }
  };

  // 2. Soil Moisture & Hydration Focus Chart (Expanded for detailed soil metrics)
  const soilMoistureOptions = {
    title: { 
      text: 'Soil Moisture & Surface Hydration Dynamics', 
      textStyle: { fontSize: 14, fontWeight: 'bold', color: '#1e293b' } 
    },
    tooltip: { trigger: 'axis' },
    legend: { data: ['Relative Humidity (%)', 'Soil Moisture Proxy'], bottom: 0, textStyle: { fontSize: 11 } },
    xAxis: { type: 'category', data: timestamps, boundaryGap: false },
    yAxis: { type: 'value', name: '%' },
    series: [
      { 
        name: 'Relative Humidity (%)', 
        type: 'line', 
        data: metrics.map(m => m.humidity_sht), 
        smooth: true, 
        itemStyle: { color: '#3b82f6' },
        areaStyle: { color: 'rgba(59, 130, 246, 0.1)' }
      },
      { 
        name: 'Soil Moisture Proxy', 
        type: 'bar', 
        data: metrics.map(m => m.humidity_sht * 0.4), // Simulated soil retention index based on available conduit data
        itemStyle: { color: '#0284c7' }
      }
    ],
    grid: { left: '10%', right: '5%', bottom: '15%', top: '15%' }
  };

  // 3. Precipitation & Rainfall Chart
  const precipitationOptions = {
    title: { 
      text: 'Precipitation & Rainfall Accumulation', 
      textStyle: { fontSize: 14, fontWeight: 'bold', color: '#1e293b' } 
    },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: timestamps },
    yAxis: { type: 'value', name: 'mm' },
    series: [
      { 
        name: 'Rainfall (rg1)', 
        type: 'bar', 
        data: metrics.map(m => m.rg1), 
        itemStyle: { color: '#0284c7' } 
      }
    ],
    grid: { left: '10%', right: '5%', bottom: '10%', top: '15%' }
  };

  // 4. Atmospheric Pressure & Wind Dynamics Chart
  const atmosphericOptions = {
    title: { 
      text: 'Atmospheric Pressure & Wind Speed', 
      textStyle: { fontSize: 14, fontWeight: 'bold', color: '#1e293b' } 
    },
    tooltip: { trigger: 'axis' },
    legend: { data: ['Pressure (hPa)', 'Wind Speed (m/s)'], bottom: 0, textStyle: { fontSize: 11 } },
    xAxis: { type: 'category', data: timestamps, boundaryGap: false },
    yAxis: [
      { type: 'value', name: 'hPa', min: 'dataMin' },
      { type: 'value', name: 'm/s', position: 'right' }
    ],
    series: [
      { name: 'Pressure (hPa)', type: 'line', data: metrics.map(m => m.press_bme), smooth: true, itemStyle: { color: '#8b5cf6' } },
      { name: 'Wind Speed (m/s)', type: 'line', yAxisIndex: 1, data: metrics.map(m => m.wind_spd), smooth: true, itemStyle: { color: '#f59e0b' } }
    ],
    grid: { left: '10%', right: '10%', bottom: '15%', top: '15%' }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
      
      {/* Chart 1: Temperature Trajectory (Spans 6 columns - half width) */}
      <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <ReactECharts option={tempOptions} style={{ height: '320px', width: '100%' }} />
      </div>

      {/* Chart 2: Soil Moisture & Hydration (Spans 6 columns - half width) */}
      <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <ReactECharts option={soilMoistureOptions} style={{ height: '320px', width: '100%' }} />
      </div>

      {/* Chart 3: Precipitation & Rainfall (Spans 6 columns - half width) */}
      <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <ReactECharts option={precipitationOptions} style={{ height: '320px', width: '100%' }} />
      </div>

      {/* Chart 4: Atmospheric Pressure & Wind (Spans 6 columns - half width) */}
      <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <ReactECharts option={atmosphericOptions} style={{ height: '320px', width: '100%' }} />
      </div>

    </div>
  );
}