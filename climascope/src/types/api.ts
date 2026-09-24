export type SeverityLevel = "NORMAL" | "WATCH" | "WARNING" | "CRITICAL";

export interface ApiAnomaly {
  id: number;
  variable: string;
  description: string;
  severity: string;
  timestamp?: string;
}

export interface RecommendedAction {
  id: number;
  action_text: string;
}

export interface RiskPrediction {
  id: number;
  location_id: number;
  timestamp: string;
  risk_type: string;
  risk_probability: number;
  severity: SeverityLevel;
  forecast_window_days: number;
  confidence: number;
  drivers: string[];
  anomalies: ApiAnomaly[];
  recommended_action: RecommendedAction | string | null;
  recommended_actions?: string[];
}

export interface TelemetryReading {
  id: number;
  timestamp: string;
  temperature: number | null;
  humidity: number | null;
  soil_moisture: number | null;
  rainfall: number | null;
  pressure: number | null;
  wind_speed: number | null;
}

export interface Location {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  is_active: boolean;
  status?: SeverityLevel;
}

export interface ClimaScopeData {
  locations: Location[];
  risk: RiskPrediction;
  telemetry: TelemetryReading[];
}
