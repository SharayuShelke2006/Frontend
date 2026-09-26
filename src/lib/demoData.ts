import type { AreaFeatureProperties, DistrictFeatureProperties } from './data';
import type { ActionRecord, Alert, Atm, Case, Prediction, PredictedPath, RiskLevel } from '@/types/contract';

const DEMO_ANCHOR = Date.parse('2026-09-24T12:00:00+05:30');
const CATEGORIES = ['CYBER_FINANCIAL_FRAUD', 'PHISHING', 'ONLINE_BANKING_FRAUD', 'INVESTMENT_SCAM'];
const STATUSES: Alert['status'][] = ['GENERATED', 'DELIVERED', 'ACKNOWLEDGED', 'ASSIGNED', 'ACTION_INITIATED', 'RESOLVED'];

export interface DemoDataResult {
  districtsGeojson: GeoJSON.FeatureCollection<GeoJSON.Geometry, DistrictFeatureProperties>;
  areasGeojson: GeoJSON.FeatureCollection<GeoJSON.Geometry, AreaFeatureProperties>;
  atms: Atm[];
  cases: Case[];
  predictions: Prediction[];
  paths: PredictedPath[];
  alerts: Alert[];
  actions: ActionRecord[];
}

export interface DemoChartSignals {
  pattern: number[][];
  forecast: Array<{ predictedAlerts: number; highRiskATMActivity: number; criticalSignals: number; uncertainty: number }>;
  trend: Array<{ cases: number; alerts: number }>;
  spatial: Array<{ distance: number; amount: number; linkedTransactions: number }>;
}

