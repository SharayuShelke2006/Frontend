import { create } from 'zustand';
import { dataApi, type AreaFeatureProperties, type DistrictFeatureProperties, type FlagshipRef } from '@/lib/data';
import type {
  ActionRecord,
  Alert,
  AlertStatus,
  Atm,
  AuditEvent,
  Case,
  CaseStatus,
  NotificationItem,
  OutcomeRecord,
  Prediction,
  PredictedPath,
  Role,
  WithdrawalHistory,
} from '@/types/contract';

export interface ComplaintInput {
  incidentType: string;
  crimeCategory: string;
  incidentTime: string;
  amount: number;
  reference: string;
  contact: string;
  location: string;
}

const FINANCIAL_CRIME_CATEGORIES = new Set([
  'UPI_FRAUD',
  'ONLINE_BANKING_FRAUD',
  'INVESTMENT_SCAM',
  'PHISHING',
  'CYBER_FINANCIAL_FRAUD',
]);

const ROLE_STORAGE_KEY = 'nirikshak_role';
const VALID_ROLES: Role[] = ['LEA', 'I4C', 'BANK', 'CITIZEN'];

// Role is deliberately kept in sessionStorage, not localStorage: it should
// survive a refresh of THIS tab (so reloading /bank as BANK doesn't bounce
// you to the LEA home), but must NOT leak to other tabs — the whole point of
// opening two tabs is usually to view two different roles side by side.
function loadInitialRole(): Role {
  try {
    const stored = sessionStorage.getItem(ROLE_STORAGE_KEY);
    if (stored && VALID_ROLES.includes(stored as Role)) return stored as Role;
  } catch {
    /* storage unavailable — fall back to default */
  }
  return 'LEA';
}

function persistRole(role: Role) {
  try {
    sessionStorage.setItem(ROLE_STORAGE_KEY, role);
  } catch {
    /* storage unavailable — role just won't survive a reload */
  }
}

// ---------------------------------------------------------------------------
// Cross-tab sync. There is no backend, so "other users seeing this alert"
// means "other tabs on this browser". The mutable slices (everything that
// can change after init: cases/predictions/paths/alerts/actions/audit/
// notifications/outcomes) are mirrored into localStorage on every mutation;
// the browser's `storage` event fires in every OTHER same-origin tab when
// that happens, so they can pick up the change live. A freshly opened tab
// also reads this overlay on init instead of the static fixture files, so it
// catches up on whatever earlier tabs already generated.
// ---------------------------------------------------------------------------
const OVERLAY_STORAGE_KEY = 'nirikshak_live_overlay_v1';

interface LiveOverlay {
  cases: Case[];
  predictions: Prediction[];
  paths: PredictedPath[];
  alerts: Alert[];
  actions: ActionRecord[];
  audit: AuditEvent[];
  notifications: NotificationItem[];
  outcomes: Record<string, OutcomeRecord>;
}

function readOverlay(): LiveOverlay | null {
  try {
    const raw = localStorage.getItem(OVERLAY_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LiveOverlay) : null;
  } catch {
    return null;
  }
}

function writeOverlay(overlay: LiveOverlay) {
  try {
    localStorage.setItem(OVERLAY_STORAGE_KEY, JSON.stringify(overlay));
  } catch {
    /* storage unavailable or quota exceeded — this tab just won't broadcast */
  }
}

function buildDerived(cases: Case[], predictions: Prediction[], paths: PredictedPath[]) {
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
  return {
    casesById: new Map(cases.map((c) => [c.case_id, c])),
    predictionsById: new Map(predictions.map((p) => [p.prediction_id, p])),
    predictionsByCase,
    pathsByPrediction,
  };
}

interface NirikshakState {
  ready: boolean;
  error: string | null;
  role: Role;
  lastUpdated: string;
  toast: { id: number; message: string } | null;

