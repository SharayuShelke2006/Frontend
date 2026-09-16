import { useState, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useStore } from '@/state/store';
import { useAlertBundle } from '@/lib/selectors';
import { formatIstTime, timeAgo } from '@/lib/selectors';
import RiskBadge from '@/components/shared/RiskBadge';

const LIFECYCLE_STEPS = ['GENERATED', 'DELIVERED', 'ACKNOWLEDGED', 'ASSIGNED', 'ACTION_INITIATED', 'RESOLVED'];

export default function AlertDetail() {
  const { alertId } = useParams();
  const navigate = useNavigate();
  const role = useStore((s) => s.role);
  const acknowledgeAlert = useStore((s) => s.acknowledgeAlert);
  const assignAlert = useStore((s) => s.assignAlert);
  const recordAction = useStore((s) => s.recordAction);
  const recordOutcome = useStore((s) => s.recordOutcome);
  const bundle = useAlertBundle(alertId);
  const [notes, setNotes] = useState('Local unit assigned for verification.');

  if (!bundle) {
    return <div className="p-6 text-sm text-slate-500">Alert not found.</div>;
  }
  const { alert, case: caseObj, prediction, atm, actions, outcome } = bundle;

  const stepIndex = Math.max(0, LIFECYCLE_STEPS.indexOf(alert.status));
  const isTerminalOther = alert.status === 'EXPIRED' || alert.status === 'FALSE_POSITIVE';

  const canAcknowledgeLea = role === 'LEA' && ['GENERATED', 'DELIVERED'].includes(alert.status);
  const canAcknowledgeBank = role === 'BANK' && ['GENERATED', 'DELIVERED'].includes(alert.status);
  const canAssign = role === 'LEA' && alert.status === 'ACKNOWLEDGED';
  const canRecordAction = role === 'LEA' && ['ASSIGNED', 'ACKNOWLEDGED'].includes(alert.status);
  const canRecordOutcome = role === 'LEA' && alert.status === 'ACTION_INITIATED';
  const canNotifyBank = (role === 'LEA' || role === 'I4C') && true;

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-4 text-[11px] text-slate-400">
        Alert / {alert.alert_id}
      </div>

      <div className="mb-4 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-navy-900">{alert.severity} Alert</h1>
            <RiskBadge level={alert.severity} />
          </div>
          <p className="text-sm text-slate-500">
            Created {formatIstTime(alert.created_at)} · expires {formatIstTime(alert.expires_at)}
          </p>
        </div>
        <span className="badge badge-medium">{alert.status.replaceAll('_', ' ')}</span>
      </div>

      {/* Lifecycle */}
      <div className="panel mb-4 p-4">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Alert Lifecycle</h2>
        {isTerminalOther ? (
          <span className="badge badge-critical">{alert.status.replaceAll('_', ' ')}</span>
        ) : (
          <div className="flex items-center">
            {LIFECYCLE_STEPS.map((step, i) => (
              <div key={step} className="flex flex-1 items-center last:flex-none">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold ${
                      i <= stepIndex ? 'bg-accent-600 text-white' : 'bg-slate-200 text-slate-400'
                    }`}
                  >
                    {i + 1}
                  </div>
                  <span className="mt-1 max-w-[70px] text-center text-[10px] text-slate-500">
                    {step.replaceAll('_', ' ')}
                  </span>
                </div>
                {i < LIFECYCLE_STEPS.length - 1 && (
                  <div className={`mx-1 h-0.5 flex-1 ${i < stepIndex ? 'bg-accent-600' : 'bg-slate-200'}`} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <section className="panel p-4">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Why This Alert?</h2>
          {prediction && (
            <dl className="space-y-2 text-sm">
              <Row label="Risk Score / Level" value={`${prediction.risk.score.toFixed(2)} / ${prediction.risk.level}`} />
              <Row label="Supporting Paths" value={String(prediction.supporting_intelligence.supporting_path_count)} />
              <Row label="Converging Paths" value={String(prediction.supporting_intelligence.converging_path_count)} />
              <Row label="Freshness" value={`${timeAgo(prediction.generated_at)}`} />
            </dl>
          )}
        </section>

        <section className="panel p-4">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Where &amp; When</h2>
          <dl className="space-y-2 text-sm">
            <Row label="District" value={alert.target.district} />
            <Row label="Area" value={alert.target.area ?? '—'} />
            <Row label="ATM" value={alert.target.atm_id} />
            <Row
              label="Predicted Window"
              value={`${formatIstTime(alert.predicted_window.start)} – ${formatIstTime(alert.predicted_window.end)}`}
            />
          </dl>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => navigate(`/atms/${alert.target.atm_id}`)}
              className="rounded border border-slate-300 px-3 py-1 text-xs font-medium hover:bg-slate-50"
            >
              View ATM
            </button>
            {prediction && (
              <button
                onClick={() => navigate(`/predictions/${prediction.prediction_id}`)}
                className="rounded border border-slate-300 px-3 py-1 text-xs font-medium hover:bg-slate-50"
              >
                View Prediction
              </button>
            )}
          </div>
        </section>

        <section className="panel p-4">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Related Case</h2>
          {caseObj ? (
            <dl className="space-y-2 text-sm">
              <Row label="Case ID" value={caseObj.case_id} />
              <Row label="Complaint ID" value={caseObj.complaint_id} />
              <Row label="Crime Category" value={caseObj.crime_category.replaceAll('_', ' ')} />
            </dl>
          ) : (
            <p className="text-sm text-slate-400">No linked case.</p>
          )}
          {caseObj && (
            <button
              onClick={() => navigate(`/cases/${caseObj.case_id}`)}
              className="mt-3 rounded border border-slate-300 px-3 py-1 text-xs font-medium hover:bg-slate-50"
            >
              Open Case
            </button>
          )}
        </section>

        <section className="panel p-4">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Recipients</h2>
          <ul className="space-y-2">
            {alert.recipients.map((r) => (
              <li key={r.type} className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{r.type}{r.type === 'LEA' ? ` (${r.id})` : r.type === 'BANK' ? ` (${atm?.bank_name ?? r.id})` : ''}</span>
                <span className={`badge ${r.status === 'ACKNOWLEDGED' ? 'badge-low' : 'badge-medium'}`}>{r.status}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Actions */}
      <section className="panel mt-4 p-4">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Actions</h2>
        <div className="flex flex-wrap gap-2">
          {canAcknowledgeLea && (
            <ActionButton onClick={() => acknowledgeAlert(alert.alert_id, 'LEA')}>Acknowledge (LEA)</ActionButton>
          )}
          {canAcknowledgeBank && (
            <ActionButton onClick={() => acknowledgeAlert(alert.alert_id, 'BANK')}>Acknowledge (Bank/FI)</ActionButton>
          )}
          {canAssign && (
            <ActionButton onClick={() => assignAlert(alert.alert_id, caseObj?.assigned_lea.unit_name ?? 'local unit')}>
              Assign Investigation
            </ActionButton>
          )}
          {canNotifyBank && (
            <ActionButton onClick={() => alert.recipients.some((r) => r.type === 'BANK') && acknowledgeAlert(alert.alert_id, 'BANK')} variant="ghost">
              Share with Bank/FI
            </ActionButton>
          )}
          {!canAcknowledgeLea && !canAcknowledgeBank && !canAssign && !canRecordAction && !canRecordOutcome && (
            <p className="text-sm text-slate-400">No further actions available for this role at the current status.</p>
          )}
        </div>

        {canRecordAction && (
          <div className="mt-4 border-t border-slate-100 pt-4">
            <label className="mb-1 block text-xs font-semibold text-slate-500">Field Verification Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full rounded border border-slate-300 p-2 text-sm outline-none focus:border-accent-500"
            />
            <ActionButton onClick={() => recordAction(alert.alert_id, 'FIELD_VERIFICATION_INITIATED', notes)}>
              Record Action
            </ActionButton>
          </div>
        )}

        {canRecordOutcome && (
          <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
            <ActionButton
              onClick={() =>
                recordOutcome(alert.alert_id, 'WITHDRAWAL_OBSERVED', 'TRUE_POSITIVE', 'Withdrawal confirmed at predicted location.')
              }
            >
              Record Outcome: True Positive
            </ActionButton>
            <ActionButton
              onClick={() =>
                recordOutcome(alert.alert_id, 'NO_WITHDRAWAL_OBSERVED', 'FALSE_POSITIVE', 'Prediction window elapsed without confirmed withdrawal.')
              }
              variant="ghost"
            >
              Record Outcome: False Positive
            </ActionButton>
          </div>
        )}

        {actions.length > 0 && (
          <div className="mt-4 border-t border-slate-100 pt-3">
            <h3 className="mb-2 text-[11px] font-semibold uppercase text-slate-400">Recorded Actions</h3>
            <ul className="space-y-1 text-sm text-slate-600">
              {actions.map((a) => (
                <li key={a.action_id}>
                  {formatIstTime(a.created_at)} — {a.action_type.replaceAll('_', ' ')} ({a.status})
                </li>
              ))}
            </ul>
          </div>
        )}
        {outcome && (
          <div className="mt-3 rounded border border-slate-200 bg-slate-50 p-3 text-sm">
            <span className="font-semibold text-navy-900">Outcome recorded:</span> {outcome.feedback_label.replaceAll('_', ' ')} —{' '}
            {outcome.notes}
          </div>
        )}
      </section>

      <div className="mt-3 text-[11px] text-slate-400">
        <Link to="/audit" className="hover:underline">
          View full audit timeline →
        </Link>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-medium text-navy-900">{value}</dd>
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  variant = 'primary',
}: {
  children: ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'ghost';
}) {
  return (
    <button
      onClick={onClick}
      className={
        variant === 'primary'
          ? 'rounded bg-accent-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-accent-500'
          : 'rounded border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50'
      }
    >
      {children}
    </button>
  );
}
