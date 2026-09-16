import type {
  ActionRecord,
  Alert,
  Atm,
  AuditEvent,
  Case,
  NotificationItem,
  OutcomeRecord,
  Prediction,
  PredictedPath,
  RiskLevel,
  WithdrawalHistory,
} from '@/types/contract';

export interface DistrictFeatureProperties {
  district_id: string;
  district_name: string;
  risk_level: RiskLevel;
  risk_score: number;
  atm_total: number;
  high_risk_atm_count: number;
  highlight_threshold: number;
  district_highlight: boolean;
}

export interface AreaFeatureProperties {
  area_id: string;
  area_name: string;
  district_id: string;
  risk_score: number;
  risk_level: RiskLevel;
  high_risk_atm_count: number;
  atm_ids: string[];
}

export interface FlagshipRef {
  case_id: string;
  prediction_id: string;
  alert_id: string;
  atm_id: string;
  district_id: string;
  area_id: string;
}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
  return res.json() as Promise<T>;
}

export const dataApi = {
  stateGeojson: () => getJson<GeoJSON.FeatureCollection>('/data/state.geojson'),
  districtsGeojson: () =>
    getJson<GeoJSON.FeatureCollection<GeoJSON.Geometry, DistrictFeatureProperties>>(
      '/data/districts.geojson',
    ),
  areasGeojson: () =>
    getJson<GeoJSON.FeatureCollection<GeoJSON.Geometry, AreaFeatureProperties>>(
      '/data/areas.geojson',
    ),
  atms: () => getJson<Atm[]>('/data/atms.json'),
  cases: () => getJson<Case[]>('/data/cases.json'),
  predictions: () => getJson<Prediction[]>('/data/predictions.json'),
  paths: () => getJson<PredictedPath[]>('/data/paths.json'),
  alerts: () => getJson<Alert[]>('/data/alerts.json'),
  actions: () => getJson<ActionRecord[]>('/data/actions.json'),
  audit: () => getJson<AuditEvent[]>('/data/audit.json'),
  notifications: () => getJson<NotificationItem[]>('/data/notifications.json'),
  withdrawals: () => getJson<WithdrawalHistory[]>('/data/withdrawals.json'),
  flagship: () => getJson<FlagshipRef>('/data/flagship.json'),
};

export type OutcomeStore = Record<string, OutcomeRecord>;
