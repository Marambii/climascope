import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  ClimaScopeData,
  Location,
  RiskPrediction,
  TelemetryReading,
} from "../types/api";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";
const DEFAULT_LOCATION_ID = 1;

interface ClimaScopeDataContextValue {
  data: ClimaScopeData | null;
  error: string | null;
  loading: boolean;
  reload: () => Promise<void>;
}

const ClimaScopeDataContext = createContext<ClimaScopeDataContextValue | null>(null);

async function fetchJson<T>(path: string, signal: AbortSignal): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, { signal });

  if (!response.ok) {
    throw new Error(`Request to ${path} failed with status ${response.status}.`);
  }

  return response.json() as Promise<T>;
}

export function ClimaScopeDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ClimaScopeData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);

    try {
      const [locations, risk, telemetry] = await Promise.all([
        fetchJson<Location[]>("/api/locations/", signal ?? new AbortController().signal),
        fetchJson<RiskPrediction>(
          `/api/locations/${DEFAULT_LOCATION_ID}/risk/latest/`,
          signal ?? new AbortController().signal,
        ),
        fetchJson<TelemetryReading[]>(
          `/api/locations/${DEFAULT_LOCATION_ID}/telemetry/`,
          signal ?? new AbortController().signal,
        ),
      ]);
      setData({ locations, risk, telemetry });
    } catch (loadError) {
      if (loadError instanceof DOMException && loadError.name === "AbortError") {
        return;
      }
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load live environmental data.",
      );
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadData(controller.signal);

    return () => controller.abort();
  }, [loadData]);

  const reload = useCallback(async () => {
    await loadData();
  }, [loadData]);

  const value = useMemo(
    () => ({ data, error, loading, reload }),
    [data, error, loading, reload],
  );

  return (
    <ClimaScopeDataContext.Provider value={value}>
      {children}
    </ClimaScopeDataContext.Provider>
  );
}

export function useClimaScopeData(): ClimaScopeDataContextValue {
  const context = useContext(ClimaScopeDataContext);

  if (context === null) {
    throw new Error("useClimaScopeData must be used within ClimaScopeDataProvider.");
  }

  return context;
}

export function getRecommendedAction(risk: RiskPrediction): string {
  if (risk.recommended_actions?.length) {
    return risk.recommended_actions[0];
  }
  if (typeof risk.recommended_action === "string") {
    return risk.recommended_action;
  }
  return risk.recommended_action?.action_text ?? "No immediate action required.";
}
