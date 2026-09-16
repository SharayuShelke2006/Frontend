/**
 * Domain types mirroring the NIRIKSHAK Frontend / UI / API Data Contract
 * (SIH26184). Field names intentionally match the contract exactly so
 * fixture JSON can be swapped for a real backend without UI changes.
 */

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type Role = 'CITIZEN' | 'LEA' | 'BANK' | 'I4C';

export interface Envelope<T> {
  success: boolean;
  request_id: string;
  generated_at: string;
  data_version: string;
  data: T;
}

export interface DistrictRisk {
  district_id: string;
  district_name: string;
  risk_level: RiskLevel;
  risk_score: number;
  atm_total: number;
  high_risk_atm_count: number;
  highlight_threshold: number;
  district_highlight: boolean;
  geometry: GeoJSON.Geometry;
  predicted_window_start?: string;
  predicted_window_end?: string;
}

export interface TelanganaOverview {
  map_scope: 'TELANGANA';
  districts: DistrictRisk[];
  atm_overview: AtmOverviewPoint[];
}

export interface AtmOverviewPoint {
  atm_id: string;
  district_id: string;
  lat: number;
  lon: number;
  map_interaction: 'DOT_ONLY' | 'INTERACTIVE';
}

export interface AreaRisk {
  area_id: string;
  area_name: string;
  risk_score: number;
  risk_level: RiskLevel;
  high_risk_atm_count: number;
  geometry: GeoJSON.Geometry;
}

export interface DistrictAreas {
  district_id: string;
  areas: AreaRisk[];
}

export interface AtmRisk {
  risk_score: number;
  risk_level: RiskLevel;
  rank_in_district: number;
  predicted_withdrawal_window?: {
    start: string;
    end: string;
  };
}

export interface AtmRelated {
  active_prediction_count: number;
  related_case_count: number;
  high_risk_path_count: number;
}

export interface Atm {
  atm_id: string;
  name: string;
  bank_name: string;
  bank_id: string;
  lat: number;
  lon: number;
  address: string;
  district_id: string;
  district_name: string;
  area_id: string | null;
  area_name: string | null;
  risk: AtmRisk;
  map_links: {
    google_maps: string;
  };
  related: AtmRelated;
}

export interface WithdrawalRecord {
  withdrawal_id: string;
  timestamp: string;
  amount: number;
  status: 'COMPLETED' | 'FAILED' | 'FLAGGED';
  related_case_id?: string;
}

export interface WithdrawalHistory {
  atm_id: string;
  withdrawal_history: {
    period: { from: string; to: string };
    summary: {
      withdrawal_count: number;
      total_amount: number;
      avg_amount: number;
    };
    records: WithdrawalRecord[];
  };
}

export type PredictionStatus = 'ACTIVE' | 'EXPIRED' | 'SUPERSEDED' | 'RESOLVED';

export interface ExplanationFactor {
  label: string;
  value: string | number;
}

export interface Prediction {
  prediction_id: string;
  case_id: string;
  status: PredictionStatus;
  as_of: string;
  generated_at: string;
  risk: {
    score: number;
    level: RiskLevel;
    rank: number;
  };
  predicted_cashout: {
    location_type: 'ATM';
    atm_id: string;
    district_id: string;
    district_name: string;
    area_id: string | null;
    area_name: string | null;
    lat: number;
    lon: number;
    withdrawal_window: { start: string; end: string };
  };
  supporting_intelligence: {
    supporting_path_count: number;
    converging_path_count: number;
    last_observed_transaction: { timestamp: string; amount: number };
    explanation_factors: ExplanationFactor[];
  };
  freshness_seconds: number;
}

export interface PathNode {
  sequence: number;
  node_type: 'VICTIM_ACCOUNT' | 'ACCOUNT' | 'ATM';
  node_id: string;
  label: string;
  lat?: number;
  lon?: number;
}

export interface PathEdge {
  from: string;
  to: string;
  timestamp?: string;
  amount?: number;
  predicted?: boolean;
}

export interface PredictedPath {
  prediction_id: string;
  path_id: string;
  path_probability: number;
  nodes: PathNode[];
  edges: PathEdge[];
}

export type CaseStatus =
  | 'RECEIVED'
  | 'UNDER_INVESTIGATION'
  | 'FINANCIAL_INTELLIGENCE_PROCESSING'
  | 'ACTION_INITIATED'
  | 'RESOLVED'
  | 'CLOSED';

export interface Case {
  case_id: string;
  complaint_id: string;
  created_at: string;
  status: CaseStatus;
  crime_category: string;
  reported_amount: number;
  reporting_timestamp: string;
  victim: {
    display_name: string;
    contact_masked: string;
  };
  known_financial_context: {
    victim_account_masked: string;
    bank_name: string;
  };
  assigned_lea: {
    unit_id: string;
    unit_name: string;
  };
}

export type AlertStatus =
  | 'GENERATED'
  | 'DELIVERED'
  | 'ACKNOWLEDGED'
  | 'ASSIGNED'
  | 'ACTION_INITIATED'
  | 'RESOLVED'
  | 'EXPIRED'
  | 'FALSE_POSITIVE';

export interface AlertRecipient {
  type: 'LEA' | 'BANK' | 'I4C';
  id: string;
  status: 'DELIVERED' | 'ACKNOWLEDGED' | 'VISIBLE';
}

export interface Alert {
  alert_id: string;
  alert_type: 'PREDICTED_CASHOUT';
  severity: RiskLevel;
  status: AlertStatus;
  created_at: string;
  expires_at: string;
  case_id: string;
  prediction_id: string;
  target: {
    atm_id: string;
    district: string;
    area: string | null;
  };
  predicted_window: { start: string; end: string };
  recipients: AlertRecipient[];
}

export interface ActionRecord {
  action_id: string;
  alert_id: string;
  case_id: string;
  actor: { role: Role; user_id: string };
  action_type: string;
  status: 'IN_PROGRESS' | 'COMPLETED';
  created_at: string;
  notes: string;
  next_review_at?: string;
}

export interface OutcomeRecord {
  outcome_id: string;
  alert_id: string;
  outcome_type: string;
  recorded_at: string;
  location_match: boolean;
  actual_atm_id: string;
  notes: string;
  feedback_label: 'TRUE_POSITIVE' | 'FALSE_POSITIVE' | 'UNVERIFIED';
}

export interface AuditEvent {
  event_id: string;
  timestamp: string;
  actor_role: Role;
  actor_display: string;
  event_type: string;
  entity_type: 'ALERT' | 'CASE' | 'PREDICTION' | 'ACTION';
  entity_id: string;
  summary: string;
  ip_or_device_reference?: string;
}

export interface NotificationItem {
  notification_id: string;
  recipient_role: Role;
  recipient_id: string;
  created_at: string;
  read: boolean;
  category: 'ALERT' | 'ACKNOWLEDGEMENT' | 'ESCALATION' | 'SYSTEM';
  title: string;
  body: string;
  related_alert_id?: string;
  related_case_id?: string;
}
