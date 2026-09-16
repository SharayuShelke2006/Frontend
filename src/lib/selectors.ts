import { useStore } from '@/state/store';
import type { RiskLevel } from '@/types/contract';

// Fixed status palette (validated: adjacent-pair CVD ΔE and normal-vision ΔE
// both clear the floor at every step — LOW/HIGH are the closest pair at 11.5,
// still above the 10 minimum). Never reused for categorical series.
export const RISK_COLORS: Record<RiskLevel, string> = {
  LOW: '#0ca30c',
  MEDIUM: '#fab219',
  HIGH: '#ec835a',
  CRITICAL: '#d03b3b',
};

export const RISK_FILL_OPACITY: Record<RiskLevel, number> = {
  LOW: 0.22,
  MEDIUM: 0.34,
  HIGH: 0.46,
  CRITICAL: 0.6,
};

export function useAlertBundle(alertId: string | undefined) {
  return useStore((s) => {
    if (!alertId) return null;
    const alert = s.alerts.find((a) => a.alert_id === alertId);
    if (!alert) return null;
    const caseObj = s.casesById.get(alert.case_id) ?? null;
    const prediction = s.predictionsById.get(alert.prediction_id) ?? null;
    const atm = s.atmsById.get(alert.target.atm_id) ?? null;
    const paths = prediction ? s.pathsByPrediction.get(prediction.prediction_id) ?? [] : [];
    const actions = s.actions.filter((a) => a.alert_id === alertId);
    const outcome = s.outcomes[alertId] ?? null;
    return { alert, case: caseObj, prediction, atm, paths, actions, outcome };
  });
}

export function useCaseBundle(caseId: string | undefined) {
  return useStore((s) => {
    if (!caseId) return null;
    const caseObj = s.casesById.get(caseId) ?? null;
    if (!caseObj) return null;
    const predictions = s.predictionsByCase.get(caseId) ?? [];
    const alerts = s.alerts.filter((a) => a.case_id === caseId);
    const actions = s.actions.filter((a) => a.case_id === caseId);
    return { case: caseObj, predictions, alerts, actions };
  });
}

export function useAtmBundle(atmId: string | undefined) {
  return useStore((s) => {
    if (!atmId) return null;
    const atm = s.atmsById.get(atmId) ?? null;
    if (!atm) return null;
    const withdrawals = s.withdrawalsByAtm.get(atmId) ?? null;
    const predictions = s.predictions.filter((p) => p.predicted_cashout.atm_id === atmId);
    const alerts = s.alerts.filter((a) => a.target.atm_id === atmId);
    return { atm, withdrawals, predictions, alerts };
  });
}

export function useDistrictAtms(districtId: string | undefined) {
  return useStore((s) => (districtId ? s.atms.filter((a) => a.district_id === districtId) : []));
}

export function useAreaAtms(areaId: string | undefined) {
  return useStore((s) => (areaId ? s.atms.filter((a) => a.area_id === areaId) : []));
}

export function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export function formatIstTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}
