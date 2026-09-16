import { create } from 'zustand';
import { dataApi, type AreaFeatureProperties, type DistrictFeatureProperties, type FlagshipRef } from '@/lib/data';
import type {
  ActionRecord,
  Alert,
  AlertStatus,
  Atm,
  AuditEvent,
  Case,
  NotificationItem,
  OutcomeRecord,
  Prediction,
  PredictedPath,
  Role,
  WithdrawalHistory,
} from '@/types/contract';

interface NirikshakState {
  ready: boolean;
  error: string | null;
  role: Role;
  lastUpdated: string;

  stateGeojson: GeoJSON.FeatureCollection | null;
  districtsGeojson: GeoJSON.FeatureCollection<GeoJSON.Geometry, DistrictFeatureProperties> | null;
  areasGeojson: GeoJSON.FeatureCollection<GeoJSON.Geometry, AreaFeatureProperties> | null;
  atms: Atm[];
  atmsById: Map<string, Atm>;
  cases: Case[];
  casesById: Map<string, Case>;
  predictions: Prediction[];
  predictionsById: Map<string, Prediction>;
  predictionsByCase: Map<string, Prediction[]>;
  paths: PredictedPath[];
  pathsByPrediction: Map<string, PredictedPath[]>;
  alerts: Alert[];
  actions: ActionRecord[];
  audit: AuditEvent[];
  notifications: NotificationItem[];
  withdrawalsByAtm: Map<string, WithdrawalHistory>;
  outcomes: Record<string, OutcomeRecord>;
  flagship: FlagshipRef | null;

  init: () => Promise<void>;
  setRole: (role: Role) => void;
  touchLastUpdated: () => void;

  acknowledgeAlert: (alertId: string, recipientType: 'LEA' | 'BANK') => void;
  assignAlert: (alertId: string, unitLabel: string) => void;
  recordAction: (alertId: string, actionType: string, notes: string) => void;
  recordOutcome: (
    alertId: string,
    outcomeType: string,
    feedbackLabel: OutcomeRecord['feedback_label'],
    notes: string,
  ) => void;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;
}

let auditCounter = 900000;
let actionCounter = 8800;
let outcomeCounter = 2200;
let notifCounter = 5000;