function hash(value: string): number {
  let result = 2166136261;
  for (let index = 0; index < value.length; index++) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

function random(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function integer(value: number): number {
  return Math.max(1, Math.round(value));
}

function riskLevel(score: number): RiskLevel {
  if (score >= 0.78) return 'CRITICAL';
  if (score >= 0.62) return 'HIGH';
  if (score >= 0.43) return 'MEDIUM';
  return 'LOW';
}

function isoAt(offsetHours: number): string {
  return new Date(DEMO_ANCHOR - offsetHours * 3600000).toISOString().replace('Z', '+05:30');
}

function slug(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function getDemoChartSignals(scopeKey: string, scopeFactor: number): DemoChartSignals {
  const next = random(hash(`charts:${scopeKey}`));
  const patternBase = [
    [18, 12, 21, 35, 42, 51, 68, 44],
    [12, 9, 15, 28, 31, 38, 47, 32],
    [6, 4, 8, 16, 22, 29, 41, 25],
    [3, 2, 5, 11, 18, 27, 36, 21],
    [14, 10, 17, 26, 34, 43, 52, 37],
    [8, 6, 10, 15, 19, 24, 29, 20],
    [10, 7, 13, 22, 27, 33, 39, 28],
    [7, 5, 9, 18, 24, 30, 35, 23],
  ];
  const pattern = patternBase.map((row, rowIndex) => row.map((value, index) => {
    const wave = Math.sin((index + rowIndex + Math.round(next() * 3)) * 0.9) * 0.16;
    const noise = 0.84 + next() * 0.32;
    return Math.max(1, Math.round(value * scopeFactor * (1 + wave) * noise));
  }));
  const forecastBase = [
    [18, 30, 4], [21, 18, 9], [29, 14, 7], [24, 26, 15], [47, 37, 12], [63, 42, 28],
    [58, 55, 22], [76, 64, 46], [88, 52, 39], [61, 68, 25], [39, 44, 18], [28, 31, 11],
  ];
  const forecast = forecastBase.map(([alerts, atmActivity, critical]) => ({
    predictedAlerts: Math.min(96, Math.max(4, Math.round(alerts * scopeFactor * (0.86 + next() * 0.28)))),
    highRiskATMActivity: Math.min(94, Math.max(4, Math.round(atmActivity * scopeFactor * (0.84 + next() * 0.3)))),
    criticalSignals: Math.min(88, Math.max(2, Math.round(critical * scopeFactor * (0.82 + next() * 0.34)))),
    uncertainty: Math.round(5 + next() * 13),
  }));
  const trend = Array.from({ length: 14 }, (_, index) => ({
    cases: Math.max(1, Math.round((2 + (index % 5) + next() * 7) * (0.7 + scopeFactor * 0.42))),
    alerts: Math.max(1, Math.round((2 + ((index + 2) % 6) + next() * 7) * (0.7 + scopeFactor * 0.42))),
  }));
  const spatial = Array.from({ length: 16 }, (_, index) => ({
    distance: Number(Math.max(1.5, 3 + index * 1.7 + next() * 8 * (0.7 + scopeFactor)).toFixed(1)),
    amount: Math.round((28000 + next() * 112000) * (0.78 + scopeFactor * 0.28)),
    linkedTransactions: Math.max(1, Math.round(1 + next() * 6)),
  }));
  return { pattern, forecast, trend, spatial };
}

function profile(seedKey: string, atmCount: number) {
  const next = random(hash(seedKey));
  const density = Math.min(1, atmCount / 450);
  const activity = 0.42 + next() * 0.48 + density * 0.12;
  const risk = Math.min(0.9, 0.28 + next() * 0.42 + activity * 0.18);
  return {
    activity,
    risk,
    confidence: integer(62 + next() * 29),
    cases: integer(5 + activity * 16),
    variation: next,
  };
}

function enrichRisk(atms: Atm[], districtRisk: Map<string, number>): Atm[] {
  return atms.map((atm, index) => {
    const next = random(hash(`atm:${atm.atm_id}`));
    const score = Math.max(0.18, Math.min(0.92, (districtRisk.get(atm.district_id) ?? 0.5) + (next() - 0.5) * 0.28));
    return {
      ...atm,
      risk: { ...atm.risk, risk_score: Number(score.toFixed(2)), risk_level: riskLevel(score), rank_in_district: index + 1 },
      related: { ...atm.related, active_prediction_count: integer(score * 4), related_case_count: integer(score * 3), high_risk_path_count: integer(score * 2) },
    };
  });
}

export function generateDemoData(
  districtsInput: GeoJSON.FeatureCollection<GeoJSON.Geometry, DistrictFeatureProperties>,
  areasInput: GeoJSON.FeatureCollection<GeoJSON.Geometry, AreaFeatureProperties>,
  fixtureAtms: Atm[],
  fixtureCases: Case[],
  fixturePredictions: Prediction[],
  fixturePaths: PredictedPath[],
  fixtureAlerts: Alert[],
  fixtureActions: ActionRecord[],
): DemoDataResult {
  const atmsByDistrict = new Map<string, Atm[]>();
  const atmsByBank = new Map<string, Atm[]>();
  for (const atm of fixtureAtms) {
    const districtList = atmsByDistrict.get(atm.district_id) ?? [];
    districtList.push(atm);
    atmsByDistrict.set(atm.district_id, districtList);
    const bankList = atmsByBank.get(atm.bank_id) ?? [];
    bankList.push(atm);
    atmsByBank.set(atm.bank_id, bankList);
  }

  const districtProfiles = new Map<string, ReturnType<typeof profile>>();
  const districtRisk = new Map<string, number>();
  const districtsGeojson = {
    ...districtsInput,
    features: districtsInput.features.map((feature) => {
      const props = feature.properties;
      const districtProfile = profile(`district:${props.district_id}`, atmsByDistrict.get(props.district_id)?.length ?? 1);
      districtProfiles.set(props.district_id, districtProfile);
      districtRisk.set(props.district_id, districtProfile.risk);
      const districtAtms = atmsByDistrict.get(props.district_id)?.length ?? props.atm_total;
      const highRiskAtmCount = Math.max(1, Math.round(districtAtms * (0.1 + districtProfile.risk * 0.34)));
      return { ...feature, properties: { ...props, risk_score: Number(districtProfile.risk.toFixed(2)), risk_level: riskLevel(districtProfile.risk), atm_total: districtAtms, high_risk_atm_count: highRiskAtmCount, district_highlight: districtProfile.risk >= props.highlight_threshold } };
    }),
  };
  const areasGeojson = {
    ...areasInput,
    features: areasInput.features.map((feature) => {
      const props = feature.properties;
      const next = random(hash(`area:${props.area_id}`));
      const score = Math.max(0.2, Math.min(0.91, (districtRisk.get(props.district_id) ?? 0.5) + (next() - 0.5) * 0.32));
      return { ...feature, properties: { ...props, risk_score: Number(score.toFixed(2)), risk_level: riskLevel(score), high_risk_atm_count: Math.max(1, Math.round(props.atm_ids.length * (0.08 + score * 0.35))) } };
    }),
  };
  const atms = enrichRisk(fixtureAtms, districtRisk);
  const enrichedAtmByDistrict = new Map<string, Atm[]>();
  const enrichedAtmByBank = new Map<string, Atm[]>();
  for (const atm of atms) {
    const districtList = enrichedAtmByDistrict.get(atm.district_id) ?? [];
    districtList.push(atm);
    enrichedAtmByDistrict.set(atm.district_id, districtList);
    const bankList = enrichedAtmByBank.get(atm.bank_id) ?? [];
    bankList.push(atm);
    enrichedAtmByBank.set(atm.bank_id, bankList);
  }

  const cases = [...fixtureCases];
  const predictions = [...fixturePredictions];
  const alerts = [...fixtureAlerts];
  const actions = [...fixtureActions];
  const addBundle = (atm: Atm, key: string, sequence: number, districtProfile: ReturnType<typeof profile>) => {
    const next = random(hash(`bundle:${key}:${sequence}`));
    const caseId = `DEMO-C-${slug(key)}-${String(sequence).padStart(2, '0')}`;
    const predictionId = `DEMO-P-${slug(key)}-${String(sequence).padStart(2, '0')}`;
    const alertId = `DEMO-A-${slug(key)}-${String(sequence).padStart(2, '0')}`;
    const score = Math.max(0.32, Math.min(0.91, atm.risk.risk_score + (next() - 0.5) * 0.16));
    const level = riskLevel(score);
    const createdAt = isoAt(8 + Math.round(next() * 300));
    const status = STATUSES[Math.floor(next() * STATUSES.length)];
    const caseStatus: Case['status'] = status === 'RESOLVED' ? 'RESOLVED' : status === 'ACTION_INITIATED' ? 'ACTION_INITIATED' : next() > 0.45 ? 'UNDER_INVESTIGATION' : 'FINANCIAL_INTELLIGENCE_PROCESSING';
    const windowStart = isoAt(2 + Math.round(next() * 12));
    const windowEnd = new Date(new Date(windowStart).getTime() + 2 * 3600000).toISOString().replace('Z', '+05:30');
    cases.push({ case_id: caseId, complaint_id: `NCRP-DEMO-${slug(key)}-${sequence}`, created_at: createdAt, status: caseStatus, crime_category: CATEGORIES[Math.floor(next() * CATEGORIES.length)], reported_amount: 18000 + Math.round(next() * 130000), reporting_timestamp: createdAt, victim: { display_name: 'Masked Victim (Simulated)', contact_masked: '+91-******' + String(100 + sequence).slice(-3) }, known_financial_context: { victim_account_masked: `XXXXXX${1000 + Math.floor(next() * 8999)}`, bank_name: atm.bank_name }, assigned_lea: { unit_id: `LEA-TG-${slug(atm.district_name)}-01`, unit_name: `${atm.district_name} Cybercrime Unit` } });
    predictions.push({ prediction_id: predictionId, case_id: caseId, status: caseStatus === 'RESOLVED' ? 'RESOLVED' : 'ACTIVE', as_of: createdAt, generated_at: createdAt, risk: { score: Number(score.toFixed(2)), level, rank: Math.max(1, Math.round((1 - score) * 40)) }, predicted_cashout: { location_type: 'ATM', atm_id: atm.atm_id, district_id: atm.district_id, district_name: atm.district_name, area_id: atm.area_id, area_name: atm.area_name, lat: atm.lat, lon: atm.lon, withdrawal_window: { start: windowStart, end: windowEnd } }, supporting_intelligence: { supporting_path_count: integer(2 + next() * 7), converging_path_count: integer(1 + next() * 4), last_observed_transaction: { timestamp: createdAt, amount: 12000 + Math.round(next() * 90000) }, explanation_factors: [{ label: 'Model confidence', value: `${districtProfile.confidence}%` }, { label: 'ATM density in area', value: districtProfile.activity > 0.8 ? 'HIGH' : 'MEDIUM' }, { label: 'Historical cash-out similarity', value: level }] }, freshness_seconds: Math.round(next() * 900) });
    alerts.push({ alert_id: alertId, alert_type: 'PREDICTED_CASHOUT', severity: level, status, created_at: createdAt, expires_at: windowEnd, case_id: caseId, prediction_id: predictionId, target: { atm_id: atm.atm_id, district: atm.district_name, area: atm.area_name }, predicted_window: { start: windowStart, end: windowEnd }, recipients: [{ type: 'LEA', id: `LEA-TG-${slug(atm.district_name)}-01`, status: status === 'GENERATED' ? 'DELIVERED' : 'ACKNOWLEDGED' }, { type: 'BANK', id: atm.bank_id, status: status === 'GENERATED' ? 'DELIVERED' : 'ACKNOWLEDGED' }, { type: 'I4C', id: 'I4C-TG-01', status: 'VISIBLE' }] });
    if (['ACKNOWLEDGED', 'ASSIGNED', 'ACTION_INITIATED'].includes(status)) actions.push({ action_id: `DEMO-ACT-${slug(key)}-${sequence}`, alert_id: alertId, case_id: caseId, actor: { role: 'LEA', user_id: 'OFFICER-DEMO' }, action_type: 'FIELD_VERIFICATION_INITIATED', status: next() > 0.35 ? 'IN_PROGRESS' : 'COMPLETED', created_at: createdAt, notes: 'Simulated operational follow-up.', next_review_at: windowEnd });
  };

  for (const [districtId, districtAtms] of enrichedAtmByDistrict) {
    const districtProfile = districtProfiles.get(districtId)!;
    for (let index = 0; index < districtProfile.cases; index++) addBundle(districtAtms[index % districtAtms.length], districtId, index + 1, districtProfile);
  }
  for (const [bankId, bankAtms] of enrichedAtmByBank) {
    const bankProfile = profile(`bank:${bankId}`, bankAtms.length);
    const existingBankCases = cases.filter((item) => item.known_financial_context.bank_name === bankAtms[0].bank_name).length;
    for (let index = existingBankCases; index < Math.max(4, integer(3 + bankProfile.activity * 5)); index++) addBundle(bankAtms[index % bankAtms.length], bankId, index + 1, bankProfile);
  }

  return { districtsGeojson, areasGeojson, atms, cases, predictions, paths: fixturePaths, alerts, actions };
}