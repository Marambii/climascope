import ReactECharts from 'echarts-for-react';
import dummyData from '../data/dummyData.json';
import type { ClimascopeResponse } from '../types/mockData';

export function MetricCharts() {
  // Cast the local JSON to your strict TypeScript interface
  const data = dummyData as unknown as ClimascopeResponse;
  
  // Extract time labels for the X-axis safely
  const timeLabels = data.historical_metrics?.map(m => 
    new Date(m.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  ) || [];

  // 1. Temperature Composite Chart Configuration
  const temperatureOptions = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['Base Temp', 'MCP Temp', 'Wet Bulb'], bottom: 0 },
    grid: { left: '10%', right: '5%', bottom: '15%', top: '10%' },
    xAxis: { type: 'category', data: timeLabels, boundaryGap: false },
    yAxis: { type: 'value', name: '°C', scale: true },
    series: [
      { name: 'Base Temp', type: 'line', smooth: true, data: data.historical_metrics?.map(m => m.temp_bme) },
      { name: 'MCP Temp', type: 'line', smooth: true, data: data.historical_metrics?.map(m => m.temp_mcp), lineStyle: { type: 'dashed' } },
      { name: 'Wet Bulb', type: 'line', smooth: true, data: data.historical_metrics?.map(m => m.wet_bulb_temp), areaStyle: { opacity: 0.1 } }
    ],
    color: ['#f87171', '#fb923c', '#38bdf8'] 
  };

  // 2. Atmospheric & Moisture Chart Configuration (Dual Y-Axis)
  const atmosphericOptions = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['Humidity (%)', 'Pressure (hPa)'], bottom: 0 },
    grid: { left: '12%', right: '12%', bottom: '15%', top: '10%' },
    xAxis: { type: 'category', data: timeLabels, boundaryGap: false },
    yAxis: [
      { type: 'value', name: 'RH %', position: 'left', scale: true },
      { type: 'value', name: 'hPa', position: 'right', scale: true }
    ],
    series: [
      { name: 'Humidity (%)', type: 'line', smooth: true, yAxisIndex: 0, data: data.historical_metrics?.map(m => m.humidity_sht), areaStyle: { opacity: 0.2 } },
      { name: 'Pressure (hPa)', type: 'line', smooth: true, yAxisIndex: 1, data: data.historical_metrics?.map(m => m.press_bme) }
    ],
    color: ['#34d399', '#94a3b8'] 
  };

  // 3. Wind Conditions Chart Configuration
  const windOptions = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['Wind Speed', 'Wind Gust'], bottom: 0 },
    grid: { left: '10%', right: '5%', bottom: '15%', top: '10%' },
    xAxis: { type: 'category', data: timeLabels },
    yAxis: { type: 'value', name: 'm/s' },
    series: [
      { name: 'Wind Speed', type: 'bar', data: data.historical_metrics?.map(m => m.wind_spd) },
    ],
    color: ['#818cf8', '#c084fc'] 
  };

  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-slate-500">Temperature Trajectory</h3>
        <ReactECharts option={temperatureOptions} style={{ height: '280px', width: '100%' }} />
      </div>
      
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-slate-500">Atmospheric Profile</h3>
        <ReactECharts option={atmosphericOptions} style={{ height: '280px', width: '100%' }} />
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-slate-500">Wind Conditions</h3>
        <ReactECharts option={windOptions} style={{ height: '280px', width: '100%' }} />
      </div>
    </section>
  );
}