function nowIso(): string {
  const ist = new Date(Date.now() + 5.5 * 3600000);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${ist.getUTCFullYear()}-${pad(ist.getUTCMonth() + 1)}-${pad(ist.getUTCDate())}T${pad(
    ist.getUTCHours(),
  )}:${pad(ist.getUTCMinutes())}:${pad(ist.getUTCSeconds())}+05:30`;
}

export const useStore = create<NirikshakState>((set, get) => ({
  ready: false,
  error: null,
  role: 'LEA',
  lastUpdated: nowIso(),

  stateGeojson: null,
  districtsGeojson: null,
  areasGeojson: null,
  atms: [],
  atmsById: new Map(),
  cases: [],
  casesById: new Map(),
  predictions: [],
  predictionsById: new Map(),
  predictionsByCase: new Map(),
  paths: [],
  pathsByPrediction: new Map(),
  alerts: [],
  actions: [],
  audit: [],
  notifications: [],
  withdrawalsByAtm: new Map(),
  outcomes: {},
  flagship: null,

  init: async () => {
    if (get().ready) return;
    try {
      const [
        stateGeojson,
        districtsGeojson,
        areasGeojson,
        atms,
        cases,
        predictions,
        paths,
        alerts,
        actions,
        audit,
        notifications,
        withdrawals,
        flagship,
      ] = await Promise.all([
        dataApi.stateGeojson(),
        dataApi.districtsGeojson(),
        dataApi.areasGeojson(),
        dataApi.atms(),
        dataApi.cases(),
        dataApi.predictions(),
        dataApi.paths(),
        dataApi.alerts(),
        dataApi.actions(),
        dataApi.audit(),
        dataApi.notifications(),
        dataApi.withdrawals(),
        dataApi.flagship(),
      ]);

      const predictionsByCase = new Map<string, Prediction[]>();
      for (const p of predictions) {
        const list = predictionsByCase.get(p.case_id) || [];
        list.push(p);
        predictionsByCase.set(p.case_id, list);
      }
      const pathsByPrediction = new Map<string, PredictedPath[]>();
      for (const p of paths) {
        const list = pathsByPrediction.get(p.prediction_id) || [];
        list.push(p);
        pathsByPrediction.set(p.prediction_id, list);
      }

      set({
        ready: true,
        stateGeojson,
        districtsGeojson,
        areasGeojson,
        atms,
        atmsById: new Map(atms.map((a) => [a.atm_id, a])),
        cases,
        casesById: new Map(cases.map((c) => [c.case_id, c])),
        predictions,
        predictionsById: new Map(predictions.map((p) => [p.prediction_id, p])),
        predictionsByCase,
        paths,
        pathsByPrediction,
        alerts,
        actions,
        audit,
        notifications,
        withdrawalsByAtm: new Map(withdrawals.map((w) => [w.atm_id, w])),
        flagship,
        lastUpdated: nowIso(),
      });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to load intelligence data.' });
    }
  },

  setRole: (role) => set({ role }),
  touchLastUpdated: () => set({ lastUpdated: nowIso() }),

  acknowledgeAlert: (alertId, recipientType) => {
    const ts = nowIso();
    set((s) => ({
      alerts: s.alerts.map((a) => {
        if (a.alert_id !== alertId) return a;
        const nextStatus: AlertStatus = a.status === 'GENERATED' || a.status === 'DELIVERED' ? 'ACKNOWLEDGED' : a.status;
        return {
          ...a,
          status: nextStatus,
          recipients: a.recipients.map((r) =>
            r.type === recipientType ? { ...r, status: 'ACKNOWLEDGED' } : r,
          ),
        };
      }),
      audit: [
        {
          event_id: `AUD-${++auditCounter}`,
          timestamp: ts,
          actor_role: recipientType,
          actor_display: recipientType === 'LEA' ? 'LEA Officer' : 'Bank/FI Officer',
          event_type: 'ALERT_ACKNOWLEDGED',
          entity_type: 'ALERT',
          entity_id: alertId,
          summary: `Alert acknowledged by ${recipientType === 'LEA' ? 'assigned LEA unit' : 'bank/FI officer'}.`,
        },
        ...s.audit,
      ],
      lastUpdated: ts,
    }));
  },

  assignAlert: (alertId, unitLabel) => {
    const ts = nowIso();
    set((s) => ({
      alerts: s.alerts.map((a) => (a.alert_id === alertId ? { ...a, status: 'ASSIGNED' as AlertStatus } : a)),
      audit: [
        {
          event_id: `AUD-${++auditCounter}`,
          timestamp: ts,
          actor_role: 'LEA',
          actor_display: 'LEA Officer',
          event_type: 'ALERT_ASSIGNED',
          entity_type: 'ALERT',
          entity_id: alertId,
          summary: `Responsibility assigned to ${unitLabel}.`,
        },
        ...s.audit,
      ],
      lastUpdated: ts,
    }));
  },

  recordAction: (alertId, actionType, notes) => {
    const ts = nowIso();
    const alert = get().alerts.find((a) => a.alert_id === alertId);
    const actionId = `ACT-${++actionCounter}`;
    set((s) => ({
      alerts: s.alerts.map((a) => (a.alert_id === alertId ? { ...a, status: 'ACTION_INITIATED' as AlertStatus } : a)),
      actions: [
        {
          action_id: actionId,
          alert_id: alertId,
          case_id: alert?.case_id ?? '',
          actor: { role: s.role, user_id: 'OFFICER-DEMO' },
          action_type: actionType,
          status: 'IN_PROGRESS',
          created_at: ts,
          notes,
        },
        ...s.actions,
      ],
      audit: [
        {
          event_id: `AUD-${++auditCounter}`,
          timestamp: ts,
          actor_role: s.role,
          actor_display: 'Duty Officer',
          event_type: 'ACTION_RECORDED',
          entity_type: 'ACTION',
          entity_id: actionId,
          summary: `${actionType.replaceAll('_', ' ')} recorded for alert ${alertId}.`,
        },
        ...s.audit,
      ],
      lastUpdated: ts,
    }));
  },

  recordOutcome: (alertId, outcomeType, feedbackLabel, notes) => {
    const ts = nowIso();
    const alert = get().alerts.find((a) => a.alert_id === alertId);
    const outcomeId = `OUT-${++outcomeCounter}`;
    set((s) => ({
      alerts: s.alerts.map((a) => (a.alert_id === alertId ? { ...a, status: 'RESOLVED' as AlertStatus } : a)),
      outcomes: {
        ...s.outcomes,
        [alertId]: {
          outcome_id: outcomeId,
          alert_id: alertId,
          outcome_type: outcomeType,
          recorded_at: ts,
          location_match: feedbackLabel === 'TRUE_POSITIVE',
          actual_atm_id: alert?.target.atm_id ?? '',
          notes,
          feedback_label: feedbackLabel,
        },
      },
      audit: [
        {
          event_id: `AUD-${++auditCounter}`,
          timestamp: ts,
          actor_role: s.role,
          actor_display: 'Duty Officer',
          event_type: 'OUTCOME_RECORDED',
          entity_type: 'ACTION',
          entity_id: outcomeId,
          summary: `Outcome recorded for alert ${alertId}: ${feedbackLabel.replaceAll('_', ' ')}.`,
        },
        ...s.audit,
      ],
      lastUpdated: ts,
    }));
  },

  markNotificationRead: (notificationId) =>
    set((s) => ({
      notifications: s.notifications.map((n) =>
        n.notification_id === notificationId ? { ...n, read: true } : n,
      ),
    })),

  markAllNotificationsRead: () =>
    set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
}));
