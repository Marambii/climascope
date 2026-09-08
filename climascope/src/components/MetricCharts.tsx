import ReactECharts from 'echarts-for-react';
import dummyData from '../data/dummyData.json';
import type { ClimascopeResponse } from '../types/mockData';

export function MetricCharts() {
  const data = dummyData as unknown as ClimascopeResponse;
  
  // Extract time labels for the X-axis
  const timeLabels = data.historical_metrics.map(m => 
    new Date(m.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );

  // 1. Temperature Composite Chart Configuration
  const temperatureOptions = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['Base Temp', 'MCP Temp', 'Wet Bulb Temp'], bottom: 0 },
    grid: { left: '8%', right: '5%', bottom: '15%', top: '10%' },
    xAxis: { type: 'category', data: timeLabels, boundaryGap: false },
    yAxis: { type: 'value', name: '°C' },
    series: [
      { name: 'Base Temp', type: 'line', smooth: true, data: data.historical_metrics.map(m => m.temp_bme) },
      { name: 'MCP Temp', type: 'line', smooth: true, data: data.historical_metrics.map(m => m.temp_mcp), lineStyle: { type: 'dashed' } },
      { name: 'Wet Bulb Temp', type: 'line', smooth: true, data: data.historical_metrics.map(m => m.wet_bulb_temp), areaStyle: { opacity: 0.1 } }
    ],
    color: ['#f87171', '#fb923c', '#38bdf8'] // Tailwind red-400, orange-400, sky-400
  };

  // 2. Atmospheric & Moisture Chart Configuration (Dual Y-Axis)
  const atmosphericOptions = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['Humidity (%)', 'Pressure (hPa)'], bottom: 0 },
    grid: { left: '8%', right: '8%', bottom: '15%', top: '10%' },
    xAxis: { type: 'category', data: timeLabels, boundaryGap: false },
    yAxis: [
      { type: 'value', name: 'Humidity (%)', position: 'left', min: 70, max: 100 },
      { type: 'value', name: 'Pressure (hPa)', position: 'right', min: 840, max: 860 }
    ],
    series: [
      { name: 'Humidity (%)', type: 'line', smooth: true, yAxisIndex: 0, data: data.historical_metrics.map(m => m.humidity_sht), areaStyle: { opacity: 0.2 } },
      { name: 'Pressure (hPa)', type: 'line', smooth: true, yAxisIndex: 1, data: data.historical_metrics.map(m => m.press_bme) }
    ],
    color: ['#34d399', '#94a3b8'] // Tailwind emerald-400, slate-400
  };

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold mb-4 text-slate-800">Temperature Trajectory</h3>
        <ReactECharts option={temperatureOptions} style={{ height: '320px', width: '100%' }} />
      </div>
      
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold mb-4 text-slate-800">Atmospheric Conditions</h3>
        <ReactECharts option={atmosphericOptions} style={{ height: '320px', width: '100%' }} />
      </div>
    </section>
  );
}