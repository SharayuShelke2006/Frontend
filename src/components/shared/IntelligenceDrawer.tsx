import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/state/store';
import { formatCurrency, formatIstTime } from '@/lib/selectors';
import RiskBadge from '@/components/shared/RiskBadge';
import type { Alert, Atm, Case, Prediction } from '@/types/contract';

type DrawerTarget =
  | { type: 'prediction'; id: string }
  | { type: 'alert'; id: string }
  | { type: 'case'; id: string }
  | { type: 'atm'; id: string };

interface DrawerContextValue {
  open: (target: DrawerTarget) => void;
}

const DrawerContext = createContext<DrawerContextValue | null>(null);

export function useIntelligenceDrawer() {
  const context = useContext(DrawerContext);
  if (!context) throw new Error('useIntelligenceDrawer must be used inside IntelligenceDrawerProvider');
  return context;
}

export function IntelligenceDrawerProvider({ children }: { children: ReactNode }) {
  const [target, setTarget] = useState<DrawerTarget | null>(null);

  return (
    <DrawerContext.Provider value={{ open: setTarget }}>
      {children}
      <IntelligenceDrawer target={target} onClose={() => setTarget(null)} />
    </DrawerContext.Provider>
  );
}

function IntelligenceDrawer({ target, onClose }: { target: DrawerTarget | null; onClose: () => void }) {
  const navigate = useNavigate();
  const predictionsById = useStore((s) => s.predictionsById);
  const casesById = useStore((s) => s.casesById);
  const atmsById = useStore((s) => s.atmsById);
  const alerts = useStore((s) => s.alerts);
  const pathsByPrediction = useStore((s) => s.pathsByPrediction);
  const actions = useStore((s) => s.actions);
  const outcomes = useStore((s) => s.outcomes);
  const role = useStore((s) => s.role);
  const acknowledgeAlert = useStore((s) => s.acknowledgeAlert);
  const assignAlert = useStore((s) => s.assignAlert);
  const recordAction = useStore((s) => s.recordAction);
  const [reportOpen, setReportOpen] = useState(false);

  useEffect(() => {
    if (!target) return;
    setReportOpen(false);
    const closeOnEscape = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [target, onClose]);

  if (!target) return null;

  const prediction = target.type === 'prediction'
    ? predictionsById.get(target.id)
    : target.type === 'alert'
      ? predictionsById.get(alerts.find((a) => a.alert_id === target.id)?.prediction_id ?? '')
      : target.type === 'case'
        ? predictionsById.get(firstPredictionId(predictionsById, target.id))
        : undefined;
  const alert = target.type === 'alert'
    ? alerts.find((item) => item.alert_id === target.id)
    : prediction ? alerts.find((item) => item.prediction_id === prediction.prediction_id) : undefined;
  const caseObj = target.type === 'case'
    ? casesById.get(target.id)
    : prediction ? casesById.get(prediction.case_id) : alert ? casesById.get(alert.case_id) : undefined;
  const atm = target.type === 'atm'
    ? atmsById.get(target.id)
    : prediction ? atmsById.get(prediction.predicted_cashout.atm_id) : alert ? atmsById.get(alert.target.atm_id) : undefined;

  if (!prediction && !alert && !caseObj && !atm) return null;

  const linkedActions = alert ? actions.filter((item) => item.alert_id === alert.alert_id) : [];
  const outcome = alert ? outcomes[alert.alert_id] : undefined;
  const canAcknowledge = alert && (role === 'LEA' || role === 'BANK') && ['GENERATED', 'DELIVERED'].includes(alert.status);
  const canAssign = alert && role === 'LEA' && alert.status === 'ACKNOWLEDGED';
  const canRecordAction = alert && role === 'LEA' && ['ACKNOWLEDGED', 'ASSIGNED'].includes(alert.status);
  const title = prediction ? 'Predicted withdrawal hotspot' : alert ? `${alert.severity} intelligence alert` : caseObj ? 'Complaint intelligence' : 'ATM risk profile';
  const openFullDetail = () => {
    if (prediction) navigate(`/predictions/${prediction.prediction_id}`);
    else if (alert) navigate(`/alerts/${alert.alert_id}`);
    else if (caseObj) navigate(`/cases/${caseObj.case_id}`);
    else if (atm) navigate(`/atms/${atm.atm_id}`);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-[1800] bg-navy-950/35 backdrop-blur-[2px] motion-drawer-backdrop" onClick={onClose} />
      <aside className="fixed inset-y-0 right-0 z-[1900] flex w-full max-w-lg flex-col overflow-hidden border-l border-slate-200 bg-white shadow-2xl motion-drawer-panel" role="dialog" aria-modal="true" aria-label={title}>
        <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-accent-600">Operational intelligence</p>
            <h2 className="mt-1 text-lg font-bold text-navy-900">{title}</h2>
            <p className="mt-1 text-xs text-slate-500">Demo / simulated data · human decision support</p>
          </div>
          <button onClick={onClose} className="rounded p-2 text-lg leading-none text-slate-400 hover:bg-slate-100 hover:text-navy-900" aria-label="Close detail panel">×</button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {prediction && <PredictionSummary prediction={prediction} atm={atm} />}
          {alert && <AlertSummary alert={alert} actions={linkedActions.length} outcome={outcome?.feedback_label} />}
          {caseObj && <CaseSummary caseObj={caseObj} />}
          {atm && !prediction && <AtmSummary atm={atm} />}
          {prediction && (
            <section className="mt-4 panel p-4">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Why this location?</h3>
              <div className="space-y-2">
                {prediction.supporting_intelligence.explanation_factors.map((factor) => (
                  <div key={factor.label} className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-slate-600">{factor.label}</span>
                    <span className="font-semibold text-navy-900">{factor.value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
                <span>Supporting paths <b className="text-navy-900">{prediction.supporting_intelligence.supporting_path_count}</b></span>
                <span>Converging paths <b className="text-navy-900">{prediction.supporting_intelligence.converging_path_count}</b></span>
              </div>
            </section>
          )}
          {alert && (
            <section className="mt-4 panel p-4">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Response timeline</h3>
              <div className="space-y-3 border-l-2 border-accent-600/20 pl-4 text-sm">
                <TimelineItem label="Prediction generated" value={prediction ? formatIstTime(prediction.generated_at) : formatIstTime(alert.created_at)} />
                <TimelineItem label="Alert issued" value={formatIstTime(alert.created_at)} />
                {linkedActions.map((action) => <TimelineItem key={action.action_id} label={action.action_type.replaceAll('_', ' ')} value={formatIstTime(action.created_at)} />)}
                {outcome && <TimelineItem label={`Outcome: ${outcome.feedback_label.replaceAll('_', ' ')}`} value={formatIstTime(outcome.recorded_at)} />}
              </div>
            </section>
          )}
          {prediction && pathsByPrediction.get(prediction.prediction_id)?.length ? (
            <p className="mt-4 rounded border border-accent-600/15 bg-accent-600/5 p-3 text-xs text-slate-600">
              {pathsByPrediction.get(prediction.prediction_id)?.length} transaction path(s) converge on this location. Review the full intelligence view for the evidence graph.
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4">
          {canAcknowledge && <button onClick={() => acknowledgeAlert(alert.alert_id, role === 'BANK' ? 'BANK' : 'LEA')} className="rounded border border-accent-600/30 bg-white px-3 py-2 text-xs font-semibold text-accent-600 hover:bg-accent-600/5">Acknowledge</button>}
          {canAssign && <button onClick={() => assignAlert(alert.alert_id, caseObj?.assigned_lea.unit_name ?? 'local unit')} className="rounded border border-accent-600/30 bg-white px-3 py-2 text-xs font-semibold text-accent-600 hover:bg-accent-600/5">Assign LEA</button>}
          {canRecordAction && <button onClick={() => recordAction(alert.alert_id, 'FIELD_VERIFICATION_INITIATED', 'Field verification initiated from intelligence drawer.')} className="rounded border border-accent-600/30 bg-white px-3 py-2 text-xs font-semibold text-accent-600 hover:bg-accent-600/5">Record action</button>}
          {alert && <button onClick={() => setReportOpen(true)} className="rounded bg-accent-600 px-3 py-2 text-xs font-semibold text-white hover:bg-accent-500">Preview intelligence report</button>}
          <button onClick={openFullDetail} className="rounded border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-navy-900 hover:bg-slate-100">Open full detail</button>
          <button onClick={onClose} className="rounded border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100">Close</button>
        </div>
      </aside>
      {reportOpen && alert && prediction && <ReportPreview alert={alert} prediction={prediction} caseObj={caseObj} atm={atm} onClose={() => setReportOpen(false)} />}
    </>
  );
}

function firstPredictionId(predictionsById: Map<string, Prediction>, caseId: string) {
  for (const prediction of predictionsById.values()) if (prediction.case_id === caseId) return prediction.prediction_id;
  return '';
}

function PredictionSummary({ prediction, atm }: { prediction: Prediction; atm?: Atm }) {
  const c = prediction.predicted_cashout;
  return <section className="panel p-4">
    <div className="flex items-start justify-between gap-3">
      <div><p className="text-xs text-slate-500">{c.district_name}{c.area_name ? ` / ${c.area_name}` : ''}</p><p className="mt-1 text-sm font-semibold text-navy-900">{atm?.bank_name ?? 'ATM'} · {c.atm_id}</p></div>
      <RiskBadge level={prediction.risk.level} score={prediction.risk.score} />
    </div>
    <div className="mt-4 grid grid-cols-2 gap-3">
      <Metric label="Risk score" value={`${Math.round(prediction.risk.score * 100)}/100`} />
      <Metric label="Prediction rank" value={`#${prediction.risk.rank}`} />
      <Metric label="Probability proxy" value={`${Math.round((prediction.supporting_intelligence.supporting_path_count / Math.max(1, prediction.supporting_intelligence.supporting_path_count + 1)) * 100)}%`} />
      <Metric label="Window" value={formatIstTime(c.withdrawal_window.start)} />
    </div>
    <p className="mt-3 text-xs text-slate-500">Likely withdrawal window: <b className="text-navy-900">{formatIstTime(c.withdrawal_window.start)} – {formatIstTime(c.withdrawal_window.end)}</b></p>
  </section>;
}

function AlertSummary({ alert, actions, outcome }: { alert: Alert; actions: number; outcome?: string }) {
  return <section className="mt-4 panel p-4"><div className="flex items-center justify-between"><span className="text-xs font-semibold text-slate-500">{alert.alert_id}</span><span className="badge badge-medium">{alert.status.replaceAll('_', ' ')}</span></div><div className="mt-3 grid grid-cols-2 gap-3 text-sm"><Metric label="Location" value={alert.target.district} /><Metric label="Bank response" value={`${alert.recipients.find((r) => r.type === 'BANK')?.status ?? 'VISIBLE'}`} /><Metric label="Actions" value={String(actions)} /><Metric label="Outcome" value={outcome?.replaceAll('_', ' ') ?? 'Pending'} /></div></section>;
}

function CaseSummary({ caseObj }: { caseObj: Case }) {
  return <section className="mt-4 panel p-4"><h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Complaint context</h3><div className="grid grid-cols-2 gap-3 text-sm"><Metric label="Case" value={caseObj.case_id} /><Metric label="Complaint" value={caseObj.complaint_id} /><Metric label="Category" value={caseObj.crime_category.replaceAll('_', ' ')} /><Metric label="Amount" value={formatCurrency(caseObj.reported_amount)} /><Metric label="Assigned unit" value={caseObj.assigned_lea.unit_name} /><Metric label="Status" value={caseObj.status.replaceAll('_', ' ')} /></div></section>;
}

function AtmSummary({ atm }: { atm: Atm }) {
  return <section className="mt-4 panel p-4"><h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Location context</h3><div className="space-y-2 text-sm"><Metric label="Bank" value={atm.bank_name} /><Metric label="Address" value={atm.address} /><Metric label="District" value={atm.district_name} /><Metric label="Active predictions" value={String(atm.related.active_prediction_count)} /><Metric label="Risk rank" value={`#${atm.risk.rank_in_district} in district`} /></div></section>;
}

function Metric({ label, value }: { label: string; value: string }) { return <div><p className="text-[10px] uppercase tracking-wide text-slate-400">{label}</p><p className="mt-0.5 font-semibold text-navy-900">{value}</p></div>; }
function TimelineItem({ label, value }: { label: string; value: string }) { return <div><p className="font-medium capitalize text-navy-900">{label}</p><p className="text-xs text-slate-500">{value}</p></div>; }

function ReportPreview({ alert, prediction, caseObj, atm, onClose }: { alert: Alert; prediction: Prediction; caseObj?: Case; atm?: Atm; onClose: () => void }) {
  return <div className="fixed inset-0 z-[2100] flex items-center justify-center bg-navy-950/55 p-4 backdrop-blur-sm motion-drawer-backdrop"><div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white shadow-2xl motion-report-panel" role="dialog" aria-modal="true" aria-label="Intelligence report preview"><div className="flex items-start justify-between border-b-4 border-accent-600 bg-navy-950 px-6 py-5 text-white"><div><p className="text-[10px] uppercase tracking-[0.18em] text-accent-300">NIRIKSHAK intelligence brief</p><h2 className="mt-1 text-xl font-bold">Predicted cash-out intervention report</h2><p className="mt-1 text-xs text-slate-300">Preview · {alert.alert_id} · {formatIstTime(alert.created_at)} IST</p></div><button onClick={onClose} className="text-2xl text-slate-300 hover:text-white" aria-label="Close report preview">×</button></div><div className="space-y-5 p-6"><div className="grid grid-cols-2 gap-3 md:grid-cols-4"><Metric label="Risk score" value={`${Math.round(prediction.risk.score * 100)}/100`} /><Metric label="Risk level" value={prediction.risk.level} /><Metric label="Window" value={formatIstTime(prediction.predicted_cashout.withdrawal_window.start)} /><Metric label="Status" value={alert.status.replaceAll('_', ' ')} /></div><section className="rounded border border-accent-600/20 bg-accent-600/5 p-4"><p className="text-xs font-bold uppercase tracking-wide text-accent-600">Executive summary</p><p className="mt-2 text-sm leading-6 text-navy-900">NIRIKSHAK forecasts a likely cash withdrawal at <b>{atm?.bank_name ?? 'the monitored ATM'} · {prediction.predicted_cashout.atm_id}</b> in {prediction.predicted_cashout.district_name}. The forecast is decision support for coordinated LEA, bank/FI, and I4C review.</p></section><div className="grid gap-4 md:grid-cols-2"><section className="panel p-4"><h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Supporting signals</h3><ul className="space-y-2 text-sm">{prediction.supporting_intelligence.explanation_factors.map((factor) => <li key={factor.label} className="flex justify-between gap-3"><span className="text-slate-600">{factor.label}</span><b>{factor.value}</b></li>)}</ul></section><section className="panel p-4"><h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Operational context</h3><p className="text-sm text-slate-600">Case <b className="text-navy-900">{caseObj?.case_id ?? alert.case_id}</b> · {prediction.predicted_cashout.district_name}</p><p className="mt-2 text-sm text-slate-600">Recommended: notify assigned LEA, confirm bank monitoring, and record outcome feedback after the prediction window.</p></section></div><div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4"><button onClick={() => window.print()} className="rounded bg-accent-600 px-4 py-2 text-sm font-semibold text-white hover:bg-accent-500">Generate PDF</button><button onClick={onClose} className="rounded border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50">Close preview</button></div></div></div></div>;
}