  stateGeojson: GeoJSON.FeatureCollection | null;
  districtsGeojson: GeoJSON.FeatureCollection<GeoJSON.Geometry, DistrictFeatureProperties> | null;
  areasGeojson: GeoJSON.FeatureCollection<GeoJSON.Geometry, AreaFeatureProperties> | null;
  atms: Atm[];
  atmsById: Map<string, Atm>;
  atmsByBankId: Map<string, Atm[]>;
  bankNameToId: Map<string, string>;
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
  showToast: (message: string) => void;
  clearToast: () => void;
  submitComplaint: (input: ComplaintInput) => { caseId: string; alertId: string | null };

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

let toastCounter = 0;

// Two tabs can create records at the same moment, so IDs can't be a simple
// per-tab incrementing counter (both tabs would start from the same base and
// collide). Mixing in the clock plus a random tie-breaker keeps them unique
// across tabs without any server-assigned sequence.
function uniqueNum(): number {
  return Math.floor(Date.now() % 1000000) * 10 + Math.floor(Math.random() * 10);
}

function slugId(name: string): string {
  return name
    .toUpperCase()
    .replace(/[^A-Z]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function isoFromDate(date: Date): string {
  const ist = new Date(date.getTime() + 5.5 * 3600000);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${ist.getUTCFullYear()}-${pad(ist.getUTCMonth() + 1)}-${pad(ist.getUTCDate())}T${pad(
    ist.getUTCHours(),
  )}:${pad(ist.getUTCMinutes())}:${pad(ist.getUTCSeconds())}+05:30`;
}

function nowIso(): string {
  return isoFromDate(new Date());
}

function persistOverlay(s: NirikshakState) {
  writeOverlay({
    cases: s.cases,
    predictions: s.predictions,
    paths: s.paths,
    alerts: s.alerts,
    actions: s.actions,
    audit: s.audit,
    notifications: s.notifications,
    outcomes: s.outcomes,
  });
}

export const useStore = create<NirikshakState>((set, get) => ({
  ready: false,
  error: null,
  role: loadInitialRole(),
  lastUpdated: nowIso(),
  toast: null,

  stateGeojson: null,
  districtsGeojson: null,
  areasGeojson: null,
  atms: [],
  atmsById: new Map(),
  atmsByBankId: new Map(),
  bankNameToId: new Map(),
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
        fixtureCases,
        fixturePredictions,
        fixturePaths,
        fixtureAlerts,
        fixtureActions,
        fixtureAudit,
        fixtureNotifications,
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

      // If another tab already generated live cases/alerts, join that shared
      // state instead of starting back at the static fixtures; otherwise this
      // is the first tab, so publish the fixtures as the starting overlay.
      const overlay = readOverlay();
      const cases = overlay?.cases ?? fixtureCases;
      const predictions = overlay?.predictions ?? fixturePredictions;
      const paths = overlay?.paths ?? fixturePaths;
      const alerts = overlay?.alerts ?? fixtureAlerts;
      const actions = overlay?.actions ?? fixtureActions;
      const audit = overlay?.audit ?? fixtureAudit;
      const notifications = overlay?.notifications ?? fixtureNotifications;
      const outcomes = overlay?.outcomes ?? {};
      if (!overlay) {
        writeOverlay({ cases, predictions, paths, alerts, actions, audit, notifications, outcomes });
      }

      const derived = buildDerived(cases, predictions, paths);

      set({
        ready: true,
        stateGeojson,
        districtsGeojson: districtsGeojson,
        areasGeojson: areasGeojson,
        atms: atms,
        atmsById: new Map(atms.map((a) => [a.atm_id, a])),
        atmsByBankId: atms.reduce((map, a) => {
          const list = map.get(a.bank_id) ?? [];
          list.push(a);
          map.set(a.bank_id, list);
          return map;
        }, new Map<string, Atm[]>()),
        bankNameToId: new Map(atms.map((a) => [a.bank_name, a.bank_id])),
        cases,
        predictions,
        paths,
        alerts,
        actions,
        audit,
        notifications,
        outcomes,
        ...derived,
        withdrawalsByAtm: new Map(withdrawals.map((w) => [w.atm_id, w])),
        flagship,
        lastUpdated: nowIso(),
      });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to load intelligence data.' });
    }
  },

  setRole: (role) => {
    persistRole(role);
    set({ role });
  },
  touchLastUpdated: () => set({ lastUpdated: nowIso() }),
  showToast: (message) => set({ toast: { id: ++toastCounter, message } }),
  clearToast: () => set({ toast: null }),

  submitComplaint: (input) => {
    const state = get();
    const ts = nowIso();
    const seq = uniqueNum();
    const caseId = `C-${seq}`;
    const complaintId = `NCRP-DEMO-${seq}`;

    // Try to match the citizen's free-text location to a real district;
    // otherwise fall back to a high-risk ATM anywhere in the state — this
    // mirrors "district/area risk objects are made available to GIS" even
    // when the complaint itself doesn't pinpoint a location.
    const locationText = input.location.trim().toLowerCase();
    const districtNames = [...new Set(state.atms.map((a) => a.district_name))];
    const matchedDistrict = locationText
      ? districtNames.find((d) => locationText.includes(d.toLowerCase()))
      : undefined;

    const pool = matchedDistrict
      ? state.atms.filter((a) => a.district_name === matchedDistrict)
      : state.atms.filter((a) => a.risk.risk_level === 'CRITICAL' || a.risk.risk_level === 'HIGH');
    const sortedPool = [...pool].sort((a, b) => b.risk.risk_score - a.risk.risk_score);
    const targetAtm = sortedPool[Math.floor(Math.random() * Math.min(5, sortedPool.length || 1))] ?? state.atms[0];

    const isFinancial = FINANCIAL_CRIME_CATEGORIES.has(input.crimeCategory);
    const leaUnitId = `LEA-TG-${slugId(targetAtm.district_name)}-01`;

    const newCase: Case = {
      case_id: caseId,
      complaint_id: complaintId,
      created_at: ts,
      status: 'UNDER_INVESTIGATION' as CaseStatus,
      crime_category: input.crimeCategory,
      reported_amount: input.amount,
      reporting_timestamp: ts,
      victim: {
        display_name: 'Masked Victim (Citizen Submission)',
        contact_masked: input.contact.replace(/\d(?=\d{3})/g, '*'),
      },
      known_financial_context: {
        victim_account_masked: `XXXXXX${1000 + Math.floor(Math.random() * 9000)}`,
        bank_name: targetAtm.bank_name,
      },
      assigned_lea: {
        unit_id: leaUnitId,
        unit_name: `${targetAtm.district_name} Cybercrime Unit`,
      },
    };

    let newPrediction: Prediction | null = null;
    let newPath: PredictedPath | null = null;
    let newAlert: Alert | null = null;

    if (isFinancial) {
      const predictionId = `PRED-${uniqueNum()}`;
      const alertId = `AL-${uniqueNum()}`;
      const windowStart = new Date(Date.now() + 90 * 60000);
      const windowEnd = new Date(windowStart.getTime() + 2 * 3600000);

      newPrediction = {
        prediction_id: predictionId,
        case_id: caseId,
        status: 'ACTIVE',
        as_of: ts,
        generated_at: ts,
        risk: {
          score: targetAtm.risk.risk_score,
          level: targetAtm.risk.risk_level,
          rank: targetAtm.risk.rank_in_district,
        },
        predicted_cashout: {
          location_type: 'ATM',
          atm_id: targetAtm.atm_id,
          district_id: targetAtm.district_id,
          district_name: targetAtm.district_name,
          area_id: targetAtm.area_id,
          area_name: targetAtm.area_name,
          lat: targetAtm.lat,
          lon: targetAtm.lon,
          withdrawal_window: { start: isoFromDate(windowStart), end: isoFromDate(windowEnd) },
        },
        supporting_intelligence: {
          supporting_path_count: 2,
          converging_path_count: 1,
          last_observed_transaction: { timestamp: ts, amount: input.amount },
          explanation_factors: [
            { label: 'New complaint just filed', value: 'HIGH' },
            { label: 'Historical cash-out similarity', value: targetAtm.risk.risk_level },
            { label: 'ATM density in area', value: targetAtm.area_name ? 'HIGH' : 'MEDIUM' },
          ],
        },
        freshness_seconds: 0,
      };

      newPath = {
        prediction_id: predictionId,
        path_id: 'PATH-01',
        path_probability: 0.6,
        nodes: [
          { sequence: 1, node_type: 'VICTIM_ACCOUNT', node_id: `MASKED-V-${seq}`, label: 'Victim Account' },
          { sequence: 2, node_type: 'ACCOUNT', node_id: `MASKED-A-${seq}`, label: 'Intermediate Account A' },
          {
            sequence: 3,
            node_type: 'ATM',
            node_id: targetAtm.atm_id,
            label: 'Predicted ATM',
            lat: targetAtm.lat,
            lon: targetAtm.lon,
          },
        ],
        edges: [
          {
            from: `MASKED-V-${seq}`,
            to: `MASKED-A-${seq}`,
            timestamp: ts,
            amount: input.amount,
          },
          { from: `MASKED-A-${seq}`, to: targetAtm.atm_id, predicted: true },
        ],
      };

      newAlert = {
        alert_id: alertId,
        alert_type: 'PREDICTED_CASHOUT',
        severity: targetAtm.risk.risk_level,
        status: 'GENERATED',
        created_at: ts,
        expires_at: isoFromDate(windowEnd),
        case_id: caseId,
        prediction_id: predictionId,
        target: {
          atm_id: targetAtm.atm_id,
          district: targetAtm.district_name,
          area: targetAtm.area_name,
        },
        predicted_window: { start: isoFromDate(windowStart), end: isoFromDate(windowEnd) },
        recipients: [
          { type: 'LEA', id: leaUnitId, status: 'DELIVERED' },
          { type: 'BANK', id: targetAtm.bank_id, status: 'DELIVERED' },
          { type: 'I4C', id: 'I4C-TG-01', status: 'VISIBLE' },
        ],
      };
    }

    const newNotifications: NotificationItem[] = [
      {
        notification_id: `NOTIF-LIVE-${seq}`,
        recipient_role: 'LEA',
        recipient_id: leaUnitId,
        created_at: ts,
        read: false,
        category: 'ALERT',
        title: isFinancial ? 'New predicted cash-out alert' : 'New complaint received',
        body: isFinancial
          ? `Citizen complaint ${complaintId} generated a predicted cash-out alert in ${targetAtm.district_name}${targetAtm.area_name ? ' / ' + targetAtm.area_name : ''}.`
          : `Citizen complaint ${complaintId} registered (${input.crimeCategory.replaceAll('_', ' ')}).`,
        related_alert_id: newAlert?.alert_id,
        related_case_id: caseId,
      },
      {
        notification_id: `NOTIF-LIVE-${seq}-I4C`,
        recipient_role: 'I4C',
        recipient_id: 'I4C-TG-01',
        created_at: ts,
        read: false,
        category: isFinancial ? 'ALERT' : 'SYSTEM',
        title: isFinancial ? 'New predicted cash-out alert' : 'New complaint received',
        body: `${targetAtm.district_name}${targetAtm.area_name ? ' / ' + targetAtm.area_name : ''} — case ${caseId}.`,
        related_alert_id: newAlert?.alert_id,
        related_case_id: caseId,
      },
    ];

    set((s) => ({
      cases: [newCase, ...s.cases],
      casesById: new Map(s.casesById).set(caseId, newCase),
      predictions: newPrediction ? [newPrediction, ...s.predictions] : s.predictions,
      predictionsById: newPrediction
        ? new Map(s.predictionsById).set(newPrediction.prediction_id, newPrediction)
        : s.predictionsById,
      predictionsByCase: newPrediction
        ? new Map(s.predictionsByCase).set(caseId, [newPrediction])
        : s.predictionsByCase,
      paths: newPath ? [newPath, ...s.paths] : s.paths,
      pathsByPrediction: newPath
        ? new Map(s.pathsByPrediction).set(newPath.prediction_id, [newPath])
        : s.pathsByPrediction,
      alerts: newAlert ? [newAlert, ...s.alerts] : s.alerts,
      notifications: [...newNotifications, ...s.notifications],
      audit: [
        {
          event_id: `AUD-${uniqueNum()}`,
          timestamp: ts,
          actor_role: 'CITIZEN',
          actor_display: 'Citizen Portal',
          event_type: 'COMPLAINT_RECEIVED',
          entity_type: 'CASE',
          entity_id: caseId,
          summary: `New complaint ${complaintId} received and registered as case ${caseId}.`,
        },
        ...(newAlert
          ? [
              {
                event_id: `AUD-${uniqueNum()}`,
                timestamp: ts,
                actor_role: 'I4C' as Role,
                actor_display: 'System',
                event_type: 'ALERT_GENERATED',
                entity_type: 'ALERT' as const,
                entity_id: newAlert.alert_id,
                summary: `Predicted cash-out alert generated for ${targetAtm.district_name}${targetAtm.area_name ? ' / ' + targetAtm.area_name : ''}.`,
              },
            ]
          : []),
        ...s.audit,
      ],
      lastUpdated: ts,
      toast: {
        id: ++toastCounter,
        message: isFinancial
          ? `New alert generated: ${targetAtm.district_name}${targetAtm.area_name ? ' / ' + targetAtm.area_name : ''} (${targetAtm.risk.risk_level})`
          : `New complaint registered: ${caseId}`,
      },
    }));
    persistOverlay(get());

    return { caseId, alertId: newAlert?.alert_id ?? null };
  },

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
          event_id: `AUD-${uniqueNum()}`,
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
    persistOverlay(get());
    get().showToast(`Alert acknowledged by ${recipientType === 'LEA' ? 'LEA' : 'Bank/FI'}: ${alertId}`);
  },

  assignAlert: (alertId, unitLabel) => {
    const ts = nowIso();
    set((s) => ({
      alerts: s.alerts.map((a) => (a.alert_id === alertId ? { ...a, status: 'ASSIGNED' as AlertStatus } : a)),
      audit: [
        {
          event_id: `AUD-${uniqueNum()}`,
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
    persistOverlay(get());
    get().showToast(`Investigation assigned to ${unitLabel}`);
  },

  recordAction: (alertId, actionType, notes) => {
    const ts = nowIso();
    const alert = get().alerts.find((a) => a.alert_id === alertId);
    const actionId = `ACT-${uniqueNum()}`;
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
          event_id: `AUD-${uniqueNum()}`,
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
    persistOverlay(get());
    get().showToast(`Action recorded for alert ${alertId}`);
  },

  recordOutcome: (alertId, outcomeType, feedbackLabel, notes) => {
    const ts = nowIso();
    const alert = get().alerts.find((a) => a.alert_id === alertId);
    const outcomeId = `OUT-${uniqueNum()}`;
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
          event_id: `AUD-${uniqueNum()}`,
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
    persistOverlay(get());
    get().showToast(`Outcome recorded: ${feedbackLabel.replaceAll('_', ' ')}`);
  },

  markNotificationRead: (notificationId) => {
    set((s) => ({
      notifications: s.notifications.map((n) =>
        n.notification_id === notificationId ? { ...n, read: true } : n,
      ),
    }));
    persistOverlay(get());
  },

  markAllNotificationsRead: () => {
    set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) }));
    persistOverlay(get());
  },
}));

// Live cross-tab sync: another tab's mutation writes the overlay to
// localStorage, which fires this `storage` event in every OTHER open tab
// (never the tab that made the change, so there's no feedback loop).
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key !== OVERLAY_STORAGE_KEY || !event.newValue) return;
    try {
      const overlay = JSON.parse(event.newValue) as LiveOverlay;
      const prevAlertCount = useStore.getState().alerts.length;
      const derived = buildDerived(overlay.cases, overlay.predictions, overlay.paths);
      useStore.setState({
        cases: overlay.cases,
        predictions: overlay.predictions,
        paths: overlay.paths,
        alerts: overlay.alerts,
        actions: overlay.actions,
        audit: overlay.audit,
        notifications: overlay.notifications,
        outcomes: overlay.outcomes,
        ...derived,
        lastUpdated: nowIso(),
      });
      if (overlay.alerts.length > prevAlertCount) {
        useStore.setState({
          toast: { id: Date.now(), message: 'New alert received from another session' },
        });
      }
    } catch {
      /* malformed overlay from another tab — ignore this update */
    }
  });
}