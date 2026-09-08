// Shared Data Contract Interfaces based on Felix/Josh API design

export type SeverityLevel = "NORMAL" | "WATCH" | "WARNING" | "CRITICAL";

export interface Anomaly {
  variable: string;
  description: string;
  severity: SeverityLevel;
}

export interface HistoricalMetric {
  ts: string;
  temp_bme: number;
  temp_mcp: number;
  wet_bulb_temp: number;
  press_bme: number;
  humidity_sht: number;
  wind_spd: number;
 
}
export interface ClimascopeResponse {
  location_id: number;
  station_name: string;
  last_updated: string;
  risk_type: string;
  risk_probability: number;
  severity: SeverityLevel;
  forecast_window_days: number;
  confidence: number;
  anomalies: Anomaly[];
  drivers: string[];
  recommended_action: string;
  historical_metrics: HistoricalMetric[];
}